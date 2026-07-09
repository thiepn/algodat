# Beweistrainer-Architektur

Phase 4 ergänzt die bestehende Trainer-Registry um `trainerKind: "proof"`.

Aktive Komponenten:

- Content: `data/training/proof-trainer-schleifeninvariante-summe.json`
- Rubrik: `data/training-rubrics/trainer-schleifeninvariante-summe-v1.json`
- Domainkern: `src/domain/proofs/*`
- Service/Persistenz: `src/features/trainer/proof-service.ts`
- UI-Routen: `/trainer/beweise/:trainerId`, `/versuch/:attemptId`, `/auswertung/:attemptId`

Der Beweistrainer ist kein Tracing-Sonderfall. Er nutzt eigene Antwortstruktur, eigene Engine-Version `proof-loop-invariant-v1`, eigenes Scoring `loop-invariant-scoring-v1` und Mastery V3.

Quellenbasis: `src-25d6340b518c`, Seiten 11–12; `src-baa07f0a207a`, Seiten 132–135 und 140.
# Phase 13 Bezug

Der Divide-and-Conquer-Trainer nutzt keinen freien Beweisparser. Der Beweisanteil wird als strukturierte Induktions- und Fallunterscheidungsantwort bewertet: Induktionsgröße, Basisfall, linke/rechte/cross-Fälle und Bezug auf das Rückgabetripel. Fachbeleg: `src-88179ac88dc5`, Seite 7.

