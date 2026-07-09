# Rekurrenz-Beweislinter

Stand: 2026-07-07

Der Linter prüft strukturierte Felder, keine freien Beweisaufsätze. Fehlerklassen sind unter anderem `parameter_error`, `master_case_error`, `recursion_tree_error`, `induction_hypothesis_error`, `algebra_error` und `conclusion_error`.

Quellenbasis: `src-25d6340b518c`, Seiten 17-18, für die kanonischen Beweisschritte; `src-baa07f0a207a`, Seiten 230-238, für induktive Laufzeitbeweisform.

Der Linter empfiehlt deterministisch eine Wiederholung: Master-Fall, Induktionsschritt oder Parameter.
