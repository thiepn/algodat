import type { ExamPackage, ExamTaskDefinition } from '../../content/schemas';

export type ExamMode = 'strict_exam' | 'practice_exam';
export type ExamSessionStatus =
  | 'created'
  | 'briefing'
  | 'ready'
  | 'running'
  | 'recovery_required'
  | 'time_expired'
  | 'submitted'
  | 'graded'
  | 'archived'
  | 'invalid';

export interface ExactPoint {
  numerator: bigint;
  denominator: bigint;
}

export interface ExamTaskSessionState {
  taskSlotId: string;
  trainerId: string;
  adapterId: string;
  answer: unknown;
  answerRevision?: number;
  completionStatus: 'unanswered' | 'started' | 'incomplete' | 'complete' | 'partial' | 'answered';
  firstOpenedAt: string | null;
  lastEditedAt: string | null;
  activeTimeMs: number;
  switchCount: number;
}

export interface ExamSession {
  id: string;
  examPackageId: string;
  examPackageVersion: string;
  profileId: string | null;
  mode: ExamMode;
  status: ExamSessionStatus;
  createdAt: string;
  startedAt: string | null;
  deadlineAt: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  currentTaskSlotId: string;
  reviewFlags: Record<string, boolean>;
  taskStates: Record<string, ExamTaskSessionState>;
  timerWarningsShown: string[];
  contentVersion: string;
  masteryModelVersion: 'mastery-v6';
}

export interface ExamClockSnapshot {
  now: string;
  startedAt: string | null;
  deadlineAt: string | null;
}

export interface ExamTaskScore {
  taskSlotId: string;
  trainerId: string;
  adapterId: string;
  internalScore: number;
  internalMaximum: number;
  mappedExamScore: ExactPoint;
  examMaximum: ExactPoint;
  rubricResults: Array<{
    criterionId: string;
    label: string;
    points: number;
    maxPoints: number;
  }>;
  errors: Array<{
    errorCode: string;
    evidence: string;
    explanation: string;
    recommendedReview: string;
  }>;
  completionStatus: ExamTaskSessionState['completionStatus'];
  submittedAnswerSummary?: string;
  modelAnswer?: unknown;
  explanation?: string;
  remediationActions?: Array<{ label: string; trainerId: string; errorCode?: string }>;
}

export interface ExamScoreAggregate {
  totalScore: ExactPoint;
  maximumScore: ExactPoint;
  percentage: ExactPoint;
  taskScores: ExamTaskScore[];
}

export interface ExamTimingAnalytics {
  totalElapsedMs: number;
  perTask: Array<{
    taskSlotId: string;
    activeTimeMs: number;
    switchCount: number;
    completionStatus: ExamTaskSessionState['completionStatus'];
  }>;
  expired: boolean;
}

export interface ExamRecommendation {
  code: string;
  label: string;
  reason: string;
  trainerId: string | null;
}

export interface ExamResultReport {
  sessionId: string;
  examPackageId: string;
  title: string;
  submittedAt: string;
  aggregate: ExamScoreAggregate;
  timing: ExamTimingAnalytics;
  errorClusters: Array<{ errorCode: string; count: number; trainerIds: string[] }>;
  masteryImpact: Record<string, number>;
  recommendations: ExamRecommendation[];
}

export interface ExamRecoverySnapshot {
  id: string;
  sessionId: string;
  snapshotVersion: 'exam-snapshot-v1';
  checksum: string;
  savedAt: string;
  contentVersion: string;
  packageVersion: string;
  adapterVersions: Record<string, string>;
  taskPayloadVersions: Record<string, string>;
  payload: ExamSession;
}

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  errors: string[];
}

export interface ExamTaskAdapter {
  trainerId: string;
  taskKind: string;
  version: string;
  supportedExamModes: ExamMode[];
  initializeExamAnswer(): unknown;
  validateBeforeSubmission(answer: unknown): ValidationResult<unknown>;
  gradeAfterSubmission(answer: unknown, task: ExamTaskDefinition): ExamTaskScore;
  mapInternalScoreToExamPoints(
    score: number,
    maxScore: number,
    task: ExamTaskDefinition,
  ): ExactPoint;
  buildTaskResultSummary(score: ExamTaskScore): string;
}

export type { ExamPackage, ExamTaskDefinition };
