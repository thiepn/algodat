# Datenmodell

## Phase 20.1 Nachtrag

`data/hosted-materials.json` ist das einzige Datenmodell für künftig veröffentlichbare
Originalmaterialien. Das Manifest ist in `1.0.0-rc.7` leer und wird durch
`src/content/loaders/hosted-materials.ts` validiert. Zulässige `distributionBasis`-Werte sind
`author_owned`, `explicit_permission`, `open_license` und `official_public_url`; zulässige
`publicationStatus`-Werte sind `approved`, `pending` und `rejected`.

IndexedDB-Version 13 entfernt die alten lokalen Quellen-Stores `localDocuments` und
`localTaskRegions` sowie optionale private Cache-/FileHandle-Stores. Die Lernfortschritts-Stores
bleiben erhalten und werden weiter beim Export/Import gegen ausführbare Schemas validiert.

## Phase-4-Ergänzung

Phase 4 ergänzt `ProofTrainer`, `LoopInvariantProofProblem` und `ProofRubric`. `PracticeAttempt` kann nun `trainerKind: "proof"` und `canonicalProofVersion` tragen. Die Antwort eines Beweisversuchs ist ein strukturierter Beweis mit Programmanalyse, Behauptung, Invariante, Induktionsanfang, Induktionsvoraussetzung, Induktionsschritt, Terminierung und Schluss. Quellenbezug des produktiven Proof-Inhalts: `src-25d6340b518c`, Seiten 11–12; `src-baa07f0a207a`, Seiten 132–135 und 140.

Alle IDs sind stabile, sprechende Präfix-IDs; Inhaltsobjekte tragen `schemaVersion`, `contentVersion`, `sourceRefs`, `verificationStatus`, `lastReviewed` und optional `duplicateGroupId`. Zeitwerte sind ISO-8601. Löschen erfolgt im lokalen Fortschritt weich, kanonische Inhalte werden unveränderlich versioniert.

| Schema | Zweck | Versionierung/Duplikate |
| --- | --- | --- |
| `SourceDocument` | sichere Quellenmetadaten ohne öffentliche PDF-Links | Quelle über Prüfsumme versioniert |
| `SourcePage` | Seitenanker, Text-/Sichtstatus | verweist auf Quelle und Seite |
| `Topic` | kanonischer Themenbegriff | deduplizierte Evidenzklassen |
| `ExamProfile` | Standardprofil und historische Ausnahmen | echte Klausurereignisse getrennt von Probe/Übung |
| `ExamQuestion` | echte Aufgabenereignisse | Duplikate über Gruppe |
| `TracingTrainer` | öffentlicher aktiver Lernpfad | `contentVersion`, `sourceRefs`, `publicDistributionStatus` |
| `TracingRubric` | Teilpunkte und Fehlerzuordnung | Summe muss `maxPoints` ergeben |
| `TrainingFeedback` | Ergebnis einer Abgabe | aus Engine ableitbar |
| `TrainingRecommendation` | nächste Aktion | deterministisch aus Score und Fehlern |
| `PracticeAttempt` | lokaler Entwurf oder abgeschlossener Versuch | referenziert Trainer-, Engine-, Scoring- und Mastery-Version |
| `ExamPackage` | startbares oder dokumentiertes Prüfungspaket | `historicalExam`, Auto-Grading-Status, Quellen und Punktesumme |
| `ExamProfileCoverage` | Abdeckung historischer Profile | trennt startbare, teilweise unterstützte und reine Metadatenprofile |
| `ExamTaskInstance` | konkrete Simulatoraufgabe | verweist auf Trainer, Adapter, Quellen und Exam-Slot |
| `ExamSession` | lokale laufende oder abgegebene Prüfungssitzung | IndexedDB-Version 7, Mastery-Modell V6 |
| `ExamSnapshot` | Recovery-Punkt einer Session | deterministische Prüfsumme über Session-Payload |
| `ExamResult` | Ergebnisbericht nach Abgabe | Punkte, Fehlercluster, Timing und Mastery-Auswirkung |
| `ErrorRecord` | klassifizierter Fehler mit Evidenz | keine Diagnose ohne Eingabezitat/Schritt |
| `MasteryRecord` | lokale Beherrschung je Thema/Trainer | aus Versuchen rekonstruierbar |

## TracingTrainer Phase 3

`TracingTrainer.problem` ist nach `algorithm` diskriminiert:

- `knapsack_01`: Items, Kapazität, Tie-Breaker und erwartete DP-Zeilen.
- `union_find_linked_lists`: Elemente, Operationen, Kontrollpunkte, Listenrepräsentation, Weighted Union und Tie-Breaker.

Die produktiven Instanzen `trainer-rucksack-dp-v1` und `trainer-union-find-listen-v1` sind `source_aligned_generated_exercise`, `verified_against_official_source`, `engine_matches_official_method` und `public_safe`.

## Persistente Nutzerdaten

