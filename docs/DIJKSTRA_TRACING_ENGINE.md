# Dijkstra-Tracing-Engine

Die Engine `graph-tracing-dijkstra-v1` berechnet eine kanonische Spur:

1. Initialisiere `d[s]=0`, alle anderen Distanzen mit `∞`, alle Vorgänger mit `NIL`.
2. Wähle mit `ExtractMin` den noch nicht schwarzen Knoten mit kleinster Distanz.
3. Relaxiere ausgehende Kanten nur bei strikter Verbesserung `d[u]+w(u,v)<d[v]`.
4. Setze bei Verbesserung `p[v]=u`.
5. Markiere den Knoten als schwarz und schreibe die nächste Tabellenzeile.

Quellen: `src-baa07f0a207a`, Seite 846, für Pseudocode und Vorgänger; `src-baa07f0a207a`, Seiten 848-849, für Laufzeit; `src-1ea0642ec775`, Seite 6, für das Tabellenformat.

Die public-safe Phase-11-Instanz nutzt die Knoten `A, B, C, D, E`, Startknoten `A` und keine Gleichstände in der Markierungsentscheidung.
