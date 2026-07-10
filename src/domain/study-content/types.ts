export interface SourceRef {
  sourceId: string;
  page: number;
  label?: string;
}

export interface StudyContentModule {
  moduleId: string;
  title: string;
  summary: string;
  topicIds: string[];
  taskNumbers: number[];
  prerequisiteModuleIds: string[];
  learningObjectives: string[];
  coreIdeas: string[];
  workedExamples: Array<{
    title: string;
    steps: string[];
    sourceRefs: SourceRef[];
  }>;
  commonMistakes: string[];
  examTips: string[];
  trainerIds: string[];
  diagnosticCompetencyIds: string[];
  historicalQuestionIds: string[];
  sourceRefs: SourceRef[];
  verificationStatus: string;
  publicDistributionStatus: 'public_safe';
}

export interface StudyModulesFile {
  schemaVersion: string;
  contentVersion: string;
  modules: StudyContentModule[];
}

export interface TaskSlotLearningMapEntry {
  taskNumber: number;
  title: string;
  examSlotIds: string[];
  topicIds: string[];
  trainerIds: string[];
  diagnosticCompetencyIds: string[];
  studyModuleIds: string[];
  historicalQuestionIds: string[];
  commonMistakeIds: string[];
  coverageLevel: string;
  actionableLearningResourceIds: string[];
  recommendedOrder: string[];
  sourceRefs: SourceRef[];
}

export interface TaskSlotLearningMapFile {
  schemaVersion: string;
  contentVersion: string;
  tasks: TaskSlotLearningMapEntry[];
}

export interface LearningResourceGraphFile {
  schemaVersion: string;
  contentVersion: string;
  nodes: Array<{ id: string; kind: string; label: string }>;
  edges: Array<{ from: string; to: string; relation: string }>;
}

export interface SafeExamLibrary {
  schemaVersion: string;
  contentVersion: string;
  publicationPolicy: string;
  exams: SafeExamSummary[];
  questions: SafeExamQuestion[];
}

export interface SafeExamSummary {
  id: string;
  kind?: string;
  year: number | null;
  date?: string | null;
  semester?: string | null;
  taskCount: number;
  totalPoints: number | null;
  durationMinutes: number | null;
  confidence: string;
  historicalFrequencyEligible: boolean;
  sourceRefs: SourceRef[];
  tasks: Array<{
    questionId: string;
    number: number;
    points: number | null;
    topic: string;
    format: string;
    requestedDeliverables: string;
  }>;
}

export interface SafeExamQuestion {
  id: string;
  examId: string | null;
  taskNumber: number | null;
  subtask: string;
  paraphrasedTitle: string;
  topicTags: string[];
  difficulty: string;
  expectedSolutionMethod: string | null;
  expectedRuntime: string | null;
  expectedProofType: string | null;
  officialSolutionAvailable: boolean;
  sourceAuthorityLevel: number;
  duplicateGroupId: string | null;
  examRelevance: string;
  verificationStatus: string;
  evidenceType: string;
  historicalFrequencyEligible: boolean;
  sourceRefs: SourceRef[];
  solutionSourceIds: string[];
}
