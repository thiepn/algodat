# DP State Model

Kanonischer Zustand des Mine-Trainers:

`G(i,j)` bezeichnet die maximale Erzmenge auf einem gültigen Weg, der in der ersten Reihe beginnt und in `a_ij` endet.

Beleg: `src-35405e721f05`, Seite 11.

Dimensionen:

- Zeile `i` mit `1<=i<=k`.
- Spalte `j` mit `1<=j<=l`.
- Optimierungsrichtung: Maximum.

Unzulässige Zustände mit `j<1` oder `j>l` werden nicht gelesen. Die UI fragt diese Modellentscheidung separat ab, weil Randfälle bei DP-Entwürfen häufige Fehlerquellen sind.

