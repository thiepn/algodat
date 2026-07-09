# Prim-Tracing-Engine

Die Engine `graph-tracing-prim-mst-v1` implementiert die Vorlesungsvariante von Prim:

- `key[start]=0`, alle anderen `key=∞`,
- alle `parent=NIL`,
- wiederholtes `Extract-Min` über den kleinsten key,
- Update von `key[v]` und `parent[v]`, wenn eine betrachtete Kante leichter ist,
- Aufnahme der parent-Kante als Baumkante beim finalen Herausnehmen eines Nicht-Startknotens.

Quellen:

- Algorithmusidee: `src-baa07f0a207a`, Seiten 955-956.
- key-/parent-Variante: `src-baa07f0a207a`, Seite 958.
- Korrektheit über Schnittsatz: `src-baa07f0a207a`, Seiten 960-964.
- Laufzeit: `src-baa07f0a207a`, Seite 965.

Die produktive Instanz vermeidet Gleichstände und verwendet daher keine unbelegte Tie-Breaker-Regel.

