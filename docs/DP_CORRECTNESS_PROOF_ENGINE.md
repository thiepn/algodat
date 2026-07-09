# DP Correctness Proof Engine

Der Korrektheitsbeweis folgt der Beispiellösung:

- Behauptung: `G(i,j)` enthält den optimalen Wert für Wege nach `a_ij`.
- Induktionsanfang: Zeile `1`.
- Induktionsschritt: Für `(i+1,j)` sind genau die zulässigen Vorgänger aus der vorherigen Zeile relevant.
- Schluss: Das Maximum in Zeile `k` ist die beste Endposition.

Beleg: `src-35405e721f05`, Seite 12.

Die Engine bewertet keine freien Beweisideen. Sie prüft, ob die strukturierten Abschnitte den belegten Pflichtbausteinen entsprechen.

