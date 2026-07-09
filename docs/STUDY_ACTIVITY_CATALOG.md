# Study Activity Catalog

Der Aktivitätskatalog liegt in `data/study-activity-catalog.json` und wird nach `src/content/generated/study-activity-catalog.json` gebaut.

Produktive Aktivitätstypen:

- `diagnostic_quickcheck`
- `diagnostic_standard`
- `deep_trainer_practice`
- `deep_trainer_exam`
- `targeted_review`
- `error_replay`
- `exam_package`
- `rest_or_buffer`

Jede Aktivität enthält Zielkompetenzen, Mastery-Dimensionen, Klausuraufgaben, optionale Trainer-/Diagnose-/ExamPackage-Referenz, Dauergrenzen, Voraussetzungen, Evidenzanforderung, Abschlussdefinition, Route und `public_safe`-Status.

Beispiele: Rekurrenztraining verweist auf `trainer-rekurrenz-master-fall1-v1` mit Quellen `src-25d6340b518c`, Seiten 17 und 25. Dijkstra-Error-Replay verweist auf `trainer-graph-dijkstra-v1` mit Fachbezug `src-baa07f0a207a`, Seite 846.
