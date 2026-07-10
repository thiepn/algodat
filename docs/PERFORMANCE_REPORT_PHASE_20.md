# Archived: local source indexing was removed in 1.0.0-rc.7.

# Performance Report Phase 20

Version: `1.0.0-rc.6`  
Datum: 2026-07-10

## Build-Ergebnis

Finaler Produktionsbuild aus `npm.cmd run verify`:

- Entry-Chunk: `index-Paixgd5B.js`
- Entry raw: 486.130 Bytes
- Entry gzip: 139.667 Bytes
- Gesamt raw: 2.161.150 Bytes
- Gesamt gzip: 485.750 Bytes
- Chunk-Anzahl: 62
- 500-kB-Warnschwelle: nicht erreicht
- 1-MB-Warnschwelle: nicht erreicht
- 5-MB-Notfallgrenze: eingehalten

## Einordnung

Phase 20 ergänzt Dokumentabdeckung, Regionenqualität, lokale Metadaten-Suche und die
Indexierungswerkbank. Der initiale Entry-Chunk bleibt trotz zusätzlicher UI und Validatorlogik unter
der bestehenden 500-kB-Warnschwelle.

Der lokale PDF-Renderer bleibt lazy geladen und wird nicht in den initialen Entry-Chunk gezogen.
