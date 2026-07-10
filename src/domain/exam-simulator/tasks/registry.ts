import type { PracticeAttempt } from '../../../content/schemas';
import {
  canonicalDpDesignAnswerForTrainer,
  scoreStoredDpDesignAttempt,
} from '../../../features/trainer/dp-design-service';
import {
  canonicalDivideConquerDesignAnswerForTrainer,
  scoreStoredDivideConquerDesignAttempt,
} from '../../../features/trainer/divide-conquer-design-service';
import {
  canonicalGreedyDesignAnswerForTrainer,
  scoreStoredGreedyDesignAttempt,
} from '../../../features/trainer/greedy-design-service';
import {
  canonicalGraphTracingAnswerForTrainer,
  scoreStoredGraphTracingAttempt,
} from '../../../features/trainer/graph-tracing-service';
import {
  canonicalRbInsertionAnswerForTrainer,
  scoreStoredRbInsertionAttempt,
} from '../../../features/trainer/rb-insertion-service';
import {
  canonicalProofAnswerForTrainer,
  scoreStoredProofAttempt,
} from '../../../features/trainer/proof-service';
import {
  canonicalRecurrenceAnswerForTrainer,
  scoreStoredRecurrenceAttempt,
} from '../../../features/trainer/recurrence-service';
import {
  canonicalAnswerForTrainer,
  getDivideConquerDesignTrainerById,
  getDpDesignTrainerById,
  getGreedyDesignTrainerById,
  getGraphTracingTrainerById,
  getProofTrainerById,
  getRbInsertionTrainerById,
  getRecurrenceTrainerById,
  getRegistryEntry,
  getTrainerById,
  scoreAttempt,
} from '../../../features/trainer/trainer-service';
import { exact, exactFromContent, multiplyExact, divideExact } from '../scoring/exact-points';
import type {
  ExamTaskAdapter,
  ExamTaskDefinition,
  ExamTaskScore,
  ValidationResult,
} from '../types';

function attemptFor(
  trainerId: string,
  answer: unknown,
  mode: PracticeAttempt['mode'] = 'exam',
): PracticeAttempt {
  const now = new Date().toISOString();
  return {
    id: `exam-adapter-${trainerId}`,
    schemaVersion: '1.0.0',
    contentVersion: 'exam-adapter',
    sourceRefs: [],
    verificationStatus: 'verified_against_official_source',
    lastReviewed: now,
    duplicateGroupId: null,
    itemId: trainerId,
    trainerId,
    trainerKind: 'tracing',
    itemContentVersion: 'exam-adapter',
    mode,
    status: 'completed',
    startedAt: now,
    completedAt: now,
    durationMs: 0,
    answers: [answer],
    score: null,
    maxScore: 0,
    rubricResults: [],
    errorCodes: [],
    hintsUsed: [],
    solutionRevealed: false,
    canonicalTraceVersion: 'exam-adapter',
    sourceVersion: 'exam-adapter',
    preflightAnswers: {},
    attemptedAt: now,
    storedContentVersion: 'exam-adapter',
  };
}

function zeroScore(task: ExamTaskDefinition, errorCode = 'exam_task_unanswered'): ExamTaskScore {
  return {
    taskSlotId: task.taskSlotId,
    trainerId: task.trainerId,
    adapterId: task.adapterId,
    internalScore: 0,
    internalMaximum: task.internalMaxPoints,
    mappedExamScore: exact(0),
    examMaximum: exactFromContent(task.examPoints),
    rubricResults: [],
    errors: [
      {
        errorCode,
        evidence: 'Keine bewertbare Antwort abgegeben.',
        explanation: 'Die Aufgabe wurde leer oder mit ungültiger Payload abgegeben.',
        recommendedReview: 'Einzeltrainer im Prüfungsmodus wiederholen.',
      },
    ],
    completionStatus: 'unanswered',
  };
}

function isStudentTextFallback(answer: unknown): boolean {
  return (
    !!answer &&
    typeof answer === 'object' &&
    'kind' in answer &&
    (answer as { kind?: unknown }).kind === 'student_text_answer'
  );
}

function mapScore(score: number, maxScore: number, task: ExamTaskDefinition) {
  if (maxScore <= 0) return exact(0);
  return multiplyExact(
    exactFromContent(task.examPoints),
    divideExact(exact(score), exact(maxScore)),
  );
}

function normalizeResult(
  task: ExamTaskDefinition,
  result: {
    points: number;
    maxPoints: number;
    rubricResults: ExamTaskScore['rubricResults'];
    errors: Array<{
      errorCode: string;
      evidence: string;
      explanation: string;
      recommendedReview: string;
    }>;
  },
): ExamTaskScore {
  return {
    taskSlotId: task.taskSlotId,
    trainerId: task.trainerId,
    adapterId: task.adapterId,
    internalScore: result.points,
    internalMaximum: result.maxPoints,
    mappedExamScore: mapScore(result.points, result.maxPoints, task),
    examMaximum: exactFromContent(task.examPoints),
    rubricResults: result.rubricResults,
    errors: result.errors,
    completionStatus: result.points > 0 ? 'answered' : 'partial',
  };
}

