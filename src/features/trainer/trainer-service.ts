import { coreContent } from '../../content/loaders/core';
import {
  dpDesignRubrics,
  dpDesignTrainers,
  divideConquerDesignRubrics,
  divideConquerDesignTrainers,
  greedyDesignRubrics,
  greedyDesignTrainers,
  graphTracingRubrics,
  graphTracingTrainers,
  proofRubrics,
  proofTrainers,
  rbInsertionRubrics,
  rbInsertionTrainers,
  recurrenceRubrics,
  recurrenceTrainers,
  tracingRubrics,
  tracingTrainers,
} from '../../content/loaders/trainers';
import type {
  KnapsackTracingProblem,
  DpDesignTrainer,
  DivideConquerDesignTrainer,
  GreedyDesignTrainer,
  GraphTracingTrainer,
  MasteryRecord,
  PracticeAttempt,
  ProofTrainer,
  RbInsertionTrainer,
  RecurrenceTrainer,
  TracingTrainer,
} from '../../content/schemas';
import {
  canonicalRowsAsInput,
  canonicalUnionFindInput,
  deriveMastery,
  deriveUnionFindMastery,
  scoreKnapsackTrace,
  scoreUnionFindTrace,
  type PreflightAnswers,
  type TraceScore,
  type TraceSubmission,
  type TrainingErrorCode,
  type TrainingMode,
  type UnionFindPreflightAnswers,
  type UnionFindScore,
  type UnionFindSubmission,
  type UnionFindUserCheckpoint,
  type UserTraceRow,
} from '../../domain/tracing';
import {
  errorRepository,
  masteryRepository,
  practiceAttemptRepository,
} from '../../persistence/repositories';

export interface KnapsackStoredAnswer {
  kind: 'knapsack';
  rows: UserTraceRow[];
  preflight: PreflightAnswers;
  finalValue: number | null;
}

export interface UnionFindStoredAnswer {
  kind: 'union_find';
  checkpoints: UnionFindUserCheckpoint[];
  preflight: UnionFindPreflightAnswers;
  finalValue: null;
}

export type StoredAnswer = KnapsackStoredAnswer | UnionFindStoredAnswer;
export type StoredSubmission = TraceSubmission | UnionFindSubmission;
export type StoredScore = TraceScore | UnionFindScore;

type KnapsackTrainer = TracingTrainer & { problem: KnapsackTracingProblem };
const trainerModes: TrainingMode[] = ['practice', 'exam', 'review'];
type RegistryMode = 'learn' | TrainingMode;

export interface TrainerRegistryEntry {
  trainerId: string;
  trainerKind: 'tracing' | 'proof' | 'design';
  title: string;
  description: string;
  topicIds: string[];
  taskTypes: string[];
  algorithmFamily:
    | 'Dynamische Programmierung'
    | 'Union-Find'
    | 'Beweise'
    | 'Rekurrenzen'
    | 'Algorithmusentwurf'
    | 'Bäume'
    | 'Graphen';
  status: 'available';
  availableModes: RegistryMode[];
  difficultyLevels: string[];
  sourceRefs:
    | TracingTrainer['sourceRefs']
    | ProofTrainer['sourceRefs']
    | RecurrenceTrainer['sourceRefs']
    | DpDesignTrainer['sourceRefs']
    | DivideConquerDesignTrainer['sourceRefs']
    | GreedyDesignTrainer['sourceRefs']
    | RbInsertionTrainer['sourceRefs']
    | GraphTracingTrainer['sourceRefs'];
  verificationStatus: TracingTrainer['verificationStatus'];
  publicDistributionStatus: TracingTrainer['publicDistributionStatus'];
  engineVersion: string;
  rendererType:
    | 'knapsack'
    | 'union_find'
    | 'proof_loop_invariant'
    | 'recurrence_runtime_proof'
    | 'dp_design_mine'
    | 'divide_conquer_max_difference'
    | 'greedy_design_fitnesspunkte'
    | 'red_black_tree_insertion'
    | 'floyd_warshall_matrix'
    | 'dijkstra_trace'
    | 'prim_mst_trace';
  scoringModelVersion: string;
  masteryModelVersion: string;
  lazyModulePath: string;
}

