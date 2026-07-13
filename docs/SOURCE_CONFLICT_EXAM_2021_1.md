# Quellenkonflikt zur Erstklausur 2021

## Befund

Die Datei `src-39eb3d94f40a` und ihre byteidentische Dublette `src-720584558efd` in `dup-exact-9e4ca178d6ef` sind trotz ihres inventarisierten Lösungsnamens keine Lösung zur Klausur `src-28fe81380661`. Die echte Klausur und ihre Dublette `src-0457af7a63f0` gehören zu `dup-exact-503c2fc8ed32` und behandeln Rekurrenz, LatenessScheduling, Bellman-Ford, eine Minimum-Invariante, Minen-DP und Artikulationsknoten. [Klausur: `src-28fe81380661`, S. 2–7]

Der vollständige visuelle Seitenvergleich zeigt stattdessen folgende Inhalte in der vermeintlichen Lösung:

| Seiten | Inhalt der abweichenden Quelle | Erwartete Klausuraufgabe |
| --- | --- | --- |
| 1–2 | zwei andere Rekurrenzvarianten | Rekurrenz des angegebenen Dreiteilungsalgorithmus |
| 3–4 | Rot-Schwarz-Einfügen | LatenessScheduling |
| 5–6 | Dijkstra auf anderen Graphen | Improved Bellman-Ford |
| 7–8 | additive beziehungsweise multiplikative Invarianten | Minimumcode |
| 9–12 | Talent-Show-DP | Minen-DP |
| 13–16 | Laternen-/Strauchprobleme | Artikulationsknoten |

[Abweichende Quelle: `src-39eb3d94f40a`, S. 1–16]

## Entscheidung

Die abweichende Quelle und ihre exakte Dublette in `dup-exact-9e4ca178d6ef` sind mit `mismatched_solution_evidence` ausgeschlossen. Sie erzeugen weder neue Fragen dieser Sammlung noch Lösungsevidenz. Die sechs Lösungen wurden transparent redaktionell hergeleitet. Der Konflikt bleibt in `data/source-conflicts.json` offen dokumentiert und wird nicht durch die Kanonisierung gelöscht.

Die visuelle Prüfung fand lokal statt. Private PDF-Dateien, Renderbilder, Dateipfade und PDF-Verknüpfungen sind keine Produktionsartefakte.
