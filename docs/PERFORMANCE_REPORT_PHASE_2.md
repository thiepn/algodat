# Performance-Bericht Phase 2

## Ergebnis

Phase 2 führt Route- und Daten-Code-Splitting ein. Themen-, Quellen- und Trainerseiten werden lazy geladen. KaTeX wird nur im Trainer-Komponenten-Chunk importiert. Der Produktionsbuild bleibt unter dem gesetzten Entry-Chunk-Limit.

## Gemessene Produktionswerte

Letzter erfolgreicher Build vor der Abschlussverifikation:

- Entry-Chunk: 396.939 Byte, gzip 119.617 Byte
- Gesamtes JavaScript: 919.143 Byte, gzip 243.886 Byte
- Chunk-Anzahl: 11
- größter Chunk: `index`, 396.939 Byte
- Trainer-Komponenten-Chunk einschließlich KaTeX: 265.422 Byte, gzip 79.052 Byte
- PWA-Precache: 38 Einträge, 1194,10 KiB

Der Phase-1-Entry lag bei ungefähr 616 KiB. Der Entry-Chunk wurde damit um ungefähr 219 KiB beziehungsweise 35,6 Prozent reduziert, obwohl Phase 2 einen vollständigen Trainer ergänzt.

## Prüfskript

`npm run analyze:bundle` wertet `dist/assets` aus und schlägt fehl, wenn der Entry-Chunk 500 KiB überschreitet. Das Skript ist Teil von `npm run verify`.

## Offene Optimierung

Der Trainer-Komponenten-Chunk enthält bewusst KaTeX und alle Trainer-Bausteine. Sobald mehrere Trainer existieren, sollte dieser Bereich weiter nach Algorithmusfamilien aufgeteilt werden.
