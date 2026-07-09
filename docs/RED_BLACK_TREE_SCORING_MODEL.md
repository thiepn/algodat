# Rot-Schwarz-Scoring-Modell

## Rubrik

Die Rubrik `rubric-trainer-rot-schwarz-einfuegen-v1` vergibt 40 interne Punkte:

- NIL-Konvention: 4 Punkte.
- Einfügefolge: 4 Punkte.
- Reparaturfälle: 10 Punkte.
- Endbaum: 10 Punkte.
- Schwarzhöhe: 4 Punkte.
- Laufzeit: 4 Punkte.
- Invariantenbegründung: 4 Punkte.

Im Simulator werden 40 interne Punkte exakt rational auf 8 Exam-Punkte skaliert.

## Fehlercodes

- `rb_nil_missing`
- `rb_sequence_wrong`
- `rb_case_missing`
- `rb_final_tree_wrong`
- `rb_black_height_wrong`
- `rb_runtime_wrong`
- `rb_explanation_missing`

Die fachlichen Kriterien sind durch `src-5c9eadb17ccc`, Seiten 5, 7, 15, 20 und 36 belegt.
