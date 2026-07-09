# AlgoDat Study System

Deutschsprachige, lokale und quellenbasierte Lernanwendung für Algorithmen und Datenstrukturen. Phase 0/0A inventarisierte und prüfte den Quellenbestand, Phase 1 stellte das React-/TypeScript-/PWA-Fundament bereit, Phase 2 bis 13 bauten elf aktive Lernpfade und den Klausursimulator auf, Phase 14 ergänzte die Grundlagen-Diagnose, Phase 15 ergänzt einen adaptiven Lernorchestrator und Phase 16 führt den Stand als `1.0.0-rc.2` mit lokalem A4-Spickzettel-Builder und Accessibility-Fallback-Audit in die Release-Härtung.

## Lokaler Start

```powershell
npm install
npm run dev
```

Die lokale Entwicklung läuft standardmäßig unter `/`. Produktionsbuilds für GitHub Pages nutzen den Basispfad `/algodat/`. Bei Bedarf kann `VITE_BASE_PATH` explizit gesetzt werden.

## Zentrale Prüfungen

```powershell
npm run verify
```

Der Verify-Befehl führt Datenvalidierung, Inhaltsbuild, Inhaltsvalidierung, Formatprüfung, Lint, Typprüfung, Unit-/Integrations-/Komponententests, Coverage, Produktionsbuild, Bundle-Analyse, Deployment-Audit und Playwright-E2E aus.

## Architektur

- `src/content/`: ausführbare Zod-Schemas, Loader, Selektoren und generierte Inhaltsindizes
- `src/domain/tracing/`: deterministische Rucksack-DP- und Union-Find-Engines
- `src/domain/proofs/`: deterministische Schleifeninvarianten-Engine, Ausdrucksparser, Scoring und Mastery V3
- `src/domain/recurrences/`: Rekurrenzanalyse, Master-Theorem, Rekursionsbaum und Laufzeitinduktion
- `src/domain/dp-design/`: deterministische DP-Entwurfsengine, Brute-Force-Orakel, Rubrik und Mastery V5
- `src/domain/red-black-tree/`: deterministische Rot-Schwarz-Einfügung, Rotation, Invariantenprüfung, Scoring und Mastery V8
- `src/domain/exam-simulator/`: Klausurpakete, Session-Lifecycle, Timer, Recovery, Adapter, exakte Punkte und Ergebnisberichte
- `src/domain/study-orchestrator/`: Evidenznormalisierung, Prüfungsreife, Spaced Review und deterministische Tages-/Wochenplanung
- `src/domain/cheat-sheet/`: verifizierte Spickzettelblöcke, Auswahl, Priorisierung, Packing und Druckvalidierung
- `src/features/trainer/`: deutschsprachige Tracing-, Beweis-, Rekurrenz- und Entwurfs-Trainer mit Lern-, Übungs-, Prüfungs- und Wiederholungsmodus
- `src/features/simulator/`: Profil-Coverage, Probeklausur-Briefing, Strict-Exam-Session und Ergebnisbericht
- `src/features/study-plan/`: Lernplan, heutige Aufgaben, Wochenplan, Prüfungsreife, Wiederholungen, Einstellungen und Verlauf
- `src/features/cheat-sheet/`: A4-Spickzettel mit Vorlage, manueller Auswahl, Vorschau und Druckansicht
- `src/persistence/`: versioniertes IndexedDB-Modell mit Migration, Import, Export und Reset
- `scripts/`: deterministischer Inhaltsbuild, Daten-, Bundle- und Deployment-Prüfungen
- `docs/`: Audit-, Sicherheits-, Architektur- und Abschlussberichte

## Aktuelle Lernpfade

- `trainer-rucksack-dp-v1`: Rucksack-DP-Tabelle. Quellen: `src-25d6340b518c`, Seiten 33–34, und `src-baa07f0a207a`, ab Seite 390.
- `trainer-union-find-listen-v1`: Union-Find mit verketteten Listen. Quellen: `src-8f16b2505bbd`, Seite 6; `src-35405e721f05`, Seite 6; `src-baa07f0a207a`, Seiten 943, 946, 948, 949, 950–951.
- `trainer-schleifeninvariante-summe-v1`: Schleifeninvariante für gewichtete Array-Summe. Quellen: `src-25d6340b518c`, Seiten 11–12; `src-baa07f0a207a`, Seiten 132–135 und 140.
- `trainer-rekurrenz-master-fall1-v1`: Rekurrenzanalyse, Master-Theorem und Laufzeitinduktion. Quellen: `src-25d6340b518c`, Seiten 17–18 und 25–26; `src-baa07f0a207a`, Seiten 194–198 und 230–238.
- `trainer-dp-entwurf-mine-v1`: Algorithmusentwurf mit dynamischer Programmierung für Aufgabe 8. Quellen: `src-8f16b2505bbd`, Seite 10; `src-35405e721f05`, Seiten 11–12.