export const trainerRegistry: TrainerRegistryEntry[] = [
  ...tracingTrainers.map((trainer) => {
    const isUnionFind = trainer.problem.algorithm === 'union_find_linked_lists';
    return {
      trainerId: trainer.id,
      trainerKind: 'tracing' as const,
      title: trainer.title,
      description: trainer.typicalExamTask,
      topicIds: trainer.topicIds,
      taskTypes: [trainer.taskType],
      algorithmFamily: isUnionFind
        ? ('Union-Find' as const)
        : ('Dynamische Programmierung' as const),
      status: 'available' as const,
      availableModes: trainerModes,
      difficultyLevels: ['mittel', 'klausurnah'],
      sourceRefs: trainer.sourceRefs,
      verificationStatus: trainer.verificationStatus,
      publicDistributionStatus: trainer.publicDistributionStatus,
      engineVersion: isUnionFind ? 'union-find-list-v1' : 'knapsack-dp-v1',
      rendererType: isUnionFind ? ('union_find' as const) : ('knapsack' as const),
      scoringModelVersion: isUnionFind ? 'union-find-scoring-v1' : 'knapsack-scoring-v1',
      masteryModelVersion: 'mastery-v2',
      lazyModulePath: '../features/trainer',
    };
  }),
  ...proofTrainers.map((trainer) => ({
    trainerId: trainer.id,
    trainerKind: 'proof' as const,
    title: trainer.title,
    description: trainer.typicalExamTask,
    topicIds: trainer.topicIds,
    taskTypes: [trainer.taskType],
    algorithmFamily: 'Beweise' as const,
    status: 'available' as const,
    availableModes: trainerModes,
    difficultyLevels: ['mittel', 'klausurnah'],
    sourceRefs: trainer.sourceRefs,
    verificationStatus: trainer.verificationStatus,
    publicDistributionStatus: trainer.publicDistributionStatus,
    engineVersion: 'proof-loop-invariant-v1',
    rendererType: 'proof_loop_invariant' as const,
    scoringModelVersion: 'loop-invariant-scoring-v1',
    masteryModelVersion: 'mastery-v3',
    lazyModulePath: '../features/trainer',
  })),
  ...recurrenceTrainers.map((trainer) => ({
    trainerId: trainer.id,
    trainerKind: 'proof' as const,
    title: trainer.title,
    description: trainer.typicalExamTask,
    topicIds: trainer.topicIds,
    taskTypes: [trainer.taskType],
    algorithmFamily: 'Rekurrenzen' as const,
    status: 'available' as const,
    availableModes: ['learn', 'practice', 'exam', 'review'] as RegistryMode[],
    difficultyLevels: ['mittel', 'klausurnah'],
    sourceRefs: trainer.sourceRefs,
    verificationStatus: trainer.verificationStatus,
    publicDistributionStatus: trainer.publicDistributionStatus,
    engineVersion: 'recurrence-runtime-v1',
    rendererType: 'recurrence_runtime_proof' as const,
    scoringModelVersion: 'recurrence-scoring-v1',
    masteryModelVersion: 'mastery-v4',
    lazyModulePath: '../features/trainer',
  })),
  ...dpDesignTrainers.map((trainer) => ({
    trainerId: trainer.id,
    trainerKind: 'design' as const,
    title: trainer.title,
    description: trainer.description,
    topicIds: trainer.topicIds,
    taskTypes: [trainer.taskType],
    algorithmFamily: 'Algorithmusentwurf' as const,
    status: 'available' as const,
    availableModes: trainer.supportedModes,
    difficultyLevels: trainer.difficultyLevels,
    sourceRefs: trainer.sourceRefs,
    verificationStatus: trainer.verificationStatus,
    publicDistributionStatus: trainer.publicDistributionStatus,
    engineVersion: trainer.engineVersion,
    rendererType: trainer.rendererType,
    scoringModelVersion: trainer.scoringModelVersion,
    masteryModelVersion: trainer.masteryModelVersion,
    lazyModulePath: '../features/trainer',
  })),
  ...divideConquerDesignTrainers.map((trainer) => ({
    trainerId: trainer.id,
    trainerKind: 'design' as const,
    title: trainer.title,
    description: trainer.description,
    topicIds: trainer.topicIds,
    taskTypes: [trainer.taskType],
    algorithmFamily: 'Algorithmusentwurf' as const,
    status: 'available' as const,
    availableModes: trainer.supportedModes,
    difficultyLevels: trainer.difficultyLevels,
    sourceRefs: trainer.sourceRefs,
    verificationStatus: trainer.verificationStatus,
    publicDistributionStatus: trainer.publicDistributionStatus,
    engineVersion: trainer.engineVersion,
    rendererType: trainer.rendererType,
    scoringModelVersion: trainer.scoringModelVersion,
    masteryModelVersion: trainer.masteryModelVersion,
    lazyModulePath: '../features/trainer',
  })),
  ...greedyDesignTrainers.map((trainer) => ({
    trainerId: trainer.id,
    trainerKind: 'design' as const,
    title: trainer.title,
    description: trainer.description,
    topicIds: trainer.topicIds,
    taskTypes: [trainer.taskType],
    algorithmFamily: 'Algorithmusentwurf' as const,
    status: 'available' as const,
    availableModes: trainer.supportedModes,
    difficultyLevels: trainer.difficultyLevels,
    sourceRefs: trainer.sourceRefs,
    verificationStatus: trainer.verificationStatus,
    publicDistributionStatus: trainer.publicDistributionStatus,
    engineVersion: trainer.engineVersion,
    rendererType: trainer.rendererType,
    scoringModelVersion: trainer.scoringModelVersion,
    masteryModelVersion: trainer.masteryModelVersion,
    lazyModulePath: '../features/trainer',
  })),
  ...rbInsertionTrainers.map((trainer) => ({
    trainerId: trainer.id,
    trainerKind: 'tracing' as const,
    title: trainer.title,
    description: trainer.description,
    topicIds: trainer.topicIds,
    taskTypes: [trainer.taskType],
    algorithmFamily: 'Bäume' as const,
    status: 'available' as const,
    availableModes: trainer.supportedModes,
    difficultyLevels: trainer.difficultyLevels,
    sourceRefs: trainer.sourceRefs,
    verificationStatus: trainer.verificationStatus,
    publicDistributionStatus: trainer.publicDistributionStatus,
    engineVersion: trainer.engineVersion,
    rendererType: trainer.rendererType,
    scoringModelVersion: trainer.scoringModelVersion,
    masteryModelVersion: trainer.masteryModelVersion,
    lazyModulePath: '../features/trainer',
  })),
  ...graphTracingTrainers.map((trainer) => ({
    trainerId: trainer.id,
    trainerKind: 'tracing' as const,
    title: trainer.title,
    description: trainer.description,
    topicIds: trainer.topicIds,
    taskTypes: [trainer.taskType],
    algorithmFamily: 'Graphen' as const,
    status: 'available' as const,
    availableModes: trainer.supportedModes,
    difficultyLevels: trainer.difficultyLevels,
    sourceRefs: trainer.sourceRefs,
    verificationStatus: trainer.verificationStatus,
    publicDistributionStatus: trainer.publicDistributionStatus,
    engineVersion: trainer.engineVersion,
    rendererType: trainer.rendererType,
    scoringModelVersion: trainer.scoringModelVersion,
    masteryModelVersion: trainer.masteryModelVersion,
    lazyModulePath: '../features/trainer',
  })),
];

