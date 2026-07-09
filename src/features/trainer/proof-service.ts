import { coreContent } from '../../content/loaders/core';
import type { MasteryRecord, PracticeAttempt } from '../../content/schemas';
import {
  canonicalProofAttempt,
  createSumProofProblem,
  deriveProofMastery,
  generateCanonicalProofText,
  scoreProofAttempt,
} from '../../domain/proofs';
import type { ProofMode, StructuredProof } from '../../domain/proofs';
import {
  errorRepository,
  masteryRepository,
  practiceAttemptRepository,
} from '../../persistence/repositories';
import {
  getProofRubricByTrainerId,
  getProofTrainerById,
  getRegistryEntry,
} from './trainer-service';

export type ProofStoredAnswer = StructuredProof & { kind: 'proof_loop_invariant' };

const emptyProof: ProofStoredAnswer = {
  kind: 'proof_loop_invariant',
  trainerKind: 'proof',
  problemId: 'problem-schleifeninvariante-gewichtete-summe-v1',
  preflight: {
    accumulator: '',
    iterationEffect: '',
    iterationCount: '',
    valueAfterZero: '',
    valueAfterOne: '',
    valueAfterTwo: '',
    expectedReturn: '',
  },
  claim: {
    inputRange: '',
    returnVariable: '',
    expression: '',
    quantifier: '',
    edgeCases: '',
  },
  invariant: {
    variable: 's',
    index: 'i',
    range: '',
    timing: '',
    expression: '',
  },
  initialization: {
    startIndex: '',
    stateBeforeFirstIteration: '',
    initializedValue: '',
    substitutedExpression: '',
    conclusion: '',
  },
  hypothesis: {
    index: '',
    range: '',
    equation: '',
    timing: '',
  },
  preservation: {
    before: '',
    bodySubstitution: '',
    algebra: '',
    target: '',
  },
  termination: {
    loopEndsWhen: '',
    nextIndex: '',
    invariantInstance: '',
    returnValue: '',
  },
  conclusion: {
    invariantToReturn: '',
    returnLine: '',
    claimRestated: '',
  },
};

function attemptId(): string {
  return `attempt-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}

export function defaultProofAnswer(): ProofStoredAnswer {
  return structuredClone(emptyProof);
}

export function proofAnswerFromAttempt(attempt: PracticeAttempt): ProofStoredAnswer {
  const value = attempt.answers[0] as ProofStoredAnswer | undefined;
  if (!value) throw new Error('Gespeicherter Beweisversuch fehlt.');
  return value;
}

export async function createProofAttempt(
  mode: ProofMode,
  trainerId = 'trainer-schleifeninvariante-summe-v1',
): Promise<PracticeAttempt> {
  const trainer = getProofTrainerById(trainerId);
  const rubric = getProofRubricByTrainerId(trainerId);
  const registry = getRegistryEntry(trainerId);
  if (!trainer || !rubric || !registry) throw new Error('Beweistrainerinhalt fehlt.');
  const now = new Date().toISOString();
  const answer = defaultProofAnswer();
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
    answerPayloadSchemaVersion: 'proof-answer-v1',
    preflightAnswers: { ...answer.preflight },
    attemptedAt: now,
    storedContentVersion: coreContent.manifest.contentVersion,
  };
  await practiceAttemptRepository.put(attempt);
  return attempt;
}

export async function saveProofDraft(
  attempt: PracticeAttempt,
  answer: ProofStoredAnswer,
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

export function scoreStoredProofAttempt(
  attempt: PracticeAttempt,
  answer = proofAnswerFromAttempt(attempt),
) {
  return scoreProofAttempt(createSumProofProblem(), answer, {
    mode: attempt.mode as ProofMode,
    hintsUsed: attempt.hintsUsed,
    solutionRevealed: attempt.solutionRevealed,
  });
}

export async function completeProofAttempt(attempt: PracticeAttempt, answer: ProofStoredAnswer) {
  const trainer = getProofTrainerById(attempt.trainerId);
  if (!trainer) throw new Error('Beweistrainerinhalt fehlt.');
  const now = new Date().toISOString();
  const draft = { ...attempt, answers: [answer], preflightAnswers: { ...answer.preflight } };
  const result = scoreStoredProofAttempt(draft, answer);
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
  const mastery = deriveProofMastery(
    attempts.map((candidate) => ({
      id: candidate.id,
      mode: candidate.mode as ProofMode,
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

export function canonicalProofAnswerForTrainer(): ProofStoredAnswer {
  return { ...canonicalProofAttempt(), kind: 'proof_loop_invariant' };
}

export function canonicalProofTextForTrainer(): string[] {
  return generateCanonicalProofText();
}
