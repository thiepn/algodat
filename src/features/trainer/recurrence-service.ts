import { coreContent } from '../../content/loaders/core';
import type { MasteryRecord, PracticeAttempt } from '../../content/schemas';
import {
  canonicalRecurrenceAttempt,
  canonicalRecurrenceProofText,
  createRecurrenceProblem,
  deriveRecurrenceMastery,
  emptyRecurrenceAttempt,
  evaluateRecurrenceProof,
  type RecurrenceMode,
  type RuntimeProofAnswer,
} from '../../domain/recurrences';
import {
  errorRepository,
  masteryRepository,
  practiceAttemptRepository,
} from '../../persistence/repositories';
import {
  getRecurrenceRubricByTrainerId,
  getRecurrenceTrainerById,
  getRegistryEntry,
} from './trainer-service';

export type RecurrenceStoredAnswer = RuntimeProofAnswer;

function attemptId(): string {
  return `attempt-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}

export function defaultRecurrenceAnswer(): RecurrenceStoredAnswer {
  return structuredClone(emptyRecurrenceAttempt());
}

export function recurrenceAnswerFromAttempt(attempt: PracticeAttempt): RecurrenceStoredAnswer {
  const value = attempt.answers[0] as RecurrenceStoredAnswer | undefined;
  if (!value) throw new Error('Gespeicherter Rekurrenzversuch fehlt.');
  return value;
}

export async function createRecurrenceAttempt(
  mode: RecurrenceMode,
  trainerId = 'trainer-rekurrenz-master-fall1-v1',
): Promise<PracticeAttempt> {
  const trainer = getRecurrenceTrainerById(trainerId);
  const rubric = getRecurrenceRubricByTrainerId(trainerId);
  const registry = getRegistryEntry(trainerId);
  if (!trainer || !rubric || !registry) throw new Error('Rekurrenztrainerinhalt fehlt.');
  const now = new Date().toISOString();
  const answer = defaultRecurrenceAnswer();
  const canonicalProofVersion = trainer.problem.canonical.canonicalProofVersion;
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
    trainerKind: 'proof',
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
    canonicalProofVersion,
    sourceVersion: coreContent.manifest.contentVersion,
    engineVersion: registry.engineVersion,
    problemVersion: trainer.problem.contentVersion,
    scoringModelVersion: registry.scoringModelVersion,
    masteryModelVersion: registry.masteryModelVersion,
    answerPayloadSchemaVersion: 'recurrence-answer-v1',
    preflightAnswers: { ...answer.preflight },
    attemptedAt: now,
    storedContentVersion: coreContent.manifest.contentVersion,
  };
  await practiceAttemptRepository.put(attempt);
  return attempt;
}

export async function saveRecurrenceDraft(
  attempt: PracticeAttempt,
  answer: RecurrenceStoredAnswer,
  hintsUsed = attempt.hintsUsed,
  solutionRevealed = attempt.solutionRevealed,
) {
  await practiceAttemptRepository.put({
    ...attempt,
    answers: [answer],
    hintsUsed,
    solutionRevealed,
    preflightAnswers: { ...answer.preflight },
    durationMs: Math.max(0, Date.now() - new Date(attempt.startedAt).getTime()),
    lastReviewed: new Date().toISOString(),
  });
}

export function scoreStoredRecurrenceAttempt(
  attempt: PracticeAttempt,
  answer = recurrenceAnswerFromAttempt(attempt),
) {
  return evaluateRecurrenceProof(createRecurrenceProblem(), answer, {
    mode: attempt.mode as RecurrenceMode,
    hintsUsed: attempt.hintsUsed,
    solutionRevealed: attempt.solutionRevealed,
  });
}

export async function completeRecurrenceAttempt(
  attempt: PracticeAttempt,
  answer: RecurrenceStoredAnswer,
) {
  const trainer = getRecurrenceTrainerById(attempt.trainerId);
  if (!trainer) throw new Error('Rekurrenztrainerinhalt fehlt.');
  const now = new Date().toISOString();
  const draft = { ...attempt, answers: [answer], preflightAnswers: { ...answer.preflight } };
  const result = scoreStoredRecurrenceAttempt(draft, answer);
  const completed: PracticeAttempt = {
    ...draft,
    status: 'completed',
    completedAt: now,
    durationMs: Math.max(0, Date.now() - new Date(attempt.startedAt).getTime()),
    score: result.points,
    maxScore: result.maxPoints,
    rubricResults: result.rubricResults,
    errorCodes: result.errors.map((error) => error.errorCode),
    lastReviewed: now,
  };
  await practiceAttemptRepository.put(completed);
  await Promise.all(
    result.errors.map((error, index) =>
      errorRepository.put({
        id: `${attempt.id}-error-${index + 1}`,
        schemaVersion: '1.0.0',
        contentVersion: coreContent.manifest.contentVersion,
        sourceRefs: trainer.sourceRefs,
        verificationStatus: 'verified_against_official_source',
        lastReviewed: now,
        duplicateGroupId: null,
        attemptId: attempt.id,
        category: error.errorCode,
        evidence: error.evidence,
        errorCode: error.errorCode,
        step: error.step,
        expected: error.expected,
        actual: error.actual,
        explanation: error.explanation,
        severity: error.severity,
        topicId: error.topicId,
        recommendedReview: error.recommendedReview,
        resolvedAt: null,
      }),
    ),
  );
  const attempts = (await practiceAttemptRepository.list()).filter(
    (candidate) => candidate.trainerId === attempt.trainerId && candidate.status === 'completed',
  );
  const mastery = deriveRecurrenceMastery(
    attempts.map((candidate) => ({
      id: candidate.id,
      mode: candidate.mode as RecurrenceMode,
      score: candidate.score ?? 0,
      maxScore: candidate.maxScore,
      errorCodes: candidate.errorCodes,
      hintsUsed: candidate.hintsUsed,
      solutionRevealed: candidate.solutionRevealed,
    })),
  );
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
    evidenceAttemptIds: mastery.evidenceAttemptIds,
    updatedAt: now,
  };
  await masteryRepository.put(masteryRecord);
  return { completed, result, mastery };
}

export function canonicalRecurrenceAnswerForTrainer(): RecurrenceStoredAnswer {
  return structuredClone(canonicalRecurrenceAttempt());
}

export function canonicalRecurrenceTextForTrainer(): string[] {
  return canonicalRecurrenceProofText();
}
