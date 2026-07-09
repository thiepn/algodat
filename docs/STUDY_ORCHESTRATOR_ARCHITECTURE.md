# Study-Orchestrator-Architektur

Der Study Orchestrator ist ein reiner Domainkern unter `src/domain/study-orchestrator/`. Er kombiniert lokale Evidenz aus Trainer-Versuchen, Diagnose-Sessions, Exam-Resultaten, Mastery-Records und Review-Schedules zu Tagesplan, Wochenplan, Wiederholungen und Prüfungsreife.

Schichten:

- Daten/Policies: `data/study-activity-catalog.json`, `data/exam-slot-competency-map.json`, `data/*policy.json`.
- Generated Content: entsprechende Dateien in `src/content/generated/`.
- Loader: `src/content/loaders/study-orchestrator.ts`.
- Domain: `src/domain/study-orchestrator/engine.ts`.
- Persistenz: IndexedDB-Version 9 mit `studyPlans`, `studyPlanSettings`, `reviewSchedules`.
- UI: `/lernplan/*` in `src/features/study-plan/`.

Alle Entscheidungen sind deterministisch. Keine Empfehlung nutzt LLM, externe API, Telemetrie oder Cloud-Synchronisation.

Fachliche Slot- und Kompetenzbelege bleiben aus den vorhandenen Quellen abgeleitet, z. B. Rekurrenzen `src-25d6340b518c`, Seiten 17 und 25, Graphalgorithmen `src-baa07f0a207a`, Seite 846, und Paradigmen `src-8f16b2505bbd`, Seite 10.
