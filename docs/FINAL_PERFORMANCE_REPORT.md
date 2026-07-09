# Final Performance Report

## Ziel

Hard Limit: Entry < 500000 Byte. Release-Ziel: Entry ≤ 450000 Byte.

## Gemessener Stand für `1.0.0-rc.2`

Gemessen mit `npm.cmd run verify` am 2026-07-09:

- Entry: `index-vxkKtK4G.js`, 463041 Byte raw, 134602 Byte gzip.
- Gesamt-JavaScript/CSS-Audit: 1684618 Byte raw, 410975 Byte gzip.
- Chunk-Anzahl: 44.
- Größter Chunk: `index-vxkKtK4G.js`, 463041 Byte raw.
- Hard Limit: bestanden (`entryWithinLimit: true`, Grenze 500000 Byte).
- Release-Ziel ≤ 450000 Byte: knapp verfehlt; dokumentierte RC-Einschränkung.

Der Spickzettel bleibt route-lazy (`CheatSheetPages-*`, 31870 Byte raw, 8830 Byte gzip im vorangegangenen Build-Protokoll) und lädt seine Inhaltsdaten über `src/content/loaders/cheat-sheet.ts`, damit die neue Funktion nicht in den primären Content-Einstieg gezwungen wird.

## Bewertung

Der harte Produktionsgrenzwert ist eingehalten. Das weichere Ziel von 450000 Byte sollte vor einem späteren `1.0.1` durch weiteres Code-Splitting im App-Einstieg oder bei gemeinsam genutzten Trainer-Komponenten nachgezogen werden.
