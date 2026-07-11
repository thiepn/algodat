import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import {
  CitationFixturesFileSchema,
  ContentHealthSchema,
  ContentManifestSchema,
  DpDesignRubricSchema,
  DpDesignRubricsFileSchema,
  DpDesignTrainerSchema,
  DpDesignTrainersFileSchema,
  DpDesignVariantsFileSchema,
  DpDesignProblemSchema,
  DivideConquerDesignProblemSchema,
  DivideConquerDesignRubricSchema,
  DivideConquerDesignRubricsFileSchema,
  DivideConquerDesignTrainerSchema,
  DivideConquerDesignTrainersFileSchema,
  DivideConquerDesignVariantsFileSchema,
  ExamPackageSchema,
  ExamPackagesFileSchema,
  ExamProfileCoverageFileSchema,
  ExamScoringPoliciesFileSchema,
  ExamTaskInstancesFileSchema,
  ProofRubricSchema,
  ProofRubricsFileSchema,
  ProofTrainerSchema,
  ProofTrainersFileSchema,
  RecurrenceRubricSchema,
  RecurrenceRubricsFileSchema,
  RecurrenceTrainerSchema,
  RecurrenceTrainersFileSchema,
  ExamProfilesFileSchema,
  GreedyDesignProblemSchema,
  GreedyDesignRubricSchema,
  GreedyDesignRubricsFileSchema,
  GreedyDesignTrainerSchema,
  GreedyDesignTrainersFileSchema,
  GreedyDesignVariantsFileSchema,
  GraphTracingProblemSchema,
  GraphTracingRubricSchema,
  GraphTracingRubricsFileSchema,
  GraphTracingTrainerSchema,
  GraphTracingTrainersFileSchema,
  GraphTracingVariantsFileSchema,
  RbInsertionProblemSchema,
  RbInsertionRubricSchema,
  RbInsertionRubricsFileSchema,
  RbInsertionTrainerSchema,
  RbInsertionTrainersFileSchema,
  RbInsertionVariantsFileSchema,
  SafeSourcesFileSchema,
  TopicsIndexFileSchema,
  TracingRubricSchema,
  TracingRubricsFileSchema,
  TracingTrainerSchema,
  TracingTrainersFileSchema,
  type ExamProfile,
  type SourceCitationFixture,
  type SourceDocument,
  type Topic,
  type VerificationStatus,
} from '../src/content/schemas';
import { dataDir, generatedDir, readJson, sha256, sha256File, writeJson } from './content-utils';
import { buildPhase14DiagnosticContent } from './phase14-diagnostic-content';
import {
  ExamDatePhasePolicySchema,
  ExamSlotCompetencyMapFileSchema,
  ReadinessPolicySchema,
  SpacedReviewPolicySchema,
  StudyActivityCatalogFileSchema,
  StudyPlanDefaultSettingsSchema,
  StudyPriorityPolicySchema,
} from '../src/domain/study-orchestrator/schemas';
import {
  CheatSheetCatalogFileSchema,
  CheatSheetLayoutPolicySchema,
  CheatSheetPresetsFileSchema,
} from '../src/domain/cheat-sheet/schemas';

interface RawSource {
  id: string;
  path: string;
  original_name: string;
  document_title?: string;
  source_authority_level?: number;
  document_category?: string;
  evidenceType: SourceDocument['evidenceType'];
  document_year?: number | null;
  page_count?: number | null;
  extraction_succeeded?: boolean | null;
  visual_review_required?: boolean;
  verification_status?: VerificationStatus;
  canonicalDocumentId: string;
  historicalFrequencyEligible: boolean;
  duplicateGroupId?: string | null;
}
interface RawManifest {
  phase0aCorrectedAt: string;
  documents: RawSource[];
}
interface RawExam {
  id: string;
  kind?: string;
  year: number | null;
  date?: string | null;
  semester?: string | null;
  task_count: number;
  total_points: number | null;
  duration_minutes: number | null;
  confidence: string;
  question_source_id: string | null;
  historicalFrequencyEligible?: boolean;
  tasks: Array<{
    number: number;
    points: number | null;
    topic: string;
    format: string;
    requested_deliverables: string;
  }>;
}
interface RawExams {
  exams: RawExam[];
}
interface RawBlueprint {
  tasks: Array<{
    task_number: number;
    likely_formats: string[];
    historical_topics: string[];
    typical_points: number;
    required_answer_components: string;
    priority: string;
    confidence: string;
  }>;
  examProfiles: Array<{
    id: string;
    title: string;
    tasks: number;
    points: number;
    durationMinutes: number;
    durationEvidence: string;
    confidence: string;
    supportingExamIds: string[];
  }>;
  frequencyPolicy: string;
}
interface RawTopic {
  id: string;
  name: string;
  importance: Topic['importance'];
  prerequisites: string[];
  verification_status: VerificationStatus;
  official_source_refs: Array<{ source_id: string; pages: number[] }>;
  exercise_source_refs: unknown[];
  evidenceOccurrences?: {
    realExam: string[];
    mockExam: string[];
    exercise: string[];
  };
}
interface RawTopics {
  topics: RawTopic[];
}
interface RawQuestions {
  questions: Array<{
    id: string;
    source_id: string;
    page: number;
    year: number | null;
    task_number: number | null;
    subtask: string;
    title: string;
    topic_tags: string[];
    difficulty: string;
    expected_solution_method: string | null;
    expected_runtime: string | null;
    expected_proof_type: string | null;
    official_solution_available: boolean;
    solution_source_ids: string[];
    source_authority_level: number;
    duplicate_group_id: string | null;
    exam_relevance: string;
    verification_status: VerificationStatus;
    evidenceType: string;
    corpusEventId: string | null;
    canonicalDocumentId: string;
    historicalFrequencyEligible: boolean;
    visualReviewDisposition?: string;
  }>;
}
interface RawConflicts {
  conflicts: Array<{ status: string }>;
}
interface Validation {
  passed: boolean;
}

