import {
  CheatSheetBlockSchema,
  CheatSheetCatalogFileSchema,
  CheatSheetDocumentSchema,
  CheatSheetLayoutPolicySchema,
  CheatSheetPresetsFileSchema,
  type CheatSheetBlock,
  type CheatSheetDocument,
  type CheatSheetLayout,
  type CheatSheetLayoutPolicy,
  type CheatSheetMode,
  type CheatSheetPlacement,
  type CheatSheetPreset,
  type CheatSheetSelection,
  type CheatSheetValidationResult,
} from './schemas';

export function validateCheatSheetBlock(block: unknown): CheatSheetValidationResult {
  const result = CheatSheetBlockSchema.safeParse(block);
  if (!result.success)
    return { ok: false, errors: result.error.issues.map((issue) => issue.message) };
  const parsed = result.data;
  const errors: string[] = [];
  if (parsed.publicDistributionStatus !== 'public_safe')
    errors.push('Block ist nicht public_safe.');
  if (parsed.solutionValidationStatus === 'unverified') errors.push('Block ist nicht verifiziert.');
  if (/\.pdf|[A-Z]:\\|Users[\\/]|pdfs[\\/]/iu.test(JSON.stringify(parsed)))
    errors.push('Block enthält private Pfad- oder PDF-Hinweise.');
  return { ok: errors.length === 0, errors };
}

export function validateCheatSheetCatalog(catalog: unknown): CheatSheetValidationResult {
  const result = CheatSheetCatalogFileSchema.safeParse(catalog);
  if (!result.success)
    return { ok: false, errors: result.error.issues.map((issue) => issue.message) };
  const seen = new Set<string>();
  const errors: string[] = [];
  for (const block of result.data) {
    if (seen.has(block.blockId)) errors.push(`Doppelte Block-ID: ${block.blockId}`);
    seen.add(block.blockId);
    const validation = validateCheatSheetBlock(block);
    errors.push(...validation.errors.map((error) => `${block.blockId}: ${error}`));
  }
  return { ok: errors.length === 0, errors };
}

export function scoreCheatSheetBlockPriority(
  block: CheatSheetBlock,
  selection: CheatSheetSelection,
): number {
  const weaknessBoost = block.topicIds.reduce(
    (sum, topicId) => sum + (selection.weaknessScores[topicId] ?? 0),
    0,
  );
  const slotBoost = block.examTaskNumbers.reduce(
    (sum, taskNumber) => sum + (selection.slotWeights[String(taskNumber)] ?? 0),
    0,
  );
  const lockBoost = selection.lockedBlockIds.includes(block.blockId) ? 100 : 0;
  const modeBoost =
    selection.mode === 'minimal' && ['laufzeiten', 'fehler'].includes(block.category) ? 1.5 : 0;
  return block.priorityWeight + weaknessBoost * 4 + slotBoost * 2 + modeBoost + lockBoost;
}

export function selectCheatSheetBlocks({
  catalog,
  presets,
  selection,
}: {
  catalog: CheatSheetBlock[];
  presets: CheatSheetPreset[];
  selection: CheatSheetSelection;
}): CheatSheetBlock[] {
  CheatSheetCatalogFileSchema.parse(catalog);
  CheatSheetPresetsFileSchema.parse(presets);
  const preset = selection.presetId
    ? presets.find((candidate) => candidate.presetId === selection.presetId)
    : undefined;
  const selectedIds =
    selection.mode === 'manual'
      ? selection.selectedBlockIds
      : selection.selectedBlockIds.length
        ? selection.selectedBlockIds
        : (preset?.defaultBlockIds ?? catalog.map((block) => block.blockId));
  const selected =
    selection.mode === 'manual'
      ? selectedIds
          .map((blockId) => catalog.find((block) => block.blockId === blockId))
          .filter((block): block is CheatSheetBlock => Boolean(block))
      : catalog.filter((block) => selectedIds.includes(block.blockId));
  const maxBlocks = preset?.maxBlocks ?? selected.length;
  if (selection.mode === 'manual') return selected.slice(0, maxBlocks);
  return [...selected]
    .sort((left, right) => {
      const score =
        scoreCheatSheetBlockPriority(right, selection) -
        scoreCheatSheetBlockPriority(left, selection);
      if (score !== 0) return score;
      return left.blockId.localeCompare(right.blockId, 'de');
    })
    .slice(0, maxBlocks);
}

