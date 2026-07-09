# Graph Tracing Scoring Model

Die Rubrik `rubric-trainer-graph-floyd-warshall-v1` vergibt 40 interne Punkte:

| Kriterium | Punkte |
| --- | ---: |
| Knotenreihenfolge | 4 |
| Initialmatrix `D(0)` | 6 |
| Matrix `D(1)` | 5 |
| Matrix `D(2)` | 5 |
| Matrix `D(3)` | 5 |
| Matrix `D(4)` | 5 |
| Rekurrenznotation | 5 |
| Laufzeit und Begründung | 5 |

Die Bewertungsstruktur folgt dem offiziellen Aufgabenformat mit Initialmatrix und Iterationsmatrizen (`src-8f16b2505bbd`, Seite 4). Die vollständige Vergleichsform ist durch `src-35405e721f05`, Seite 5, belegt.

Im Simulator werden 40 interne Punkte linear auf 4 Klausurpunkte abgebildet.
## Phase 12 Ergänzung

Prim-MST-Scoring vergibt 40 Punkte für Startknoten, Knotenfolge, Kantenfolge/Endbaum, `key`-Tabelle, `parent`-Tabelle, Gesamtgewicht sowie sichere-Kante- und Laufzeitbegründung. Ein gültiger alternativer minimaler Endbaum erhält semantische Teilpunkte.
