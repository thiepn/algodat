import { z } from 'zod';

export const VerificationStatusSchema = z.enum([
  'official_verified',
  'verified_against_official_source',
  'official_solution_available',
  'unofficial_solution_only',
  'generated_unverified',
  'conflict_detected',
  'extraction_uncertain',
  'visual_review_required',
]);

export const EvidenceTypeSchema = z.enum([
  'real_exam',
  'mock_exam',
  'exercise',
  'tutorial',
  'official_solution',
  'unofficial_solution',
  'generated_example',
  'source_aligned_generated_exercise',
  'unknown',
]);

export const SourceReferenceSchema = z.object({
  sourceId: z.string().min(1),
  page: z.number().int().positive(),
  label: z.string().min(1).optional(),
});

export const CanonicalMetaShape = {
  id: z.string().min(1),
  schemaVersion: z.string().min(1),
  contentVersion: z.string().min(1),
  sourceRefs: z.array(SourceReferenceSchema),
  verificationStatus: VerificationStatusSchema,
  lastReviewed: z.string().min(1),
  duplicateGroupId: z.string().nullable().optional(),
};

export const CanonicalMetaSchema = z.object(CanonicalMetaShape);

export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;
export type EvidenceType = z.infer<typeof EvidenceTypeSchema>;
export type SourceReference = z.infer<typeof SourceReferenceSchema>;
