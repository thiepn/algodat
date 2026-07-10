import { sources } from '../../content/loaders/sources';
import { studyModules } from '../../content/loaders/study-content';
import topicsData from '../../content/generated/topics-index.json';
import examLibraryData from '../../content/generated/exam-library.json';
import type { SourceDocument } from '../../content/schemas';
import type { CropRegion, SourceTaskRegion } from '../../persistence/database/schema';

type Topic = (typeof topicsData)[number];

export type DocumentKind =
  | 'exercise_sheet'
  | 'exercise_solution'
  | 'mock_exam'
  | 'past_exam'
  | 'exam_solution'
  | 'lecture_reference';

export interface IndexedExerciseTask {
  id: string;
  sheetId: string;
  sourceId: string;
  taskNumber: number;
  subtasks: string[];
  pageStart: number;
  pageEnd: number;
  topicIds: string[];
  expectedMethod: string;
  trainerIds: string[];
  moduleIds: string[];
  regionId: string;
  solutionRegionId: string | null;
}

export interface IndexedExerciseSheet {
  id: string;
  sourceId: string;
  solutionSourceId: string | null;
  title: string;
  course: string;
  sheetNumber: number | null;
  year: number | null;
  semester: string;
  taskCount: number;
  topicIds: string[];
  trainerIds: string[];
  moduleIds: string[];
  tasks: IndexedExerciseTask[];
}

export interface IndexedExamTask {
  id: string;
  examId: string;
  sourceId: string | null;
  solutionSourceId: string | null;
  taskNumber: number;
  pageStart: number;
  pageEnd: number;
  points: number | null;
  topicIds: string[];
  topicLabels: string[];
  expectedMethod: string;
  trainerIds: string[];
  moduleIds: string[];
  regionId: string;
  solutionRegionId: string | null;
}

export interface IndexedExam {
  id: string;
  sourceId: string | null;
  solutionSourceId: string | null;
  title: string;
  kind: string;
  year: number | null;
  date: string | null;
  durationMinutes: number | null;
  totalPoints: number | null;
  taskCount: number;
  tasks: IndexedExamTask[];
}

export const FULL_PAGE_CROP: CropRegion = {
  page: 1,
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  coordinateSystem: 'normalized_page',
};

export function normalizeFilename(value: string): string {
  return value
    .replace(/[äÄ]/gu, 'ae')
    .replace(/[öÖ]/gu, 'oe')
    .replace(/[üÜ]/gu, 'ue')
    .replace(/ß/gu, 'ss')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/gu, '')
    .toLocaleLowerCase('de')
    .replace(/\.pdf$/iu, '')
    .replace(/[^a-z0-9]+/giu, '');
}

export function inferSheetNumber(source: Pick<SourceDocument, 'displayName' | 'title'>) {
  const raw = `${source.displayName} ${source.title}`;
  const match =
    raw.match(/(?:uebungsblatt|übungsblatt|blatt)\s*([0-9]{1,2})/iu) ??
    raw.match(/loesung\s*([0-9]{1,2})/iu) ??
    raw.match(/lösung\s*([0-9]{1,2})/iu);
  if (match?.[1]) return Number(match[1]);
  if (/praesenz|präsenz/iu.test(raw)) return 0;
  return null;
}

export function documentKindForSource(source: SourceDocument): DocumentKind {
  if (source.category === 'Übung') return 'exercise_sheet';
  if (source.category === 'Übungslösung') return 'exercise_solution';
  if (source.category === 'Probeklausur') return 'mock_exam';
  if (source.category === 'Probeklausurlösung' || source.category === 'Prüfungslösung') {
    return 'exam_solution';
  }
  if (source.category === 'Prüfung') return 'past_exam';
  return 'lecture_reference';
}

export function titleForSource(source: SourceDocument): string {
  const sheet = inferSheetNumber(source);
  if (source.category === 'Übung' && sheet === 0) return 'Präsenzübung';
  if (source.category === 'Übung' && sheet) return `Übungsblatt ${sheet}`;
  if (source.category === 'Übungslösung' && sheet === 0) return 'Lösung zur Präsenzübung';
  if (source.category === 'Übungslösung' && sheet) return `Lösung zu Übungsblatt ${sheet}`;
  return source.displayName.replace(/\.pdf$/iu, '');
}

