# Phase 12 Kandidatenauswahl: MST-Tracing

Ausgewählt wurde `trainer-graph-prim-mst-v1`.

## Ergebnis

| Kandidat | Gate | Begründung |
|---|---:|---|
| Prim-Tracing | bestanden | Offizielle Aufgabe und Beispiellösung sind verknüpft; Vorlesung belegt Prim-Idee, `key`, `parent`, Schnittsatz und Laufzeit. Die produktive Instanz vermeidet Auswahlgleichstände. |
| Kruskal-Tracing | blockiert | Vorlesung belegt Algorithmus und Union-Find-Integration, aber die inventarisierte Probeklausur-Lösung ist als `unofficial_solution_only` klassifiziert. |
| DFS-Tracing | Fallback nicht benötigt | Für 2020 sind Aufgabe und Lösung mit alphabetischer Ordnung belegt, aber Prim erfüllt das MST-Gate. |
| BFS-Tracing | Fallback nicht benötigt | BFS bleibt Fallback; Phase 12 benötigt ihn nicht. |

## Positive Prim-Quellen

- `src-8f16b2505bbd`, Seite 3: Prim-Aufgabe mit ungerichtetem Graphen, Startknoten `a`, Markierung der ausgewählten Kanten und Reihenfolge.
- `src-35405e721f05`, Seite 3: offizielle Beispiellösung zur Prim-Aufgabe.
- `src-97414623dd81`, Seite 5: reale Prim-Prüfungsaufgabe mit Initialisierung über Knoten `a`.
- `src-8a588d5ddc35`, Seite 5: offizielle reale Lösung mit Kantenreihenfolge.
- `src-baa07f0a207a`, Seiten 955-958: Prim-Idee, `Q`, `A`, `key`, `parent`, `Extract-Min`.
- `src-baa07f0a207a`, Seiten 960-965: sichere Kante über Schnittsatz und Laufzeit `O(|E| log |V|)`.

## Kruskal-Blocker

Kruskal ist fachlich gut belegt durch `src-baa07f0a207a`, Seiten 933, 942, 945 und 953-954. Das produktive Gate verlangt aber zusätzlich eine verifizierte vollständige Aufgaben-/Lösungsverknüpfung. Die sichtbaren Kruskal-Lösungseinträge `src-a969dc88f8e9`, Seite 3, und `src-fbf39f80037d`, Seite 3, sind im Inventar als `unofficial_solution_only` geführt. Dieser Blocker wird nicht übergangen.

## Entscheidung

Die Phase implementiert genau einen produktiven MST-Trainer: Prim-Tracing. Die public-safe Instanz ist neu formuliert und enthält keine historischen Originalwerte. Sie besitzt keine Auswahlgleichstände; dadurch wird keine unbelegte Tie-Breaker-Regel erfunden.

