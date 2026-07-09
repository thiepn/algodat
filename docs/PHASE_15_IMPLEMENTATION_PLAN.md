# Phase 15 Implementierungsplan

Zielversion: `0.15.0-adaptive-study-orchestrator`.

Phase 15 ergänzt genau eine neue Systemschicht: den adaptiven Lernorchestrator. Er berechnet lokal und deterministisch Tagesplan, Wochenplan, Wiederholungen und Prüfungsreife. Er ist kein LLM-Coach, keine Notenprognose und keine Cloud-Funktion.

## Verfügbare Evidenzquellen

- `PracticeAttempt`: abgeschlossene Trainer-Versuche, Modus, Dauer, Hinweisnutzung, Lösungsoffenlegung, Rubrik- und Fehlerdaten.
- `DiagnosticSession`: Kompetenzresultate, Itemresultate, Fehlvorstellungen, Konfidenz und Sessiontyp.
- `ExamResult`: Punkte je Slot, Zeitdaten, Fehlercluster und Package-ID.
- `MasteryRecord`: bestehende fachliche Mastery-Dimensionen V1 bis V13.
- `ReviewSchedule`: neue lokale Review-Einheiten aus Fehlern, Kompetenzen und Wiederholungen.
- `CoverageMetadata`: Exam-Packages, Exam-Task-Instances, Trainerregistry, Diagnosekompetenzen und `data/exam-profile-coverage.json`.

Die Diagnosekompetenzen sind quellenbelegt, z. B. Asymptotik über `src-35405e721f05`, Seiten 9 und 11, Rekurrenzen über `src-25d6340b518c`, Seiten 17 und 25, Graphalgorithmen über `src-baa07f0a207a`, Seite 846.

## Derzeitige Mastery-Berechnung

Mastery V1 bis V13 bleibt fachlich. Phase 15 ergänzt V14 nur als Metakompetenzmodell mit `study_consistency`, `review_completion`, `timed_practice_exposure`, `exam_slot_coverage`, `error_recovery` und `confidence_calibration_stability`. Skip, Snooze und bloßes Öffnen verändern keine fachliche Mastery.

## Exam-Slot-Mapping

`data/exam-slot-competency-map.json` ordnet Aufgaben 1 bis 9 auf typische Punkte, Trainer, Diagnosekompetenzen, Mastery-Dimensionen, Evidenzarten und Coverage-Status ab. Ein einzelner Trainer markiert keinen ganzen Slot automatisch als vollständig abgedeckt.

## Aktivitätskatalog

`data/study-activity-catalog.json` enthält public-safe Aktivitäten für:

- tiefe Trainer im Lern-, Übungs- und Prüfungsmodus,
- gezielte Wiederholung,
- Diagnose-Schnellcheck, Standarddiagnose und Themendiagnose,
- Error Replay,
- ExamPackage,
- ExamTask-Retry,
- Konzeptreview,
- Puffer.

Jede Aktivität beschreibt Zielkompetenzen, Klausurslots, Dauer, Voraussetzungen, Abschlussdefinition und verfügbare Zielroute.

## Priorisierungsmodell

`data/study-priority-policy.json` versioniert alle Faktoren: Mastery-Defizit, Slotgewicht, fällige Wiederholung, wiederholte Fehler, Konfidenzkonflikt, Aktualität, Coverage-Lücke, Voraussetzungen, Zeitpassung, Vielfalt, Wiederholungspenalty, manuelle Priorisierung und Prüfungsdringlichkeit. Tie-Breaker sind stabil.

## Wiederholungsmodell

`data/spaced-review-policy.json` nutzt Basisintervalle von 1, 3, 7, 14 und 30 Tagen. Falsche Antworten und sichere Fehler verkürzen Intervalle; korrekte Antworten im Prüfungsmodus verlängern sie. Es gibt keine Benachrichtigungen, nur lokale Fälligkeiten.

## Prüfungsreifemodell

Readiness besteht getrennt aus `masteryLevel`, `evidenceStrength`, `evidenceRecency`, `timedPerformance`, `transferCoverage`, `errorStability` und `completionReliability`. Bänder: `insufficient_evidence`, `foundation_missing`, `developing`, `mostly_stable`, `exam_ready`, `stale_evidence`.

Gesamtreadiness wird gecappt: fehlende Evidenz, nur Diagnoseevidenz, veraltete Evidenz oder fehlende zeitbegrenzte Prüfung verhindern `exam_ready`.

## Persistenzbedarf

IndexedDB wird additiv von Version 8 auf Version 9 erweitert:

- `studyPlans`
- `studyPlanSettings`
- `reviewSchedules`

Export und Import validieren die neuen Stores gegen ausführbare Schemas. Alte Attempts, ExamResults und DiagnosticSessions werden nicht verändert.

## UX-Konzept

Neue Routen:

- `/lernplan`
- `/lernplan/heute`
- `/lernplan/woche`
- `/lernplan/pruefungsreife`
- `/lernplan/wiederholungen`
- `/lernplan/einstellungen`
- `/lernplan/verlauf`

Die UI zeigt sofort die nächste sinnvolle Aktivität, maximal drei prominente Tagesaktivitäten, klare Dauerangaben, transparente Gründe, Slotbezug und neutrale Skip-/Snooze-Aktionen.

## Performance-Risiken

Der Lernplan wird route-lazy geladen. Der allgemeine Entry darf keine Orchestrator-Engine, keine Diagnose-Itembank, keine Trainerchunks und keine Musterlösungen importieren. Policy-Daten werden über einen eigenen Loader geladen.

## Accessibility-Risiken

Tages- und Wochenplan werden als semantische Listen umgesetzt. Readiness-Karten nutzen Textstatus statt reine Farben. Echte Screenreader-Prüfung wird nur behauptet, wenn sie tatsächlich durchgeführt wurde.

## Teststrategie

Neue Tests decken ab:

- Policy- und Katalogvalidierung,
- Evidenznormalisierung und Fingerprint,
- Slot- und Gesamtreadiness,
- Review-Scheduling,
- Prioritätsfaktoren,
- Queue-Constraints,
- Tages- und Wochenplan,
- Planaktionen Start/Complete/Skip/Snooze,
- Persistenz Version 9,
- E2E-Fluss über `/lernplan`.

## Nichtziele

Kein neuer tiefer Trainer, keine weitere große Itembank, keine LLM-Bewertung, keine Cloud-Synchronisation, keine Telemetrie, keine Notenprognose, keine Bestehenswahrscheinlichkeit und keine externen Benachrichtigungen.
