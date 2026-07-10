# Performance Report Phase 20.1

Version: `1.0.0-rc.7`  
Datum: 2026-07-10

Phase 20.1 entfernt den lokalen PDF-Renderer, Crop-Overlay-Styles, die Indexierungswerkbank und
die lokalen Dokumentseiten. Dadurch werden Browser-PDF-Rendering, ArrayBuffer-Verarbeitung,
Side-by-side-Ansichten und Crop-Interaktionen nicht mehr in Lazy-Routen ausgeliefert.

Der finale Bundle-Gate bleibt unverändert:

- `npm run analyze:bundle`
- `npm run check:deployment`
- `npm run verify`

