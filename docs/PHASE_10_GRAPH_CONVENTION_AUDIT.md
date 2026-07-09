# Phase 10 Graph-Konventionsaudit

## Floyd-Warshall

Gate-Status: bestanden.

Belegte Konventionen:

- Gewichteter gerichteter Graph: `src-8f16b2505bbd`, Seite 4.
- Matrixfolge `D(0)` nach Initialisierung und `D(i)` nach Iteration `i`: `src-8f16b2505bbd`, Seite 4.
- Vollständige Beispiellösung mit `D(0)` bis `D(4)`: `src-35405e721f05`, Seite 5.
- Knotenreihenfolge: `1,2,3,4`, ablesbar aus der offiziellen Matrix und den Iterationslabels (`src-35405e721f05`, Seite 5).

Reproduktionsaudit:

- `D(0)` aus `src-35405e721f05`, Seite 5, wurde mit der Rekurrenz `D^{(k)}[i,j] = min(D^{(k-1)}[i,j], D^{(k-1)}[i,k] + D^{(k-1)}[k,j])` in der Reihenfolge `k=1,2,3,4` nachgerechnet.
- Die Matrixfolge stimmt mit der offiziellen Beispiellösung überein.
- Unendlich wird in Eingaben als `∞`, `inf` oder `unendlich` akzeptiert, intern aber als `null` normalisiert.

## Bellman-Ford

Gate-Status: zurückgestellt.

Belegte Quellen existieren, unter anderem `src-88179ac88dc5`, Seite 3, und `src-28fe81380661`, Seite 4. Für den ersten produktiven Graphtrainer bleibt Bellman-Ford zurückgestellt, weil die Rundensemantik, Kantenreihenfolge und Konflikte aus früheren Audits nicht enger belegt sind als Floyd-Warshall.

## Dijkstra

Gate-Status: blockiert.

Reale Aufgaben sind inventarisiert, etwa `src-011d1ee23245`, Seite 4. Die produktive Freigabe bleibt blockiert, weil keine eindeutig verknüpfte vollständige Lösung mit Auswahlregel im lokalen Phase-10-Gate vorliegt und frühere Audits widersprüchliche Tags dokumentieren.

## Prim

Gate-Status: zurückgestellt.

Die 2023er Probeklausur enthält Prim mit Startknoten `a` (`src-8f16b2505bbd`, Seite 3) und die Beispiellösung zeigt die ausgewählten Kanten (`src-35405e721f05`, Seite 3). Für Phase 10 wird Prim nicht gewählt, weil Floyd-Warshall die Zwischenzustände als vollständige Matrixfolge enger maschinenprüfbar liefert.

## BFS und DFS

Gate-Status: zurückgestellt oder blockiert.

DFS 2024 nennt eine alphabetische Tie-Break-Regel (`src-6df30a9ff1ae`, Seite 1), aber im verfügbaren lokalen PDF-Satz fehlt die dazu verknüpfte vollständige Lösung. BFS ist als Übungsthema vorhanden, erfüllt aber für Phase 10 kein stärkeres produktives Gate als Floyd-Warshall.
