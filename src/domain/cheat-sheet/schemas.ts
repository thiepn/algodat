import { z } from 'zod';
import {
  PublicDistributionStatusSchema,
  SolutionValidationStatusSchema,
} from '../../content/schemas';
import { SourceReferenceSchema, VerificationStatusSchema } from '../../content/schemas/common';

export const CheatSheetModeSchema = z.enum(['standard', 'weakness', 'slot', 'manual', 'minimal']);
export const CheatSheetBlockCategorySchema = z.enum([
  'grundlagen',
  'beweis',
  'entwurf',
  'datenstruktur',
  'graphen',
  'dynamische_programmierung',
  'laufzeiten',
  'fehler',
]);
export const CheatSheetVariantSchema = z.enum(['compact', 'expanded']);

export const CheatSheetBlockSchema = z.object({
  blockId: z.string().min(1),
  title: z.string().min(1),
  category: CheatSheetBlockCategorySchema,
  topicIds: z.array(z.string().min(1)).min(1),
  examTaskNumbers: z.array(z.number().int().min(1).max(9)).min(1),
  sourceRefs: z.array(SourceReferenceSchema).min(1),
  contentVersion: z.string().min(1),
  compactContent: z.array(z.string().min(1)).min(1),
  optionalExpandedContent: z.array(z.string().min(1)).default([]),
  estimatedArea: z.number().int().positive(),
  priorityWeight: z.number().positive(),
  prerequisites: z.array(z.string().min(1)),
  verificationStatus: VerificationStatusSchema,
  publicDistributionStatus: PublicDistributionStatusSchema,
  solutionValidationStatus: SolutionValidationStatusSchema,
});

export const CheatSheetPresetSchema = z.object({
  presetId: z.string().min(1),
  title: z.string().min(1),
  mode: CheatSheetModeSchema,
  description: z.string().min(1),
  defaultBlockIds: z.array(z.string().min(1)),
  maxBlocks: z.number().int().positive(),
  priorityHint: z.string().min(1),
});

export const CheatSheetLayoutPolicySchema = z.object({
  policyVersion: z.string().min(1),
  pageFormat: z.literal('A4'),
  pageCount: z.literal(2),
  widthMm: z.number().positive(),
  heightMm: z.number().positive(),
  marginMm: z.number().positive(),
  minFontSizePt: z.number().positive(),
  baseFontSizePt: z.number().positive(),
  pageAreaUnits: z.number().int().positive(),
  columnCount: z.number().int().min(1).max(4),
  gutterMm: z.number().positive(),
  overflowStrategy: z.array(z.string().min(1)).min(1),
});

export const CheatSheetSelectionSchema = z.object({
  mode: CheatSheetModeSchema,
  presetId: z.string().min(1).nullable(),
  selectedBlockIds: z.array(z.string().min(1)),
  lockedBlockIds: z.array(z.string().min(1)),
  weaknessScores: z.record(z.string(), z.number().min(0).max(1)).default({}),
  slotWeights: z.record(z.string(), z.number().positive()).default({}),
});

export const CheatSheetPlacementSchema = z.object({
  blockId: z.string().min(1),
  page: z.number().int().min(1).max(2),
  order: z.number().int().nonnegative(),
  variant: CheatSheetVariantSchema,
  area: z.number().int().positive(),
});

export const CheatSheetPageSchema = z.object({
  pageNumber: z.number().int().min(1).max(2),
  capacity: z.number().int().positive(),
  usedArea: z.number().int().nonnegative(),
  placements: z.array(CheatSheetPlacementSchema),
});

export const CheatSheetOverflowSchema = z.object({
  omittedBlockIds: z.array(z.string().min(1)),
  reasons: z.array(z.string().min(1)),
  hasOverflow: z.boolean(),
});

export const CheatSheetLayoutSchema = z.object({
  layoutVersion: z.string().min(1),
  policyVersion: z.string().min(1),
  pages: z.array(CheatSheetPageSchema).length(2),
  overflow: CheatSheetOverflowSchema,
  deterministicKey: z.string().min(1),
});

export const CheatSheetValidationResultSchema = z.object({
  ok: z.boolean(),
  errors: z.array(z.string()),
});

export const CheatSheetDocumentSchema = z.object({
  id: z.string().min(1),
  sheetId: z.string().min(1),
  title: z.string().min(1),
  mode: CheatSheetModeSchema,
  presetId: z.string().min(1).nullable(),
  catalogVersion: z.string().min(1),
  layoutPolicyVersion: z.string().min(1),
  masteryModelVersion: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  selectedBlockIds: z.array(z.string().min(1)),
  blockVariants: z.record(z.string(), CheatSheetVariantSchema),
  lockedBlockIds: z.array(z.string().min(1)),
  placements: z.array(CheatSheetPlacementSchema),
  printSettings: z.object({
    paper: z.literal('A4'),
    sides: z.literal('duplex'),
    colorRequired: z.literal(false),
  }),
  sourceSummary: z.array(SourceReferenceSchema),
  validationStatus: z.enum(['valid', 'overflow_reduced', 'invalid']),
});

export const CheatSheetCatalogFileSchema = z.array(CheatSheetBlockSchema);
export const CheatSheetPresetsFileSchema = z.array(CheatSheetPresetSchema);

export type CheatSheetMode = z.infer<typeof CheatSheetModeSchema>;
export type CheatSheetBlock = z.infer<typeof CheatSheetBlockSchema>;
export type CheatSheetPreset = z.infer<typeof CheatSheetPresetSchema>;
export type CheatSheetLayoutPolicy = z.infer<typeof CheatSheetLayoutPolicySchema>;
export type CheatSheetSelection = z.infer<typeof CheatSheetSelectionSchema>;
export type CheatSheetPlacement = z.infer<typeof CheatSheetPlacementSchema>;
export type CheatSheetPage = z.infer<typeof CheatSheetPageSchema>;
export type CheatSheetOverflow = z.infer<typeof CheatSheetOverflowSchema>;
export type CheatSheetLayout = z.infer<typeof CheatSheetLayoutSchema>;
export type CheatSheetDocument = z.infer<typeof CheatSheetDocumentSchema>;
export type CheatSheetValidationResult = z.infer<typeof CheatSheetValidationResultSchema>;