function sourceById(sourceId: string | null | undefined) {
  return sources.find((source) => source.id === sourceId) ?? null;
}

function countTasks(source: SourceDocument): number {
  const matches = [...source.title.matchAll(/Aufgabe\s*([0-9]{1,2})/giu)].map((match) =>
    Number(match[1]),
  );
  const max = Math.max(0, ...matches.filter((value) => Number.isFinite(value)));
  if (max > 0) return Math.min(max, 12);
  if (source.category === 'Übung') return Math.max(1, Math.min(4, source.pageCount ?? 2));
  return Math.max(1, Math.min(9, source.pageCount ?? 1));
}

function topicIdsForLabels(labels: string[], fallbackTaskNumber?: number): string[] {
  const normalizedLabels = labels.map((label) => label.toLocaleLowerCase('de'));
  const direct = (topicsData as Topic[])
    .filter((topic) =>
      normalizedLabels.some(
        (label) =>
          label.includes(topic.name.toLocaleLowerCase('de')) ||
          topic.name.toLocaleLowerCase('de').includes(label),
      ),
    )
    .map((topic) => topic.id);
  if (direct.length) return [...new Set(direct)].slice(0, 4);
  const modules = studyModules.modules.filter(
    (module) => fallbackTaskNumber && module.taskNumbers.includes(fallbackTaskNumber),
  );
  return [...new Set(modules.flatMap((module) => module.topicIds))].slice(0, 4);
}

function resourcesForTopics(topicIds: string[], taskNumber?: number) {
  const modules = studyModules.modules.filter(
    (module) =>
      module.topicIds.some((topicId) => topicIds.includes(topicId)) ||
      (taskNumber ? module.taskNumbers.includes(taskNumber) : false),
  );
  return {
    moduleIds: [...new Set(modules.map((module) => module.moduleId))].slice(0, 4),
    trainerIds: [...new Set(modules.flatMap((module) => module.trainerIds))].slice(0, 4),
  };
}

function expectedMethod(taskNumber: number, labels: string[] = []) {
  const joined = labels.join(' ').toLocaleLowerCase('de');
  if (/dijkstra|floyd|prim|graph/iu.test(joined)) return 'Graphalgorithmus tabellarisch tracen';
  if (/dynamische|rucksack|dp/iu.test(joined)) return 'DP-Zustand, Rekurrenz und Tabelle angeben';
  if (/greedy/iu.test(joined)) return 'Greedy-Regel, Austauschargument und Laufzeit begründen';
  if (/rekurrenz|master/iu.test(joined)) return 'Rekurrenz lösen und asymptotisch begründen';
  if (/invariante|induktion|beweis/iu.test(joined))
    return 'Formale Behauptung mit Beweisstruktur formulieren';
  if (taskNumber === 5) return 'Schleifeninvariante formulieren und beweisen';
  if (taskNumber === 6) return 'Rekurrenz oder Laufzeitbeweis ausarbeiten';
  if (taskNumber === 7) return 'Greedy- oder Divide-and-Conquer-Entwurf begründen';
  if (taskNumber === 8) return 'Dynamische Programmierung entwerfen';
  if (taskNumber === 9) return 'Transferaufgabe mit Datenstruktur oder Graphalgorithmus lösen';
  return 'Aufgabe anhand der angegebenen Methode bearbeiten';
}

function regionId(prefix: string, sourceId: string, taskNumber: number) {
  return `${prefix}-${sourceId}-aufgabe-${taskNumber}`;
}

function fullPageRegion(page: number): CropRegion {
  return { ...FULL_PAGE_CROP, page };
}

const exerciseSolutions = sources.filter((source) => source.category === 'Übungslösung');

function solutionForExercise(source: SourceDocument): SourceDocument | null {
  const sheet = inferSheetNumber(source);
  const sameSheet = exerciseSolutions.filter((solution) => inferSheetNumber(solution) === sheet);
  return (
    sameSheet.find((solution) => solution.year === source.year) ??
    sameSheet.find((solution) => solution.evidenceType === 'official_solution') ??
    sameSheet[0] ??
    null
  );
}