Alle öffentlichen Aufgaben sind neu formuliert, deterministisch gelöst und als `public_safe` markiert.

## Phase 12: Prim-MST-Tracing

`trainer-graph-prim-mst-v1` ergänzt minimale Spannbäume als zehnten produktiven Lernpfad. Die fachliche Kanonik ist belegt durch `src-8f16b2505bbd`, Seite 3, `src-35405e721f05`, Seite 3, sowie `src-baa07f0a207a`, Seiten 955-958 und 960-965. Die Hauptinstanz vermeidet Auswahlgleichstände und erfindet keine Tie-Breaker-Regel.

## Phase 7: Klausursimulator

`exam-package-kernkompetenz-v1` ist die einzige startbare Probeklausur. Sie kombiniert die fünf produktiven Trainerfamilien zu 5 Aufgaben mit je 8 Punkten, insgesamt 40 Punkten und 144 Minuten Trainingszeit. Sie ist keine historische Originalklausur, keine offizielle Notensimulation und kein Häufigkeitsbeleg.

Historische Profile unter `/simulator/profile` sind bewusst nicht startbar, solange nicht alle Slots durch verifizierte Trainer abgedeckt sind.

Zusätzliche Dokumente:

- [Klausursimulator-Architektur](docs/EXAM_SIMULATOR_ARCHITECTURE.md)
- [Exam Session Lifecycle](docs/EXAM_SESSION_LIFECYCLE.md)
- [Timer und Recovery](docs/EXAM_TIMER_AND_RECOVERY.md)
- [Exam Task Adapter](docs/EXAM_TASK_ADAPTERS.md)
- [Exam Scoring Model](docs/EXAM_SCORING_MODEL.md)
- [Beherrschungsmodell V6](docs/MASTERY_MODEL_V6.md)
- [Phase-7-Abschlussbericht](docs/PHASE_7_COMPLETION_REPORT.md)

Original-PDFs im lokalen Ordner `pdfs/` bleiben privates Eingangsmaterial. Sie werden nicht gebündelt, nicht gecacht und nicht öffentlich verlinkt.

## Wichtige Dokumente

- [Trainingsinhaltsrichtlinie](docs/TRAINING_CONTENT_POLICY.md)
- [Trainer-Registry](docs/TRAINER_REGISTRY.md)
- [Tracing-Engine](docs/TRACING_ENGINE.md)
- [Union-Find-Engine](docs/UNION_FIND_TRACING_ENGINE.md)
- [Beweistrainer-Architektur](docs/PROOF_TRAINER_ARCHITECTURE.md)
- [Rekurrenztrainer-Architektur](docs/RECURRENCE_TRAINER_ARCHITECTURE.md)
- [DP-Entwurfstrainer-Architektur](docs/DP_DESIGN_TRAINER_ARCHITECTURE.md)
- [Klausursimulator-Architektur](docs/EXAM_SIMULATOR_ARCHITECTURE.md)
- [Math-Grammatik](docs/MATH_EXPRESSION_GRAMMAR.md)

## Phase 5: Rekurrenztrainer

`trainer-rekurrenz-master-fall1-v1` ergänzt Rekurrenzanalyse, Master-Theorem, Rekursionsbaum und induktiven Laufzeitbeweis. Quellen: `src-25d6340b518c`, Seiten 17-18 und 25-26; `src-baa07f0a207a`, Seiten 194-198 und 230-238.

Zusätzliche Dokumente:

- [Phase-5-Auswahl](docs/PHASE_5_CANDIDATE_SELECTION.md)
- [Master-Theorem-Engine](docs/MASTER_THEOREM_ENGINE.md)
- [Beherrschungsmodell V4](docs/MASTERY_MODEL_V4.md)
- [Phase-5-Abschlussbericht](docs/PHASE_5_COMPLETION_REPORT.md)

## Phase 6: DP-Entwurfstrainer

`trainer-dp-entwurf-mine-v1` ergänzt Aufgabe-8-Training für dynamische Programmierung: Zustand definieren, Rekurrenz mit Randfällen formulieren, Auswertungsordnung, Algorithmus, Induktionsbeweis und Komplexität aktiv eingeben. Quellen: `src-8f16b2505bbd`, Seite 10; `src-35405e721f05`, Seiten 11-12.

Zusätzliche Dokumente:

- [Phase-6-Auswahl](docs/PHASE_6_CANDIDATE_SELECTION.md)
- [DP-Scoring-Modell](docs/DP_DESIGN_SCORING_MODEL.md)
- [Beherrschungsmodell V5](docs/MASTERY_MODEL_V5.md)
- [Phase-6-Abschlussbericht](docs/PHASE_6_COMPLETION_REPORT.md)

