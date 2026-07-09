# Graph Tracing Variant Policy

Phase 10 enthält genau eine produktive Floyd-Warshall-Variante.

## Erlaubt

- Neue public-safe Graphinstanzen mit eigener Kantenliste.
- Dieselbe feste Knotenreihenfolge als explizites Feld.
- Deterministische Oracle-Prüfung gegen die Floyd-Warshall-Rekurrenz.

## Nicht erlaubt

- Übernahme historischer Aufgabenwerte.
- Aufgaben ohne explizite Knotenreihenfolge.
- Graphen mit negativem Kreis, solange der Trainer keine Negativkreisdiagnose verlangt.
- Weitere Graphalgorithmus-Familien innerhalb Phase 10.

Die Variantenpolitik bleibt an das Matrix-Tracing-Format aus `src-8f16b2505bbd`, Seite 4, gebunden.
