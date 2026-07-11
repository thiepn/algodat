import blueprintData from '../generated/exam-blueprint.json';
import profilesData from '../generated/exam-profiles.json';
import examPackagesData from '../generated/exam-packages.json';
import examProfileCoverageData from '../generated/exam-profile-coverage.json';
import examTaskInstancesData from '../generated/exam-task-instances.json';
import fixturesData from '../generated/citation-fixtures.json';
import healthData from '../generated/content-health.json';
import manifestData from '../generated/content-manifest.json';
import sourcesData from '../generated/sources.json';
import topicsData from '../generated/topics-index.json';
import trainersData from '../generated/tracing-trainers.json';
import rubricsData from '../generated/tracing-rubrics.json';
import dpDesignProblemsData from '../generated/dp-design-problems.json';
import dpDesignRubricsData from '../generated/dp-design-rubrics.json';
import dpDesignTrainersData from '../generated/dp-design-trainers.json';
import dpDesignVariantsData from '../generated/dp-design-variants.json';
import divideConquerDesignProblemsData from '../generated/divide-conquer-design-problems.json';
import divideConquerDesignRubricsData from '../generated/divide-conquer-design-rubrics.json';
import divideConquerDesignTrainersData from '../generated/divide-conquer-design-trainers.json';
import divideConquerDesignVariantsData from '../generated/divide-conquer-design-variants.json';
import greedyDesignProblemsData from '../generated/greedy-design-problems.json';
import greedyDesignRubricsData from '../generated/greedy-design-rubrics.json';
import greedyDesignTrainersData from '../generated/greedy-design-trainers.json';
import greedyDesignVariantsData from '../generated/greedy-design-variants.json';
import graphTracingProblemsData from '../generated/graph-tracing-problems.json';
import graphTracingRubricsData from '../generated/graph-tracing-rubrics.json';
import graphTracingTrainersData from '../generated/graph-tracing-trainers.json';
import graphTracingVariantsData from '../generated/graph-tracing-variants.json';
import rbInsertionProblemsData from '../generated/rb-insertion-problems.json';
import rbInsertionRubricsData from '../generated/rb-insertion-rubrics.json';
import rbInsertionTrainersData from '../generated/rb-insertion-trainers.json';
import rbInsertionVariantsData from '../generated/rb-insertion-variants.json';
import proofTrainersData from '../generated/proof-trainers.json';
import proofRubricsData from '../generated/proof-rubrics.json';
import recurrenceTrainersData from '../generated/recurrence-trainers.json';
import recurrenceRubricsData from '../generated/recurrence-rubrics.json';
import canonicalQuestionsData from '../generated/canonical-questions.json';
import {
  CitationFixturesFileSchema,
  CanonicalQuestionsFileSchema,
  ContentHealthSchema,
  ContentManifestSchema,
  DpDesignRubricsFileSchema,
  DpDesignTrainersFileSchema,
  DpDesignVariantsFileSchema,
  DpDesignProblemsFileSchema,
  DivideConquerDesignProblemsFileSchema,
  DivideConquerDesignRubricsFileSchema,
  DivideConquerDesignTrainersFileSchema,
  DivideConquerDesignVariantsFileSchema,
  ExamProfilesFileSchema,
  ExamPackagesFileSchema,
  ExamProfileCoverageFileSchema,
  ExamTaskInstancesFileSchema,
  GreedyDesignProblemsFileSchema,
  GreedyDesignRubricsFileSchema,
  GreedyDesignTrainersFileSchema,
  GreedyDesignVariantsFileSchema,
  GraphTracingProblemsFileSchema,
  GraphTracingRubricsFileSchema,
  GraphTracingTrainersFileSchema,
  GraphTracingVariantsFileSchema,
  RbInsertionProblemsFileSchema,
  RbInsertionRubricsFileSchema,
  RbInsertionTrainersFileSchema,
  RbInsertionVariantsFileSchema,
  ProofRubricsFileSchema,
  ProofTrainersFileSchema,
  RecurrenceRubricsFileSchema,
  RecurrenceTrainersFileSchema,
  SafeSourcesFileSchema,
  TopicsIndexFileSchema,
  TracingRubricsFileSchema,
  TracingTrainersFileSchema,
} from '../schemas';

