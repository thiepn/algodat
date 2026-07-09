# Phase 5 Implementierungsplan

## Ist-Zustand

Phase 4 liefert drei produktive Trainer: Rucksack-DP, Union-Find mit Listen und einen Schleifeninvarianten-Beweistrainer. Content wird über Zod-Schemas gebaut, `PracticeAttempt` liegt in IndexedDB Version 4, Trainer werden über eine Registry exponiert, und `npm.cmd run verify` war in Phase 4 grün.

## Wiederverwendbare Module

- Trainer-Registry und Routenmuster aus `src/features/trainer`.
- Rubrik-, Fehler- und Mastery-Persistenz aus `src/persistence`.
- Proof-Architektur aus `src/domain/proofs` als Muster für strukturierte Beweise.
- Quellenpanel, Moduswahl, Rubrik- und Fehlerdarstellung aus `TrainerComponents`.

## Neuer Umfang

Genau ein produktiver Rekurrenztrainer wird gebaut:

- `trainer-rekurrenz-master-fall1-v1`
- Rekurrenz: `T(n)=8T(n/2)+n^3`, `T(1)=1`
- Domäne: `n` ist Zweierpotenz
- Master-Fall: Fall 1 der kursinternen Fassung
- geschlossene Form: `(log_2(n)+1)n^3`
- asymptotische Schranke: `O(n^3 log n)`

## Neue Module

- `src/domain/recurrences/*`
- `src/features/trainer/recurrence-service.ts`
- `src/features/trainer/RecurrenceTrainerPage.tsx`
- `src/features/trainer/RecurrenceAttemptPage.tsx`
- `src/features/trainer/RecurrenceResultPage.tsx`
- neue Content-Schemas für Rekurrenztrainer, Problem, Rubrik und Varianten.

## Migration

IndexedDB wird auf Version 5 erhöht. Es sind keine neuen Stores nötig; `PracticeAttempt` erhält nur neue optionale Versionen/Trainer-Metadaten und einen neuen Modus `learn`.

## Risiken

- Probeklausur-Lösung zu `16T(n/4)+n^3` ist offiziell, aber lokal nicht sauber genug extrahiert. Sie wird deshalb nicht Golden Truth.
- Der neue Trainer bleibt bewusst auf eine belegte Familie beschränkt.
- Keine allgemeine CAS- oder Freitextbewertung.

## Teststrategie

Neue Tests für:

- Rekurrenzparser,
- Master-Theorem-Fallauswahl,
- Rekursionsbaum,
- kanonischen Induktionsbeweis,
- Fehlercodes,
- Scoring,
- Persistenz,
- Content-Referenzen,
- E2E-Fluss Desktop/Mobil.

## Nichtziele

Kein zweiter Rekurrenztrainer, keine beliebigen Rekurrenzen, kein Backend, kein LLM-Scoring, keine globale Git-Konfiguration.

