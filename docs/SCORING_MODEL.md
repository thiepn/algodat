# Scoring-Modell der Grundlagen-Diagnose

Das Scoring ist deterministisch und itemlokal. Es bewertet keine freien Beweise und keine freie Programmausführung.

## Punktmodell

- `single_choice`, `algorithm_selection`, `complexity_classification`: volle Punkte nur bei exakt korrekter Auswahl.
- `multiple_choice`: Teilpunkte nach korrekten und falschen Markierungen.
- `true_false_reason`: Teilpunkte für Wahrheitswert und Begründung.
- `matching`: Anteil korrekt zugeordneter Paare.
- `ordering`: Anteil korrekt positionierter Elemente.
- `numeric_short_answer`: Toleranzprüfung gegen die gespeicherte numerische Lösung.

Das Modell ist in `src/domain/foundations-diagnostic/engine.ts` implementiert und durch `tests/unit/foundations-diagnostic.test.ts` geprüft.

Fachliche Inhalte bleiben quellengebunden: Rekurrenzbewertungen beziehen sich auf `src-25d6340b518c`, Seiten 17 und 25; Proof-Grundlagen auf `src-25d6340b518c`, Seite 11, und `src-35405e721f05`, Seite 12.
