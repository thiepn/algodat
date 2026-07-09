# Divide-and-Conquer-Domain

Die Phase-13-Domain ist absichtlich spezialisiert. Sie modelliert nur `max_value_difference_divide_conquer`.

Kanonischer Rückgabewert pro Teilfeld:

1. maximale gerichtete Differenz,
2. kleinster Wert,
3. größter Wert.

Der Solver steht in `src/domain/divide-conquer-design/max-difference.ts`. Das Oracle ist unabhängig: Es enumeriert alle Paare `i <= j` und vergleicht den besten Wert.
