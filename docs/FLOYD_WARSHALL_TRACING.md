# Floyd-Warshall Tracing

Der produktive Trainer `trainer-graph-floyd-warshall-v1` trainiert:

- Initialisierung von `D(0)`.
- Iterationen `D(1)` bis `D(4)` in fester Knotenreihenfolge.
- Umgang mit `∞`.
- Rekurrenz und Laufzeit `O(n^3)`.

## Quellen

- Aufgabenformat: `src-8f16b2505bbd`, Seite 4.
- Kontrolllösung mit Matrixfolge: `src-35405e721f05`, Seite 5.
- Reale Klausurrelevanz: `src-c4dde22523d3`, Seite 4.

## Didaktische Entscheidung

Der Trainer verlangt aktive Matrixeingabe statt passiver Animation. Dadurch werden Initialisierung, Zwischenknotenreihenfolge und Zellupdates explizit überprüfbar.
