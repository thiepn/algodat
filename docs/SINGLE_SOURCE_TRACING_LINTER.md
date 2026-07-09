# Single-Source-Tracing-Linter

Der Phase-11-Linter ist im Scoring eingebettet und prüft Dijkstra-Antworten deterministisch.

## Prüfungen

- Startknoten entspricht der Aufgabe.
- Markierungsreihenfolge entspricht der `ExtractMin`-Spur.
- Distanztabelle entspricht der kanonischen Spur nach jedem Durchlauf.
- Vorgängertabelle aktualisiert `p[v]` nur bei strikter Verbesserung.
- Relaxationslog nennt alle verbessernden Kanten.
- Laufzeit enthält `O((|V|+|E|) log |V|)`.

Quelle für `p[v]`, `ExtractMin` und `DecreaseKey`: `src-baa07f0a207a`, Seite 846. Quelle für das Tabellenformat: `src-1ea0642ec775`, Seite 6.
