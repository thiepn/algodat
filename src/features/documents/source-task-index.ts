import examLibraryData from '../../content/generated/exam-library.json';
import topicsData from '../../content/generated/topics-index.json';
import { sources } from '../../content/loaders/sources';
import { studyModules } from '../../content/loaders/study-content';
import type { SourceDocument } from '../../content/schemas';

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
  solutionSourceId: string | null;
  taskNumber: number;
  subtasks: string[];
  pageStart: number;
  pageEnd: number;
  topicIds: string[];
  expectedMethod: string;
  trainerIds: string[];
  moduleIds: string[];
  authoredSummary: string;
  authoredPracticeVariant: string;
  authoredSolutionOutline: string;
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
  authoredSummary: string;
  authoredPracticeVariant: string;
  authoredSolutionOutline: string;
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

function authoredSummary(kind: 'Übung' | 'Klausur', taskNumber: number, labels: string[]) {
  const topic = labels.filter(Boolean).slice(0, 2).join(', ') || `Aufgabe ${taskNumber}`;
  return `${kind} ${taskNumber}: Bearbeite den Themenbereich ${topic} anhand der sicheren Metadaten. Das Originaldokument ist nicht öffentlich eingebunden.`;
}

function authoredPracticeVariant(taskNumber: number, labels: string[]) {
  const method = expectedMethod(taskNumber, labels);
  return `Übungsvariante: Formuliere zuerst die Eingabe, wähle die passende Methode („${method}“) und löse eine kleine selbstgewählte Instanz vollständig. Begründe danach Laufzeit und zentrale Invariante.`;
}

function authoredSolutionOutline(taskNumber: number, labels: string[]) {
  const method = expectedMethod(taskNumber, labels);
  return `Lösungsskizze: Prüfe, ob die Aufgabenstellung ein Tracing, einen Entwurf oder einen Beweis verlangt. Nutze dann ${method}; notiere Zwischenschritte, Korrektheitsargument und asymptotische Kosten getrennt.`;
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
      const labels = [sourceTitle(source.id), ...topicNames(topicIds)];
      return {
        id: `${source.id}-aufgabe-${taskNumber}`,
        sheetId: `sheet-${source.id}`,
        sourceId: source.id,
        solutionSourceId: solution?.id ?? null,
        taskNumber,
        subtasks: ['gesamt'],
        pageStart: page,
        pageEnd: page,
        topicIds,
        expectedMethod: expectedMethod(taskNumber, [source.title]),
        trainerIds,
        moduleIds,
        authoredSummary: authoredSummary('Übung', taskNumber, labels),
        authoredPracticeVariant: authoredPracticeVariant(taskNumber, labels),
        authoredSolutionOutline: authoredSolutionOutline(taskNumber, labels),
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
    const labels = topicLabels.length ? topicLabels : [task.topic, task.format];
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
      authoredSummary: authoredSummary('Klausur', task.number, labels),
      authoredPracticeVariant: authoredPracticeVariant(task.number, labels),
      authoredSolutionOutline: authoredSolutionOutline(task.number, labels),
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

export function sourceTitle(sourceId: string | null | undefined) {
  const source = sourceById(sourceId);
  return source ? titleForSource(source) : 'Quelle nicht zugeordnet';
}

export function topicNames(topicIds: string[]) {
  return topicIds
    .map((topicId) => (topicsData as Topic[]).find((topic) => topic.id === topicId)?.name)
    .filter((name): name is string => Boolean(name));
}