interface Phase17StudyModules {
  schemaVersion: string;
  contentVersion: string;
  modules: Array<{
    moduleId: string;
    title: string;
    topicIds: string[];
    taskNumbers: number[];
    trainerIds: string[];
    diagnosticCompetencyIds: string[];
    sourceRefs: Array<{ sourceId: string; page: number; label?: string }>;
    publicDistributionStatus: string;
  }>;
}

interface Phase17TaskMap {
  schemaVersion: string;
  contentVersion: string;
  tasks: Array<{
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
    sourceRefs: Array<{ sourceId: string; page: number }>;
  }>;
}

interface Phase17LearningGraph {
  schemaVersion: string;
  contentVersion: string;
  nodes: Array<{ id: string; kind: string; label: string }>;
  edges: Array<{ from: string; to: string; relation: string }>;
}

const schemaVersion = '1.0.0';

function categoryForTopic(name: string): string {
  const lowered = name.toLocaleLowerCase('de');
  if (/graph|dijkstra|bellman|floyd|kruskal|prim|bfs|dfs|spann/.test(lowered)) return 'Graphen';
  if (/baum|hash|union|heap|queue|stack|liste|array|adress/.test(lowered)) return 'Datenstrukturen';
  if (/sort|divide|rekursion|karatsuba|strassen|matrix|master/.test(lowered))
    return 'Teile und Herrsche';
  if (/dynam|rucksack|subset|lcs|fibonacci|memo/.test(lowered)) return 'Dynamische Programmierung';
  if (/greedy|scheduling|approx|austausch|widerspruch/.test(lowered))
    return 'Greedy und Approximation';
  return 'Grundlagen und Beweise';
}

function assertPhase17LearningContent(
  studyModules: Phase17StudyModules,
  taskMap: Phase17TaskMap,
  learningGraph: Phase17LearningGraph,
): void {
  const moduleIds = new Set(studyModules.modules.map((module) => module.moduleId));
  const taskNumbers = new Set(taskMap.tasks.map((task) => task.taskNumber));
  if (taskMap.tasks.length !== 9 || taskNumbers.size !== 9)
    throw new Error('Phase 17 verlangt genau neun Aufgaben-Lernhubs.');
  for (let taskNumber = 1; taskNumber <= 9; taskNumber += 1) {
    const task = taskMap.tasks.find((candidate) => candidate.taskNumber === taskNumber);
    if (!task) throw new Error(`Phase-17-Lernhub für Aufgabe ${taskNumber} fehlt.`);
    if (task.actionableLearningResourceIds.length === 0)
      throw new Error(`Aufgabe ${taskNumber} hat keine nächste Lernaktion.`);
    const missingModule = task.studyModuleIds.find((moduleId) => !moduleIds.has(moduleId));
    if (missingModule)
      throw new Error(`Aufgabe ${taskNumber} referenziert ein fehlendes Modul: ${missingModule}`);
    if (task.sourceRefs.length === 0)
      throw new Error(`Aufgabe ${taskNumber} hat keinen Datei-/Seitenbezug.`);
  }
  for (const module of studyModules.modules) {
    if (module.publicDistributionStatus !== 'public_safe')
      throw new Error(`Lernmodul ${module.moduleId} ist nicht öffentlich freigegeben.`);
    if (module.sourceRefs.length === 0)
      throw new Error(`Lernmodul ${module.moduleId} hat keinen Datei-/Seitenbezug.`);
  }
  const graphNodeIds = new Set(learningGraph.nodes.map((node) => node.id));
  const brokenEdge = learningGraph.edges.find(
    (edge) => !graphNodeIds.has(edge.from) || !graphNodeIds.has(edge.to),
  );
  if (brokenEdge)
    throw new Error(`Learning-Resource-Graph enthält eine gebrochene Kante: ${brokenEdge.from}`);
}

function normalExamQuestionViolation(question: RawQuestions['questions'][number]): string | null {
  if (question.verification_status === 'generated_unverified')
    return 'generated_unverified darf nicht in normalen Klausuransichten erscheinen.';
  if (question.evidenceType === 'generated_example')
    return 'generated_example ohne freigegebenen didaktischen Zweck bleibt Entwickler-Audit.';
  if (/thema aus quelle zu verifizieren/iu.test(question.title))
    return 'generischer Platzhaltertitel ist nicht publikationsfähig.';
  if (question.topic_tags.length === 0) return 'Themen-Tags fehlen.';
  if (!question.source_id || question.page < 1) return 'Datei-/Seitenbezug fehlt.';
  const hasLearningAction =
    question.task_number !== null ||
    question.expected_solution_method !== null ||
    question.expected_proof_type !== null ||
    question.expected_runtime !== null ||
    question.official_solution_available;
  if (!hasLearningAction) return 'keine nutzbare Lernaktion oder Lösungsevidenz.';
  return null;
}