export const exerciseSheets: IndexedExerciseSheet[] = sources
  .filter((source) => source.category === 'Übung')
  .map((source) => {
    const taskCount = countTasks(source);
    const solution = solutionForExercise(source);
    const tasks: IndexedExerciseTask[] = Array.from({ length: taskCount }, (_, index) => {
      const taskNumber = index + 1;
      const page = Math.min(Math.max(1, taskNumber), source.pageCount ?? taskNumber);
      const topicIds = topicIdsForLabels([source.title], taskNumber);
      const { moduleIds, trainerIds } = resourcesForTopics(topicIds, taskNumber);
      return {
        id: `${source.id}-aufgabe-${taskNumber}`,
        sheetId: `sheet-${source.id}`,
        sourceId: source.id,
        taskNumber,
        subtasks: ['gesamt'],
        pageStart: page,
        pageEnd: page,
        topicIds,
        expectedMethod: expectedMethod(taskNumber, [source.title]),
        trainerIds,
        moduleIds,
        regionId: regionId('exercise-region', source.id, taskNumber),
        solutionRegionId: solution
          ? regionId('exercise-solution-region', solution.id, taskNumber)
          : null,
      };
    });
    const topicIds = [...new Set(tasks.flatMap((task) => task.topicIds))];
    const { moduleIds, trainerIds } = resourcesForTopics(topicIds);
    return {
      id: `sheet-${source.id}`,
      sourceId: source.id,
      solutionSourceId: solution?.id ?? null,
      title: titleForSource(source),
      course: 'Algorithmen und Datenstrukturen',
      sheetNumber: inferSheetNumber(source),
      year: source.year,
      semester: source.year ? `Sommersemester ${source.year}` : 'Semester unbekannt',
      taskCount,
      topicIds,
      trainerIds,
      moduleIds,
      tasks,
    };
  })
  .sort((left, right) => (left.sheetNumber ?? 99) - (right.sheetNumber ?? 99));

const examLibrary = examLibraryData as {
  exams: Array<{
    id: string;
    kind: string;
    year: number | null;
    date: string | null;
    taskCount: number;
    totalPoints: number | null;
    durationMinutes: number | null;
    sourceRefs: Array<{ sourceId: string; page: number }>;
    tasks: Array<{
      number: number;
      points: number | null;
      topic: string;
      format: string;
      requestedDeliverables: string;
    }>;
  }>;
  questions: Array<{
    id: string;
    examId: string;
    taskNumber: number;
    topicTags: string[];
    expectedSolutionMethod: string;
    sourceRefs: Array<{ sourceId: string; page: number }>;
    solutionSourceIds: string[];
  }>;
};

function solutionForExam(exam: (typeof examLibrary.exams)[number]) {
  const candidates = sources.filter(
    (source) =>
      (source.category === 'Prüfungslösung' || source.category === 'Probeklausurlösung') &&
      source.year === exam.year,
  );
  return (
    candidates.find((source) => source.evidenceType === 'official_solution') ??
    candidates[0] ??
    null
  );
}

export const indexedExams: IndexedExam[] = examLibrary.exams.map((exam) => {
  const examSource =
    sourceById(exam.sourceRefs[0]?.sourceId) ??
    sources.find(
      (source) =>
        (source.category === 'Prüfung' || source.category === 'Probeklausur') &&
        source.year === exam.year,
    ) ??
    null;
  const solution = solutionForExam(exam);
  const tasks = exam.tasks.map((task): IndexedExamTask => {
    const question = examLibrary.questions.find(
      (candidate) => candidate.examId === exam.id && candidate.taskNumber === task.number,
    );
    const page =
      question?.sourceRefs[0]?.page ??
      Math.min(task.number + 1, examSource?.pageCount ?? task.number);
    const solutionSourceId = question?.solutionSourceIds[0] ?? solution?.id ?? null;
    const topicLabels = question?.topicTags?.length
      ? question.topicTags
      : [task.topic, task.format];
    const topicIds = topicIdsForLabels(topicLabels, task.number);
    const { moduleIds, trainerIds } = resourcesForTopics(topicIds, task.number);
    return {
      id: question?.id ?? `${exam.id}-aufgabe-${task.number}`,
      examId: exam.id,
      sourceId: examSource?.id ?? question?.sourceRefs[0]?.sourceId ?? null,
      solutionSourceId,
      taskNumber: task.number,
      pageStart: page,
      pageEnd: page,
      points: task.points,
      topicIds,
      topicLabels,
      expectedMethod: question?.expectedSolutionMethod ?? expectedMethod(task.number, topicLabels),
      trainerIds,
      moduleIds,
      regionId: regionId('exam-region', examSource?.id ?? exam.id, task.number),
      solutionRegionId: solutionSourceId
        ? regionId('exam-solution-region', solutionSourceId, task.number)
        : null,
    };
  });
  return {
    id: exam.id,
    sourceId: examSource?.id ?? null,
    solutionSourceId: solution?.id ?? null,
    title: `${exam.kind} ${exam.year ?? ''}`.trim(),
    kind: exam.kind,
    year: exam.year,
    date: exam.date,
    durationMinutes: exam.durationMinutes,
    totalPoints: exam.totalPoints,
    taskCount: exam.taskCount,
    tasks,
  };
});

