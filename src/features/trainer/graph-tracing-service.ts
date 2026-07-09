import { coreContent } from '../../content/loaders/core';
import type { MasteryRecord, PracticeAttempt } from '../../content/schemas';
import {
  canonicalGraphTracingAnswer,
  deriveGraphTracingMastery,
  emptyGraphTracingAnswer,
  evaluateGraphTracingAnswer,
  type GraphTracingAnswer,
} from '../../domain/graph-tracing';
import {
  errorRepository,
  masteryRepository,
  practiceAttemptRepository,
} from '../../persistence/repositories';
import {
  getGraphTracingRubricByTrainerId,
  getGraphTracingTrainerById,
  getRegistryEntry,
} from './trainer-service';

export type GraphTracingStoredAnswer = GraphTracingAnswer;
export type GraphTracingMode = 'learn' | 'practice' | 'exam' | 'review';

function attemptId(): string {
  return `attempt-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}

export function defaultGraphTracingAnswer(trainerId?: string): GraphTracingStoredAnswer {
  const trainer = getGraphTracingTrainerById(trainerId);
  return structuredClone(emptyGraphTracingAnswer(trainer?.problem));
}

export function graphTracingAnswerFromAttempt(attempt: PracticeAttempt): GraphTracingStoredAnswer {
  const value = attempt.answers[0] as GraphTracingStoredAnswer | undefined;
  if (!value) throw new Error('Gespeicherter Graph-Tracing-Versuch fehlt.');
  return value;
}

export async function createGraphTracingAttempt(
  mode: GraphTracingMode,
  trainerId = 'trainer-graph-floyd-warshall-v1',
): Promise<PracticeAttempt> {
  const trainer = getGraphTracingTrainerById(trainerId);
  const rubric = getGraphTracingRubricByTrainerId(trainerId);
  const registry = getRegistryEntry(trainerId);
  if (!trainer || !rubric || !registry) throw new Error('Graph-Trainerinhalt fehlt.');
  const now = new Date().toISOString();
  const answer = defaultGraphTracingAnswer(trainer.id);
  const attempt: PracticeAttempt = {
    id: attemptId(),
    schemaVersion: '1.0.0',
    contentVersion: coreContent.manifest.contentVersion,
    sourceRefs: trainer.sourceRefs,
    verificationStatus: 'verified_against_official_source',
    lastReviewed: now,
    duplicateGroupId: null,
    itemId: trainer.problem.id,
    trainerId: trainer.id,
    trainerKind: 'tracing',
    itemContentVersion: trainer.problem.contentVersion,
    mode,
    status: 'draft',
    startedAt: now,
    completedAt: null,
    durationMs: 0,
    answers: [answer],
    score: null,
    maxScore: rubric.maxPoints,
    rubricResults: [],
    errorCodes: [],
    hintsUsed: [],
    solutionRevealed: false,
    canonicalTraceVersion: registry.engineVersion,
    canonicalProofVersion: trainer.canonicalSolutionVersion,
    sourceVersion: coreContent.manifest.contentVersion,
    engineVersion: registry.engineVersion,
    problemVersion: trainer.problem.contentVersion,
    scoringModelVersion: registry.scoringModelVersion,
    masteryModelVersion: registry.masteryModelVersion,
    answerPayloadSchemaVersion: trainer.answerPayloadSchemaVersion,
    preflightAnswers: {},
    attemptedAt: now,
    storedContentVersion: coreContent.manifest.contentVersion,
  };
  await practiceAttemptRepository.put(attempt);
  return attempt;
}

export async function saveGraphTracingDraft(
  attempt: PracticeAttempt,
  answer: GraphTracingStoredAnswer,
  hintsUsed = attempt.hintsUsed,
  solutionRevealed = attempt.solutionRevealed,
) {
  await practiceAttemptRepository.put({
    ...attempt,
    answers: [answer],
    hintsUsed,
    solutionRevealed,
    durationMs: Math.max(0, Date.now() - new Date(attempt.startedAt).getTime()),
    lastReviewed: new Date().toISOString(),
  });
}

export function scoreStoredGraphTracingAttempt(
  attempt: PracticeAttempt,
  answer: GraphTracingStoredAnswer,
) {
  const trainer = getGraphTracingTrainerById(attempt.trainerId);
  if (!trainer) throw new Error('Graph-Trainerinhalt fehlt.');
  return evaluateGraphTracingAnswer(trainer.problem, answer);
}

export async function completeGraphTracingAttempt(
  attempt: PracticeAttempt,
  answer: GraphTracingStoredAnswer,
) {
  const trainer = getGraphTracingTrainerById(attempt.trainerId);
  if (!trainer) throw new Error('Graph-Trainerinhalt fehlt.');
  const now = new Date().toISOString();
  const draft = { ...attempt, answers: [answer] };
  const result = scoreStoredGraphTracingAttempt(draft, answer);
  const completed: PracticeAttempt = {
    ...draft,
    status: 'completed',
    completedAt: now,
    durationMs: Math.max(0, Date.now() - new Date(attempt.startedAt).getTime()),
    score: result.points,
    maxScore: result.maxPoints,
    rubricResults: result.rubricResults,
    errorCodes: result.errors.map((item) => item.errorCode),
    lastReviewed: now,
  };
  await practiceAttemptRepository.put(completed);
  await Promise.all(
    result.errors.map((item, index) =>
      errorRepository.put({
        id: `${attempt.id}-error-${index + 1}`,
        schemaVersion: '1.0.0',
        contentVersion: coreContent.manifest.contentVersion,
        sourceRefs: trainer.sourceRefs,
        verificationStatus: 'verified_against_official_source',
        lastReviewed: now,
        duplicateGroupId: null,
        attemptId: attempt.id,
        category: item.errorCode,
        evidence: item.evidence,
        errorCode: item.errorCode,
        step: item.step,
        expected: item.expected,
        actual: item.actual,
        explanation: item.explanation,
        severity: item.severity,
        topicId: item.topicId,
        recommendedReview: item.recommendedReview,
        resolvedAt: null,
      }),
    ),
  );
  const mastery = deriveGraphTracingMastery(result);
  const masteryRecord: MasteryRecord = {
    id: `mastery-${attempt.trainerId}`,
    schemaVersion: '1.0.0',
    contentVersion: coreContent.manifest.contentVersion,
    sourceRefs: trainer.sourceRefs,
    verificationStatus: 'verified_against_official_source',
    lastReviewed: now,
    duplicateGroupId: null,
    topicOrTaskId: attempt.trainerId,
    dimensions: mastery.dimensions,
    evidenceAttemptIds: [attempt.id],
    updatedAt: now,
  };
  await masteryRepository.put(masteryRecord);
  return { completed, result, mastery };
}

export function canonicalGraphTracingAnswerForTrainer(
  trainerId = 'trainer-graph-floyd-warshall-v1',
): GraphTracingStoredAnswer {
  const trainer = getGraphTracingTrainerById(trainerId);
  if (!trainer) return defaultGraphTracingAnswer(trainerId);
  return structuredClone(canonicalGraphTracingAnswer(trainer.problem));
}