`PracticeAttempt` enthält Modus, Status, Start-/Endzeit, Dauer, Vorprüfungsantworten, Antwortpayload, Hinweise, Lösungsoffenlegung, Rubrikergebnisse und referenzierte Versionsfelder. Export und Import validieren diese Daten gegen dieselben ausführbaren Schemas wie die App.

IndexedDB-Version 3 ergänzt einen Trainer-Index und optionale Versionsfelder für ältere Versuche.

## Phase-7-Ergänzung

Phase 7 ergänzt die Simulator-Schemas in `src/content/schemas/content.ts`. `exam-package-kernkompetenz-v1` ist `historicalExam: false`, `fullyAutoGradable: true`, `public_safe` und summiert exakt 40 Punkte. Alle historischen Profil-Coverage-Einträge in `data/exam-profile-coverage.json` sind nicht startbar, solange Slotabdeckung fehlt.

Persistente Exam-Daten verwenden die Stores `examSessions`, `examSnapshots` und `examResults`. Export und Import validieren diese Stores gegen die ausführbaren Schemas.
# Phase 8 Nachtrag

Neue Content-Dateien: `greedy-design-trainers.json`, `greedy-design-problems.json`, `greedy-design-rubrics.json`, `greedy-design-variants.json` sowie `exam-package-kernkompetenz-v2`. Die Persistenz nutzt weiterhin `PracticeAttempt.answers` und kennzeichnet Greedy-Antworten mit `answerPayloadSchemaVersion = greedy-design-answer-v1`; keine IndexedDB-Migration. Belege: `src-97414623dd81`, Seite 8; `src-8a588d5ddc35`, Seite 8.
## Phase 12 Ergänzung

`GraphTracingProblem` enthält nun zusätzlich `algorithm: "prim"` mit `graphKind: "weighted_undirected"`. Die kanonische Lösung speichert Prim-Schritte, `mstEdges`, `totalWeight` und eine Mehrfach-MST-Policy. Persistente Antworten nutzen das bestehende `PracticeAttempt.answers`-Feld mit Payloadversion `prim-mst-answer-v1`.
# Phase 13 Nachtrag

Neue generierte Content-Artefakte:

- `divide-conquer-design-trainers.json`
- `divide-conquer-design-problems.json`
- `divide-conquer-design-rubrics.json`
- `divide-conquer-design-variants.json`
- `exam-package-kernkompetenz-v4`

Persistente Antworten verwenden `PracticeAttempt.answers` mit `answerPayloadSchemaVersion = divide-conquer-design-answer-v1`. Es ist keine IndexedDB-Migration erforderlich.

# Phase 14 Nachtrag

Neue generierte Diagnose-Artefakte:

- `foundation-competencies.json`
- `diagnostic-items-asymptotics.json`
- `diagnostic-items-recurrences.json`
- `diagnostic-items-sorting-search.json`
- `diagnostic-items-data-structures.json`
- `diagnostic-items-graphs.json`
- `diagnostic-items-paradigms.json`
- `diagnostic-items-proofs.json`
- `diagnostic-session-templates.json`
- `diagnostic-misconceptions.json`
- `diagnostic-recommendation-rules.json`

Persistente Diagnose-Sessions verwenden den neuen Store `diagnosticSessions` in IndexedDB-Version 8. Fachliche Kompetenzquellen sind in `data/phase14-competency-inventory.json` dokumentiert, zum Beispiel Datenstrukturen `src-79ae96ebbccf`, Seite 2, und `src-35405e721f05`, Seite 6.

# Phase 15 Nachtrag

Neue generierte Orchestrator-Artefakte:

- `study-activity-catalog.json`
- `exam-slot-competency-map.json`
- `study-priority-policy.json`
- `spaced-review-policy.json`
- `readiness-policy.json`
- `exam-date-phase-policy.json`
- `study-plan-default-settings.json`

Persistente Lernplan-Daten verwenden IndexedDB-Version 9 mit `studyPlans`, `studyPlanSettings` und `reviewSchedules`. Export und Import validieren diese Stores gegen ausführbare Schemas. Der Orchestrator speichert keine PDF-Links und keine extern synchronisierten Nutzerdaten.

# Phase 16 Nachtrag

Neue Content-Artefakte:

- `cheat-sheet-blocks.json`
- `cheat-sheet-presets.json`
- `cheat-sheet-layout-policy.json`

Persistente Spickzettel verwenden IndexedDB-Version 10 mit `cheatSheets`. Ein Dokument speichert Auswahl, Varianten, Platzierungen, Druckeinstellungen und Quellenzusammenfassung. Export und Import validieren den Store gegen `CheatSheetDocumentSchema`.
# Phase 17 Datenmodell

Neue öffentliche Datenartefakte:

- `data/study-modules.json`
- `data/task-slot-learning-map.json`
- `data/learning-resource-graph.json`
- `src/content/generated/exam-library.json`

Alle fachlichen UI-Aussagen müssen weiter Quellen-ID und Seite tragen. Die Klausurenbibliothek enthält keine Original-PDFs, lokalen Pfade oder vollständigen historischen Aufgabentexte.