export const sourceTaskRegions: SourceTaskRegion[] = [
  ...exerciseSheets.flatMap((sheet) =>
    sheet.tasks.map((task) => ({
      id: task.regionId,
      regionId: task.regionId,
      sourceId: task.sourceId,
      documentKind: 'exercise_sheet' as const,
      year: sheet.year,
      sheetNumber: sheet.sheetNumber && sheet.sheetNumber > 0 ? sheet.sheetNumber : null,
      examId: null,
      taskNumber: task.taskNumber,
      subtask: null,
      pageStart: task.pageStart,
      pageEnd: task.pageEnd,
      cropRegions: [fullPageRegion(task.pageStart)],
      solutionSourceId: sheet.solutionSourceId,
      solutionPageStart: sheet.solutionSourceId ? task.pageStart : null,
      solutionPageEnd: sheet.solutionSourceId ? task.pageEnd : null,
      topicIds: task.topicIds,
      trainerIds: task.trainerIds,
      taskSlot: null,
      verificationStatus: 'metadata_only' as const,
      updatedAt: '2026-07-10T00:00:00.000Z',
    })),
  ),
  ...indexedExams.flatMap((exam) =>
    exam.tasks.map((task) => ({
      id: task.regionId,
      regionId: task.regionId,
      sourceId: task.sourceId ?? exam.id,
      documentKind: exam.kind === 'Probeklausur' ? ('mock_exam' as const) : ('past_exam' as const),
      year: exam.year,
      sheetNumber: null,
      examId: exam.id,
      taskNumber: task.taskNumber,
      subtask: null,
      pageStart: task.pageStart,
      pageEnd: task.pageEnd,
      cropRegions: [fullPageRegion(task.pageStart)],
      solutionSourceId: task.solutionSourceId,
      solutionPageStart: task.solutionSourceId ? task.pageStart : null,
      solutionPageEnd: task.solutionSourceId ? task.pageEnd : null,
      topicIds: task.topicIds,
      trainerIds: task.trainerIds,
      taskSlot: task.taskNumber,
      verificationStatus: 'metadata_only' as const,
      updatedAt: '2026-07-10T00:00:00.000Z',
    })),
  ),
];

export function getExerciseSheet(sheetId: string) {
  return exerciseSheets.find((sheet) => sheet.id === sheetId);
}

export function getExerciseTask(sheetId: string, taskId: string) {
  const sheet = getExerciseSheet(sheetId);
  return (
    sheet?.tasks.find((task) => task.id === taskId || String(task.taskNumber) === taskId) ?? null
  );
}

export function getIndexedExam(examId: string) {
  return indexedExams.find((exam) => exam.id === examId);
}

export function getIndexedExamTask(examId: string, taskId: string) {
  const exam = getIndexedExam(examId);
  return (
    exam?.tasks.find((task) => task.id === taskId || String(task.taskNumber) === taskId) ?? null
  );
}

export function getSourceTaskRegion(regionIdValue: string | null | undefined) {
  if (!regionIdValue) return null;
  return sourceTaskRegions.find((region) => region.regionId === regionIdValue) ?? null;
}

export function sourceTitle(sourceId: string | null | undefined) {
  const source = sourceById(sourceId);
  return source ? titleForSource(source) : 'Quelle nicht zugeordnet';
}

export function topicNames(topicIds: string[]) {
  return topicIds
    .map((topicId) => (topicsData as Topic[]).find((topic) => topic.id === topicId)?.name)
    .filter((name): name is string => Boolean(name));
}

export type CropPrecision =
  | 'exact_task_crop'
  | 'exact_subtask_crop'
  | 'page_section_crop'
  | 'full_page_fallback'
  | 'unmapped';

