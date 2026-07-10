import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DiagnosticsPage } from '../features/diagnostics/DiagnosticsPage';
import { PlannedState } from '../ui/feedback/PlannedState';

const basename = import.meta.env.BASE_URL.replace(/\/$/u, '');

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <AppLayout />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: 'klausurprofile', element: <Navigate to="/pruefungsstruktur" replace /> },
        {
          path: 'pruefungsstruktur',
          lazy: async () => ({
            Component: (await import('../features/exam-structure/ExamStructurePage'))
              .ExamStructurePage,
          }),
        },
        {
          path: 'lernen',
          lazy: async () => ({
            Component: (await import('../features/learning/LearningPages')).LearningIndexPage,
          }),
        },
        {
          path: 'lernen/:moduleSlug',
          lazy: async () => ({
            Component: (await import('../features/learning/LearningPages')).LearningModulePage,
          }),
        },
        {
          path: 'klausuren',
          lazy: async () => ({
            Component: (await import('../features/exam-library/ExamLibraryPages'))
              .ExamLibraryIndexPage,
          }),
        },
        {
          path: 'klausuren/fragen',
          lazy: async () => ({
            Component: (await import('../features/exam-library/ExamLibraryPages'))
              .ExamQuestionListPage,
          }),
        },
        {
          path: 'klausuren/vergleich',
          lazy: async () => ({
            Component: (await import('../features/exam-library/ExamLibraryPages'))
              .ExamComparisonPage,
          }),
        },
        {
          path: 'klausuren/:examId',
          lazy: async () => ({
            Component: (await import('../features/exam-library/ExamLibraryPages')).ExamDetailPage,
          }),
        },
        {
          path: 'klausuren/:examId/original',
          lazy: async () => ({
            Component: (await import('../features/exam-library/ExamOriginalPages'))
              .ExamOriginalPage,
          }),
        },
        {
          path: 'klausuren/:examId/aufgabe/:questionId',
          lazy: async () => ({
            Component: (await import('../features/exam-library/ExamLibraryPages'))
              .ExamQuestionDetailPage,
          }),
        },
        {
          path: 'klausuren/:examId/aufgabe/:taskId/original',
          lazy: async () => ({
            Component: (await import('../features/exam-library/ExamOriginalPages'))
              .ExamTaskOriginalPage,
          }),
        },
        {
          path: 'uebungen',
          lazy: async () => ({
            Component: (await import('../features/exercises/ExercisePages')).ExerciseIndexPage,
          }),
        },
        {
          path: 'uebungen/:sheetId',
          lazy: async () => ({
            Component: (await import('../features/exercises/ExercisePages')).ExerciseSheetPage,
          }),
        },
        {
          path: 'uebungen/:sheetId/aufgabe/:taskId',
          lazy: async () => ({
            Component: (await import('../features/exercises/ExercisePages')).ExerciseTaskPage,
          }),
        },
        {
          path: 'aufgaben',
          lazy: async () => ({
            Component: (await import('../features/tasks/TasksPage')).TasksPage,
          }),
        },
        {
          path: 'aufgaben/:taskNumber',
          lazy: async () => ({
            Component: (await import('../features/tasks/TasksPage')).TaskDetailPage,
          }),
        },
        {
          path: 'themen',
          lazy: async () => ({
            Component: (await import('../features/topics/TopicsPage')).TopicsPage,
          }),
        },
        {
          path: 'themen/:topicId',
          lazy: async () => ({
            Component: (await import('../features/topics/TopicsPage')).TopicDetailPage,
          }),
        },
        {
          path: 'quellen',
          lazy: async () => ({
            Component: (await import('../features/sources/SourcesPage')).SourcesPage,
          }),
        },
        {
          path: 'dokumente',
          lazy: async () => ({
            Component: (await import('../features/documents/DocumentPages')).DocumentIndexPage,
          }),
        },
        {
          path: 'dokumente/verbinden',
          lazy: async () => ({
            Component: (await import('../features/documents/DocumentPages')).DocumentConnectPage,
          }),
        },
        {
          path: 'dokumente/indexierung',
          lazy: async () => ({
            Component: (await import('../features/documents/DocumentPages')).DocumentIndexingPage,
          }),
        },
        {
          path: 'dokumente/indexierung/qualitaet',
          lazy: async () => ({
            Component: (await import('../features/documents/DocumentPages'))
              .DocumentCropQualityPage,
          }),
        },
        {
          path: 'dokumente/abdeckung',
          lazy: async () => ({
            Component: (await import('../features/documents/DocumentPages')).DocumentCoveragePage,
          }),
        },
        {
          path: 'dokumente/zuordnungen',
          lazy: async () => ({
            Component: (await import('../features/documents/DocumentPages')).DocumentMappingsPage,
          }),
        },
        {
          path: 'dokumente/:documentId',
          lazy: async () => ({
            Component: (await import('../features/documents/DocumentPages')).DocumentDetailPage,
          }),
        },
        { path: 'diagnostik', element: <DiagnosticsPage /> },
        {
          path: 'diagnose',
          lazy: async () => ({
            Component: (await import('../features/diagnose/DiagnosticPages')).DiagnosticLandingPage,
          }),
        },
        {
          path: 'diagnose/schnellcheck',
          lazy: async () => ({
            Component: (await import('../features/diagnose/DiagnosticPages'))
              .DiagnosticQuickStartPage,
          }),
        },
        {
          path: 'diagnose/standard',
          lazy: async () => ({
            Component: (await import('../features/diagnose/DiagnosticPages'))
              .DiagnosticStandardStartPage,
          }),
        },
        {
          path: 'diagnose/thema',
          lazy: async () => ({
            Component: (await import('../features/diagnose/DiagnosticPages'))
              .DiagnosticTopicStartPage,
          }),
        },
        {
          path: 'diagnose/session/:sessionId',
          lazy: async () => ({
            Component: (await import('../features/diagnose/DiagnosticPages')).DiagnosticSessionPage,
          }),
        },
        {
          path: 'diagnose/auswertung/:sessionId',
          lazy: async () => ({
            Component: (await import('../features/diagnose/DiagnosticPages')).DiagnosticResultPage,
          }),
        },
        {
          path: 'lernplan',
          lazy: async () => ({
            Component: (await import('../features/study-plan/StudyPlanPages'))
              .StudyPlannerLandingPage,
          }),
        },
        {
          path: 'lernplan/heute',
          lazy: async () => ({
            Component: (await import('../features/study-plan/StudyPlanPages')).TodayStudyPlanPage,
          }),
        },
        {
          path: 'lernplan/woche',
          lazy: async () => ({
            Component: (await import('../features/study-plan/StudyPlanPages')).WeeklyStudyPlanPage,
          }),
        },
        {
          path: 'lernplan/pruefungsreife',
          lazy: async () => ({
            Component: (await import('../features/study-plan/StudyPlanPages')).ExamReadinessPage,
          }),
        },
        {
          path: 'lernplan/wiederholungen',
          lazy: async () => ({
            Component: (await import('../features/study-plan/StudyPlanPages')).ReviewQueuePage,
          }),
        },
        {
          path: 'lernplan/einstellungen',
          lazy: async () => ({
            Component: (await import('../features/study-plan/StudyPlanPages'))
              .StudyPlanSettingsPage,
          }),
        },
        {
          path: 'lernplan/verlauf',
          lazy: async () => ({
            Component: (await import('../features/study-plan/StudyPlanPages')).StudyPlanHistoryPage,
          }),
        },
        {
          path: 'spickzettel',
          lazy: async () => ({
            Component: (await import('../features/cheat-sheet/CheatSheetPages'))
              .CheatSheetLandingPage,
          }),
        },
        {
          path: 'spickzettel/neu',
          lazy: async () => ({
            Component: (await import('../features/cheat-sheet/CheatSheetPages')).CheatSheetNewPage,
          }),
        },
        {
          path: 'spickzettel/vorlagen',
          lazy: async () => ({
            Component: (await import('../features/cheat-sheet/CheatSheetPages'))
              .CheatSheetTemplatesPage,
          }),
        },
        {
          path: 'spickzettel/einstellungen',
          lazy: async () => ({
            Component: (await import('../features/cheat-sheet/CheatSheetPages'))
              .CheatSheetSettingsPage,
          }),
        },
        {
          path: 'spickzettel/:sheetId',
          lazy: async () => ({
            Component: (await import('../features/cheat-sheet/CheatSheetPages'))
              .CheatSheetEditorPage,
          }),
        },
        {
          path: 'spickzettel/:sheetId/vorschau',
          lazy: async () => ({
            Component: (await import('../features/cheat-sheet/CheatSheetPages'))
              .CheatSheetPreviewPage,
          }),
        },
        {
          path: 'spickzettel/:sheetId/drucken',
          lazy: async () => ({
            Component: (await import('../features/cheat-sheet/CheatSheetPages'))
              .CheatSheetPrintPage,
          }),
        },
        {
          path: 'trainer',
          lazy: async () => ({
            Component: (await import('../features/trainer/TrainerOverview')).TrainerOverview,
          }),
        },
        {
          path: 'trainer/tracing',
          lazy: async () => ({
            Component: (await import('../features/trainer/TrainerOverview')).TracingOverview,
          }),
        },
        {
          path: 'trainer/tracing/:trainerId',
          lazy: async () => ({
            Component: (await import('../features/trainer/TracingTrainerPage')).TracingTrainerPage,
          }),
        },
        {
          path: 'trainer/tracing/:trainerId/versuch/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/TrainingAttemptPage'))
              .TrainingAttemptPage,
          }),
        },
        {
          path: 'trainer/tracing/:trainerId/auswertung/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/TrainingResultPage')).TrainingResultPage,
          }),
        },
        {
          path: 'trainer/beweise',
          lazy: async () => ({
            Component: (await import('../features/trainer/TrainerOverview')).ProofOverview,
          }),
        },
        {
          path: 'trainer/beweise/:trainerId',
          lazy: async () => ({
            Component: (await import('../features/trainer/ProofTrainerPage')).ProofTrainerPage,
          }),
        },
        {
          path: 'trainer/beweise/:trainerId/versuch/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/ProofAttemptPage')).ProofAttemptPage,
          }),
        },
        {
          path: 'trainer/beweise/:trainerId/auswertung/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/ProofResultPage')).ProofResultPage,
          }),
        },
        {
          path: 'trainer/rekurrenzen',
          lazy: async () => ({
            Component: (await import('../features/trainer/TrainerOverview')).RecurrenceOverview,
          }),
        },
        {
          path: 'trainer/rekurrenzen/:trainerId',
          lazy: async () => ({
            Component: (await import('../features/trainer/RecurrenceTrainerPage'))
              .RecurrenceTrainerPage,
          }),
        },
        {
          path: 'trainer/rekurrenzen/:trainerId/versuch/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/RecurrenceAttemptPage'))
              .RecurrenceAttemptPage,
          }),
        },
        {
          path: 'trainer/rekurrenzen/:trainerId/auswertung/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/RecurrenceResultPage'))
              .RecurrenceResultPage,
          }),
        },
        {
          path: 'trainer/entwurf',
          lazy: async () => ({
            Component: (await import('../features/trainer/TrainerOverview')).DesignOverview,
          }),
        },
        {
          path: 'trainer/entwurf/dp',
          lazy: async () => ({
            Component: (await import('../features/trainer/TrainerOverview')).DesignOverview,
          }),
        },
        {
          path: 'trainer/entwurf/dp/:trainerId',
          lazy: async () => ({
            Component: (await import('../features/trainer/DpDesignTrainerPage'))
              .DpDesignTrainerPage,
          }),
        },
        {
          path: 'trainer/entwurf/dp/:trainerId/versuch/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/DpDesignAttemptPage'))
              .DpDesignAttemptPage,
          }),
        },
        {
          path: 'trainer/entwurf/dp/:trainerId/auswertung/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/DpDesignResultPage')).DpDesignResultPage,
          }),
        },
        {
          path: 'trainer/entwurf/greedy/:trainerId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GreedyDesignTrainerPage'))
              .GreedyDesignTrainerPage,
          }),
        },
        {
          path: 'trainer/entwurf/greedy/:trainerId/versuch/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GreedyDesignAttemptPage'))
              .GreedyDesignAttemptPage,
          }),
        },
        {
          path: 'trainer/entwurf/greedy/:trainerId/auswertung/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GreedyDesignResultPage'))
              .GreedyDesignResultPage,
          }),
        },
        {
          path: 'trainer/entwurf/divide-and-conquer/:trainerId',
          lazy: async () => ({
            Component: (await import('../features/trainer/DivideConquerDesignTrainerPage'))
              .DivideConquerDesignTrainerPage,
          }),
        },
        {
          path: 'trainer/entwurf/divide-and-conquer/:trainerId/versuch/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/DivideConquerDesignAttemptPage'))
              .DivideConquerDesignAttemptPage,
          }),
        },
        {
          path: 'trainer/entwurf/divide-and-conquer/:trainerId/auswertung/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/DivideConquerDesignResultPage'))
              .DivideConquerDesignResultPage,
          }),
        },
        {
          path: 'trainer/baeume/rot-schwarz/:trainerId',
          lazy: async () => ({
            Component: (await import('../features/trainer/RbInsertionTrainerPage'))
              .RbInsertionTrainerPage,
          }),
        },
        {
          path: 'trainer/baeume/rot-schwarz/:trainerId/versuch/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/RbInsertionAttemptPage'))
              .RbInsertionAttemptPage,
          }),
        },
        {
          path: 'trainer/baeume/rot-schwarz/:trainerId/auswertung/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/RbInsertionResultPage'))
              .RbInsertionResultPage,
          }),
        },
        {
          path: 'trainer/graphen/floyd-warshall/:trainerId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GraphTracingTrainerPage'))
              .GraphTracingTrainerPage,
          }),
        },
        {
          path: 'trainer/graphen/floyd-warshall/:trainerId/versuch/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GraphTracingAttemptPage'))
              .GraphTracingAttemptPage,
          }),
        },
        {
          path: 'trainer/graphen/floyd-warshall/:trainerId/auswertung/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GraphTracingResultPage'))
              .GraphTracingResultPage,
          }),
        },
        {
          path: 'trainer/graphen/dijkstra/:trainerId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GraphTracingTrainerPage'))
              .GraphTracingTrainerPage,
          }),
        },
        {
          path: 'trainer/graphen/dijkstra/:trainerId/versuch/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GraphTracingAttemptPage'))
              .GraphTracingAttemptPage,
          }),
        },
        {
          path: 'trainer/graphen/dijkstra/:trainerId/auswertung/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GraphTracingResultPage'))
              .GraphTracingResultPage,
          }),
        },
        {
          path: 'trainer/graphen/prim/:trainerId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GraphTracingTrainerPage'))
              .GraphTracingTrainerPage,
          }),
        },
        {
          path: 'trainer/graphen/prim/:trainerId/versuch/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GraphTracingAttemptPage'))
              .GraphTracingAttemptPage,
          }),
        },
        {
          path: 'trainer/graphen/prim/:trainerId/auswertung/:attemptId',
          lazy: async () => ({
            Component: (await import('../features/trainer/GraphTracingResultPage'))
              .GraphTracingResultPage,
          }),
        },
        {
          path: 'simulator',
          lazy: async () => ({
            Component: (await import('../features/simulator/SimulatorPages')).SimulatorDashboard,
          }),
        },
        {
          path: 'simulator/profile',
          element: <Navigate to="/pruefungsstruktur" replace />,
        },
        {
          path: 'simulator/profile/:profileId',
          element: <Navigate to="/pruefungsstruktur" replace />,
        },
        {
          path: 'simulator/pruefungen',
          lazy: async () => ({
            Component: (await import('../features/simulator/SimulatorPages')).ExamPackageList,
          }),
        },
        {
          path: 'simulator/pruefungen/:examPackageId',
          lazy: async () => ({
            Component: (await import('../features/simulator/SimulatorPages')).ExamPackageDetail,
          }),
        },
        {
          path: 'simulator/pruefungen/:examPackageId/briefing',
          lazy: async () => ({
            Component: (await import('../features/simulator/SimulatorPages')).ExamBriefing,
          }),
        },
        {
          path: 'simulator/sitzung/:sessionId',
          lazy: async () => ({
            Component: (await import('../features/simulator/SimulatorPages')).ExamSessionPage,
          }),
        },
        {
          path: 'simulator/sitzung/:sessionId/aufgabe/:taskSlotId',
          lazy: async () => ({
            Component: (await import('../features/simulator/SimulatorPages')).ExamSessionPage,
          }),
        },
        {
          path: 'simulator/sitzung/:sessionId/uebersicht',
          lazy: async () => ({
            Component: (await import('../features/simulator/SimulatorPages')).ExamOverview,
          }),
        },
        {
          path: 'simulator/sitzung/:sessionId/ergebnis',
          lazy: async () => ({
            Component: (await import('../features/simulator/SimulatorPages')).ExamResultPage,
          }),
        },
        {
          path: 'fehler',
          element: (
            <PlannedState
              title="Fehleranalyse"
              description="Fehlerdatensätze können lokal gespeichert werden, die fachliche Klassifikation folgt mit den Trainern."
            />
          ),
        },
        {
          path: 'beherrschung',
          element: (
            <PlannedState
              title="Beherrschung"
              description="Ein leerer Lernstand ist korrekt. Es wird noch kein Beherrschungswert berechnet."
            />
          ),
        },
        {
          path: 'spickzettel-alt',
          element: (
            <PlannedState
              title="Spickzettel"
              description="Der quellenbasierte A4-Builder ist für eine spätere Phase vorgesehen."
            />
          ),
        },
      ],
    },
  ],
  { basename },
);
