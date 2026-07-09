import { describe, expect, it } from 'vitest';
import * as schemas from '../../src/content/schemas';
import trainerFixtures from '../../src/content/generated/tracing-trainers.json';
import rubricFixtures from '../../src/content/generated/tracing-rubrics.json';
import proofTrainerFixtures from '../../src/content/generated/proof-trainers.json';
import proofRubricFixtures from '../../src/content/generated/proof-rubrics.json';
import recurrenceTrainerFixtures from '../../src/content/generated/recurrence-trainers.json';
import recurrenceRubricFixtures from '../../src/content/generated/recurrence-rubrics.json';
import dpDesignTrainerFixtures from '../../src/content/generated/dp-design-trainers.json';
import dpDesignRubricFixtures from '../../src/content/generated/dp-design-rubrics.json';
import greedyDesignTrainerFixtures from '../../src/content/generated/greedy-design-trainers.json';
import greedyDesignRubricFixtures from '../../src/content/generated/greedy-design-rubrics.json';
import rbInsertionTrainerFixtures from '../../src/content/generated/rb-insertion-trainers.json';
import rbInsertionRubricFixtures from '../../src/content/generated/rb-insertion-rubrics.json';
import graphTracingTrainerFixtures from '../../src/content/generated/graph-tracing-trainers.json';
import graphTracingRubricFixtures from '../../src/content/generated/graph-tracing-rubrics.json';
import examPackageFixtures from '../../src/content/generated/exam-packages.json';
import examProfileCoverageFixtures from '../../src/content/generated/exam-profile-coverage.json';

const meta = {
  id: 'item-1',
  schemaVersion: '1.0.0',
  contentVersion: 'test',
  sourceRefs: [],
  verificationStatus: 'generated_unverified' as const,
  lastReviewed: '2026-07-06',
  duplicateGroupId: null,
};

