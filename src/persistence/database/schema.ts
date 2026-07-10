import type { DBSchema } from 'idb';
import { z } from 'zod';
import {
  ErrorRecordSchema,
  ExamResultSchema,
  ExamSessionSchema,
  ExamSnapshotSchema,
  MasteryRecordSchema,
  PracticeAttemptSchema,
  StudySessionSchema,
} from '../../content/schemas';
import { DiagnosticSessionSchema } from '../../domain/foundations-diagnostic/schemas';
import {
  DailyStudyPlanSchema,
  ReviewScheduleSchema,
  StudyPlanSettingsSchema,
  WeeklyStudyPlanSchema,
} from '../../domain/study-orchestrator/schemas';
import { CheatSheetDocumentSchema } from '../../domain/cheat-sheet/schemas';

export const DATABASE_NAME = 'algodat-study-system';
export const DATABASE_VERSION = 12;

export const CropRegionSchema = z.object({
  page: z.number().int().positive(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().positive().max(1),
  height: z.number().positive().max(1),
  coordinateSystem: z.literal('normalized_page'),
});

export const SourceTaskRegionSchema = z.object({
  id: z.string(),
  regionId: z.string(),
  sourceId: z.string(),
  documentKind: z.enum([
    'exercise_sheet',
    'exercise_solution',
    'mock_exam',
    'past_exam',
    'exam_solution',
    'lecture_reference',
  ]),
  year: z.number().int().nullable(),
  sheetNumber: z.number().int().positive().nullable(),
  examId: z.string().nullable(),
  taskNumber: z.number().int().positive(),
  subtask: z.string().nullable(),
  pageStart: z.number().int().positive(),
  pageEnd: z.number().int().positive(),
  cropRegions: z.array(CropRegionSchema),
  solutionSourceId: z.string().nullable(),
  solutionPageStart: z.number().int().positive().nullable(),
  solutionPageEnd: z.number().int().positive().nullable(),
  topicIds: z.array(z.string()),
  trainerIds: z.array(z.string()),
  taskSlot: z.number().int().positive().nullable(),
  verificationStatus: z.enum([
    'source_verified',
    'metadata_only',
    'needs_local_review',
    'local_user_indexed',
  ]),
  updatedAt: z.string(),
});

export const LocalDocumentBindingSchema = z.object({
  id: z.string(),
  bindingId: z.string(),
  sourceId: z.string(),
  expectedFilename: z.string(),
  actualFilename: z.string(),
  fileHandleMetadata: z
    .object({
      name: z.string(),
      lastModified: z.number().nullable(),
      webkitRelativePath: z.string().optional(),
    })
    .nullable(),
  displayName: z.string(),
  fileName: z.string(),
  mimeType: z.literal('application/pdf'),
  sizeBytes: z.number().int().nonnegative(),
  byteSize: z.number().int().nonnegative(),
  pageCount: z.number().int().positive().nullable(),
  sha256: z.string().nullable(),
  connectedAt: z.string(),
  lastOpenedAt: z.string().nullable(),
  updatedAt: z.string(),
  storageBackend: z.enum(['indexeddb_arraybuffer', 'opfs_unavailable']),
  permissionState: z.enum(['granted', 'prompt', 'denied', 'unknown']),
  matchingState: z.enum([
    'exact_hash_match',
    'filename_match',
    'probable_match',
    'manual_match',
    'unbound',
    'mismatch',
  ]),
  bytes: z.instanceof(ArrayBuffer),
});

export const UserPreferencesSchema = z.object({
  id: z.literal('preferences'),
  selectedExamProfileId: z.string(),
  reducedMotion: z.boolean(),
  updatedAt: z.string(),
});

export const PersistenceExportSchema = z.object({
  databaseVersion: z.number().int().min(1).max(DATABASE_VERSION),
  contentVersion: z.string(),
  exportedAt: z.string(),
  studySessions: z.array(StudySessionSchema),
  practiceAttempts: z.array(PracticeAttemptSchema),
  masteryRecords: z.array(MasteryRecordSchema),
  errorRecords: z.array(ErrorRecordSchema),
  examSessions: z.array(ExamSessionSchema),
  examSnapshots: z.array(ExamSnapshotSchema),
  examResults: z.array(ExamResultSchema),
  diagnosticSessions: z.array(DiagnosticSessionSchema),
  studyPlans: z.array(z.union([DailyStudyPlanSchema, WeeklyStudyPlanSchema])).default([]),
  studyPlanSettings: z.array(StudyPlanSettingsSchema).default([]),
  reviewSchedules: z.array(ReviewScheduleSchema).default([]),
  cheatSheets: z.array(CheatSheetDocumentSchema).default([]),
  localDocuments: z.array(LocalDocumentBindingSchema).default([]),
  localTaskRegions: z.array(SourceTaskRegionSchema).default([]),
  preferences: UserPreferencesSchema.nullable(),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type PersistenceExport = z.infer<typeof PersistenceExportSchema>;
export type StudySession = z.infer<typeof StudySessionSchema>;
export type PracticeAttempt = z.infer<typeof PracticeAttemptSchema>;
export type MasteryRecord = z.infer<typeof MasteryRecordSchema>;
export type ErrorRecord = z.infer<typeof ErrorRecordSchema>;
export type ExamSession = z.infer<typeof ExamSessionSchema>;
export type ExamSnapshot = z.infer<typeof ExamSnapshotSchema>;
export type ExamResult = z.infer<typeof ExamResultSchema>;
export type DiagnosticSession = z.infer<typeof DiagnosticSessionSchema>;
export type StudyPlan =
  z.infer<typeof DailyStudyPlanSchema> | z.infer<typeof WeeklyStudyPlanSchema>;
export type StudyPlanSettings = z.infer<typeof StudyPlanSettingsSchema>;
export type ReviewSchedule = z.infer<typeof ReviewScheduleSchema>;
export type CheatSheetDocument = z.infer<typeof CheatSheetDocumentSchema>;
export type LocalDocumentBinding = z.infer<typeof LocalDocumentBindingSchema>;
export type CropRegion = z.infer<typeof CropRegionSchema>;
export type SourceTaskRegion = z.infer<typeof SourceTaskRegionSchema>;

export interface AlgoDatDatabase extends DBSchema {
  studySessions: { key: string; value: StudySession };
  practiceAttempts: {
    key: string;
    value: PracticeAttempt;
    indexes: { 'by-item': string; 'by-trainer': string };
  };
  masteryRecords: { key: string; value: MasteryRecord };
  errorRecords: { key: string; value: ErrorRecord; indexes: { 'by-attempt': string } };
  preferences: { key: string; value: UserPreferences };
  examSessions: { key: string; value: ExamSession; indexes: { 'by-package': string } };
  examSnapshots: { key: string; value: ExamSnapshot; indexes: { 'by-session': string } };
  examResults: { key: string; value: ExamResult; indexes: { 'by-session': string } };
  diagnosticSessions: {
    key: string;
    value: DiagnosticSession;
    indexes: { 'by-mode': string };
  };
  studyPlans: {
    key: string;
    value: StudyPlan;
    indexes: { 'by-date': string; 'by-type': string };
  };
  studyPlanSettings: { key: string; value: StudyPlanSettings };
  reviewSchedules: {
    key: string;
    value: ReviewSchedule;
    indexes: { 'by-next-due': string };
  };
  cheatSheets: {
    key: string;
    value: CheatSheetDocument;
    indexes: { 'by-updated': string; 'by-mode': string };
  };
  localDocuments: {
    key: string;
    value: LocalDocumentBinding;
    indexes: { 'by-source': string; 'by-updated': string };
  };
  localTaskRegions: {
    key: string;
    value: SourceTaskRegion;
    indexes: { 'by-source': string; 'by-region': string; 'by-updated': string };
  };
}
