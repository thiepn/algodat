# Technische Architektur

## Phase-4-Ergänzung

`src/domain/proofs/` ist ein reiner Domainkern für Beweistrainer. Er enthält Ausdrucksparser, Normalisierung, Beweisbewertung, Fehlercodes und Mastery V3. UI und Persistenz rufen diesen Kern über `src/features/trainer/proof-service.ts` auf.

React, TypeScript im Strict-Modus und Vite liefern eine statische, GitHub-Pages-kompatible PWA. Inhalte liegen als validierte, versionierte JSON-Pakete vor; Lernfortschritt liegt lokal in IndexedDB. KaTeX rendert mathematische Notation nur dort, wo sie gebraucht wird.

## Schichten

- `content`: read-only JSON, Zod-Schemas, Loader und Content-Build.
- `domain`: reine, deterministische Fachlogik ohne React oder Browserabhängigkeit.
- `persistence`: IndexedDB-Repositories, Migrationen, Import, Export und Reset.
- `features`: routenbezogene UI-Module.
- `pwa`: Manifest, Service-Worker-Registrierung, Offline-Strategie und Update-Hinweise.

## Phase-7-Architekturentscheidung

Der Klausursimulator ist als eigener Domainkern unter `src/domain/exam-simulator/` umgesetzt. Adapter rufen die vorhandenen Trainer-Scorer auf und skalieren deren interne Punkte exakt rational auf Exam-Punkte. Die UI unter `src/features/simulator/` kennt keine fachlichen Musterlösungen vor Abgabe; sie persistiert Sessions über `exam-simulator-service.ts`.

Historische Profile werden bewusst von startbaren Packages getrennt: `exam-profile-coverage.json` dokumentiert Abdeckung, `exam-packages.json` enthält nur startbare Probeklausuren.

## Phase-3-Architekturentscheidung

Der Trainerbereich ist von einem Einzeltrainer zu einer Registry-Architektur gewachsen. Die UI wählt Renderer und Engine über den Trainer-Eintrag, nicht über harte globale Annahmen. Rucksack-DP und Union-Find teilen Persistenz, Modi, Rubrikdarstellung und Ergebnisansicht, behalten aber getrennte Fachlogik.

## Performance

Themen-, Quellen-, Trainer- und Simulatorseiten werden lazy geladen. Der Entry-Chunk wird per `npm run analyze:bundle` überwacht. In Phase 7 lag der Simulator-Chunk bei 56,94 kB raw und 12,52 kB gzip.

## Risiken

Die wichtigsten Risiken bleiben GitHub-Pages-Basispfad, PWA-Cache-Invalidierung, IndexedDB-Migrationen, deterministisches Scoring, Renderer-Verzweigung und die Trennung von Inhalts- und Fortschrittsversion. Diese Punkte sind durch Integrations- und E2E-Tests abgedeckt, benötigen aber bei jeder neuen Trainerfamilie erneute Prüfung.
# Phase 8 Nachtrag

Die technische Architektur enthält jetzt `src/domain/greedy-design` für Solver, Brute-Force-Oracle, Scoring und Mastery V7 sowie `src/features/trainer/greedy-design-service.ts` für Persistenz und Auswertung. Die UI lädt Greedy-Seiten lazy unter `/trainer/entwurf/greedy`. Der Simulator-Adapter `greedy_design_fitnesspunkte` skaliert 40 interne Punkte auf 8 Exam-Punkte. Quellen: `src-97414623dd81`, Seite 8; `src-8a588d5ddc35`, Seite 8.
## Phase 12 Ergänzung

Prim-MST ist als Erweiterung der bestehenden Graph-Tracing-Schicht implementiert:

- Domain: `src/domain/graph-tracing/mst.ts`
- Scoring: `src/domain/graph-tracing/scoring.ts`
- UI: gemeinsame Graph-Tracing-Seiten
- Adapter: `src/domain/exam-simulator/tasks/registry.ts`

Es gibt kein Backend, keine neue Graphbibliothek und keine neue Persistenzversion.
# Phase 13 Nachtrag

Divide-and-Conquer ist als eigene Domänenschicht implementiert:

- Domain: `src/domain/divide-conquer-design/*`
- Service: `src/features/trainer/divide-conquer-design-service.ts`
- UI: `DivideConquerDesignTrainerPage`, `DivideConquerDesignAttemptPage`, `DivideConquerDesignResultPage`
- Simulatoradapter: `src/domain/exam-simulator/tasks/registry.ts`

Die Implementierung nutzt keine freie LLM-/CAS-Bewertung. Scoring, Oracle, Counterexample und Mastery V12 sind deterministisch.

# Phase 14 Nachtrag

Die Grundlagen-Diagnose ist als eigener Domainkern implementiert:

- Domain: `src/domain/foundations-diagnostic/*`
- Content-Build: `scripts/phase14-diagnostic-content.ts`
- separater Loader: `src/content/loaders/diagnostics.ts`
- UI: `src/features/diagnose/DiagnosticPages.tsx`
- Persistenz: `diagnosticSessions` in IndexedDB-Version 8

Die Itembank wird nicht über den allgemeinen Content-Loader in die App-Shell gezogen. Die Diagnose verwendet keine freie LLM-/CAS-Bewertung. Scoring, Itemauswahl, Fehlerdiagnose, Konfidenz und Mastery V13 sind deterministisch.

# Phase 15 Nachtrag

Der adaptive Lernorchestrator ist als eigener Domainkern implementiert:

- Domain: `src/domain/study-orchestrator/*`
- Service: `src/features/study-plan/study-plan-service.ts`
- UI: `src/features/study-plan/StudyPlanPages.tsx`
- separater Loader: `src/content/loaders/study-orchestrator.ts`
- Persistenz: `studyPlans`, `studyPlanSettings`, `reviewSchedules` in IndexedDB-Version 9

Planung, Prüfungsreife, Wiederholungsintervalle und Empfehlungserklärungen sind deterministisch. Der Lernplan wird route-lazy geladen und zieht keine privaten PDFs, keine vollständigen Nutzerhistorien und keine Source-Audit-Rohdaten in das Deploymentartefakt.

# Phase 16 Nachtrag

Der A4-Spickzettel ist als eigene Domänenschicht implementiert:

- Domain: `src/domain/cheat-sheet/*`
- Loader: `src/content/loaders/cheat-sheet.ts`
- UI: `src/features/cheat-sheet/*`
- Persistenz: `cheatSheets` in IndexedDB-Version 10

Auswahl und Packing sind deterministisch. Der Spickzettel wird lazy geladen und nicht in den allgemeinen Content-Loader aufgenommen.
