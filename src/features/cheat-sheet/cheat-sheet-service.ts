import { cheatSheetContent } from '../../content/loaders/cheat-sheet';
import {
  buildManualCheatSheet,
  buildSlotFocusedCheatSheet,
  buildStandardCheatSheet,
  buildWeaknessFocusedCheatSheet,
  packCheatSheetPages,
  selectCheatSheetBlocks,
  validatePrintableCheatSheet,
  type CheatSheetBlock,
  type CheatSheetDocument,
  type CheatSheetMode,
  type CheatSheetSelection,
} from '../../domain/cheat-sheet';
import { cheatSheetRepository, masteryRepository } from '../../persistence/repositories';

const masteryModelVersion = 'mastery-v14';

function nowIso() {
  return new Date().toISOString();
}

function uniqueSourceSummary(blocks: CheatSheetBlock[]) {
  const seen = new Set<string>();
  return blocks
    .flatMap((block) => block.sourceRefs)
    .filter((ref) => {
      const key = `${ref.sourceId}:${ref.page}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function selectionFor(mode: CheatSheetMode, selectedBlockIds: string[] = []): CheatSheetSelection {
  return {
    mode,
    presetId:
      mode === 'standard'
        ? 'preset-standard'
        : mode === 'weakness'
          ? 'preset-weakness'
          : mode === 'slot'
            ? 'preset-slot'
            : mode === 'minimal'
              ? 'preset-minimal'
              : 'preset-manual',
    selectedBlockIds,
    lockedBlockIds: [],
    weaknessScores: {},
    slotWeights: {},
  };
}

async function weaknessScores() {
  const records = await masteryRepository.list();
  return Object.fromEntries(
    records.map((record) => {
      const average =
        Object.values(record.dimensions).reduce((sum, value) => sum + value, 0) /
        Math.max(1, Object.keys(record.dimensions).length);
      return [record.topicOrTaskId, Math.max(0, 1 - average)];
    }),
  );
}

function slotWeights() {
  return {
    '1': 1,
    '2': 1,
    '3': 1.2,
    '4': 1.2,
    '5': 1,
    '6': 1.1,
    '7': 1.2,
    '8': 1.3,
    '9': 1,
  };
}

export function listCheatSheetBlocks() {
  return cheatSheetContent.blocks;
}

export function listCheatSheetPresets() {
  return cheatSheetContent.presets;
}

export async function listCheatSheets() {
  return cheatSheetRepository.list();
}

export async function getCheatSheet(sheetId: string) {
  return cheatSheetRepository.get(sheetId);
}

export async function createCheatSheet(mode: CheatSheetMode, selectedBlockIds: string[] = []) {
  const catalog = cheatSheetContent.blocks;
  const presets = cheatSheetContent.presets;
  const policy = cheatSheetContent.layoutPolicy;
  let selection = selectionFor(mode, selectedBlockIds);
  let layout =
    mode === 'standard'
      ? buildStandardCheatSheet(catalog, presets, policy)
      : mode === 'weakness'
        ? buildWeaknessFocusedCheatSheet({
            catalog,
            presets,
            policy,
            weaknessScores: await weaknessScores(),
          })
        : mode === 'slot'
          ? buildSlotFocusedCheatSheet({ catalog, presets, policy, slotWeights: slotWeights() })
          : mode === 'manual'
            ? buildManualCheatSheet({ catalog, presets, policy, selectedBlockIds })
            : packCheatSheetPages({
                blocks: selectCheatSheetBlocks({ catalog, presets, selection }),
                policy,
                selection,
              });
  if (mode === 'minimal') {
    selection = selectionFor('minimal', []);
    layout = packCheatSheetPages({
      blocks: selectCheatSheetBlocks({ catalog, presets, selection }),
      policy,
      selection,
    });
  }
  const placedBlockIds = layout.pages.flatMap((page) =>
    page.placements.map((placement) => placement.blockId),
  );
  const placedBlocks = catalog.filter((block) => placedBlockIds.includes(block.blockId));
  const id = `cheat-sheet-${Date.now()}-${mode}`;
  const timestamp = nowIso();
  const validation = validatePrintableCheatSheet(layout);
  const document: CheatSheetDocument = {
    id,
    sheetId: id,
    title:
      mode === 'standard'
        ? 'Standard-Spickzettel'
        : mode === 'weakness'
          ? 'Schwächenorientierter Spickzettel'
          : mode === 'slot'
            ? 'Klausurslot-Spickzettel'
            : mode === 'minimal'
              ? 'Minimal-Spickzettel'
              : 'Manueller Spickzettel',
    mode,
    presetId: selection.presetId,
    catalogVersion: cheatSheetContent.blocks[0]?.contentVersion ?? 'cheat-sheet-v1',
    layoutPolicyVersion: policy.policyVersion,
    masteryModelVersion,
    createdAt: timestamp,
    updatedAt: timestamp,
    selectedBlockIds: placedBlockIds,
    blockVariants: Object.fromEntries(
      layout.pages.flatMap((page) =>
        page.placements.map((placement) => [placement.blockId, placement.variant]),
      ),
    ),
    lockedBlockIds: selection.lockedBlockIds,
    placements: layout.pages.flatMap((page) => page.placements),
    printSettings: { paper: 'A4', sides: 'duplex', colorRequired: false },
    sourceSummary: uniqueSourceSummary(placedBlocks),
    validationStatus: validation.ok
      ? layout.overflow.hasOverflow
        ? 'overflow_reduced'
        : 'valid'
      : 'invalid',
  };
  await cheatSheetRepository.put(document);
  return document;
}

export async function updateCheatSheetBlocks(
  sheet: CheatSheetDocument,
  selectedBlockIds: string[],
  expandedBlockIds: string[] = [],
) {
  const selection = {
    ...selectionFor('manual', selectedBlockIds),
    lockedBlockIds: expandedBlockIds,
  };
  const blocks = selectCheatSheetBlocks({
    catalog: cheatSheetContent.blocks,
    presets: cheatSheetContent.presets,
    selection,
  });
  const layout = packCheatSheetPages({
    blocks,
    policy: cheatSheetContent.layoutPolicy,
    selection,
  });
  const updated: CheatSheetDocument = {
    ...sheet,
    mode: 'manual',
    presetId: 'preset-manual',
    updatedAt: nowIso(),
    selectedBlockIds: layout.pages.flatMap((page) =>
      page.placements.map((placement) => placement.blockId),
    ),
    blockVariants: Object.fromEntries(
      layout.pages.flatMap((page) =>
        page.placements.map((placement) => [placement.blockId, placement.variant]),
      ),
    ),
    lockedBlockIds: selection.lockedBlockIds,
    placements: layout.pages.flatMap((page) => page.placements),
    sourceSummary: uniqueSourceSummary(blocks),
    validationStatus: validatePrintableCheatSheet(layout).ok
      ? layout.overflow.hasOverflow
        ? 'overflow_reduced'
        : 'valid'
      : 'invalid',
  };
  await cheatSheetRepository.put(updated);
  return updated;
}

export async function duplicateCheatSheet(sheet: CheatSheetDocument) {
  const id = `cheat-sheet-${Date.now()}-kopie`;
  const copy = {
    ...sheet,
    id,
    sheetId: id,
    title: `${sheet.title} Kopie`,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await cheatSheetRepository.put(copy);
  return copy;
}

export async function deleteCheatSheet(sheetId: string) {
  await cheatSheetRepository.delete(sheetId);
}