export type CoverageState =
  | 'fully_indexed'
  | 'pages_mapped_crop_pending'
  | 'tasks_partially_indexed'
  | 'solution_mapping_missing'
  | 'document_unmatched'
  | 'source_metadata_only';

export type RegionValidationIssueCode =
  | 'task_without_page_mapping'
  | 'solution_without_source_mapping'
  | 'crop_bounds_invalid'
  | 'zero_crop'
  | 'duplicate_task_region'
  | 'wrong_document_type'
  | 'invalid_task_number'
  | 'missing_topic_mapping'
  | 'missing_learning_action'
  | 'full_page_fallback_mislabeled_precise'
  | 'same_incorrect_region';

export interface SourceCoverageRecord {
  sourceId: string;
  displayName: string;
  title: string;
  filename: string;
  documentKind: DocumentKind;
  coverageState: CoverageState;
  cropPrecision: CropPrecision;
  pageCount: number | null;
  year: number | null;
  sheetNumber: number | null;
  examId: string | null;
  taskCount: number;
  subtaskCount: number;
  taskPageMappings: number;
  solutionPageMappings: number;
  topicMappings: number;
  trainerMappings: number;
  requiresLocalFile: boolean;
  actionRequired: string;
}

export interface RegionValidationIssue {
  code: RegionValidationIssueCode;
  severity: 'error' | 'warning' | 'info';
  regionId: string;
  sourceId: string;
  taskNumber: number | null;
  message: string;
}

export interface SourceLibrarySearchResult {
  sourceId: string;
  label: string;
  documentKind: DocumentKind;
  filename: string;
  year: number | null;
  sheetNumber: number | null;
  examId: string | null;
  taskNumbers: number[];
  topics: string[];
  trainers: string[];
  modules: string[];
  coverageState: CoverageState;
  cropPrecision: CropPrecision;
}

export interface IndexedTaskPointer {
  id: string;
  title: string;
  sourceId: string;
  regionId: string;
  taskNumber: number;
  href: string;
}

export function isFullPageCrop(crop: CropRegion | null | undefined) {
  if (!crop) return false;
  return crop.x === 0 && crop.y === 0 && crop.width === 1 && crop.height === 1;
}

export function cropPrecisionForRegion(region: SourceTaskRegion | null | undefined): CropPrecision {
  if (!region) return 'unmapped';
  if (region.cropRegions.length === 0) return 'unmapped';
  if (region.cropRegions.every(isFullPageCrop)) return 'full_page_fallback';
  if (region.subtask && region.verificationStatus === 'local_user_indexed')
    return 'exact_subtask_crop';
  if (region.verificationStatus === 'local_user_indexed') return 'exact_task_crop';
  return 'page_section_crop';
}

export function cropPrecisionLabel(precision: CropPrecision) {
  switch (precision) {
    case 'exact_task_crop':
      return 'exakter Aufgaben-Crop';
    case 'exact_subtask_crop':
      return 'exakter Teilaufgaben-Crop';
    case 'page_section_crop':
      return 'Seitenabschnitt-Crop';
    case 'full_page_fallback':
      return 'Vollseiten-Fallback';
    case 'unmapped':
      return 'nicht zugeordnet';
  }
}

export const indexedTaskPointers: IndexedTaskPointer[] = [
  ...exerciseSheets.flatMap((sheet) =>
    sheet.tasks.map((task) => ({
      id: task.id,
      title: `${sheet.title} · Aufgabe ${task.taskNumber}`,
      sourceId: task.sourceId,
      regionId: task.regionId,
      taskNumber: task.taskNumber,
      href: `/uebungen/${sheet.id}/aufgabe/${task.id}`,
    })),
  ),
  ...indexedExams.flatMap((exam) =>
    exam.tasks.map((task) => ({
      id: task.id,
      title: `${exam.title} · Aufgabe ${task.taskNumber}`,
      sourceId: task.sourceId ?? exam.id,
      regionId: task.regionId,
      taskNumber: task.taskNumber,
      href: `/klausuren/${exam.id}/aufgabe/${task.id}/original`,
    })),
  ),
];

export function adjacentTaskPointers(regionIdValue: string | null | undefined) {
  const index = indexedTaskPointers.findIndex((task) => task.regionId === regionIdValue);
  return {
    previous: index > 0 ? indexedTaskPointers[index - 1] : null,
    next:
      index >= 0 && index < indexedTaskPointers.length - 1 ? indexedTaskPointers[index + 1] : null,
  };
}

