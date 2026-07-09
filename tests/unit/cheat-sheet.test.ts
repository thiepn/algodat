import { describe, expect, it } from 'vitest';
import { cheatSheetContent } from '../../src/content/loaders/cheat-sheet';
import {
  buildManualCheatSheet,
  buildSlotFocusedCheatSheet,
  buildStandardCheatSheet,
  buildWeaknessFocusedCheatSheet,
  detectCheatSheetOverflow,
  restoreCheatSheet,
  serializeCheatSheet,
  validateCheatSheetCatalog,
  validatePrintableCheatSheet,
} from '../../src/domain/cheat-sheet';

describe('A4-Spickzettel-Domain', () => {
  it('validiert den quellengebundenen Blockkatalog', () => {
    const validation = validateCheatSheetCatalog(cheatSheetContent.blocks);
    expect(validation).toEqual({ ok: true, errors: [] });
    expect(cheatSheetContent.blocks.length).toBeGreaterThanOrEqual(16);
    expect(cheatSheetContent.blocks.every((block) => block.sourceRefs.length > 0)).toBe(true);
  });

  it('packt den Standardmodus deterministisch auf genau zwei Seiten', () => {
    const first = buildStandardCheatSheet(
      cheatSheetContent.blocks,
      cheatSheetContent.presets,
      cheatSheetContent.layoutPolicy,
    );
    const second = buildStandardCheatSheet(
      cheatSheetContent.blocks,
      cheatSheetContent.presets,
      cheatSheetContent.layoutPolicy,
    );
    expect(first).toEqual(second);
    expect(first.pages).toHaveLength(2);
    expect(validatePrintableCheatSheet(first).ok).toBe(true);
    expect(first.pages.every((page) => page.usedArea <= page.capacity)).toBe(true);
  });

  it('unterstützt Schwächen-, Slot- und manuellen Modus ohne Layoutüberlauf', () => {
    const weakness = buildWeaknessFocusedCheatSheet({
      catalog: cheatSheetContent.blocks,
      presets: cheatSheetContent.presets,
      policy: cheatSheetContent.layoutPolicy,
      weaknessScores: { 'topic-c0af8532bb72': 1, 'topic-e8b80c23286d': 0.8 },
    });
    const slot = buildSlotFocusedCheatSheet({
      catalog: cheatSheetContent.blocks,
      presets: cheatSheetContent.presets,
      policy: cheatSheetContent.layoutPolicy,
      slotWeights: { '8': 2, '9': 1.5 },
    });
    const manual = buildManualCheatSheet({
      catalog: cheatSheetContent.blocks,
      presets: cheatSheetContent.presets,
      policy: cheatSheetContent.layoutPolicy,
      selectedBlockIds: ['cs-dp-zustand', 'cs-rucksack-dp', 'cs-typische-fehler'],
    });
    expect(validatePrintableCheatSheet(weakness).ok).toBe(true);
    expect(validatePrintableCheatSheet(slot).ok).toBe(true);
    expect(validatePrintableCheatSheet(manual).ok).toBe(true);
    expect(detectCheatSheetOverflow(manual)).toBe(false);
    expect(
      manual.pages.flatMap((page) => page.placements).map((placement) => placement.blockId),
    ).toEqual(['cs-dp-zustand', 'cs-rucksack-dp', 'cs-typische-fehler']);
  });

  it('serialisiert und restauriert ein Spickzettel-Dokument', () => {
    const layout = buildManualCheatSheet({
      catalog: cheatSheetContent.blocks,
      presets: cheatSheetContent.presets,
      policy: cheatSheetContent.layoutPolicy,
      selectedBlockIds: ['cs-asymptotik'],
    });
    const document = {
      id: 'cheat-sheet-test',
      sheetId: 'cheat-sheet-test',
      title: 'Test',
      mode: 'manual' as const,
      presetId: 'preset-manual',
      catalogVersion: cheatSheetContent.blocks[0]?.contentVersion ?? 'test',
      layoutPolicyVersion: cheatSheetContent.layoutPolicy.policyVersion,
      masteryModelVersion: 'mastery-v14',
      createdAt: '2026-07-09T00:00:00.000Z',
      updatedAt: '2026-07-09T00:00:00.000Z',
      selectedBlockIds: ['cs-asymptotik'],
      blockVariants: { 'cs-asymptotik': 'compact' as const },
      lockedBlockIds: [],
      placements: layout.pages.flatMap((page) => page.placements),
      printSettings: {
        paper: 'A4' as const,
        sides: 'duplex' as const,
        colorRequired: false as const,
      },
      sourceSummary: cheatSheetContent.blocks[0]?.sourceRefs ?? [],
      validationStatus: 'valid' as const,
    };
    expect(restoreCheatSheet(serializeCheatSheet(document))).toEqual(document);
  });
});
