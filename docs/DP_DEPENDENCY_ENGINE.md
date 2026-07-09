# DP Dependency Engine

Jeder Zustand `G(i,j)` hängt nur von Zuständen der vorherigen Zeile `i-1` ab. Daraus folgt die Bottom-up-Ordnung:

1. Initialisiere Zeile `1`.
2. Berechne Zeilen `2` bis `k`.
3. Innerhalb einer Zeile können die Spalten von links nach rechts berechnet werden, weil keine Abhängigkeit innerhalb derselben Zeile besteht.

Beleg: `src-35405e721f05`, Seiten 11–12.

Die Ausgabedefinition ist `max_{1<=j<=l} G(k,j)`.