export const selectedTrainer = tracingTrainers.find(
  (trainer): trainer is KnapsackTrainer =>
    trainer.id === 'trainer-rucksack-dp-v1' && trainer.problem.algorithm === 'knapsack_01',
);
export const selectedRubric = selectedTrainer
  ? tracingRubrics.find((rubric) => rubric.trainerId === selectedTrainer.id)
  : undefined;

export function getTrainerById(trainerId: string | undefined): TracingTrainer | undefined {
  return tracingTrainers.find((trainer) => trainer.id === trainerId);
}

export function getRubricByTrainerId(trainerId: string | undefined) {
  return tracingRubrics.find((rubric) => rubric.trainerId === trainerId);
}

export function getProofTrainerById(trainerId: string | undefined) {
  return proofTrainers.find((trainer) => trainer.id === trainerId);
}

export function getProofRubricByTrainerId(trainerId: string | undefined) {
  return proofRubrics.find((rubric) => rubric.trainerId === trainerId);
}

export function getRecurrenceTrainerById(trainerId: string | undefined) {
  return recurrenceTrainers.find((trainer) => trainer.id === trainerId);
}

export function getRecurrenceRubricByTrainerId(trainerId: string | undefined) {
  return recurrenceRubrics.find((rubric) => rubric.trainerId === trainerId);
}

