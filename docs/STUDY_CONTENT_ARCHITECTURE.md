# Study Content Architecture

Phase 17 ergänzt eine Lerninhaltsschicht zwischen Quellenkorpus und UI.

## Daten

- `data/study-modules.json`: quellengebundene Lernmodule mit Lernzielen, Kernideen, Beispielen, Fehlerbildern, Tipps, Trainer- und Diagnosebezug.
- `data/task-slot-learning-map.json`: Aufgaben 1–9 als Lernhubs mit Topics, Trainern, Diagnosekompetenzen, Modulen und empfohlener Reihenfolge.
- `data/learning-resource-graph.json`: einfache Route-/Trainer-/Diagnose-Beziehungen für nächste Aktionen.
- `src/content/generated/exam-library.json`: sichere Klausuren- und Fragenmetadaten, erzeugt durch `scripts/build-content.ts`.

## UI

Die UI konsumiert die Daten über `src/content/loaders/study-content.ts`. `NextLearningActions` übersetzt Ressourcen-IDs in konkrete Links. Fachliche Aussagen zeigen Quellen-IDs und Seitenbezüge; private PDF-Pfade werden nicht gerendert.

## Validierung

Der Content-Build bricht ab, wenn:

- nicht genau neun Aufgaben-Hubs existieren,
- ein Aufgaben-Hub keine Aktion besitzt,
- ein Lernmodul nicht `public_safe` ist,
- ein Modul oder Aufgaben-Hub ohne Quellenbezug bleibt,
- der Ressourcen-Graph gebrochene Kanten enthält.
