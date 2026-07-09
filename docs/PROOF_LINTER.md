# Beweis-Linter

Der Übungsmodus zeigt einen einfachen Formellinter für zentrale Felder:

- Behauptungsformel,
- Invariantenformel,
- Rückgabewert nach Terminierung.

Im Prüfungsmodus bleibt dieser Vorabhinweis deaktiviert. Die Abgabe wird erst danach deterministisch bewertet.

Typische erkannte Fehler:

- `off_by_one_error`: Summe bis `i` statt bis `i-1`.
- `invariant_timing_error`: Invariante nach statt vor der Iteration.
- `expression_parse_error`: Formel außerhalb der Grammatik.
- `return_value_connection_error`: Rückgabezeile nicht mit Invariante verbunden.

Beleg: `src-25d6340b518c`, Seiten 11–12; `src-baa07f0a207a`, Seiten 132–135.