export function getDpDesignTrainerById(trainerId: string | undefined) {
  return dpDesignTrainers.find((trainer) => trainer.id === trainerId);
}

export function getDpDesignRubricByTrainerId(trainerId: string | undefined) {
  return dpDesignRubrics.find((rubric) => rubric.trainerId === trainerId);
}

export function getDivideConquerDesignTrainerById(trainerId: string | undefined) {
  return divideConquerDesignTrainers.find((trainer) => trainer.id === trainerId);
}

export function getDivideConquerDesignRubricByTrainerId(trainerId: string | undefined) {
  return divideConquerDesignRubrics.find((rubric) => rubric.trainerId === trainerId);
}

export function getGreedyDesignTrainerById(trainerId: string | undefined) {
  return greedyDesignTrainers.find((trainer) => trainer.id === trainerId);
}

export function getGreedyDesignRubricByTrainerId(trainerId: string | undefined) {
  return greedyDesignRubrics.find((rubric) => rubric.trainerId === trainerId);
}

export function getRbInsertionTrainerById(trainerId: string | undefined) {
  return rbInsertionTrainers.find((trainer) => trainer.id === trainerId);
}

export function getRbInsertionRubricByTrainerId(trainerId: string | undefined) {
  return rbInsertionRubrics.find((rubric) => rubric.trainerId === trainerId);
}

export function getGraphTracingTrainerById(trainerId: string | undefined) {
  return graphTracingTrainers.find((trainer) => trainer.id === trainerId);
}

export function getGraphTracingRubricByTrainerId(trainerId: string | undefined) {
  return graphTracingRubrics.find((rubric) => rubric.trainerId === trainerId);
}

export function getRegistryEntry(trainerId: string | undefined): TrainerRegistryEntry | undefined {
  return trainerRegistry.find((entry) => entry.trainerId === trainerId);
}

function attemptId(): string {
  return `attempt-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`;
}

export function defaultKnapsackRows(trainer = selectedTrainer): UserTraceRow[] {
  if (!trainer || trainer.problem.algorithm !== 'knapsack_01') return [];
  const problem = trainer.problem as KnapsackTracingProblem;
  return Array.from({ length: problem.items.length + 1 }, (_, index) => ({
    index,
    values: Array.from({ length: problem.capacity + 1 }, () => null),
    tieChoices: {},
  }));
}

export const defaultRows = defaultKnapsackRows;

export function defaultUnionFindCheckpoints(trainer: TracingTrainer): UnionFindUserCheckpoint[] {
  if (trainer.problem.algorithm !== 'union_find_linked_lists') return [];
  return trainer.problem.checkpoints.map((operationIndex) => ({
    operationIndex,
    stateText: '',
    attachedList: '',
  }));
}

function defaultAnswerForTrainer(
  trainer: TracingTrainer,
  preflight: PreflightAnswers | UnionFindPreflightAnswers,
): StoredAnswer {
  if (trainer.problem.algorithm === 'union_find_linked_lists')
    return {
      kind: 'union_find',
      checkpoints: defaultUnionFindCheckpoints(trainer),
      preflight: preflight as UnionFindPreflightAnswers,
      finalValue: null,
    };
  return {
    kind: 'knapsack',
    rows: defaultKnapsackRows(trainer as KnapsackTrainer),
    preflight: preflight as PreflightAnswers,
    finalValue: null,
  };
}

export async function createTrainingAttempt(
  mode: TrainingMode,
  preflight: PreflightAnswers | UnionFindPreflightAnswers,
  trainerId = selectedTrainer?.id,
): Promise<PracticeAttempt> {
  const trainer = getTrainerById(trainerId);
  const rubric = getRubricByTrainerId(trainerId);
  const registry = getRegistryEntry(trainerId);
  if (!trainer || !rubric || !registry) throw new Error('Trainerinhalt fehlt.');
  const now = new Date().toISOString();
  const answer = defaultAnswerForTrainer(trainer, preflight);
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
    sourceVersion: coreContent.manifest.contentVersion,
    engineVersion: registry.engineVersion,
    problemVersion: trainer.problem.contentVersion,
    scoringModelVersion: registry.scoringModelVersion,
    masteryModelVersion: registry.masteryModelVersion,
    answerPayloadSchemaVersion:
      answer.kind === 'union_find' ? 'union-find-answer-v1' : 'knapsack-answer-v1',
    preflightAnswers: { ...preflight },
    attemptedAt: now,
    storedContentVersion: coreContent.manifest.contentVersion,
  };
  await practiceAttemptRepository.put(attempt);
  return attempt;
}

