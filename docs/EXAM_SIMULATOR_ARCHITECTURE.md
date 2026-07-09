# Klausursimulator-Architektur

## Zweck

Phase 7 ergänzt einen lokalen Klausursimulator unter `/simulator`. Startbar ist genau `exam-package-kernkompetenz-v1`. Historische Profile werden nur als Coverage-Ansicht angezeigt, solange Slots ohne verifizierten Trainer fehlen.

## Schichten

- Content: `data/exam-packages/kernkompetenz-probeklausur-v1.json`, `data/exam-profile-coverage.json` und die generierten Dateien `exam-packages.json`, `exam-task-instances.json`, `exam-scoring-policies.json`.
- Schemas: `src/content/schemas/content.ts` validiert Packages, Tasks, Profile, Sessions, Snapshots und Ergebnisse.
- Domainkern: `src/domain/exam-simulator/` enthält Paketvalidierung, Session-Lifecycle, Timer, Recovery, Adapter, exakte Punkte, Scoring und Berichtserzeugung.
- Feature-Service: `src/features/simulator/exam-simulator-service.ts` verbindet Domainkern und IndexedDB.
- UI: `src/features/simulator/SimulatorPages.tsx` stellt Dashboard, Profilabdeckung, Paketdetail, Briefing, Prüfungssitzung, Übersicht und Ergebnis dar.
- Persistenz: IndexedDB-Version 7 ergänzt `examSessions`, `examSnapshots` und `examResults`.

## Quellen- und Statuspolitik

Die Simulatoraufgaben übernehmen keine historischen Originalaufgaben. Sie verwenden die freigegebenen Trainerfamilien:

- Rucksack-DP: `src-25d6340b518c`, Seiten 33-34; `src-baa07f0a207a`, ab Seite 390.
- Union-Find: `src-8f16b2505bbd`, Seite 6; `src-35405e721f05`, Seite 6; `src-baa07f0a207a`, Seiten 943, 946, 948, 949, 950-951.
- Schleifeninvariante: `src-25d6340b518c`, Seiten 11-12; `src-baa07f0a207a`, Seiten 132-135 und 140.
- Rekurrenz: `src-25d6340b518c`, Seiten 17-18 und 25-26; `src-baa07f0a207a`, Seiten 194-198 und 230-238.
- DP-Entwurf Mine: `src-8f16b2505bbd`, Seite 10; `src-35405e721f05`, Seiten 11-12.

## Startbarkeit

`data/exam-profile-coverage.json` markiert alle historischen Profile als nicht startbar. Nur das generierte Kernkompetenz-Package ist `fullyAutoGradable: true`, `publicDistributionStatus: public_safe` und `historicalExam: false`.
