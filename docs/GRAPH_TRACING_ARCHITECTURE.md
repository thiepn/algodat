# Graph Tracing Architecture

Der Graph-Tracing-Pfad besteht aus vier Schichten:

1. Content-Schema und JSON-Artefakte für `trainer-graph-floyd-warshall-v1`.
2. Domain-Oracle in `src/domain/graph-tracing`.
3. Trainer-Service und UI-Seiten unter `/trainer/graphen/floyd-warshall/:trainerId`.
4. Simulatoradapter `floyd_warshall_matrix`.

## Abgrenzung

Phase 10 implementiert genau Floyd-Warshall. Bellman-Ford, Dijkstra, Prim, BFS und DFS bleiben auditiert, aber nicht produktiv verdrahtet.

## Fachliche Grundlage

Die produktive Architektur folgt dem in der offiziellen Aufgabe verlangten Matrix-Tracing mit `D(0)` nach Initialisierung und einer Matrix nach jeder Iteration (`src-8f16b2505bbd`, Seite 4). Die Beispiellösung liefert die Vergleichsform der Matrixfolge (`src-35405e721f05`, Seite 5).
## Phase 12 Ergänzung

Graph-Tracing umfasst nun Floyd-Warshall, Dijkstra und Prim-MST. `prim_mst_trace` verwendet dieselben Trainerseiten, aber eigene strukturierte Felder für Knotenaufnahme, Baumkanten, `key`, `parent`, Gesamtgewicht und sichere-Kante-Begründung.