describe('ausführbare Inhaltsschemata', () => {
  const cases: Array<[string, { parse: (value: unknown) => unknown }, unknown]> = [
    [
      'SourceReference',
      schemas.SourceReferenceSchema,
      { sourceId: 'src-1', page: 1, label: 'Vorlesung 1, Folie 1' },
    ],
    [
      'SourceDocument',
      schemas.SourceDocumentSchema,
      {
        ...meta,
        displayName: 'Quelle.pdf',
        title: 'Quelle',
        authorityLevel: 1,
        category: 'Vorlesung',
        evidenceType: 'unknown',
        year: 2024,
        pageCount: 1,
        extractionSucceeded: true,
        visualReviewRequired: false,
        canonicalDocumentId: 'item-1',
        historicalFrequencyEligible: false,
      },
    ],
    [
      'SourcePage',
      schemas.SourcePageSchema,
      { ...meta, sourceId: 'src-1', page: 1, textCharacterCount: 20, visualReviewStatus: null },
    ],
    [
      'Topic',
      schemas.TopicSchema,
      {
        ...meta,
        name: 'BFS',
        category: 'Graphen',
        importance: 'hoch',
        prerequisites: [],
        officialSourceCoverage: 1,
        exerciseCoverage: 0,
        realExamOccurrences: [],
        mockExamOccurrences: [],
        exerciseOccurrences: [],
        visualReviewStatus: 'geprüft',
      },
    ],
    [
      'Algorithm',
      schemas.AlgorithmSchema,
      {
        ...meta,
        topicId: 'topic-1',
        name: 'BFS',
        pseudocode: null,
        runtime: 'O(V+E)',
        memoryComplexity: null,
      },
    ],
    [
      'DataStructure',
      schemas.DataStructureSchema,
      {
        ...meta,
        name: 'Queue',
        invariants: [],
        operations: [{ name: 'enqueue', complexity: 'O(1)' }],
      },
    ],
    ['Definition', schemas.DefinitionSchema, { ...meta, term: 'Graph', statement: 'Definition' }],
    [
      'Theorem',
      schemas.TheoremSchema,
      { ...meta, name: 'Satz', statement: 'Aussage', assumptions: [] },
    ],
    [
      'ProofTemplate',
      schemas.ProofTemplateSchema,
      { ...meta, proofType: 'Induktion', steps: ['IA'], applicability: ['Rekurrenz'] },
    ],
    [
      'Exercise',
      schemas.ExerciseSchema,
      {
        ...meta,
        title: 'Übung',
        topicIds: ['topic-1'],
        difficulty: 'mittel',
        evidenceType: 'exercise',
      },
    ],
    [
      'Exam',
      schemas.ExamSchema,
      {
        ...meta,
        title: 'Klausur',
        year: 2024,
        evidenceType: 'real_exam',
        examRegime: 'standard',
        examiner: null,
        durationMinutes: null,
        totalPoints: 50,
        confidence: 'confirmed',
        taskCount: 9,
      },
    ],
    [
      'ExamProfile',
      schemas.ExamProfileSchema,
      {
        ...meta,
        title: 'Profil',
        description: 'Profil',
        taskCount: 9,
        totalPoints: 50,
        durationMinutes: 180,
        durationEvidence: 'Quelle',
        confidence: 'confirmed',
        supportingExamIds: [],
        deviations: [],
        tasks: [],
      },
    ],
    [
      'ExamQuestion',
      schemas.ExamQuestionSchema,
      {
        ...meta,
        examId: 'exam-1',
        taskNumber: 1,
        subtask: null,
        points: 4,
        topicIds: [],
        evidenceType: 'real_exam',
      },
    ],
    [
      'Solution',
      schemas.SolutionSchema,
      { ...meta, questionId: 'q-1', summary: null, official: false },
    ],
    [
      'Rubric',
      schemas.RubricSchema,
      {
        ...meta,
        questionId: 'q-1',
        criteria: [{ id: 'c-1', description: 'Idee', points: 2 }],
        maxPoints: 2,
      },
    ],
    [
      'CommonMistake',
      schemas.CommonMistakeSchema,
      { ...meta, topicIds: [], errorCode: 'runtime_error', description: 'Fehler' },
    ],
    [
      'LearningModule',
      schemas.LearningModuleSchema,
      { ...meta, topicIds: [], learningOutcomes: [], contentRefs: [] },
    ],
    [
      'PracticeAttempt',
      schemas.PracticeAttemptSchema,
      {
        ...meta,
        itemId: 'q-1',
        trainerId: 'trainer-1',
        itemContentVersion: 'test',
        mode: 'practice',
        status: 'draft',
        startedAt: '2026-07-06',
        completedAt: null,
        durationMs: 0,
        answers: [],
        score: null,
        maxScore: 12,
        rubricResults: [],
        errorCodes: [],
        hintsUsed: [],
        solutionRevealed: false,
        canonicalTraceVersion: 'v1',
        sourceVersion: 'test',
        preflightAnswers: {},
        attemptedAt: '2026-07-06',
        storedContentVersion: 'test',
      },
    ],
    [
      'MasteryRecord',
      schemas.MasteryRecordSchema,
      {
        ...meta,
        topicOrTaskId: 'topic-1',
        dimensions: {},
        evidenceAttemptIds: [],
        updatedAt: '2026-07-06',
      },
    ],
    [
      'ErrorRecord',
      schemas.ErrorRecordSchema,
      {
        ...meta,
        attemptId: 'a-1',
        category: 'runtime_error',
        evidence: 'Evidenz',
        errorCode: 'runtime_error',
        step: null,
        expected: 'O(n)',
        actual: 'O(1)',
        explanation: 'Fehler',
        severity: 'mittel',
        topicId: 'topic-1',
        recommendedReview: 'Laufzeit',
        resolvedAt: null,
      },
    ],
    [
      'StudySession',
      schemas.StudySessionSchema,
      { ...meta, startedAt: '2026-07-06', endedAt: null, activityIds: [], summary: null },
    ],
    [
      'CheatSheetItem',
      schemas.CheatSheetItemSchema,
      {
        ...meta,
        sourceContentId: 'topic-1',
        kind: 'Formel',
        priority: 'hoch',
        placement: null,
        mustKnow: true,
      },
    ],
    [
      'SourceConflict',
      schemas.SourceConflictSchema,
      {
        ...meta,
        topic: 'Struktur',
        higherAuthorityClaim: 'A',
        lowerAuthorityClaim: 'B',
        resolution: 'A gilt',
      },
    ],
    [
      'ContentCorrection',
      schemas.ContentCorrectionSchema,
      {
        ...meta,
        recordType: 'Topic',
        recordId: 'topic-1',
        field: 'year',
        previousValue: null,
        correctedValue: 2024,
        reason: 'Beleg',
      },
    ],
  ];

  it.each(cases)('%s akzeptiert einen gültigen Repräsentanten', (_name, schema, value) => {
    expect(() => schema.parse(value)).not.toThrow();
  });

  it('weist eine inkonsistente Bewertungsrubrik zurück', () => {
    expect(() =>
      schemas.RubricSchema.parse({
        ...meta,
        questionId: 'q-1',
        criteria: [{ id: 'c', description: 'Teil', points: 1 }],
        maxPoints: 2,
      }),
    ).toThrow();
  });

  it('validiert die Phase-3-Trainingsschemata für beide Trainerfamilien', () => {
    const trainers = trainerFixtures.map((trainer) => schemas.TracingTrainerSchema.parse(trainer));
    expect(trainers.map((trainer) => trainer.problem.algorithm).sort()).toEqual([
      'knapsack_01',
      'union_find_linked_lists',
    ]);
    for (const trainer of trainers) {
      expect(schemas.TracingProblemSchema.parse(trainer.problem).publicDistributionStatus).toBe(
        'public_safe',
      );
    }
    expect(() =>
      schemas.TracingStepSchema.parse({ index: 0, itemId: null, values: [0], ties: [] }),
    ).not.toThrow();
    expect(() =>
      schemas.TrainingHintSchema.parse({ id: 'h', level: 1, text: 'Hinweis' }),
    ).not.toThrow();
    expect(() =>
      schemas.TrainingFeedbackSchema.parse({
        level: 'kurz',
        step: 0,
        correct: true,
        points: 1,
        message: 'Richtig',
      }),
    ).not.toThrow();
    expect(() =>
      schemas.TrainingRecommendationSchema.parse({
        code: 'repeat_full_task',
        label: 'Wiederholen',
        reason: 'Evidenz',
      }),
    ).not.toThrow();
    expect(schemas.TracingRubricSchema.parse(rubricFixtures[0]).maxPoints).toBe(12);
  });

  it('validiert den Phase-4-Beweistrainer und die Proof-Rubrik', () => {
    const trainer = schemas.ProofTrainerSchema.parse(proofTrainerFixtures[0]);
    expect(trainer.trainerKind).toBe('proof');
    expect(trainer.problem.algorithm).toBe('loop_invariant_weighted_sum');
    expect(trainer.problem.canonical.invariant.expression).toBe('sum(j,1,i-1,j*A[j])');
    expect(schemas.ProofRubricSchema.parse(proofRubricFixtures[0]).maxPoints).toBe(16);
    expect(() =>
      schemas.TrainingRecommendationSchema.parse({
        code: 'repeat_invariant_timing',
        label: 'Zeitpunkt üben',
        reason: 'Beleg',
      }),
    ).not.toThrow();
  });

  it('validiert den Phase-5-Rekurrenztrainer und die Rekurrenzrubrik', () => {
    const trainer = schemas.RecurrenceTrainerSchema.parse(recurrenceTrainerFixtures[0]);
    expect(trainer.trainerKind).toBe('proof');
    expect(trainer.problem.algorithm).toBe('master_theorem_case_1_runtime_induction');
    expect(trainer.problem.canonical.parameters.masterCase).toBe('fall1');
    expect(trainer.problem.canonical.recursionTree.totalCost).toBe('(log_2(n)+1)*n^3');
    expect(schemas.RecurrenceRubricSchema.parse(recurrenceRubricFixtures[0]).maxPoints).toBe(23);
    expect(() =>
      schemas.TrainingRecommendationSchema.parse({
        code: 'repeat_recurrence_master_case',
        label: 'Master-Fall üben',
        reason: 'Beleg',
      }),
    ).not.toThrow();
  });

  it('validiert den Phase-6-DP-Entwurfstrainer und die DP-Rubrik', () => {
    const trainer = schemas.DpDesignTrainerSchema.parse(dpDesignTrainerFixtures[0]);
    expect(trainer.trainerKind).toBe('design');
    expect(trainer.designFamily).toBe('dynamic_programming');
    expect(trainer.problem.algorithm).toBe('mine_path_dynamic_programming');
    expect(trainer.problem.canonicalSolution.optimalValue).toBe(214);
    expect(trainer.problem.canonicalSolution.oracleValidationStatus).toBe('brute_force_matches_dp');
    expect(trainer.problem.variants).toHaveLength(9);
    expect(schemas.DpDesignRubricSchema.parse(dpDesignRubricFixtures[0]).maxPoints).toBe(54);
    expect(() =>
      schemas.TrainingRecommendationSchema.parse({
        code: 'repeat_dp_state_definition',
        label: 'Zustand üben',
        reason: 'Beleg',
      }),
    ).not.toThrow();
  });

  it('validiert Phase-7-Prüfungspackages und Profil-Coverage', () => {
    const examPackage = schemas.ExamPackageSchema.parse(
      examPackageFixtures.find((candidate) => candidate.id === 'exam-package-kernkompetenz-v1'),
    );
    expect(examPackage.packageType).toBe('generated_core_mock');
    expect(examPackage.historicalExam).toBe(false);
    expect(examPackage.fullyAutoGradable).toBe(true);
    expect(examPackage.taskSlots).toHaveLength(5);
    expect(
      schemas.ExamProfileCoverageFileSchema.parse(examProfileCoverageFixtures).profiles,
    ).toHaveLength(6);
    expect(() =>
      schemas.ExamSessionSchema.parse({
        ...meta,
        examPackageId: 'exam-package-kernkompetenz-v1',
        examPackageVersion: 'kernkompetenz-v1',
        profileId: null,
        mode: 'strict_exam',
        status: 'running',
        createdAt: '2026-07-08',
        startedAt: '2026-07-08',
        deadlineAt: '2026-07-08',
        submittedAt: null,
        gradedAt: null,
        currentTaskSlotId: 'slot-1',
        reviewFlags: {},
        taskStates: {},
        taskPayloadVersions: {},
        timerWarningsShown: [],
        recoveryMetadata: {},
        appVersion: 'test',
        masteryModelVersion: 'mastery-v6',
      }),
    ).not.toThrow();
  });

  it('validiert den Phase-8-Greedy-Entwurfstrainer und die Greedy-Rubrik', () => {
    const trainer = schemas.GreedyDesignTrainerSchema.parse(greedyDesignTrainerFixtures[0]);
    expect(trainer.trainerKind).toBe('design');
    expect(trainer.designFamily).toBe('greedy');
    expect(trainer.problem.algorithm).toBe('fitnesspunkte_sort_descending');
    expect(trainer.problem.canonicalSolution.optimalValue).toBe(67);
    expect(trainer.problem.canonicalSolution.oracleValidationStatus).toBe(
      'brute_force_matches_greedy',
    );
    expect(trainer.problem.variants).toHaveLength(4);
    expect(schemas.GreedyDesignRubricSchema.parse(greedyDesignRubricFixtures[0]).maxPoints).toBe(
      40,
    );
    expect(() =>
      schemas.TrainingRecommendationSchema.parse({
        code: 'repeat_greedy_exchange_proof',
        label: 'Austauschbeweis Ã¼ben',
        reason: 'Beleg',
      }),
    ).not.toThrow();
  });

  it('validiert das Phase-8-PrÃ¼fungspackage V2', () => {
    const examPackage = schemas.ExamPackageSchema.parse(
      examPackageFixtures.find((candidate) => candidate.id === 'exam-package-kernkompetenz-v2'),
    );
    expect(examPackage.packageType).toBe('generated_core_mock');
    expect(examPackage.historicalExam).toBe(false);
    expect(examPackage.fullyAutoGradable).toBe(true);
    expect(examPackage.taskSlots).toHaveLength(6);
    expect(examPackage.totalPoints.numerator).toBe(48);
  });

  it('validiert den Phase-9-Rot-Schwarz-Trainer und die Rubrik', () => {
    const trainer = schemas.RbInsertionTrainerSchema.parse(rbInsertionTrainerFixtures[0]);
    expect(trainer.trainerKind).toBe('tracing');
    expect(trainer.treeFamily).toBe('red_black_tree');
    expect(trainer.problem.algorithm).toBe('rb_insert_fixup');
    expect(trainer.problem.canonicalSolution.finalTreeCompact).toBe(
      '20B(10B(N,15R(N,N)),30B(N,N))',
    );
    expect(trainer.problem.canonicalSolution.oracleValidationStatus).toBe(
      'rb_invariants_validated',
    );
    expect(schemas.RbInsertionRubricSchema.parse(rbInsertionRubricFixtures[0]).maxPoints).toBe(40);
  });

  it('validiert das Phase-9-Prüfungspackage V3', () => {
    const examPackage = schemas.ExamPackageSchema.parse(
      examPackageFixtures.find((candidate) => candidate.id === 'exam-package-kernkompetenz-v3'),
    );
    expect(examPackage.packageType).toBe('generated_core_mock');
    expect(examPackage.historicalExam).toBe(false);
    expect(examPackage.fullyAutoGradable).toBe(true);
    expect(examPackage.taskSlots).toHaveLength(7);
    expect(examPackage.totalPoints.numerator).toBe(56);
  });

  it('validiert den Phase-10-Floyd-Warshall-Trainer und die Graph-Rubrik', () => {
    const trainer = schemas.GraphTracingTrainerSchema.parse(graphTracingTrainerFixtures[0]);
    expect(trainer.trainerKind).toBe('tracing');
    expect(trainer.graphFamily).toBe('shortest_paths');
    expect(trainer.problem.algorithm).toBe('floyd_warshall');
    expect(trainer.problem.vertexOrder).toEqual(['A', 'B', 'C', 'D']);
    expect(trainer.problem.canonicalSolution.oracleValidationStatus).toBe(
      'generated_oracle_verified',
    );
    expect(schemas.GraphTracingRubricSchema.parse(graphTracingRubricFixtures[0]).maxPoints).toBe(
      40,
    );
  });
});
