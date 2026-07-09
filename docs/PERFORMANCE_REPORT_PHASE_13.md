# Performance Report Phase 13

Phase 13 fügt eine kleine D&C-Domain, vier JSON-Dateien und drei lazy geladene Seiten hinzu.

Performance-Entscheidungen:

- kein externes Algorithmuspaket,
- Brute-Force-Oracle nur für kleine Instanzen,
- keine kanonischen Lösungen im Simulator-Initialchunk,
- bestehende Lazy-Loading-Struktur bleibt erhalten,
- Entry-Limit bleibt 500000 Byte.

Zuletzt gemessene Bundlewerte aus der Schlussvalidierung:

- Entry: `439932` Byte, gzip `128424` Byte, Limit `500000` Byte.
- Gesamt: `1410777` Byte, gzip `366522` Byte.
- Chunk-Anzahl: `41`.
- D&C-Trainerseite: `4033` Byte, gzip `1608` Byte.
- D&C-Antwortseite: `4473` Byte, gzip `1900` Byte.
- D&C-Servicechunk: `10623` Byte, gzip `3868` Byte.

Die neue Phase bleibt damit innerhalb des bestehenden Entry-Limits.