function baseAdapter(
  trainerId: string,
  taskKind: string,
  initializeExamAnswer: () => unknown,
  grade: (answer: unknown, task: ExamTaskDefinition) => ExamTaskScore,
): ExamTaskAdapter {
  return {
    trainerId,
    taskKind,
    version: `${taskKind}-adapter-v1`,
    supportedExamModes: ['strict_exam', 'practice_exam'],
    initializeExamAnswer,
    validateBeforeSubmission(answer: unknown): ValidationResult<unknown> {
      return { ok: true, value: answer, errors: [] };
    },
    gradeAfterSubmission: grade,
    mapInternalScoreToExamPoints: mapScore,
    buildTaskResultSummary(score) {
      return `${score.trainerId}: ${score.internalScore}/${score.internalMaximum} interne Punkte.`;
    },
  };
}

export const examTaskAdapters: ExamTaskAdapter[] = [
  baseAdapter(
    'trainer-rucksack-dp-v1',
    'knapsack',
    () => ({ kind: 'knapsack_exam_empty' }),
    (answer, task) => {
      const trainer = getTrainerById(task.trainerId);
      if (!trainer) return zeroScore(task, 'exam_task_missing_trainer');
      if (isStudentTextFallback(answer)) return zeroScore(task, 'exam_task_text_answer_unscored');
      if (!answer || typeof answer !== 'object' || !('kind' in answer)) return zeroScore(task);
      const result = scoreAttempt(trainer, attemptFor(task.trainerId, answer));
      return normalizeResult(task, result);
    },
  ),
  baseAdapter(
    'trainer-union-find-listen-v1',
    'union_find',
    () => ({ kind: 'union_find_exam_empty' }),
    (answer, task) => {
      const trainer = getTrainerById(task.trainerId);
      if (!trainer) return zeroScore(task, 'exam_task_missing_trainer');
      if (isStudentTextFallback(answer)) return zeroScore(task, 'exam_task_text_answer_unscored');
      if (!answer || typeof answer !== 'object' || !('kind' in answer)) return zeroScore(task);
      const result = scoreAttempt(trainer, attemptFor(task.trainerId, answer));
      return normalizeResult(task, result);
    },
  ),
  baseAdapter(
    'trainer-schleifeninvariante-summe-v1',
    'proof_loop_invariant',
    () => ({ kind: 'proof_exam_empty' }),
    (answer, task) => {
      if (!getProofTrainerById(task.trainerId)) return zeroScore(task, 'exam_task_missing_trainer');
      if (isStudentTextFallback(answer)) return zeroScore(task, 'exam_task_text_answer_unscored');
      if (!answer || typeof answer !== 'object') return zeroScore(task);
      const result = scoreStoredProofAttempt(attemptFor(task.trainerId, answer), answer as never);
      return normalizeResult(task, result);
    },
  ),
  baseAdapter(
    'trainer-rekurrenz-master-fall1-v1',
    'recurrence_runtime_proof',
    () => ({ kind: 'recurrence_exam_empty' }),
    (answer, task) => {
      if (!getRecurrenceTrainerById(task.trainerId))
        return zeroScore(task, 'exam_task_missing_trainer');
      if (isStudentTextFallback(answer)) return zeroScore(task, 'exam_task_text_answer_unscored');
      if (!answer || typeof answer !== 'object') return zeroScore(task);
      const result = scoreStoredRecurrenceAttempt(
        attemptFor(task.trainerId, answer),
        answer as never,
      );
      return normalizeResult(task, result);
    },
  ),
  baseAdapter(
    'trainer-dp-entwurf-mine-v1',
    'dp_design_mine',
    () => ({ kind: 'dp_design_exam_empty' }),
    (answer, task) => {
      if (!getDpDesignTrainerById(task.trainerId))
        return zeroScore(task, 'exam_task_missing_trainer');
      if (isStudentTextFallback(answer)) return zeroScore(task, 'exam_task_text_answer_unscored');
      if (!answer || typeof answer !== 'object') return zeroScore(task);
      const result = scoreStoredDpDesignAttempt(
        attemptFor(task.trainerId, answer),
        answer as never,
      );
      return normalizeResult(task, result);
    },
  ),
  baseAdapter(
    'trainer-greedy-entwurf-fitnesspunkte-v1',
    'greedy_design_fitnesspunkte',
    () => ({ kind: 'greedy_design_exam_empty' }),
    (answer, task) => {
      if (!getGreedyDesignTrainerById(task.trainerId))
        return zeroScore(task, 'exam_task_missing_trainer');
      if (isStudentTextFallback(answer)) return zeroScore(task, 'exam_task_text_answer_unscored');
      if (!answer || typeof answer !== 'object') return zeroScore(task);
      const result = scoreStoredGreedyDesignAttempt(
        attemptFor(task.trainerId, answer),
        answer as never,
      );
      return normalizeResult(task, result);
    },
  ),
  baseAdapter(
    'trainer-dc-entwurf-maxwertdifferenz-v1',
    'divide_conquer_max_difference',
    () => ({ kind: 'divide_conquer_exam_empty' }),
    (answer, task) => {
      if (!getDivideConquerDesignTrainerById(task.trainerId))
        return zeroScore(task, 'exam_task_missing_trainer');
      if (isStudentTextFallback(answer)) return zeroScore(task, 'exam_task_text_answer_unscored');
      if (!answer || typeof answer !== 'object') return zeroScore(task);
      const result = scoreStoredDivideConquerDesignAttempt(
        attemptFor(task.trainerId, answer),
        answer as never,
      );
      return normalizeResult(task, result);
    },
  ),
  baseAdapter(
    'trainer-rot-schwarz-einfuegen-v1',
    'red_black_tree_insertion',
    () => ({ kind: 'rb_insertion_exam_empty' }),
    (answer, task) => {
      if (!getRbInsertionTrainerById(task.trainerId))
        return zeroScore(task, 'exam_task_missing_trainer');
      if (isStudentTextFallback(answer)) return zeroScore(task, 'exam_task_text_answer_unscored');
      if (!answer || typeof answer !== 'object') return zeroScore(task);
      const result = scoreStoredRbInsertionAttempt(
        attemptFor(task.trainerId, answer),
        answer as never,
      );
      return normalizeResult(task, result);
    },
  ),
  baseAdapter(
    'trainer-graph-floyd-warshall-v1',
    'floyd_warshall_matrix',
    () => ({ kind: 'floyd_warshall_exam_empty' }),
    (answer, task) => {
      if (!getGraphTracingTrainerById(task.trainerId))
        return zeroScore(task, 'exam_task_missing_trainer');
      if (isStudentTextFallback(answer)) return zeroScore(task, 'exam_task_text_answer_unscored');
      if (!answer || typeof answer !== 'object') return zeroScore(task);
      const result = scoreStoredGraphTracingAttempt(
        attemptFor(task.trainerId, answer),
        answer as never,
      );
      return normalizeResult(task, result);
    },
  ),
  baseAdapter(
    'trainer-graph-dijkstra-v1',
    'dijkstra_trace',
    () => ({ kind: 'dijkstra_exam_empty' }),
    (answer, task) => {
      if (!getGraphTracingTrainerById(task.trainerId))
        return zeroScore(task, 'exam_task_missing_trainer');
      if (isStudentTextFallback(answer)) return zeroScore(task, 'exam_task_text_answer_unscored');
      if (!answer || typeof answer !== 'object') return zeroScore(task);
      const result = scoreStoredGraphTracingAttempt(
        attemptFor(task.trainerId, answer),
        answer as never,
      );
      return normalizeResult(task, result);
    },
  ),
  baseAdapter(
    'trainer-graph-prim-mst-v1',
    'prim_mst_trace',
    () => ({ kind: 'prim_mst_exam_empty' }),
    (answer, task) => {
      if (!getGraphTracingTrainerById(task.trainerId))
        return zeroScore(task, 'exam_task_missing_trainer');
      if (isStudentTextFallback(answer)) return zeroScore(task, 'exam_task_text_answer_unscored');
      if (!answer || typeof answer !== 'object') return zeroScore(task);
      const result = scoreStoredGraphTracingAttempt(
        attemptFor(task.trainerId, answer),
        answer as never,
      );
      return normalizeResult(task, result);
    },
  ),
];

