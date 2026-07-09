import { coreContent } from '../../content/loaders/core';
import type { MasteryRecord, PracticeAttempt } from '../../content/schemas';
import {
  canonicalRbInsertionAnswer,
  deriveRbInsertionMastery,
  emptyRbInsertionAnswer,
  evaluateRbInsertionAnswer,
  type RbInsertionAnswer,
} from '../../domain/red-black-tree';
import {
  errorRepository,
  masteryRepository,
  practiceAttemptRepository,
} from '../../persistence/repositories';
import {
  getRbInsertionRubricByTrainerId,
  getRbInsertionTrainerById,
  getRegistryEntry,
} from './trainer-service';

export type RbInsertionStoredAnswer = RbInsertionAnswer;
export type RbInsertionMode = 'learn' | 'practice' | 'exam' | 'review';

function attemptId(): string {
  return `attempt-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}

export function defaultRbInsertionAnswer(): RbInsertionStoredAnswer {
  return structuredClone(emptyRbInsertionAnswer());
}

export function rbInsertionAnswerFromAttempt(attempt: PracticeAttempt): RbInsertionStoredAnswer {
  const value = attempt.answers[0] as RbInsertionStoredAnswer | undefined;
  if (!value) throw new Error('Gespeicherter Rot-Schwarz-Versuch fehlt.');
  return value;
}

export async function createRbInsertionAttempt(
  mode: RbInsertionMode,
  trainerId = 'trainer-rot-schwarz-einfuegen-v1',
): Promise<PracticeAttempt> {
  const trainer = getRbInsertionTrainerById(trainerId);
  const rubric = getRbInsertionRubricByTrainerId(trainerId);
  const registry = getRegistryEntry(trainerId);
  if (!trainer || !rubric || !registry) throw new Error('Rot-Schwarz-Trainerinhalt fehlt.');
  const now = new Date().toISOString();
  const answer = defaultRbInsertionAnswer();
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

export async function saveRbInsertionDraft(
  attempt: PracticeAttempt,
  answer: RbInsertionStoredAnswer,
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

export function scoreStoredRbInsertionAttempt(
  _attempt: PracticeAttempt,
  answer: RbInsertionStoredAnswer,
) {
  return evaluateRbInsertionAnswer(answer);
}

export async function completeRbInsertionAttempt(
  attempt: PracticeAttempt,
  answer: RbInsertionStoredAnswer,
) {
  const trainer = getRbInsertionTrainerById(attempt.trainerId);
  if (!trainer) throw new Error('Rot-Schwarz-Trainerinhalt fehlt.');
  const now = new Date().toISOString();
  const draft = { ...attempt, answers: [answer] };
  const result = scoreStoredRbInsertionAttempt(draft, answer);
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
        step: null,
        expected: item.explanation,
        actual: item.evidence,
        explanation: item.explanation,
        severity: 'mittel',
        topicId: trainer.topicIds[0] ?? 'topic-7ae0552985f1',
        recommendedReview: item.recommendedReview,
        resolvedAt: null,
      }),
    ),
  );
  const mastery = deriveRbInsertionMastery(result);
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

export function canonicalRbInsertionAnswerForTrainer(): RbInsertionStoredAnswer {
  return structuredClone(canonicalRbInsertionAnswer());
}
