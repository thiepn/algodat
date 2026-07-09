# Phase 10 Kandidatenauswahl

## Entscheidung

Ausgewählt wurde Floyd-Warshall Matrix-Tracing mit Trainer-ID `trainer-graph-floyd-warshall-v1`.

Die Auswahl stützt sich auf:

- Offizielle Aufgabe: `src-8f16b2505bbd`, Seite 4.
- Offizielle Beispiellösung: `src-35405e721f05`, Seite 5.
- Reale Klausurrelevanz ohne verwendete Musterlösung: `src-c4dde22523d3`, Seite 4.

## Ranking

| Rang | Kandidat | Gate | Kurzbegründung |
| --- | --- | --- | --- |
| 1 | Floyd-Warshall Matrix-Tracing | bestanden | Vollständige offizielle Matrixfolge vorhanden; Iterationsreihenfolge `1,2,3,4` eindeutig. |
| 2 | Bellman-Ford Runden-Tracing | zurückgestellt | Mehrere offizielle Treffer, aber die belastbare produktive Konvention braucht Kanten-/Knotenreihenfolge und Konfliktbereinigung. |
| 3 | Prim-Tracing | zurückgestellt | Offizielle Aufgaben und Lösungen vorhanden; Gleichstände und Auswahlreihenfolge sind für einen ersten Graphtrainer weniger eng prüfbar als Floyd-Warshall. |
| 4 | DFS-Tracing | zurückgestellt | DFS 2024 nennt eine alphabetische Tie-Break-Regel, aber keine verknüpfte vollständige Lösung im verfügbaren lokalen PDF-Satz. |
| 5 | Dijkstra-Tracing | blockiert | Reale Aufgaben sind belegt, aber frühere Audits dokumentieren fehlende oder widersprüchliche Lösungslage. |
| 6 | BFS-Tracing | blockiert | Übungsquellen sind vorhanden, aber keine passend verknüpfte produktive Klausur-/Lösungsbasis im Phase-10-Gate. |

## Präferenzregel

Die im Auftrag genannte Präferenz Floyd-Warshall > Bellman-Ford > Dijkstra > Prim > BFS > DFS wurde nur als Gleichstandsregel verwendet. Floyd-Warshall gewinnt nicht wegen Präferenz, sondern wegen der vollständigsten prüfbaren Matrixlösung.

## Public-Safety-Entscheidung

Der Trainer verwendet keine historischen Aufgabenwerte und keinen PDF-Ausschnitt. Die produktive Instanz ist neu formuliert und verweist nur auf Source-IDs und Seitenzahlen.
