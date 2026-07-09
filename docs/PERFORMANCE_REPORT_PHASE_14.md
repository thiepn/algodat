# Performance Report Phase 14

## Maßnahmen

- Diagnose-Seiten werden als eigene Feature-Routen geladen.
- Die Itembank liegt in `src/content/loaders/diagnostics.ts` und nicht im allgemeinen Content-Loader.
- Der Produktionsbuild wird weiterhin über `npm run analyze:bundle` geprüft.

## Erwartung

Die 64 Items sind klein genug für einen eigenen Diagnose-Chunk. Sie sollen nicht den allgemeinen App-Einstieg dominieren.

## Validierungsstand

`npm.cmd run verify` wurde erfolgreich ausgeführt. Der Bundle-Report meldet:

- Entry: 449374 Bytes, 131050 Bytes gzip.
- Gesamtbundle: 1596676 Bytes, 387314 Bytes gzip.
- Chunk-Anzahl: 42.
- Entry-Limit: 500000 Bytes, eingehalten.
- Diagnose-Chunk: `DiagnosticPages-D-A8bAIo.js`, 176400 Bytes, 18420 Bytes gzip.

Fachliche Quellenbeispiele der Itembank: Asymptotik `src-35405e721f05`, Seiten 9 und 11; Rekurrenzen `src-25d6340b518c`, Seiten 17 und 25.