## Phase 8: Greedy-Algorithmusentwurf

`trainer-greedy-entwurf-fitnesspunkte-v1` ergänzt Aufgabe 7 als sechsten produktiven Lernpfad. Die fachliche Kanonik ist belegt durch `src-97414623dd81`, Seite 8 und `src-8a588d5ddc35`, Seite 8: absteigende Sortierung, Summenalgorithmus, `O(n log n)` und Widerspruchs-/Austauschbeweis.

`exam-package-kernkompetenz-v2` ist das neue Standard-Kernpaket des Simulators: sechs Aufgaben mit je 8 Punkten, insgesamt 48 Punkte und 173 Minuten Trainingszeit. V1 bleibt unverändert erhalten.

Zusätzliche Dokumente:

- [Greedy-Entwurfstrainer-Architektur](docs/GREEDY_DESIGN_TRAINER_ARCHITECTURE.md)
- [Greedy-Regelmodell](docs/GREEDY_RULE_MODEL.md)
- [Greedy-Scoring-Modell](docs/GREEDY_DESIGN_SCORING_MODEL.md)
- [Beherrschungsmodell V7](docs/MASTERY_MODEL_V7.md)
- [Phase-8-Abschlussbericht](docs/PHASE_8_COMPLETION_REPORT.md)

## Phase 9: Rot-Schwarz-Bäume

`trainer-rot-schwarz-einfuegen-v1` ergänzt Rot-Schwarz-Invarianten, BST-Einfügung, Reparaturfälle, Rotation, Umfärbung, Schwarzhöhe und Laufzeit als siebten produktiven Lernpfad. Quellen: `src-97414623dd81`, Seite 4; `src-8a588d5ddc35`, Seite 4; `src-5c9eadb17ccc`, Seiten 5, 7, 15, 20 und 36.

`exam-package-kernkompetenz-v3` ist das neue Standard-Kernpaket des Simulators: sieben Aufgaben mit je 8 Punkten, insgesamt 56 Punkte und 202 Minuten Trainingszeit. V1 und V2 bleiben erhalten.

Zusätzliche Dokumente:

- [Phase-9-Implementierungsplan](docs/PHASE_9_IMPLEMENTATION_PLAN.md)
- [Phase-9-Portfolioentscheidung](docs/PHASE_9_PORTFOLIO_DECISION.md)
- [Rot-Schwarz-Trainer-Architektur](docs/RED_BLACK_TREE_TRAINER_ARCHITECTURE.md)
- [Rot-Schwarz-Scoring-Modell](docs/RED_BLACK_TREE_SCORING_MODEL.md)
- [Beherrschungsmodell V8](docs/MASTERY_MODEL_V8.md)
- [Phase-9-Abschlussbericht](docs/PHASE_9_COMPLETION_REPORT.md)

## Phase 13: Divide-and-Conquer-Algorithmusentwurf

`trainer-dc-entwurf-maxwertdifferenz-v1` ergänzt Aufgabe 7 als elften produktiven Lernpfad. Der produktive Kandidat wurde erst nach einem Gate ausgewählt; die maximale Wertdifferenz ist durch `src-88179ac88dc5`, Seite 7, mit Problemstellung, D&C-Zerlegung, Kombinationsfall, Rekurrenz `T(n) <= 2T(n/2)+c`, Laufzeit `O(n)` und Induktionsbeweis belegt.

`exam-package-kernkompetenz-v4` ersetzt im kuratierten Standardprofil den bisherigen Aufgabe-7-Greedy-Slot durch den Divide-and-Conquer-Entwurfsslot. V1 bis V3 bleiben unverändert erhalten; V4 ist kein historisches Klausurereignis und kein Häufigkeitsbeleg.

Zusätzliche Dokumente:

- [Phase-13-Kandidatenauswahl](docs/PHASE_13_CANDIDATE_SELECTION.md)
- [Divide-and-Conquer-Domäne](docs/DIVIDE_AND_CONQUER_DOMAIN.md)
- [Divide-and-Conquer-Trainerarchitektur](docs/DIVIDE_AND_CONQUER_TRAINER_ARCHITECTURE.md)
- [Divide-and-Conquer-Scoring](docs/DIVIDE_AND_CONQUER_SCORING_MODEL.md)
- [Beherrschungsmodell V12](docs/MASTERY_MODEL_V12.md)
- [Phase-13-Abschlussbericht](docs/PHASE_13_COMPLETION_REPORT.md)

## Phase 14: Grundlagen-Diagnose

