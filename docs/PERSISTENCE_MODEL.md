# Persistenzmodell

## Phase-4-Ergänzung

Die aktuelle IndexedDB-Schema-Version ist **9**. Version 7 ergänzt den Klausursimulator um `examSessions`, `examSnapshots` und `examResults`, Version 8 ergänzt `diagnosticSessions`, Version 9 ergänzt die Lernplan-Stores `studyPlans`, `studyPlanSettings` und `reviewSchedules`. Bestehende Trainer-, Simulator-, Diagnose- und Mastery-Daten bleiben in ihren bisherigen Stores.

## Datenbank

Die Anwendung verwendet IndexedDB über `idb`. Datenbankname ist `algodat-study-system`, die aktuelle Schema-Version ist **9**.

| Object Store | Inhalt | Index |
| --- | --- | --- |
| `studySessions` | lokale Lernsitzungen | – |
| `practiceAttempts` | Entwürfe und abgeschlossene Trainingsversuche | `by-item`, `by-trainer` |
| `masteryRecords` | berechnete Beherrschungsstände | – |
| `errorRecords` | klassifizierte Fehler | `by-attempt` |
| `preferences` | gewähltes Klausurprofil und Bewegungspräferenz | – |
| `examSessions` | lokale Simulator-Sitzungen | `by-package` |
| `examSnapshots` | Recovery-Snapshots | `by-session` |
| `examResults` | Ergebnisberichte nach Abgabe | `by-session` |
| `diagnosticSessions` | lokale Diagnose-Sitzungen | `by-mode` |
| `studyPlans` | generierte Tages- und Wochenpläne | `by-date`, `by-type` |
| `studyPlanSettings` | lokale Lernplan-Einstellungen | – |
| `reviewSchedules` | Spaced-Review-Zustände je Kompetenz | `by-next-due` |

## Phase-3-Erweiterung

Version 3 ergänzt `PracticeAttempt` um Versionen für Engine, Problem, Scoring, Mastery und Antwortpayload. Der Store `practiceAttempts` erhält einen stabilen Trainer-Index, damit mehrere Trainer parallel gefiltert werden können.

## Phase-7-Erweiterung

Version 7 speichert Prüfungssitzungen getrennt von Snapshots und Ergebnissen. Snapshots enthalten einen unveränderten Domain-Session-Payload mit Prüfsumme. Ergebnisse werden erst nach endgültiger Abgabe gespeichert und in Export/Import aufgenommen.

## Integrität und Migration

Alle Datentypen stammen aus denselben Zod-Schemas wie die Inhaltsschicht. Migrationen sind nach Zielversion geordnet und werden ausschließlich für noch nicht angewendete Versionen ausgeführt. Repositories kapseln die Store-Zugriffe.

## Export, Import und Reset

Ein Export enthält Datenbankversion, Inhaltsversion, Zeitstempel und alle Stores. Der Import wird vollständig validiert; eine abweichende Inhaltsversion wird dem Aufrufer gemeldet. Ein Reset schließt die offene Verbindung und löscht ausschließlich die anwendungseigene Datenbank.

Die Anwendung synchronisiert keine personenbezogenen Daten und besitzt kein Backend. Alle Nutzerdaten bleiben im lokalen Browserprofil.
# Phase 8 Nachtrag

Für Greedy-Entwurfsversuche ist keine Datenbankmigration notwendig. Persistiert werden strukturierte Antworten in `PracticeAttempt.answers`, Fehlercodes in `ErrorRecord` und Mastery-Dimensionen in `MasteryRecord` mit `mastery-v7`. Fachbeleg: `src-97414623dd81`, Seite 8; `src-8a588d5ddc35`, Seite 8.
## Phase 12 Ergänzung

Prim-MST-Versuche verwenden das bestehende `PracticeAttempt`-Payloadmodell. Es war keine IndexedDB-Migration erforderlich, weil Antworten als versionierte Trainerpayloads gespeichert werden.
# Phase 13 Nachtrag

Divide-and-Conquer-Versuche verwenden das bestehende `PracticeAttempt`-Payloadmodell. Antworten werden versioniert als `divide-conquer-design-answer-v1` gespeichert; Fehlercodes und Mastery-Dimensionen bleiben deterministisch ableitbar. Es ist keine neue IndexedDB-Version notwendig.

# Phase 14 Nachtrag

Die aktuelle IndexedDB-Schema-Version ist **8**. Version 8 ergänzt den Store `diagnosticSessions` mit Index `by-mode`. Export und Import validieren Diagnose-Sessions gegen `DiagnosticSessionSchema`.

Diagnose-Sessions speichern Modus, Seed, Itemliste, Antworten, Konfidenzen, aktuelle Position, Ergebnis, Kompetenzresultate, Empfehlungen und Zeitstempel. Die fachlichen Iteminhalte bleiben in versionierten Content-Dateien; lokale Sessions speichern keine PDF-Links.

# Phase 15 Nachtrag

Die aktuelle IndexedDB-Schema-Version ist **9**. Version 9 ergänzt `studyPlans`, `studyPlanSettings` und `reviewSchedules`. Export und Import validieren diese Stores gegen `StudyPlanSchema`, `StudyPlanSettingsSchema` und `ReviewScheduleSchema`.

Lernpläne speichern Planart, Datum oder Wochenstart, generierte Aktivitäten, Evidenz-Fingerprint, Einstellungen, Erklärungen und Zeitstempel. Review-Schedules speichern Kompetenz-ID, Intervall, nächste Fälligkeit und Ergebniszähler. Der Orchestrator synchronisiert keine Daten extern und speichert keine privaten Quellpfade oder PDF-Links.

# Phase 16 Nachtrag

Die aktuelle IndexedDB-Schema-Version ist **10**. Version 10 ergänzt additiv den Store `cheatSheets` mit Index `by-updated` und `by-mode`. Alte Stores bleiben unverändert.

Spickzettel speichern keine Original-PDFs und keine historischen Aufgaben. Export und Import nehmen `cheatSheets` in die validierte lokale Datensicherung auf.