function coverageStateForSource(
  source: SourceDocument,
  regions: SourceTaskRegion[],
): CoverageState {
  if (regions.length === 0) {
    return source.pageCount ? 'source_metadata_only' : 'document_unmatched';
  }
  if (
    regions.some(
      (region) => !region.solutionSourceId && region.documentKind !== 'lecture_reference',
    )
  ) {
    return 'solution_mapping_missing';
  }
  if (regions.some((region) => cropPrecisionForRegion(region) === 'full_page_fallback')) {
    return 'pages_mapped_crop_pending';
  }
  if (regions.some((region) => !region.topicIds.length || !region.trainerIds.length)) {
    return 'tasks_partially_indexed';
  }
  return 'fully_indexed';
}

function strongestCropPrecision(regions: SourceTaskRegion[]): CropPrecision {
  const order: CropPrecision[] = [
    'exact_subtask_crop',
    'exact_task_crop',
    'page_section_crop',
    'full_page_fallback',
    'unmapped',
  ];
  const precisions = regions.map(cropPrecisionForRegion);
  return order.find((precision) => precisions.includes(precision)) ?? 'unmapped';
}

export const sourceTaskCoverageRecords: SourceCoverageRecord[] = sources.map((source) => {
  const sourceRegions = sourceTaskRegions.filter(
    (region) => region.sourceId === source.id || region.solutionSourceId === source.id,
  );
  const primaryRegions = sourceTaskRegions.filter((region) => region.sourceId === source.id);
  const taskNumbers = new Set(primaryRegions.map((region) => region.taskNumber));
  const topics = new Set(primaryRegions.flatMap((region) => region.topicIds));
  const trainers = new Set(primaryRegions.flatMap((region) => region.trainerIds));
  const documentKind = documentKindForSource(source);
  const state = coverageStateForSource(source, primaryRegions);
  const solutionMappings = sourceTaskRegions.filter(
    (region) => region.solutionSourceId === source.id,
  );
  return {
    sourceId: source.id,
    displayName: source.displayName,
    title: titleForSource(source),
    filename: source.displayName,
    documentKind,
    coverageState:
      solutionMappings.length && primaryRegions.length === 0 ? 'source_metadata_only' : state,
    cropPrecision: strongestCropPrecision(sourceRegions),
    pageCount: source.pageCount,
    year: source.year,
    sheetNumber: inferSheetNumber(source),
    examId:
      indexedExams.find(
        (exam) => exam.sourceId === source.id || exam.solutionSourceId === source.id,
      )?.id ?? null,
    taskCount: taskNumbers.size || solutionMappings.length,
    subtaskCount: primaryRegions.filter((region) => Boolean(region.subtask)).length,
    taskPageMappings: primaryRegions.filter((region) => region.pageStart > 0).length,
    solutionPageMappings: solutionMappings.length,
    topicMappings: topics.size,
    trainerMappings: trainers.size,
    requiresLocalFile: true,
    actionRequired:
      state === 'pages_mapped_crop_pending'
        ? 'Lokale PDF verbinden und Vollseiten-Fallback durch exakten Crop ersetzen.'
        : state === 'source_metadata_only'
          ? 'Dokument ist inventarisiert; Aufgabenregionen müssen bei Bedarf lokal erfasst werden.'
          : state === 'solution_mapping_missing'
            ? 'Lösungsquelle oder Lösungsseite ergänzen.'
            : state === 'document_unmatched'
              ? 'Quelle gegen lokale PDF-Datei abgleichen.'
              : 'Keine Pflichtaktion; lokale Präzisierung bleibt möglich.',
  };
});

