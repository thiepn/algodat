# Performance Report Phase 19

Version: `1.0.0-rc.5`

Die Bundle-Policy aus Phase 18 bleibt gültig:

- 500 kB Einstiegschunk: Informationswarnung,
- 1 MB Einstiegschunk: stärkere Warnung,
- 5 MB Einstiegschunk: harte Abbruchgrenze.

Der lokale PDF-Renderer liegt in einer lazy Route und wird nicht in den initialen Entry-Chunk
gezogen. PDF-Dateien werden nicht gebundelt und nicht vom Service Worker precached.

Gemessene Werte im Release-Lauf:

- Entry: 485629 Bytes raw / 139625 Bytes gzip.
- Total: 2139884 Bytes raw / 480723 Bytes gzip.
- `warning500k`: false.
- `warning1MB`: false.
- `withinEmergencyLimit`: true.
- Lazy PDF-Renderer-Chunk: `local-pdf-renderer`, 3748 Bytes raw / 1543 Bytes gzip.
