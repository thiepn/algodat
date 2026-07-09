# Graph Tracing Linter

Der Linter normalisiert strukturierte Eingaben:

- Zeilen dürfen mit Semikolon oder Zeilenumbruch getrennt werden.
- Einträge dürfen mit Leerzeichen, Komma oder `|` getrennt werden.
- `∞`, `inf`, `infty`, `unendlich` und `oo` werden als unendliche Distanz akzeptiert.
- Andere nicht ganzzahlige Matrixeinträge werden abgelehnt.

## Fehlerfamilien

- `fw_vertex_order_wrong`
- `fw_matrix_parse_error`
- `fw_initial_matrix_wrong`
- `fw_iteration_matrix_wrong`
- `fw_recurrence_missing`
- `fw_runtime_wrong`
- `fw_explanation_missing`

Das Linting ist auf die Matrixanforderung aus `src-8f16b2505bbd`, Seite 4, ausgerichtet.