export function buildRegionValidationIssues(
  regions: SourceTaskRegion[] = sourceTaskRegions,
): RegionValidationIssue[] {
  const issues: RegionValidationIssue[] = [];
  const seen = new Map<string, SourceTaskRegion>();
  for (const region of regions) {
    const source = sourceById(region.sourceId);
    const key = `${region.sourceId}:${region.taskNumber}:${region.subtask ?? 'gesamt'}`;
    const previous = seen.get(key);
    if (previous) {
      issues.push({
        code: 'duplicate_task_region',
        severity: 'warning',
        regionId: region.regionId,
        sourceId: region.sourceId,
        taskNumber: region.taskNumber,
        message: `Doppelte Aufgabenregion mit ${previous.regionId}.`,
      });
    }
    seen.set(key, region);
    if (region.pageStart < 1 || region.pageEnd < region.pageStart) {
      issues.push({
        code: 'task_without_page_mapping',
        severity: 'error',
        regionId: region.regionId,
        sourceId: region.sourceId,
        taskNumber: region.taskNumber,
        message: 'Aufgabe besitzt keine gültige Seitenzuordnung.',
      });
    }
    if (region.solutionPageStart && !region.solutionSourceId) {
      issues.push({
        code: 'solution_without_source_mapping',
        severity: 'error',
        regionId: region.regionId,
        sourceId: region.sourceId,
        taskNumber: region.taskNumber,
        message: 'Eine Lösungsseite ist gesetzt, aber keine Lösungsquelle.',
      });
    }
    if (!Number.isInteger(region.taskNumber) || region.taskNumber < 1 || region.taskNumber > 12) {
      issues.push({
        code: 'invalid_task_number',
        severity: 'error',
        regionId: region.regionId,
        sourceId: region.sourceId,
        taskNumber: region.taskNumber,
        message: 'Aufgabennummer liegt außerhalb des erwarteten Klausur-/Übungsbereichs.',
      });
    }
    if (source && documentKindForSource(source) !== region.documentKind) {
      const expectedKind = documentKindForSource(source);
      const compatible =
        (expectedKind === 'mock_exam' && region.documentKind === 'past_exam') ||
        (expectedKind === 'past_exam' && region.documentKind === 'mock_exam');
      if (!compatible) {
        issues.push({
          code: 'wrong_document_type',
          severity: 'warning',
          regionId: region.regionId,
          sourceId: region.sourceId,
          taskNumber: region.taskNumber,
          message: `Dokumenttyp ${region.documentKind} passt nicht zur Quelle ${expectedKind}.`,
        });
      }
    }
    if (!region.topicIds.length) {
      issues.push({
        code: 'missing_topic_mapping',
        severity: 'warning',
        regionId: region.regionId,
        sourceId: region.sourceId,
        taskNumber: region.taskNumber,
        message: 'Keine Themenzuordnung vorhanden.',
      });
    }
    if (!region.trainerIds.length) {
      issues.push({
        code: 'missing_learning_action',
        severity: 'warning',
        regionId: region.regionId,
        sourceId: region.sourceId,
        taskNumber: region.taskNumber,
        message: 'Keine direkte Lernaktion oder Trainerzuordnung vorhanden.',
      });
    }
    for (const cropRegion of region.cropRegions) {
      const boundsInvalid =
        cropRegion.x < 0 ||
        cropRegion.y < 0 ||
        cropRegion.width <= 0 ||
        cropRegion.height <= 0 ||
        cropRegion.x + cropRegion.width > 1 ||
        cropRegion.y + cropRegion.height > 1;
      if (boundsInvalid) {
        issues.push({
          code: 'crop_bounds_invalid',
          severity: 'error',
          regionId: region.regionId,
          sourceId: region.sourceId,
          taskNumber: region.taskNumber,
          message: 'Crop-Koordinaten liegen außerhalb der normalisierten Seite.',
        });
      }
      if (cropRegion.width === 0 || cropRegion.height === 0) {
        issues.push({
          code: 'zero_crop',
          severity: 'error',
          regionId: region.regionId,
          sourceId: region.sourceId,
          taskNumber: region.taskNumber,
          message: 'Crop besitzt keine sichtbare Fläche.',
        });
      }
      if (isFullPageCrop(cropRegion) && region.verificationStatus === 'source_verified') {
        issues.push({
          code: 'full_page_fallback_mislabeled_precise',
          severity: 'error',
          regionId: region.regionId,
          sourceId: region.sourceId,
          taskNumber: region.taskNumber,
          message: 'Vollseiten-Fallback darf nicht als quellenverifizierter Präzisionscrop gelten.',
        });
      }
    }
  }
  const groupedBySourcePage = new Map<string, SourceTaskRegion[]>();
  for (const region of regions) {
    const crop = region.cropRegions[0];
    if (!crop || !isFullPageCrop(crop)) continue;
    const key = `${region.sourceId}:${region.pageStart}:full-page`;
    groupedBySourcePage.set(key, [...(groupedBySourcePage.get(key) ?? []), region]);
  }
  for (const samePageRegions of groupedBySourcePage.values()) {
    if (samePageRegions.length < 2) continue;
    for (const region of samePageRegions.slice(1)) {
      issues.push({
        code: 'same_incorrect_region',
        severity: 'info',
        regionId: region.regionId,
        sourceId: region.sourceId,
        taskNumber: region.taskNumber,
        message:
          'Mehrere Aufgaben teilen denselben Vollseiten-Fallback; lokale Präzisierung empfohlen.',
      });
    }
  }
  return issues;
}

