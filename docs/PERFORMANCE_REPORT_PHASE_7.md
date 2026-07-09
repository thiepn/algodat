# Performance Report Phase 7

## Build-Messung

`npm.cmd run build` ist am 2026-07-08 erfolgreich gelaufen. Vite meldete:

- `dist/assets/index-*.js`: 419,15 kB raw, 125,96 kB gzip.
- `dist/assets/SimulatorPages-*.js`: 56,94 kB raw, 12,52 kB gzip.
- PWA-Precache: 52 Einträge, 1421,41 KiB.

## Bewertung

Der Simulator ist lazy geladen und erhöht den Einstiegschunk nicht direkt durch seine UI. Der größte Chunk bleibt die gemeinsame Trainerkomponenten-Datei.

`npm.cmd run analyze:bundle` bestätigt:

- Entry: 419154 Bytes, gzip 124751 Bytes.
- Gesamt: 1150272 Bytes, gzip 308051 Bytes.
- Chunks: 25.
- Entry-Grenze: 500000 Bytes, eingehalten.

## Offene Beobachtung

Bei weiteren Simulatorpaketen sollte die Adapter-Registry weiter vom UI-Chunk entkoppelt werden, falls der Simulator-Chunk über 100 kB gzip wächst.
