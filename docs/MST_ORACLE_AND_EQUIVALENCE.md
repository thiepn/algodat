# MST-Oracle und Äquivalenz

Das unabhängige Oracle enumeriert bei kleinen Graphen alle Kantenmengen der Größe `|V|-1` und prüft:

1. alle Knoten abgedeckt,
2. zusammenhängend,
3. azyklisch,
4. Gesamtgewicht minimal.

Statuswerte:

- `ok`: Minimum bestimmt,
- `no_spanning_tree`: kein Spannbaum,
- `not_checked_too_large`: bewusst nicht exhaustiv geprüft.

Die Phase-12-Hauptinstanz ist klein genug für vollständige Enumeration. Mehrere MSTs werden nicht als Fehler behandelt, wenn der Endbaum gültig ist und das Oracle-Minimalgewicht erreicht.

