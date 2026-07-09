# Greedy-Design-Trainer-Architektur

## Scope

Der produktive Phase-8-Trainer `trainer-greedy-entwurf-fitnesspunkte-v1` trainiert genau den Greedy-Entwurf zu Aufgabe 7 „Fitnesspunkte“.

## Quellenbindung

- Aufgabenstellung: `src-97414623dd81`, Seite 8.
- Lösungsskizze: `src-8a588d5ddc35`, Seite 8.

## Schichten

- Inhalt: `data/training/greedy-design-trainer-fitnesspunkte.json` und `data/training-rubrics/trainer-greedy-entwurf-fitnesspunkte-v1.json`.
- Schema: `GreedyDesignTrainerSchema`, `GreedyDesignProblemSchema`, `GreedyDesignRubricSchema`.
- Domain: `src/domain/greedy-design`.
- Service/Persistenz: `src/features/trainer/greedy-design-service.ts`.
- UI: Greedy-Übersicht, Versuch und Ergebnis unter `/trainer/entwurf/greedy/:trainerId`.
- Simulator: Adapter `greedy_design_fitnesspunkte` im V2-Paket.

## Persistenz

Es wurde keine Datenbankmigration erzeugt. Die bestehende `PracticeAttempt.answers`-Struktur ist schema-validiert flexibel genug; die Antwort-Payload wird über `answerPayloadSchemaVersion = greedy-design-answer-v1` markiert.