export const regionValidationIssues = buildRegionValidationIssues();

export const sourceCoverageSummary = {
  totalSources: sources.length,
  indexedExerciseSheets: exerciseSheets.length,
  indexedExerciseTasks: exerciseSheets.reduce((sum, sheet) => sum + sheet.tasks.length, 0),
  indexedExams: indexedExams.length,
  indexedExamTasks: indexedExams.reduce((sum, exam) => sum + exam.tasks.length, 0),
  indexedRegions: sourceTaskRegions.length,
  coverageStates: sourceTaskCoverageRecords.reduce<Record<CoverageState, number>>(
    (counts, record) => ({ ...counts, [record.coverageState]: counts[record.coverageState] + 1 }),
    {
      fully_indexed: 0,
      pages_mapped_crop_pending: 0,
      tasks_partially_indexed: 0,
      solution_mapping_missing: 0,
      document_unmatched: 0,
      source_metadata_only: 0,
    },
  ),
  cropPrecision: sourceTaskCoverageRecords.reduce<Record<CropPrecision, number>>(
    (counts, record) => ({ ...counts, [record.cropPrecision]: counts[record.cropPrecision] + 1 }),
    {
      exact_task_crop: 0,
      exact_subtask_crop: 0,
      page_section_crop: 0,
      full_page_fallback: 0,
      unmapped: 0,
    },
  ),
  validationIssues: regionValidationIssues.reduce<
    Record<RegionValidationIssue['severity'], number>
  >((counts, issue) => ({ ...counts, [issue.severity]: counts[issue.severity] + 1 }), {
    error: 0,
    warning: 0,
    info: 0,
  }),
};

export function searchSourceLibrary(query: string): SourceLibrarySearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('de');
  const records = sourceTaskCoverageRecords.map((record): SourceLibrarySearchResult => {
    const regions = sourceTaskRegions.filter(
      (region) =>
        region.sourceId === record.sourceId || region.solutionSourceId === record.sourceId,
    );
    const taskNumbers = [...new Set(regions.map((region) => region.taskNumber))].sort(
      (a, b) => a - b,
    );
    const topicIds = [...new Set(regions.flatMap((region) => region.topicIds))];
    const trainerIds = [...new Set(regions.flatMap((region) => region.trainerIds))];
    const moduleIds = [
      ...new Set(
        [
          ...exerciseSheets.flatMap((sheet) => sheet.tasks),
          ...indexedExams.flatMap((exam) => exam.tasks),
        ]
          .filter(
            (task) =>
              task.sourceId === record.sourceId ||
              ('solutionSourceId' in task && task.solutionSourceId === record.sourceId),
          )
          .flatMap((task) => task.moduleIds),
      ),
    ];
    return {
      sourceId: record.sourceId,
      label: sourceTitle(record.sourceId),
      documentKind: record.documentKind,
      filename: record.filename,
      year: record.year,
      sheetNumber: record.sheetNumber,
      examId: record.examId,
      taskNumbers,
      topics: topicNames(topicIds),
      trainers: trainerIds,
      modules: moduleIds,
      coverageState: record.coverageState,
      cropPrecision: record.cropPrecision,
    };
  });
  if (!normalizedQuery) return records.slice(0, 50);
  return records
    .filter((record) =>
      [
        record.label,
        record.filename,
        record.documentKind,
        record.year?.toString() ?? '',
        record.sheetNumber?.toString() ?? '',
        record.examId ?? '',
        record.taskNumbers.join(' '),
        record.topics.join(' '),
        record.trainers.join(' '),
        record.modules.join(' '),
      ]
        .join(' ')
        .toLocaleLowerCase('de')
        .includes(normalizedQuery),
    )
    .slice(0, 50);
}
