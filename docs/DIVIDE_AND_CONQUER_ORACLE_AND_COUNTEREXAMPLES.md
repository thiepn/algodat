# Divide-and-Conquer Oracle und Gegenbeispiele

Das Produktivsolver-Ergebnis wird für kleine Instanzen gegen ein unabhängiges Oracle geprüft.

- Solver: rekursives Tripel aus Differenz, Minimum, Maximum.
- Oracle: vollständige Enumeration aller Paare `i <= j`.
- Gegenbeispielsuche: feste lexikographische Suche nach Instanzen, bei denen ein Algorithmus ohne Cross-Fall zu wenig liefert.

Beispielrisiko: Wird nur `max(linke Differenz, rechte Differenz)` betrachtet, fehlen Instanzen mit `i` links und `j` rechts.
