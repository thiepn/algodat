# Phase 11 Konventionsaudit: Kürzeste Wege ab einer Quelle

## Dijkstra-Konventionen für den produktiven Trainer

| Konvention | Phase-11-Entscheidung | Quelle |
|---|---|---|
| Algorithmus | Dijkstra auf gerichteten Graphen mit nichtnegativen Kantengewichten | `src-baa07f0a207a`, Seite 846 |
| Initialisierung | `d[s]=0`, alle anderen Distanzen `∞`, alle Knoten zunächst weiß | `src-baa07f0a207a`, Seite 846 |
| Auswahl | `ExtractMin(Q)` wählt den Knoten mit kleinster Priorität | `src-baa07f0a207a`, Seite 829 und Seite 846 |
| Relaxation | Bei `d[u]+w(u,v)<d[v]` wird `d[v]` verbessert | `src-baa07f0a207a`, Seite 846 |
| Vorgänger | Bei Verbesserung wird `p[v]=u` gesetzt | `src-baa07f0a207a`, Seite 846 |
| Markierung | Nach der Bearbeitung wird `color[u]=schwarz` gesetzt | `src-baa07f0a207a`, Seite 846 |
| Tabellenformat | Distanzen nach jedem Durchlauf und neu markierter Knoten | `src-1ea0642ec775`, Seite 6 |
| Gleichstand | Zusatzinformation, z. B. Knotennummer; reale Aufgabe nennt alphabetische Reihenfolge | `src-baa07f0a207a`, Seite 829; `src-011d1ee23245`, Seite 4 |
| Laufzeit | `O((|V|+|E|) log |V|)` mit Prioritätenschlange | `src-baa07f0a207a`, Seiten 848-849 |

Die produktive Trainingsinstanz vermeidet ExtractMin-Gleichstände. Die Tie-Policy bleibt trotzdem explizit dokumentiert: Falls eine Variante Gleichstand erzeugt, entscheidet die angegebene Knotenreihenfolge.

## Bellman-Ford-Konventionsstatus

| Konvention | Befund | Quelle |
|---|---|---|
| Runden | Distanzwerte nach Initialisierung und äußeren Durchläufen sind belegt | `src-88179ac88dc5`, Seite 3; `src-02be45f603ba`, Seite 1 |
| Bearbeitungsreihenfolge | Knoten werden in aufsteigender Reihenfolge bearbeitet | `src-28fe81380661`, Seite 4; `src-d233302bcf39`, Seite 4 |
| Verbesserte Version | Speicheroptimierte Distanzupdates über eingehende Kanten sind belegt | `src-baa07f0a207a`, Seiten 876-877 |
| Negativer Zyklus | Weitere Distanzänderung nach zusätzlichem Durchlauf weist einen negativen Zyklus aus | `src-88179ac88dc5`, Seite 3 |
| Vorgänger | Für Bellman-Ford in den geprüften offiziellen Quellen nicht eindeutig belegt | blockierend |

## Quellenkonflikt

Die 2021er Bellman-Ford-Aufgabe `src-28fe81380661`, Seite 4, verweist im Inventar auf `src-39eb3d94f40a`; dort sind die relevanten Seiten 5-6 jedoch als Dijkstra-Lösung klassifiziert. Dieser Konflikt bleibt dokumentiert und wurde nicht zur Bellman-Ford-Freigabe genutzt.
