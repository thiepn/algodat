# Teststrategie

## Phase-4-Ergänzung

Neue Phase-7-Tests decken Exam-Package-Validierung, Profil-Coverage, Session-Lifecycle, Timer, Recovery-Prüfsummen, exakte rationale Punkte, alle fünf Task-Adapter, Ergebnisbericht, Mastery V6, Content Loader und IndexedDB-Export/Import ab. `npm.cmd test` umfasst aktuell 20 bestandene Testdateien mit 123 bestandenen Tests.

## Testpyramide

- Datenvertrag: JSON-Schema/Enums, referenzielle Integrität, Seitenpfade, Quellenautorität.
- Unit-Tests: Trace-Erzeugung, Scoring, Teilpunkte, Tie-Breaker, Mastery-Updates, Fehlerklassifikation, Invarianten und Randfälle.
- Property-nahe Tests: mehrere kleine Rucksack-Instanzen und deterministische Union-Find-Zustände.
- Integrations-Tests: IndexedDB-Entwurf, Wiederaufnahme, Abschluss, Fehlerpersistenz, Mastery, Export/Import und Reset.
- Komponenten-/A11y-Tests: Tastatur, Fokus, Rollen/Namen, Quellenpanel, KaTeX-Fallback und axe.
- E2E: Übungsfluss, Prüfungsmodus, Wiederholung, Offline-Neuladen, Mobile-Layout und Deployment-Sicherheit.
- Simulator-E2E: Coverage öffnen, Probeklausur-Briefing bestätigen, Session starten, Antwort speichern, Reload prüfen, Übersicht öffnen, abgeben und Ergebnis offline wieder laden.

## Phase-3-Fokus

Die kritischste Logik liegt in `src/domain/tracing/` und wird unabhängig von React getestet. Für Union-Find werden insbesondere Weighted Union, lexikografischer Tie-Breaker, Repräsentantenzeiger, Listenreihenfolge, `head`, `tail`, `size` und ungültige Zustände geprüft.

## Freigabe

Kein neuer Phasenstart bei fehlerhafter Datenvalidierung. `npm run verify` ist das Freigabetor und umfasst Validierung, Build, Coverage, Bundle-Analyse, Deployment-Audit und Playwright.
# Phase 8 Nachtrag

Phase 8 ergänzt Unit-Tests für Greedy-Solver, Permutations-Oracle, kanonische Bewertung und Fehlerdiagnose. Schema-, Content-Loader- und Simulator-Domain-Tests wurden auf sechs Trainer, zwei Pakete und 48 Punkte in V2 erweitert. Fachbeleg: `src-97414623dd81`, Seite 8; `src-8a588d5ddc35`, Seite 8.

# Phase 10 Nachtrag

Phase 10 ergänzt Unit-Tests für Floyd-Warshall-Oracle, Matrixparser, Scoring und Mastery V9. Schema-, Content-Loader-, Persistenz- und Simulator-Domain-Tests wurden auf acht Trainer erweitert. Fachbeleg: `src-8f16b2505bbd`, Seite 4; `src-35405e721f05`, Seite 5.

# Phase 11 Nachtrag

Phase 11 ergänzt Unit-Tests für Dijkstra-Oracle, Markierungsreihenfolge, Distanz-/Vorgänger-Spur, Scoring und Mastery V10. Content-Loader-Tests wurden auf neun Trainer erweitert. Fachbeleg: `src-baa07f0a207a`, Seite 846; `src-1ea0642ec775`, Seite 6.
## Phase 12 Ergänzung

Prim-MST wird durch Unit-Tests für Trace, Oracle, Spannbaumvalidierung, Scoring und Mastery V11 geprüft. Zusätzlich gibt es Regressionen für Content-Loader, TrainerRegistry und den neuen Simulatoradapter. Die vollständige Freigabe erfolgt weiterhin über `npm.cmd run verify`.
# Phase 13 Nachtrag

Phase 13 ergänzt Unit-Tests für den Divide-and-Conquer-Solver, das unabhängige Brute-Force-Oracle, Counterexamples, Scoring, Fehlerdiagnose und Mastery V12. Content-Loader- und Simulator-Domain-Tests prüfen den elften Trainer, das vierte ExamPackage und den neuen Aufgabe-7-Adapter. Der E2E-Fluss deckt Start, kanonische Eingabe, Abgabe und Ergebnisanzeige ab.

Fachbeleg: `src-88179ac88dc5`, Seite 7.

# Phase 14 Nachtrag

Phase 14 ergänzt Tests für Diagnose-Itembank, deterministische Auswahl, Scoring, Fehlerklassifikation, Konfidenz, Mastery V13, separaten Diagnose-Content-Loader, IndexedDB-Export/Import von `diagnosticSessions`, den schmalen jsdom-Canvas-Mock und einen Playwright-Fluss über `/diagnose`.

Fachbelege der Diagnose: Asymptotik `src-35405e721f05`, Seiten 9 und 11; Rekurrenzen `src-25d6340b518c`, Seiten 17 und 25; Graphalgorithmen `src-baa07f0a207a`, Seite 846.

# Phase 15 Nachtrag

Phase 15 ergänzt Unit-Tests für Evidenznormalisierung, Prüfungsreife, Wiederholungsqueue, Budgetgrenzen, Snooze/Skip, Fehlerwiederholung und Prüfungsdatumsphasen. Integrations-Tests prüfen den separaten Orchestrator-Content-Loader und IndexedDB-Export/Import von `studyPlans`, `studyPlanSettings` und `reviewSchedules`. Playwright deckt `/lernplan`, Tagesplan, Wochenplan, Einstellungen, Prüfungsreife, Wiederholungen und Reload ab.

Das Deployment-Audit blockiert zusätzlich vollständige Nutzerhistorien, ungültige Orchestrator-Policies und private Testfixtures.

# Phase 16 Nachtrag

Phase 16 ergänzt Tests für Cheat-Sheet-Katalog, Auswahl, deterministisches Packing, zwei A4-Seiten, Serialisierung, Persistenz-Export/-Import, Deployment-Leaks und einen Playwright-Smoke für Erstellung, Vorschau, Druckroute und Reload.

Der echte Screenreader-Gate ist nicht automatisiert erfüllbar und bleibt manuell.