function safePublicSourceTitle(raw: RawManifest['documents'][number]): string {
  const filenameTitle = raw.original_name
    .replace(/\.[^.]+$/u, '')
    .replace(/[_-]+/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim();
  const category = raw.document_category ?? 'Quelldokument';
  const year = raw.document_year ? ` ${raw.document_year}` : '';
  const candidate = filenameTitle || `${category}${year}`;
  return candidate.length <= 140 ? candidate : `${category}${year}`;
}

function publicSourceTitleViolation(title: string): string | null {
  if (title.length > 160) return 'Titel überschreitet 160 Zeichen.';
  if (/\r|\n/u.test(title)) return 'Titel enthält mehrzeiligen Text.';
  const examMarkers = title.match(/\b(Aufgabe|Matrikelnummer|Seite)\b/giu)?.length ?? 0;
  if (examMarkers >= 3) return 'Titel ähnelt extrahiertem Prüfungs- oder Seitentext.';
  if (title.split(/\s+/u).length > 24) return 'Titel enthält zu viele Wörter für Metadaten.';
  return null;
}

async function main(): Promise<void> {
  await mkdir(generatedDir, { recursive: true });
  const manifest = await readJson<RawManifest>(path.join(dataDir, 'source-manifest.json'));
  const exams = await readJson<RawExams>(path.join(dataDir, 'exam-corpus.json'));
  const blueprint = await readJson<RawBlueprint>(path.join(dataDir, 'exam-blueprint.json'));
  const rawTopics = await readJson<RawTopics>(path.join(dataDir, 'topic-map.json'));
  const rawQuestions = await readJson<RawQuestions>(path.join(dataDir, 'question-inventory.json'));
  const phase17StudyModules = await readJson<Phase17StudyModules>(
    path.join(dataDir, 'study-modules.json'),
  );
  const phase17TaskMap = await readJson<Phase17TaskMap>(
    path.join(dataDir, 'task-slot-learning-map.json'),
  );
  const phase17LearningGraph = await readJson<Phase17LearningGraph>(
    path.join(dataDir, 'learning-resource-graph.json'),
  );
  assertPhase17LearningContent(phase17StudyModules, phase17TaskMap, phase17LearningGraph);
  const conflicts = await readJson<RawConflicts>(path.join(dataDir, 'source-conflicts.json'));
  const phase0 = await readJson<Validation>(path.join(dataDir, 'validation-results.json'));
  const phase0a = await readJson<Validation>(path.join(dataDir, 'phase0a-validation-results.json'));

  const inputNames = [
    'source-manifest.json',
    'exam-corpus.json',
    'exam-blueprint.json',
    'topic-map.json',
    'source-conflicts.json',
    'source-corrections.json',
    'visual-review-results.json',
    'exam-profile-coverage.json',
    'exam-packages/kernkompetenz-probeklausur-v1.json',
    'training/tracing-trainer-rucksack-dp.json',
    'training/tracing-trainer-union-find-lists.json',
    'training/proof-trainer-schleifeninvariante-summe.json',
    'training/recurrence-trainer-master-fall1.json',
    'training/dp-design-trainer-mine.json',
    'training/divide-conquer-design-trainer-maxwertdifferenz.json',
    'training-rubrics/trainer-rucksack-dp-v1.json',
    'training-rubrics/trainer-union-find-listen-v1.json',
    'training-rubrics/trainer-schleifeninvariante-summe-v1.json',
    'training-rubrics/trainer-rekurrenz-master-fall1-v1.json',
    'training-rubrics/trainer-dp-entwurf-mine-v1.json',
    'training-rubrics/trainer-dc-entwurf-maxwertdifferenz-v1.json',
    'training/greedy-design-trainer-fitnesspunkte.json',
    'training/rb-insertion-trainer.json',
    'training/graph-tracing-trainer-floyd-warshall.json',
    'training/graph-tracing-trainer-dijkstra.json',
    'training/graph-tracing-trainer-prim.json',
    'training-rubrics/trainer-greedy-entwurf-fitnesspunkte-v1.json',
    'training-rubrics/trainer-rot-schwarz-einfuegen-v1.json',
    'training-rubrics/trainer-graph-floyd-warshall-v1.json',
    'training-rubrics/trainer-graph-dijkstra-v1.json',
    'training-rubrics/trainer-graph-prim-mst-v1.json',
    'exam-packages/kernkompetenz-probeklausur-v2.json',
    'exam-packages/kernkompetenz-probeklausur-v3.json',
    'exam-packages/kernkompetenz-probeklausur-v4.json',
    'phase14-competency-inventory.json',
    'study-activity-catalog.json',
    'exam-slot-competency-map.json',
    'study-priority-policy.json',
    'spaced-review-policy.json',
    'readiness-policy.json',
    'exam-date-phase-policy.json',
    'study-plan-default-settings.json',
    'cheat-sheet-blocks.json',
    'cheat-sheet-presets.json',
    'cheat-sheet-layout-policy.json',
    'study-modules.json',
    'task-slot-learning-map.json',
    'learning-resource-graph.json',
  ];
  const inputHashes = await Promise.all(
    inputNames.map((name) => sha256File(path.join(dataDir, name))),
  );
  const contentVersion = `phase16-${sha256(inputHashes.join(':')).slice(0, 12)}`;
  const lastReviewed = manifest.phase0aCorrectedAt;

  const sources: SourceDocument[] = manifest.documents
    .filter((raw) => !raw.path.endsWith('.DS_Store'))
    .map((raw) => ({
      id: raw.id,
      schemaVersion,
      contentVersion,
      sourceRefs: raw.page_count ? [{ sourceId: raw.id, page: 1 }] : [],
      verificationStatus: raw.verification_status ?? 'extraction_uncertain',
      lastReviewed,
      duplicateGroupId: raw.duplicateGroupId ?? null,
      displayName: raw.original_name,
      title: safePublicSourceTitle(raw),
      authorityLevel: raw.source_authority_level ?? 2,
      category: raw.document_category ?? 'Sonstiges',
      evidenceType: raw.evidenceType,
      year: raw.document_year ?? null,
      pageCount: raw.page_count ?? null,
      extractionSucceeded: raw.extraction_succeeded ?? null,
      visualReviewRequired: raw.visual_review_required ?? false,
      canonicalDocumentId: raw.canonicalDocumentId,
      historicalFrequencyEligible: raw.historicalFrequencyEligible,
    }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, 'de'));
  SafeSourcesFileSchema.parse(sources);
  const publicSourceViolations = sources.flatMap((source) => {
    const violation = publicSourceTitleViolation(source.title);
    return violation ? [{ sourceId: source.id, field: 'title', violation }] : [];
  });
  if (publicSourceViolations.length)
    throw new Error(
      `Öffentliche Quellenmetadaten enthalten ${publicSourceViolations.length} verdächtige Titel.`,
    );

  const sourceIds = new Set(sources.map((source) => source.id));
  const topics: Topic[] = rawTopics.topics.map((raw) => ({
    id: raw.id,
    schemaVersion,
    contentVersion,
    sourceRefs: raw.official_source_refs
      .filter((ref) => sourceIds.has(ref.source_id) && ref.pages.length > 0)
      .slice(0, 3)
      .map((ref) => ({ sourceId: ref.source_id, page: ref.pages[0] ?? 1 })),
    verificationStatus: raw.verification_status,
    lastReviewed,
    duplicateGroupId: null,
    name: raw.name,
    category: categoryForTopic(raw.name),
    importance: raw.importance,
    prerequisites: raw.prerequisites,
    officialSourceCoverage: raw.official_source_refs.length,
    exerciseCoverage: raw.exercise_source_refs.length,
    realExamOccurrences: raw.evidenceOccurrences?.realExam ?? [],
    mockExamOccurrences: raw.evidenceOccurrences?.mockExam ?? [],
    exerciseOccurrences: raw.evidenceOccurrences?.exercise ?? [],
    visualReviewStatus: raw.verification_status === 'visual_review_required' ? 'offen' : 'geprüft',
  }));
  TopicsIndexFileSchema.parse(topics);

  const standardTasks = blueprint.tasks.map((task) => ({
    taskNumber: task.task_number,
    format: task.likely_formats.join(', '),
    historicalTopics: task.historical_topics,
    typicalPoints: task.typical_points,
    answerComponents: task.required_answer_components,
    priority: task.priority,
    confidence: task.confidence,
  }));
  const exam2021 = exams.exams.find((exam) => exam.id === 'exam-2021-1');
  if (!exam2021) throw new Error('Klausurprofil 2021 fehlt.');
  const profiles: ExamProfile[] = blueprint.examProfiles.map((profile) => {
    const is2021 = profile.id === 'klausur-2021';
    const supporting = exams.exams.filter((exam) => profile.supportingExamIds.includes(exam.id));
    const sourceRefs = supporting
      .flatMap((exam) =>
        exam.question_source_id ? [{ sourceId: exam.question_source_id, page: 1 }] : [],
      )
      .filter((ref) => sourceIds.has(ref.sourceId));
    return {
      id: profile.id,
      schemaVersion,
      contentVersion,
      sourceRefs,
      verificationStatus: 'verified_against_official_source',
      lastReviewed,
      duplicateGroupId: null,
      title: profile.title,
      description: is2021
        ? 'Historische digitale Ausnahme mit offenem Material und sechs Aufgaben.'
        : 'Stark gestütztes Präsenzprofil; kein universelles Klausurgesetz.',
      taskCount: profile.tasks,
      totalPoints: profile.points,
      durationMinutes: profile.durationMinutes,
      durationEvidence: profile.durationEvidence,
      confidence: profile.confidence,
      supportingExamIds: profile.supportingExamIds,
      deviations: is2021
        ? ['Sechs statt neun Aufgaben', '60 statt 50 Punkte', 'Digitale Abgabe']
        : [
            'Die Klausur 2021 folgt einem anderen Regime.',
            'Unbekannte Angaben von 2024 werden nicht ergänzt.',
          ],
      tasks: is2021
        ? exam2021.tasks.map((task) => ({
            taskNumber: task.number,
            format: task.format,
            historicalTopics: [task.topic],
            typicalPoints: task.points ?? 0,
            answerComponents: task.requested_deliverables,
            priority: task.number >= 5 ? 'sehr hoch' : 'hoch',
            confidence: exam2021.confidence,
          }))
        : standardTasks,
    };
  });
  ExamProfilesFileSchema.parse(profiles);

  const exam2024Source = sources.find((source) => source.displayName === 'Klausur 2024.pdf');
  const lecture17 = sources.find((source) => source.displayName === 'Vorlesung17.pdf');
  if (!exam2024Source || !lecture17) throw new Error('Verifizierte Zitier-Fixquellen fehlen.');
  const fixtures: SourceCitationFixture[] = [
    {
      id: 'fixture-citation-2024-a7',
      schemaVersion,
      contentVersion,
      sourceRefs: [{ sourceId: exam2024Source.id, page: 7 }],
      verificationStatus: 'verified_against_official_source',
      lastReviewed,
      duplicateGroupId: exam2024Source.duplicateGroupId ?? null,
      title: 'Klausur 2024',
      pageLabel: 'Seite 7',
      authorityLabel: 'Offizielle Primärquelle',
      evidenceType: 'real_exam',
      conflictWarning: 'Prüfer, Datum, Dauer und Hilfsmittel sind nicht belegt.',
    },
    {
      id: 'fixture-citation-lecture17',
      schemaVersion,
      contentVersion,
      sourceRefs: [{ sourceId: lecture17.id, page: 12 }],
      verificationStatus: 'official_verified',
      lastReviewed,
      duplicateGroupId: lecture17.duplicateGroupId ?? null,
      title: 'Vorlesung 17',
      pageLabel: 'Folie 12',
      authorityLabel: 'Offizielle Primärquelle',
      evidenceType: 'unknown',
      conflictWarning: null,
    },
  ];
  CitationFixturesFileSchema.parse(fixtures);

  const rawTrainers = await Promise.all([
    readJson(path.join(dataDir, 'training', 'tracing-trainer-rucksack-dp.json')),
    readJson(path.join(dataDir, 'training', 'tracing-trainer-union-find-lists.json')),
  ]);
  const rawProofTrainers = await Promise.all([
    readJson(path.join(dataDir, 'training', 'proof-trainer-schleifeninvariante-summe.json')),
  ]);
  const rawRecurrenceTrainers = await Promise.all([
    readJson(path.join(dataDir, 'training', 'recurrence-trainer-master-fall1.json')),
  ]);
  const rawDpDesignTrainers = await Promise.all([
    readJson(path.join(dataDir, 'training', 'dp-design-trainer-mine.json')),
  ]);
  const rawGreedyDesignTrainers = await Promise.all([
    readJson(path.join(dataDir, 'training', 'greedy-design-trainer-fitnesspunkte.json')),
  ]);
  const rawRbInsertionTrainers = await Promise.all([
    readJson(path.join(dataDir, 'training', 'rb-insertion-trainer.json')),
  ]);
  const rawGraphTracingTrainers = await Promise.all([
    readJson(path.join(dataDir, 'training', 'graph-tracing-trainer-floyd-warshall.json')),
    readJson(path.join(dataDir, 'training', 'graph-tracing-trainer-dijkstra.json')),
    readJson(path.join(dataDir, 'training', 'graph-tracing-trainer-prim.json')),
  ]);
  const rawRubrics = await Promise.all([
    readJson(path.join(dataDir, 'training-rubrics', 'trainer-rucksack-dp-v1.json')),
    readJson(path.join(dataDir, 'training-rubrics', 'trainer-union-find-listen-v1.json')),
  ]);
  const rawProofRubrics = await Promise.all([
    readJson(path.join(dataDir, 'training-rubrics', 'trainer-schleifeninvariante-summe-v1.json')),
  ]);
  const rawRecurrenceRubrics = await Promise.all([
    readJson(path.join(dataDir, 'training-rubrics', 'trainer-rekurrenz-master-fall1-v1.json')),
  ]);
  const rawDpDesignRubrics = await Promise.all([
    readJson(path.join(dataDir, 'training-rubrics', 'trainer-dp-entwurf-mine-v1.json')),
  ]);
  const rawGreedyDesignRubrics = await Promise.all([
    readJson(
      path.join(dataDir, 'training-rubrics', 'trainer-greedy-entwurf-fitnesspunkte-v1.json'),
    ),
  ]);
  const rawRbInsertionRubrics = await Promise.all([
    readJson(path.join(dataDir, 'training-rubrics', 'trainer-rot-schwarz-einfuegen-v1.json')),
  ]);
  const rawGraphTracingRubrics = await Promise.all([
    readJson(path.join(dataDir, 'training-rubrics', 'trainer-graph-floyd-warshall-v1.json')),
    readJson(path.join(dataDir, 'training-rubrics', 'trainer-graph-dijkstra-v1.json')),
    readJson(path.join(dataDir, 'training-rubrics', 'trainer-graph-prim-mst-v1.json')),
  ]);
  const rawExamProfileCoverage = await readJson(path.join(dataDir, 'exam-profile-coverage.json'));
  const rawExamPackages = await Promise.all([
    readJson(path.join(dataDir, 'exam-packages', 'kernkompetenz-probeklausur-v1.json')),
    readJson(path.join(dataDir, 'exam-packages', 'kernkompetenz-probeklausur-v2.json')),
    readJson(path.join(dataDir, 'exam-packages', 'kernkompetenz-probeklausur-v3.json')),
    readJson(path.join(dataDir, 'exam-packages', 'kernkompetenz-probeklausur-v4.json')),
    readJson(path.join(dataDir, 'exam-packages', 'aktuelle-probeklausur-v5.json')),
  ]);
  const rawPhase14CompetencyInventory = await readJson(
    path.join(dataDir, 'phase14-competency-inventory.json'),
  );
  const studyActivityCatalog = StudyActivityCatalogFileSchema.parse(
    await readJson(path.join(dataDir, 'study-activity-catalog.json')),
  );
  const examSlotCompetencyMap = ExamSlotCompetencyMapFileSchema.parse(
    await readJson(path.join(dataDir, 'exam-slot-competency-map.json')),
  );
  const studyPriorityPolicy = StudyPriorityPolicySchema.parse(
    await readJson(path.join(dataDir, 'study-priority-policy.json')),
  );
  const spacedReviewPolicy = SpacedReviewPolicySchema.parse(
    await readJson(path.join(dataDir, 'spaced-review-policy.json')),
  );
  const readinessPolicy = ReadinessPolicySchema.parse(
    await readJson(path.join(dataDir, 'readiness-policy.json')),
  );
  const examDatePhasePolicy = ExamDatePhasePolicySchema.parse(
    await readJson(path.join(dataDir, 'exam-date-phase-policy.json')),
  );
  const studyPlanDefaultSettings = StudyPlanDefaultSettingsSchema.parse(
    await readJson(path.join(dataDir, 'study-plan-default-settings.json')),
  );
  const cheatSheetBlocks = CheatSheetCatalogFileSchema.parse(
    await readJson(path.join(dataDir, 'cheat-sheet-blocks.json')),
  ).map((block) => ({ ...block, contentVersion }));
  const cheatSheetPresets = CheatSheetPresetsFileSchema.parse(
    await readJson(path.join(dataDir, 'cheat-sheet-presets.json')),
  );
  const cheatSheetLayoutPolicy = CheatSheetLayoutPolicySchema.parse(
    await readJson(path.join(dataDir, 'cheat-sheet-layout-policy.json')),
  );
  const trainers = TracingTrainersFileSchema.parse(
    rawTrainers.map((raw) => {
      const trainer = TracingTrainerSchema.parse(raw);
      return {
        ...trainer,
        contentVersion,
        problem: { ...trainer.problem, contentVersion },
      };
    }),
  ).filter((trainer) => trainer.publicDistributionStatus === 'public_safe');
  const rubrics = TracingRubricsFileSchema.parse(
    rawRubrics.map((raw) => ({ ...TracingRubricSchema.parse(raw), contentVersion })),
  ).filter((rubric) => rubric.publicDistributionStatus === 'public_safe');
  const proofTrainers = ProofTrainersFileSchema.parse(
    rawProofTrainers.map((raw) => {
      const trainer = ProofTrainerSchema.parse(raw);
      return {
        ...trainer,
        contentVersion,
        problem: { ...trainer.problem, contentVersion },
      };
    }),
  ).filter((trainer) => trainer.publicDistributionStatus === 'public_safe');
  const proofRubrics = ProofRubricsFileSchema.parse(
    rawProofRubrics.map((raw) => ({ ...ProofRubricSchema.parse(raw), contentVersion })),
  ).filter((rubric) => rubric.publicDistributionStatus === 'public_safe');
  const recurrenceTrainers = RecurrenceTrainersFileSchema.parse(
    rawRecurrenceTrainers.map((raw) => {
      const trainer = RecurrenceTrainerSchema.parse(raw);
      return {
        ...trainer,
        contentVersion,
        problem: { ...trainer.problem, contentVersion },
      };
    }),
  ).filter((trainer) => trainer.publicDistributionStatus === 'public_safe');
  const recurrenceRubrics = RecurrenceRubricsFileSchema.parse(
    rawRecurrenceRubrics.map((raw) => ({
      ...RecurrenceRubricSchema.parse(raw),
      contentVersion,
    })),
  ).filter((rubric) => rubric.publicDistributionStatus === 'public_safe');
  const dpDesignTrainers = DpDesignTrainersFileSchema.parse(
    rawDpDesignTrainers.map((raw) => {
      const trainer = DpDesignTrainerSchema.parse(raw);
      return {
        ...trainer,
        contentVersion,
        problem: {
          ...trainer.problem,
          contentVersion,
          variants: trainer.problem.variants.map((variant) => ({ ...variant, contentVersion })),
        },
      };
    }),
  ).filter((trainer) => trainer.publicDistributionStatus === 'public_safe');
  const dpDesignRubrics = DpDesignRubricsFileSchema.parse(
    rawDpDesignRubrics.map((raw) => ({
      ...DpDesignRubricSchema.parse(raw),
      contentVersion,
    })),
  ).filter((rubric) => rubric.publicDistributionStatus === 'public_safe');
  const dpDesignProblems = dpDesignTrainers.map((trainer) =>
    DpDesignProblemSchema.parse(trainer.problem),
  );
  const dpDesignVariants = DpDesignVariantsFileSchema.parse(
    dpDesignTrainers.flatMap((trainer) => trainer.problem.variants),
  );
  const rawDivideConquerDesignTrainers = await Promise.all([
    readJson(path.join(dataDir, 'training', 'divide-conquer-design-trainer-maxwertdifferenz.json')),
  ]);
  const rawDivideConquerDesignRubrics = await Promise.all([
    readJson(path.join(dataDir, 'training-rubrics', 'trainer-dc-entwurf-maxwertdifferenz-v1.json')),
  ]);
  const divideConquerDesignTrainers = DivideConquerDesignTrainersFileSchema.parse(
    rawDivideConquerDesignTrainers.map((raw) => {
      const trainer = DivideConquerDesignTrainerSchema.parse(raw);
      return {
        ...trainer,
        contentVersion,
        problem: {
          ...trainer.problem,
          contentVersion,
          variants: trainer.problem.variants.map((variant) => ({ ...variant, contentVersion })),
        },
      };
    }),
  ).filter((trainer) => trainer.publicDistributionStatus === 'public_safe');
  const divideConquerDesignRubrics = DivideConquerDesignRubricsFileSchema.parse(
    rawDivideConquerDesignRubrics.map((raw) => ({
      ...DivideConquerDesignRubricSchema.parse(raw),
      contentVersion,
    })),
  ).filter((rubric) => rubric.publicDistributionStatus === 'public_safe');
  const divideConquerDesignProblems = divideConquerDesignTrainers.map((trainer) =>
    DivideConquerDesignProblemSchema.parse(trainer.problem),
  );
  const divideConquerDesignVariants = DivideConquerDesignVariantsFileSchema.parse(
    divideConquerDesignTrainers.flatMap((trainer) => trainer.problem.variants),
  );
  const greedyDesignTrainers = GreedyDesignTrainersFileSchema.parse(
    rawGreedyDesignTrainers.map((raw) => {
      const trainer = GreedyDesignTrainerSchema.parse(raw);
      return {
        ...trainer,
        contentVersion,
        problem: {
          ...trainer.problem,
          contentVersion,
          variants: trainer.problem.variants.map((variant) => ({ ...variant, contentVersion })),
        },
      };
    }),
  ).filter((trainer) => trainer.publicDistributionStatus === 'public_safe');
  const greedyDesignRubrics = GreedyDesignRubricsFileSchema.parse(
    rawGreedyDesignRubrics.map((raw) => ({
      ...GreedyDesignRubricSchema.parse(raw),
      contentVersion,
    })),
  ).filter((rubric) => rubric.publicDistributionStatus === 'public_safe');
  const greedyDesignProblems = greedyDesignTrainers.map((trainer) =>
    GreedyDesignProblemSchema.parse(trainer.problem),
  );
  const greedyDesignVariants = GreedyDesignVariantsFileSchema.parse(
    greedyDesignTrainers.flatMap((trainer) => trainer.problem.variants),
  );
  const rbInsertionTrainers = RbInsertionTrainersFileSchema.parse(
    rawRbInsertionTrainers.map((raw) => {
      const trainer = RbInsertionTrainerSchema.parse(raw);
      return {
        ...trainer,
        contentVersion,
        problem: {
          ...trainer.problem,
          contentVersion,
          variants: trainer.problem.variants.map((variant) => ({ ...variant, contentVersion })),
        },
      };
    }),
  ).filter((trainer) => trainer.publicDistributionStatus === 'public_safe');
  const rbInsertionRubrics = RbInsertionRubricsFileSchema.parse(
    rawRbInsertionRubrics.map((raw) => ({
      ...RbInsertionRubricSchema.parse(raw),
      contentVersion,
    })),
  ).filter((rubric) => rubric.publicDistributionStatus === 'public_safe');
  const rbInsertionProblems = rbInsertionTrainers.map((trainer) =>
    RbInsertionProblemSchema.parse(trainer.problem),
  );
  const rbInsertionVariants = RbInsertionVariantsFileSchema.parse(
    rbInsertionTrainers.flatMap((trainer) => trainer.problem.variants),
  );
  const graphTracingTrainers = GraphTracingTrainersFileSchema.parse(
    rawGraphTracingTrainers.map((raw) => {
      const trainer = GraphTracingTrainerSchema.parse(raw);
      return {
        ...trainer,
        contentVersion,
        problem: {
          ...trainer.problem,
          contentVersion,
          variants: trainer.problem.variants.map((variant) => ({ ...variant, contentVersion })),
        },
      };
    }),
  ).filter((trainer) => trainer.publicDistributionStatus === 'public_safe');
  const graphTracingRubrics = GraphTracingRubricsFileSchema.parse(
    rawGraphTracingRubrics.map((raw) => ({
      ...GraphTracingRubricSchema.parse(raw),
      contentVersion,
    })),
  ).filter((rubric) => rubric.publicDistributionStatus === 'public_safe');
  const graphTracingProblems = graphTracingTrainers.map((trainer) =>
    GraphTracingProblemSchema.parse(trainer.problem),
  );
  const graphTracingVariants = GraphTracingVariantsFileSchema.parse(
    graphTracingTrainers.flatMap((trainer) => trainer.problem.variants),
  );
  const examProfileCoverage = ExamProfileCoverageFileSchema.parse(rawExamProfileCoverage);
  const examPackages = ExamPackagesFileSchema.parse(
    rawExamPackages.map((raw) => {
      const examPackage = ExamPackageSchema.parse(raw);
      return {
        ...examPackage,
        contentVersion,
      };
    }),
  ).filter((examPackage) => examPackage.publicDistributionStatus === 'public_safe');
  const examTaskInstances = ExamTaskInstancesFileSchema.parse(
    examPackages.flatMap((examPackage) =>
      examPackage.taskSlots.map((slot) => ({
        id: `instance-${slot.taskSlotId}`,
        schemaVersion,
        contentVersion,
        sourceRefs: slot.sourceRefs,
        verificationStatus: examPackage.verificationStatus,
        lastReviewed,
        publicDistributionStatus: examPackage.publicDistributionStatus,
        engineVersion: examPackage.engineVersion,
        examPackageId: examPackage.id,
        taskSlotId: slot.taskSlotId,
        trainerId: slot.trainerId,
        adapterId: slot.adapterId,
        examPoints: slot.examPoints,
      })),
    ),
  );
  const examScoringPolicies = ExamScoringPoliciesFileSchema.parse(
    examPackages.map((examPackage) => examPackage.scoringPolicy),
  );
  const phase14Diagnostic = buildPhase14DiagnosticContent(
    rawPhase14CompetencyInventory as Parameters<typeof buildPhase14DiagnosticContent>[0],
    contentVersion,
  );

  const verificationCounts = Object.fromEntries(
    rawQuestions.questions.reduce((counts, question) => {
      counts.set(question.verification_status, (counts.get(question.verification_status) ?? 0) + 1);
      return counts;
    }, new Map<string, number>()),
  );
  const allStatuses = [
    'official_verified',
    'verified_against_official_source',
    'official_solution_available',
    'unofficial_solution_only',
    'generated_unverified',
    'conflict_detected',
    'extraction_uncertain',
    'visual_review_required',
  ];
  for (const status of allStatuses) verificationCounts[status] ??= 0;
  const contentHealth = {
    schemaVersion,
    contentVersion,
    verificationStatusCounts: verificationCounts,
    unresolvedConflictCount: conflicts.conflicts.filter(
      (conflict) => conflict.status === 'conflict_detected',
    ).length,
    visualReviewRequiredCount: rawQuestions.questions.filter(
      (question) => question.verification_status === 'visual_review_required',
    ).length,
    brokenReferenceCount: 0,
    duplicateSafeExamFrequency: true,
    phase0ValidationPassed: phase0.passed,
    phase0aValidationPassed: phase0a.passed,
    indexedDbSchemaVersion: 12,
    pwaVersion: contentVersion,
  };
  ContentHealthSchema.parse(contentHealth);

  const blueprintSafe = {
    schemaVersion,
    contentVersion,
    frequencyPolicy: blueprint.frequencyPolicy,
    tasks: standardTasks,
  };
  const questionPublicationAudit = rawQuestions.questions
    .map((question) => ({
      id: question.id,
      title: question.title,
      taskNumber: question.task_number,
      sourceId: question.source_id,
      page: question.page,
      verificationStatus: question.verification_status,
      evidenceType: question.evidenceType,
      topicTags: question.topic_tags,
      violation: normalExamQuestionViolation(question),
    }))
    .filter((entry) => entry.violation !== null);
  const publicQuestions = rawQuestions.questions.filter(
    (question) => normalExamQuestionViolation(question) === null,
  );
  const safeExamLibrary = {
    schemaVersion,
    contentVersion,
    publicationPolicy:
      'Es werden nur Metadaten, Paraphrasen, Quellen-IDs und Seitenbezüge veröffentlicht; keine Original-PDFs, keine lokalen Pfade und keine vollständigen historischen Aufgabentexte.',
    exams: exams.exams.map((exam) => ({
      id: exam.id,
      kind: exam.kind,
      year: exam.year,
      date: 'date' in exam ? exam.date : null,
      semester: 'semester' in exam ? exam.semester : null,
      taskCount: exam.task_count,
      totalPoints: exam.total_points,
      durationMinutes: exam.duration_minutes,
      confidence: exam.confidence,
      historicalFrequencyEligible:
        'historicalFrequencyEligible' in exam ? exam.historicalFrequencyEligible : false,
      sourceRefs: exam.question_source_id ? [{ sourceId: exam.question_source_id, page: 1 }] : [],
      tasks: exam.tasks.map((task) => ({
        questionId: `${exam.id}-aufgabe-${task.number}`,
        number: task.number,
        points: task.points,
        topic: task.topic,
        format: task.format,
        requestedDeliverables: task.requested_deliverables,
      })),
    })),
    questions: publicQuestions.map((question) => ({
      id: question.id,
      examId: question.corpusEventId,
      taskNumber: question.task_number,
      subtask: question.subtask,
      paraphrasedTitle: question.title,
      topicTags: question.topic_tags,
      difficulty: question.difficulty,
      expectedSolutionMethod: question.expected_solution_method,
      expectedRuntime: question.expected_runtime,
      expectedProofType: question.expected_proof_type,
      officialSolutionAvailable: question.official_solution_available,
      sourceAuthorityLevel: question.source_authority_level,
      duplicateGroupId: question.duplicate_group_id,
      examRelevance: question.exam_relevance,
      verificationStatus: question.verification_status,
      evidenceType: question.evidenceType,
      historicalFrequencyEligible: question.historicalFrequencyEligible,
      sourceRefs: [{ sourceId: question.source_id, page: question.page }],
      solutionSourceIds: question.solution_source_ids,
    })),
  };
  const invalidPublicQuestion = safeExamLibrary.questions.find(
    (question) =>
      question.verificationStatus === 'generated_unverified' ||
      question.evidenceType === 'generated_example' ||
      /thema aus quelle zu verifizieren/iu.test(question.paraphrasedTitle) ||
      question.topicTags.length === 0 ||
      question.sourceRefs.length === 0,
  );
  if (invalidPublicQuestion)
    throw new Error(
      `Nicht publikationsfähige Frage in normaler Bibliothek: ${invalidPublicQuestion.id}`,
    );
  const outputs: Record<string, unknown> = {
    'sources.json': sources,
    'public-source-validation-report.json': {
      schemaVersion,
      contentVersion,
      inspectedSourceCount: sources.length,
      sanitizedTitleCount: manifest.documents.filter(
        (document) => (document.document_title?.trim().length ?? 0) > 160,
      ).length,
      violationCount: publicSourceViolations.length,
      violations: publicSourceViolations,
      passed: publicSourceViolations.length === 0,
    },
    'exam-profiles.json': profiles,
    'exam-blueprint.json': blueprintSafe,
    'topics-index.json': topics,
    'content-health.json': contentHealth,
    'citation-fixtures.json': fixtures,
    'tracing-trainers.json': trainers,
    'tracing-rubrics.json': rubrics,
    'proof-trainers.json': proofTrainers,
    'proof-rubrics.json': proofRubrics,
    'recurrence-trainers.json': recurrenceTrainers,
    'recurrence-rubrics.json': recurrenceRubrics,
    'recurrence-variants.json': recurrenceTrainers.flatMap((trainer) => trainer.variants),
    'dp-design-trainers.json': dpDesignTrainers,
    'dp-design-problems.json': dpDesignProblems,
    'dp-design-rubrics.json': dpDesignRubrics,
    'dp-design-variants.json': dpDesignVariants,
    'divide-conquer-design-trainers.json': divideConquerDesignTrainers,
    'divide-conquer-design-problems.json': divideConquerDesignProblems,
    'divide-conquer-design-rubrics.json': divideConquerDesignRubrics,
    'divide-conquer-design-variants.json': divideConquerDesignVariants,
    'greedy-design-trainers.json': greedyDesignTrainers,
    'greedy-design-problems.json': greedyDesignProblems,
    'greedy-design-rubrics.json': greedyDesignRubrics,
    'greedy-design-variants.json': greedyDesignVariants,
    'rb-insertion-trainers.json': rbInsertionTrainers,
    'rb-insertion-problems.json': rbInsertionProblems,
    'rb-insertion-rubrics.json': rbInsertionRubrics,
    'rb-insertion-variants.json': rbInsertionVariants,
    'graph-tracing-trainers.json': graphTracingTrainers,
    'graph-tracing-problems.json': graphTracingProblems,
    'graph-tracing-rubrics.json': graphTracingRubrics,
    'graph-tracing-variants.json': graphTracingVariants,
    'exam-profile-coverage.json': examProfileCoverage,
    'exam-packages.json': examPackages,
    'exam-task-instances.json': examTaskInstances,
    'exam-scoring-policies.json': examScoringPolicies,
    'foundation-competencies.json': phase14Diagnostic.competencies,
    ...phase14Diagnostic.itemFiles,
    'diagnostic-session-templates.json': phase14Diagnostic.templates,
    'diagnostic-misconceptions.json': phase14Diagnostic.misconceptions,
    'diagnostic-recommendation-rules.json': phase14Diagnostic.recommendationRules,
    'study-activity-catalog.json': studyActivityCatalog,
    'exam-slot-competency-map.json': examSlotCompetencyMap,
    'study-priority-policy.json': studyPriorityPolicy,
    'spaced-review-policy.json': spacedReviewPolicy,
    'readiness-policy.json': readinessPolicy,
    'exam-date-phase-policy.json': examDatePhasePolicy,
    'study-plan-default-settings.json': studyPlanDefaultSettings,
    'cheat-sheet-blocks.json': cheatSheetBlocks,
    'cheat-sheet-presets.json': cheatSheetPresets,
    'cheat-sheet-layout-policy.json': cheatSheetLayoutPolicy,
    'study-modules.json': { ...phase17StudyModules, contentVersion },
    'task-slot-learning-map.json': { ...phase17TaskMap, contentVersion },
    'learning-resource-graph.json': { ...phase17LearningGraph, contentVersion },
    'exam-library.json': safeExamLibrary,
    'exam-question-publication-audit.json': {
      schemaVersion,
      contentVersion,
      excludedQuestionCount: questionPublicationAudit.length,
      excludedQuestions: questionPublicationAudit,
    },
  };
  for (const [name, value] of Object.entries(outputs))
    await writeJson(path.join(generatedDir, name), value);
  const fileEntries = await Promise.all(
    Object.keys(outputs)
      .sort()
      .map(async (name) => ({ name, sha256: await sha256File(path.join(generatedDir, name)) })),
  );
  const generatedManifest = {
    schemaVersion,
    contentVersion,
    builtAt: manifest.phase0aCorrectedAt,
    sourceCount: sources.length,
    topicCount: topics.length,
    examProfileCount: profiles.length,
    fixtureCount: fixtures.length,
    trainerCount:
      trainers.length +
      proofTrainers.length +
      recurrenceTrainers.length +
      dpDesignTrainers.length +
      divideConquerDesignTrainers.length +
      greedyDesignTrainers.length +
      rbInsertionTrainers.length +
      graphTracingTrainers.length,
    files: fileEntries,
  };
  ContentManifestSchema.parse(generatedManifest);
  await writeJson(path.join(generatedDir, 'content-manifest.json'), generatedManifest);
  console.log(
    `Content ${contentVersion}: ${sources.length} Quellen, ${topics.length} Themen, ${profiles.length} Profile.`,
  );
}

await main();
