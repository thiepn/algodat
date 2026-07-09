# Rekurrenztrainer-Architektur

Stand: 2026-07-07

Der Phase-5-Trainer ist ein strukturierter Laufzeitbeweis-Trainer für `T(n)=8T(n/2)+n^3`, `T(1)=1`, Domäne `n` Zweierpotenz. Die Aufgabe und die geschlossene Form stammen aus `src-25d6340b518c`, Seiten 17-18; die Master-Theorem-Einordnung wird zusätzlich durch `src-25d6340b518c`, Seiten 25-26, und die Vorlesungsform `T(n)=aT(n/b)+f(n)` durch `src-baa07f0a207a`, Seiten 194-198, abgesichert.

Architekturgrenzen:

- Content: `data/training/recurrence-trainer-master-fall1.json` und `data/training-rubrics/trainer-rekurrenz-master-fall1-v1.json`.
- Domain: `src/domain/recurrences/*` mit Parser, Master-Theorem-Auswertung, Rekursionsbaum und Beweisbewertung.
- UI: `/trainer/rekurrenzen/:trainerId`, `/versuch/:attemptId`, `/auswertung/:attemptId`.
- Persistenz: bestehender `PracticeAttempt` mit `answerPayloadSchemaVersion="recurrence-answer-v1"` und IndexedDB-Version 5.

Nicht umgesetzt: freie CAS-/LLM-Bewertung. Das ist absichtlich ausgeschlossen, weil die Phase nur offiziell belegte Bausteine deterministisch bewerten darf.
# Phase 13 Bezug

Der Divide-and-Conquer-Trainer integriert Rekurrenzbewertung nur für die belegte Form `T(n) <= 2T(n/2)+c` und die abgeleitete Laufzeit `O(n)`. Freie Master-Theorem-Generalisierungen werden hier nicht erfunden. Fachbeleg: `src-88179ac88dc5`, Seite 7.