export function getExamTaskAdapter(trainerId: string): ExamTaskAdapter {
  const adapter = examTaskAdapters.find((candidate) => candidate.trainerId === trainerId);
  if (!adapter) throw new Error(`Kein Prüfungsadapter für ${trainerId}.`);
  return adapter;
}

export function createCanonicalExamAnswer(trainerId: string): unknown {
  const registry = getRegistryEntry(trainerId);
  if (!registry) return null;
  if (registry.rendererType === 'proof_loop_invariant') return canonicalProofAnswerForTrainer();
  if (registry.rendererType === 'recurrence_runtime_proof')
    return canonicalRecurrenceAnswerForTrainer();
  if (registry.rendererType === 'dp_design_mine') return canonicalDpDesignAnswerForTrainer();
  if (registry.rendererType === 'divide_conquer_max_difference')
    return canonicalDivideConquerDesignAnswerForTrainer();
  if (registry.rendererType === 'greedy_design_fitnesspunkte')
    return canonicalGreedyDesignAnswerForTrainer();
  if (registry.rendererType === 'red_black_tree_insertion')
    return canonicalRbInsertionAnswerForTrainer();
  if (registry.rendererType === 'floyd_warshall_matrix')
    return canonicalGraphTracingAnswerForTrainer(trainerId);
  if (registry.rendererType === 'dijkstra_trace')
    return canonicalGraphTracingAnswerForTrainer(trainerId);
  if (registry.rendererType === 'prim_mst_trace')
    return canonicalGraphTracingAnswerForTrainer(trainerId);
  const trainer = getTrainerById(trainerId);
  return trainer ? canonicalAnswerForTrainer(trainer) : null;
}
