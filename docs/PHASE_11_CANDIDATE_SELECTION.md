# Phase 11 Kandidatenauswahl: Single-Source-Shortest-Paths

Ausgewählt wurde `trainer-graph-dijkstra-v1` als Fallback-Kandidat. Bellman-Ford wurde zuerst geprüft, aber nicht produktiv umgesetzt.

## Ergebnis

| Kandidat | Ergebnis | Begründung |
|---|---:|---|
| Bellman-Ford-Rundentracing mit Vorgängern und Negativkreisdiagnose | blockiert | Distanzrunden und Negativkreisdiagnose sind belegt; eine eindeutige Bellman-Ford-Konvention für `p[v]` ist in den geprüften offiziellen Quellen nicht belegt. Zusätzlich gibt es bei der 2021er Aufgaben-/Lösungsverknüpfung einen Konflikt. |
| Dijkstra mit Distanzen, Vorgängern und Markierungsreihenfolge | ausgewählt | Vorlesung belegt `ExtractMin`, `DecreaseKey`, `p[v]=u`, Laufzeit und PQ-Semantik; offizielle Lösung belegt das Tabellenformat mit markiertem Knoten. |

## Positive Dijkstra-Quellen

- `src-baa07f0a207a`, Seite 846: Dijkstra-Pseudocode mit `ExtractMin`, `DecreaseKey` und `p[v]=u`.
- `src-baa07f0a207a`, Seite 829: Prioritätenschlange, `ExtractMin`, `DecreaseKey` und Gleichstandsbehandlung über Zusatzinformation.
- `src-baa07f0a207a`, Seiten 848-849: Laufzeit `O((|V|+|E|) log |V|)`.
- `src-1ea0642ec775`, Seite 6: offizielle Dijkstra-Tracing-Tabelle mit neu markiertem Knoten.
- `src-011d1ee23245`, Seite 4: reale Klausuraufgabe zu Dijkstra mit alphabetischer Gleichstandsregel.

## Bellman-Ford-Blocker

- `src-88179ac88dc5`, Seite 3, belegt Bellman-Ford-Distanzrunden und die Erkennung eines negativen Zyklus über eine weitere Distanzänderung.
- `src-baa07f0a207a`, Seiten 869 und 876-877, belegt Bellman-Ford-Distanzrekurrenz und speicheroptimierte Distanzupdates.
- `src-02be45f603ba`, Seite 1, belegt eine offizielle Übungs-Tabelle zur verbesserten Bellman-Ford-Version.
- Nicht belegt ist eine eindeutige Bellman-Ford-Vorgängerregel für den geforderten Phase-11-Primärpfad.
- `src-28fe81380661`, Seite 4, ist als 2021er Bellman-Ford-Aufgabe erfasst; die verknüpfte Lösung `src-39eb3d94f40a`, Seiten 5-6, ist als Dijkstra-Lösung erfasst. Dieser Konflikt wird nicht stillschweigend aufgelöst.

## Konsequenz

Phase 11 implementiert genau einen produktiven Trainer: Dijkstra-Tracing. Bellman-Ford bleibt Kandidat für eine spätere Phase, sobald eine offizielle Vorgänger- und Negativkreis-Konvention vollständig belegt ist.