export function packCheatSheetPages({
  blocks,
  policy,
  selection,
}: {
  blocks: CheatSheetBlock[];
  policy: CheatSheetLayoutPolicy;
  selection: CheatSheetSelection;
}): CheatSheetLayout {
  CheatSheetLayoutPolicySchema.parse(policy);
  const pages = [1, 2].map((pageNumber) => ({
    pageNumber,
    capacity: policy.pageAreaUnits,
    usedArea: 0,
    placements: [] as CheatSheetPlacement[],
  }));
  const omittedBlockIds: string[] = [];
  const reasons: string[] = [];
  const ordered =
    selection.mode === 'manual'
      ? [...blocks]
      : [...blocks].sort((left, right) => {
          const score =
            scoreCheatSheetBlockPriority(right, selection) -
            scoreCheatSheetBlockPriority(left, selection);
          if (score !== 0) return score;
          return left.blockId.localeCompare(right.blockId, 'de');
        });
  for (const block of ordered) {
    const locked = selection.lockedBlockIds.includes(block.blockId);
    const expandedArea = Math.ceil(block.estimatedArea * 1.35);
    const variants = locked ? (['expanded', 'compact'] as const) : (['compact'] as const);
    let placed = false;
    for (const variant of variants) {
      const area = variant === 'expanded' ? expandedArea : block.estimatedArea;
      const page = pages.find((candidate) => candidate.usedArea + area <= candidate.capacity);
      if (!page) continue;
      page.placements.push({
        blockId: block.blockId,
        page: page.pageNumber,
        order: page.placements.length,
        variant,
        area,
      });
      page.usedArea += area;
      placed = true;
      break;
    }
    if (!placed) {
      omittedBlockIds.push(block.blockId);
      reasons.push(
        `${block.title}: nicht genug A4-Fläche ohne Unterschreiten der Mindestschriftgröße.`,
      );
    }
  }
  return {
    layoutVersion: 'cheat-sheet-layout-v1',
    policyVersion: policy.policyVersion,
    pages,
    overflow: {
      omittedBlockIds,
      reasons,
      hasOverflow: omittedBlockIds.length > 0,
    },
    deterministicKey: ordered.map((block) => block.blockId).join('|'),
  };
}

export function detectCheatSheetOverflow(layout: CheatSheetLayout): boolean {
  return (
    layout.pages.length !== 2 ||
    layout.pages.some((page) => page.usedArea > page.capacity) ||
    layout.overflow.hasOverflow
  );
}

function buildSelection(
  mode: CheatSheetMode,
  presetId: string | null,
  selectedBlockIds: string[],
): CheatSheetSelection {
  return {
    mode,
    presetId,
    selectedBlockIds,
    lockedBlockIds: [],
    weaknessScores: {},
    slotWeights: {},
  };
}

export function buildStandardCheatSheet(
  catalog: CheatSheetBlock[],
  presets: CheatSheetPreset[],
  policy: CheatSheetLayoutPolicy,
) {
  const selection = buildSelection('standard', 'preset-standard', []);
  return packCheatSheetPages({
    blocks: selectCheatSheetBlocks({ catalog, presets, selection }),
    policy,
    selection,
  });
}

export function buildWeaknessFocusedCheatSheet({
  catalog,
  presets,
  policy,
  weaknessScores,
}: {
  catalog: CheatSheetBlock[];
  presets: CheatSheetPreset[];
  policy: CheatSheetLayoutPolicy;
  weaknessScores: Record<string, number>;
}) {
  const selection = { ...buildSelection('weakness', 'preset-weakness', []), weaknessScores };
  return packCheatSheetPages({
    blocks: selectCheatSheetBlocks({ catalog, presets, selection }),
    policy,
    selection,
  });
}

export function buildSlotFocusedCheatSheet({
  catalog,
  presets,
  policy,
  slotWeights,
}: {
  catalog: CheatSheetBlock[];
  presets: CheatSheetPreset[];
  policy: CheatSheetLayoutPolicy;
  slotWeights: Record<string, number>;
}) {
  const selection = { ...buildSelection('slot', 'preset-slot', []), slotWeights };
  return packCheatSheetPages({
    blocks: selectCheatSheetBlocks({ catalog, presets, selection }),
    policy,
    selection,
  });
}

export function buildManualCheatSheet({
  catalog,
  presets,
  policy,
  selectedBlockIds,
}: {
  catalog: CheatSheetBlock[];
  presets: CheatSheetPreset[];
  policy: CheatSheetLayoutPolicy;
  selectedBlockIds: string[];
}) {
  const selection = buildSelection('manual', 'preset-manual', selectedBlockIds);
  return packCheatSheetPages({
    blocks: selectCheatSheetBlocks({ catalog, presets, selection }),
    policy,
    selection,
  });
}

export function validatePrintableCheatSheet(layout: CheatSheetLayout): CheatSheetValidationResult {
  const errors: string[] = [];
  if (layout.pages.length !== 2) errors.push('Layout besitzt nicht exakt zwei Seiten.');
  for (const page of layout.pages) {
    if (page.usedArea > page.capacity) errors.push(`Seite ${page.pageNumber} überläuft.`);
  }
  if (layout.pages.flatMap((page) => page.placements).some((placement) => placement.area <= 0))
    errors.push('Mindestens eine Platzierung hat ungültige Fläche.');
  return { ok: errors.length === 0, errors };
}

export function serializeCheatSheet(document: CheatSheetDocument): string {
  return JSON.stringify(CheatSheetDocumentSchema.parse(document));
}

export function restoreCheatSheet(input: string | unknown): CheatSheetDocument {
  return CheatSheetDocumentSchema.parse(typeof input === 'string' ? JSON.parse(input) : input);
}
