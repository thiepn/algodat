# Performancebericht Phase 3

## Zielwerte

- Einstiegschunk kleiner als 500 kB unkomprimiert.
- Produktionsbundle enthält keine Quell-PDFs.
- Trainer-Erweiterung darf Offlinefähigkeit und PWA-Precache nicht gefährden.

## Gemessene Produktionswerte

`npm run analyze:bundle` nach dem Phase-3-Build:

- Entry-Chunk: 399.374 Byte, gzip 120.322 Byte.
- Gesamtes JavaScript: 953.205 Byte, gzip 252.536 Byte.
- Chunk-Anzahl: 11.
- größter Chunk: `index-BSGrIV5G.js`, 399.374 Byte.
- Trainer-Komponenten-Chunk: 269.838 Byte, gzip 80.217 Byte.
- Trainer-Service-Chunk: 37.304 Byte, gzip 10.788 Byte.
- Entry-Limit: 500.000 Byte.
- Ergebnis: Entry-Chunk innerhalb des Limits.

Der Vite-Build meldete außerdem einen PWA-Precache von 38 Einträgen mit 1228,23 KiB.

## Bekannte Kosten

Der größte Trainer-bezogene Anteil liegt weiterhin in UI-Komponenten und KaTeX/React-nahen Chunks. Der Union-Find-Trainer selbst ist daten- und engine-seitig klein.

## Sicherheitsprüfung

`npm run check:deployment` prüfte 79 Artefakte und fand keine privaten Quellen oder lokalen Pfade.
