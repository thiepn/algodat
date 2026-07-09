# Graph Tracing Engine

Die Engine berechnet Floyd-Warshall deterministisch:

1. Initialisiere `D(0)` mit `0` auf der Diagonalen, direkten Kantengewichten und `∞` für nicht erreichbare Paare.
2. Für jeden Zwischenknoten der festen Reihenfolge wird eine neue Matrix erzeugt.
3. Jede Zelle verwendet die Rekurrenz `D^{(k)}[i,j] = min(D^{(k-1)}[i,j], D^{(k-1)}[i,k] + D^{(k-1)}[k,j])`.

Die Matrixfolge `D(0)` bis `D(4)` ist durch die offizielle Aufgabe und Lösung als Aufgabenformat belegt (`src-8f16b2505bbd`, Seite 4; `src-35405e721f05`, Seite 5).
## Phase 12 Ergänzung

Die neue Engine `graph-tracing-prim-mst-v1` berechnet einen deterministischen Prim-Trace für eine strict-public-safe Instanz ohne Auswahlgleichstände. Ein unabhängiges MST-Oracle prüft Endbäume semantisch auf Minimalgewicht.
