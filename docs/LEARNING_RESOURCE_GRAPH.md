# Learning Resource Graph

`data/learning-resource-graph.json` beschreibt, wie zentrale Lernressourcen verbunden sind.

## Knotentypen

- `route`: öffentliche Seiten wie Aufgaben, Themen, Klausuren, Trainer.
- `trainer`: produktive Trainer.
- `diagnostic`: Diagnoseeinstiege.

## Nutzung

Die erste UI-Nutzung erfolgt über `NextLearningActions` und die Aufgaben-/Themenhubs. Der Graph ist bewusst klein gehalten; er dient Navigation und Empfehlung, nicht als fachliche Wissensbasis.

## Validierung

Der Content-Build prüft, dass alle Kanten auf vorhandene Knoten zeigen.
