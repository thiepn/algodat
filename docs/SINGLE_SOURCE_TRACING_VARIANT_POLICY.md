# Single-Source-Tracing-Variantenpolitik

Produktive Phase-11-Varianten dürfen nur Dijkstra-Instanzen verwenden, wenn alle folgenden Bedingungen erfüllt sind:

- nichtnegative Kantengewichte,
- eindeutige oder explizit geregelte `ExtractMin`-Gleichstände,
- vollständige Distanz- und Vorgänger-Oracle-Spur,
- keine lokalen PDF-Pfade oder privaten Quellenlinks in Produktionsartefakten,
- Quellenreferenzen nur über `sourceId` und Seite.

Die aktuelle Instanz vermeidet Gleichstände. Falls spätere Varianten Gleichstände enthalten, entscheidet die in der Aufgabe angegebene Knotenreihenfolge; diese Regel ist konsistent mit der Zusatzinformation aus `src-baa07f0a207a`, Seite 829, und der alphabetischen Klausurregel aus `src-011d1ee23245`, Seite 4.
