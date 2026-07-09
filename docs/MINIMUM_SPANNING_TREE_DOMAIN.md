# Minimum-Spanning-Tree-Domain

Die MST-Domain liegt in `src/domain/graph-tracing/mst.ts`.

Sie stellt bereit:

- Prim-Trace-Erzeugung für kleine public-safe Trainingsgraphen,
- Normalisierung ungerichteter Kanten,
- Spannbaumvalidierung,
- Zyklus- und Zusammenhangsprüfung,
- Gesamtgewichtberechnung,
- exhaustive MST-Enumeration als unabhängiges Oracle für kleine Graphen.

Fachliche Grundlage:

- MST-Definition: `src-baa07f0a207a`, Seiten 929 und 939.
- Kreiseigenschaft: `src-baa07f0a207a`, Seiten 930-932 und 940-941.
- Prim-Schnittsatz: `src-baa07f0a207a`, Seiten 960-964.

Nicht zusammenhängende Graphen erzeugen in Phase 12 keinen produktiven MST. Das Oracle kann `no_spanning_tree` melden; der Trainer nutzt ausschließlich einen zusammenhängenden Graphen.