export const content = {
  manifest: ContentManifestSchema.parse(manifestData),
  health: ContentHealthSchema.parse(healthData),
  sources: SafeSourcesFileSchema.parse(sourcesData),
  topics: TopicsIndexFileSchema.parse(topicsData),
  profiles: ExamProfilesFileSchema.parse(profilesData),
  examProfileCoverage: ExamProfileCoverageFileSchema.parse(examProfileCoverageData),
  examPackages: ExamPackagesFileSchema.parse(examPackagesData),
  examTaskInstances: ExamTaskInstancesFileSchema.parse(examTaskInstancesData),
  fixtures: CitationFixturesFileSchema.parse(fixturesData),
  blueprint: blueprintData,
  trainers: TracingTrainersFileSchema.parse(trainersData),
  trainerRubrics: TracingRubricsFileSchema.parse(rubricsData),
  dpDesignTrainers: DpDesignTrainersFileSchema.parse(dpDesignTrainersData),
  dpDesignRubrics: DpDesignRubricsFileSchema.parse(dpDesignRubricsData),
  dpDesignProblems: DpDesignProblemsFileSchema.parse(dpDesignProblemsData),
  dpDesignVariants: DpDesignVariantsFileSchema.parse(dpDesignVariantsData),
  divideConquerDesignTrainers: DivideConquerDesignTrainersFileSchema.parse(
    divideConquerDesignTrainersData,
  ),
  divideConquerDesignRubrics: DivideConquerDesignRubricsFileSchema.parse(
    divideConquerDesignRubricsData,
  ),
  divideConquerDesignProblems: DivideConquerDesignProblemsFileSchema.parse(
    divideConquerDesignProblemsData,
  ),
  divideConquerDesignVariants: DivideConquerDesignVariantsFileSchema.parse(
    divideConquerDesignVariantsData,
  ),
  greedyDesignTrainers: GreedyDesignTrainersFileSchema.parse(greedyDesignTrainersData),
  greedyDesignRubrics: GreedyDesignRubricsFileSchema.parse(greedyDesignRubricsData),
  greedyDesignProblems: GreedyDesignProblemsFileSchema.parse(greedyDesignProblemsData),
  greedyDesignVariants: GreedyDesignVariantsFileSchema.parse(greedyDesignVariantsData),
  graphTracingTrainers: GraphTracingTrainersFileSchema.parse(graphTracingTrainersData),
  graphTracingRubrics: GraphTracingRubricsFileSchema.parse(graphTracingRubricsData),
  graphTracingProblems: GraphTracingProblemsFileSchema.parse(graphTracingProblemsData),
  graphTracingVariants: GraphTracingVariantsFileSchema.parse(graphTracingVariantsData),
  rbInsertionTrainers: RbInsertionTrainersFileSchema.parse(rbInsertionTrainersData),
  rbInsertionRubrics: RbInsertionRubricsFileSchema.parse(rbInsertionRubricsData),
  rbInsertionProblems: RbInsertionProblemsFileSchema.parse(rbInsertionProblemsData),
  rbInsertionVariants: RbInsertionVariantsFileSchema.parse(rbInsertionVariantsData),
  proofTrainers: ProofTrainersFileSchema.parse(proofTrainersData),
  proofRubrics: ProofRubricsFileSchema.parse(proofRubricsData),
  recurrenceTrainers: RecurrenceTrainersFileSchema.parse(recurrenceTrainersData),
  recurrenceRubrics: RecurrenceRubricsFileSchema.parse(recurrenceRubricsData),
  canonicalQuestions: CanonicalQuestionsFileSchema.parse(canonicalQuestionsData),
};

export type Content = typeof content;