export function answerFromAttempt(attempt: PracticeAttempt): StoredAnswer {
  const value = attempt.answers[0] as StoredAnswer | undefined;
  if (!value) throw new Error('Gespeicherte Bearbeitung fehlt.');
  return value;
}

export async function saveDraft(
  attempt: PracticeAttempt,
  answer: StoredAnswer,
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

export function submissionFromAttempt(attempt: PracticeAttempt): StoredSubmission {
  const answer = answerFromAttempt(attempt);
  if (answer.kind === 'union_find')
    return {
      checkpoints: answer.checkpoints,
      preflight: answer.preflight,
      mode: attempt.mode as TrainingMode,
      hintsUsed: attempt.hintsUsed,
      solutionRevealed: attempt.solutionRevealed,
    };
  return {
    rows: answer.rows,
    preflight: answer.preflight,
    finalValue: answer.finalValue,
    mode: attempt.mode as TrainingMode,
    hintsUsed: attempt.hintsUsed,
    solutionRevealed: attempt.solutionRevealed,
  };
}

export function scoreAttempt(trainer: TracingTrainer, attempt: PracticeAttempt): StoredScore {
  const submission = submissionFromAttempt(attempt);
  if (trainer.problem.algorithm === 'union_find_linked_lists')
    return scoreUnionFindTrace(trainer.problem, submission as UnionFindSubmission);
  return scoreKnapsackTrace(trainer.problem, submission as TraceSubmission);
}

function deriveMasteryForTrainer(trainer: TracingTrainer, attempts: PracticeAttempt[]) {
  const evidence = attempts.map((candidate) => ({
    id: candidate.id,
    mode: candidate.mode as TrainingMode,
    score: candidate.score ?? 0,
    maxScore: candidate.maxScore,
    rubricResults: candidate.rubricResults,
    errorCodes: candidate.errorCodes as TrainingErrorCode[],
    hintsUsed: candidate.hintsUsed,
    solutionRevealed: candidate.solutionRevealed,
    durationMs: candidate.durationMs,
    contentVersion: candidate.itemContentVersion,
  }));
  return trainer.problem.algorithm === 'union_find_linked_lists'
    ? deriveUnionFindMastery(evidence)
    : deriveMastery(evidence);
}

export async function completeAttempt(attempt: PracticeAttempt, answer: StoredAnswer) {
  const trainer = getTrainerById(attempt.trainerId);
  if (!trainer) throw new Error('Trainerinhalt fehlt.');
  const now = new Date().toISOString();
  const draft = { ...attempt, answers: [answer] };
  const result = scoreAttempt(trainer, draft);
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
  const mastery = deriveMasteryForTrainer(trainer, attempts);
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

export function canonicalAnswerForTrainer(trainer: TracingTrainer): StoredAnswer {
  if (trainer.problem.algorithm === 'union_find_linked_lists')
    return {
      kind: 'union_find',
      checkpoints: canonicalUnionFindInput(trainer.problem),
      preflight: {
        algorithm: 'union_find_linked_lists',
        representation: 'linked_lists_with_representative_pointer',
        startsEmpty: true,
        weightedUnion: true,
        tieBreaker: 'lexicographically_smaller_representative_is_smaller_set',
        output: 'checkpoint_sets_representatives_next_size',
        nextDirection: 'head_to_tail',
        runtime: 'O(m + n log n)',
      },
      finalValue: null,
    };
  return {
    kind: 'knapsack',
    rows: canonicalRowsAsInput(trainer.problem),
    preflight: {
      algorithm: 'knapsack_01',
      negativeWeights: false,
      indexingStartsAtZero: true,
      usesPreviousRow: true,
      eachItemAtMostOnce: true,
      output: 'complete_table_and_optimum',
      runtime: 'O(n · W)',
    },
    finalValue: canonicalRowsAsInput(trainer.problem).at(-1)?.values.at(-1) ?? null,
  };
}
