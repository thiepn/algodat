# Graph Domain Model

Phase 10 führt ein enges Graph-Domainmodell für Matrix-Tracing ein.

## Modell

- `GraphTracingProblem` beschreibt genau einen gewichteten gerichteten Graphen für Floyd-Warshall.
- `vertices` und `vertexOrder` sind getrennt gespeichert, damit die sichtbare Knotenmenge und die Iterationsreihenfolge prüfbar bleiben.
- `edges` enthält gerichtete Kanten mit ganzzahligen Gewichten.
- Nicht erreichbare Distanzen werden intern als `null` gespeichert und sichtbar als `∞` gerendert.

## Fachliche Quellenbindung

Die verwendete Konvention „gerichteter gewichteter Graph plus Matrizen `D(0)` bis `D(4)`“ ist belegt durch `src-8f16b2505bbd`, Seite 4. Die vollständige Matrixfolge als Kontrolllösung ist belegt durch `src-35405e721f05`, Seite 5.

## Public-Safety

Das produktive Trainingsproblem ist neu formuliert und enthält keine historischen Aufgabenwerte. Es speichert nur Source-IDs und Seitenzahlen, keine PDF-Links und keine lokalen Pfade.
## Phase 12 Ergänzung

Für minimale Spannbäume wird kein neues Graphmodell eingeführt. Die Prim-Instanz nutzt die vorhandenen gewichteten Kantenobjekte, interpretiert sie aber als ungerichtet. Die Normalisierung ungerichteter Kanten erfolgt in `src/domain/graph-tracing/mst.ts`.
