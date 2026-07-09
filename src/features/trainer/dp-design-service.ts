import { coreContent } from '../../content/loaders/core';
import type { MasteryRecord, PracticeAttempt } from '../../content/schemas';
import {
  canonicalMineDesignAnswer,
  canonicalMineDesignText,
  deriveDpDesignMastery,
  emptyMineDesignAnswer,
  evaluateMineDesign,
  type DpDesignAnswer,
  type DpDesignMode,
} from '../../domain/dp-design';
import {
  errorRepository,
  masteryRepository,
  practiceAttemptRepository,
} from '../../persistence/repositories';
import {
  getDpDesignRubricByTrainerId,
  getDpDesignTrainerById,
  getRegistryEntry,
} from './trainer-service';

export type DpDesignStoredAnswer = DpDesignAnswer;

function attemptId(): string {
  return `attempt-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}

export function defaultDpDesignAnswer(): DpDesignStoredAnswer {
  return structuredClone(emptyMineDesignAnswer());
}

export function dpDesignAnswerFromAttempt(attempt: PracticeAttempt): DpDesignStoredAnswer {
  const value = attempt.answers[0] as DpDesignStoredAnswer | undefined;
  if (!value) throw new Error('Gespeicherter DP-Entwurfsversuch fehlt.');
  return value;
}

export async function createDpDesignAttempt(
  mode: DpDesignMode,
  trainerId = 'trainer-dp-entwurf-mine-v1',
): Promise<PracticeAttempt> {
  const trainer = getDpDesignTrainerById(trainerId);
  const rubric = getDpDesignRubricByTrainerId(trainerId);
  const registry = getRegistryEntry(trainerId);
  if (!trainer || !rubric || !registry) throw new Error('DP-Entwurfstrainerinhalt fehlt.');
  const now = new Date().toISOString();
  const answer = defaultDpDesignAnswer();
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
    trainerKind: 'design',
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

export async function saveDpDesignDraft(
  attempt: PracticeAttempt,
  answer: DpDesignStoredAnswer,
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

export function scoreStoredDpDesignAttempt(
  attempt: PracticeAttempt,
  answer = dpDesignAnswerFromAttempt(attempt),
) {
  return evaluateMineDesign(answer, {
    mode: attempt.mode as DpDesignMode,
    hintsUsed: attempt.hintsUsed,
    solutionRevealed: attempt.solutionRevealed,
  });
}

export async function completeDpDesignAttempt(
  attempt: PracticeAttempt,
  answer: DpDesignStoredAnswer,
) {
  const trainer = getDpDesignTrainerById(attempt.trainerId);
  if (!trainer) throw new Error('DP-Entwurfstrainerinhalt fehlt.');
  const now = new Date().toISOString();
  const draft = { ...attempt, answers: [answer] };
  const result = scoreStoredDpDesignAttempt(draft, answer);
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
  const mastery = deriveDpDesignMastery(
    attempts.map((candidate) => ({
      id: candidate.id,
      mode: candidate.mode as DpDesignMode,
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

export function canonicalDpDesignAnswerForTrainer(): DpDesignStoredAnswer {
  return structuredClone(canonicalMineDesignAnswer());
}

export function canonicalDpDesignTextForTrainer(): string[] {
  return canonicalMineDesignText();
}
