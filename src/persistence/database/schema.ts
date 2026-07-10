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
export const DATABASE_VERSION = 13;

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
}