`/diagnose` ergänzt eine eigene Produktfamilie für Kuraufgaben-, Erkennungs- und Grundlagendiagnostik. Sie enthält 8 Kompetenzgruppen, 64 produktive Items, 8 produktive Itemtypen, Schnellcheck, Standarddiagnose, Themendiagnose, deterministisches Scoring, Fehlerdiagnose, Konfidenz, Empfehlungen und Mastery V13.

Die Diagnose ist kein historisches Klausurpaket und keine Notenprognose. Fachliche Belege stehen in `data/phase14-competency-inventory.json`, zum Beispiel Asymptotik `src-35405e721f05`, Seiten 9 und 11, Rekurrenzen `src-25d6340b518c`, Seiten 17 und 25, Graphalgorithmen `src-baa07f0a207a`, Seite 846, und Beweismethoden `src-25d6340b518c`, Seite 11.

Zusätzliche Dokumente:

- [Kompetenz-Audit Phase 14](docs/COMPETENCY_AUDIT.md)
- [Grundlagen-Diagnose-Architektur](docs/FOUNDATIONS_DIAGNOSTIC_ARCHITECTURE.md)
- [Diagnostic Item Model](docs/DIAGNOSTIC_ITEM_MODEL.md)
- [Diagnostic Item Bank Policy](docs/DIAGNOSTIC_ITEM_BANK_POLICY.md)
- [Scoring-Modell](docs/SCORING_MODEL.md)
- [Beherrschungsmodell V13](docs/MASTERY_MODEL_V13.md)
- [Phase-14-Abschlussbericht](docs/PHASE_14_COMPLETION_REPORT.md)

## Phase 15: Adaptiver Lernorchestrator

`/lernplan` ergänzt eine lokale Planungsschicht über Trainer, Diagnose und Simulator. Der Orchestrator sammelt nur lokale Evidenz, normalisiert sie deterministisch und erzeugt daraus Tagesplan, Wochenplan, Wiederholungsqueue, Prüfungsreife und Empfehlungserklärungen.

Die Prüfungsreife ist ausdrücklich keine Notenprognose. Sie verwendet die bestehenden quellengebundenen Trainer-, Diagnose- und Simulatorartefakte; Phase 15 führt keine neuen fachlichen Aufgaben oder Musterlösungen ein.

Zusätzliche Dokumente:

- [Study-Orchestrator-Architektur](docs/STUDY_ORCHESTRATOR_ARCHITECTURE.md)
- [Aktivitätskatalog](docs/STUDY_ACTIVITY_CATALOG.md)
- [Exam-Slot-Readiness-Mapping](docs/EXAM_SLOT_READINESS_MAPPING.md)
- [Readiness-Modell](docs/EXAM_READINESS_MODEL.md)
- [Spaced-Review-Policy](docs/SPACED_REVIEW_POLICY.md)
- [Prioritätspolitik](docs/STUDY_PRIORITY_POLICY.md)
- [Phase-15-Abschlussbericht](docs/PHASE_15_COMPLETION_REPORT.md)

## Phase 16: Release Candidate und A4-Spickzettel

Der Stand ist `1.0.0-rc.2`. Neu ist `/spickzettel` als lokaler, quellengebundener A4-Builder mit Standard-, Schwächen-, Slot-, manuellem und Minimalmodus. IndexedDB nutzt Version 10 mit dem Store `cheatSheets`. Der Accessibility-Fallback-Audit ergänzt Keyboard-, Fokus-, axe-, Accessibility-Tree-, Zoom-/Reflow-, Forced-Colors- und Reduced-Motion-Prüfungen, ersetzt aber keinen echten Screenreader-Test.

`1.0.0` wird erst gesetzt, wenn der echte Screenreader-Gate und das finale `npm.cmd run verify` nach der letzten Änderung erfüllt sind.

Zusätzliche Dokumente:

- [Release Checkliste](docs/RELEASE_CHECKLIST.md)
- [Known Limitations](docs/KNOWN_LIMITATIONS.md)
- [Final Accessibility Audit](docs/FINAL_ACCESSIBILITY_AUDIT.md)
- [Accessibility-Fallback-Audit](docs/ACCESSIBILITY_FALLBACK_AUDIT_REPORT.md)
- [Screenreader-Testbericht](docs/SCREENREADER_TEST_REPORT.md)
- [Verbleibende Accessibility-Einschränkungen](docs/ACCESSIBILITY_REMAINING_LIMITATIONS.md)
- [Cheat Sheet Content Policy](docs/CHEAT_SHEET_CONTENT_POLICY.md)
- [Final Topic Coverage Report](docs/FINAL_TOPIC_COVERAGE_REPORT.md)
- [Phase-16-Abschlussbericht](docs/PHASE_16_COMPLETION_REPORT.md)
