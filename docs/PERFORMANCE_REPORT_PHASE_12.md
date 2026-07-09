# Performance Report Phase 12

Phase 12 fügt eine kleine MST-Domain und einen weiteren lazy geladenen Graph-Trainer hinzu.

Performance-Entscheidungen:

- kein externer Graph-Algorithmus-Build,
- exhaustive MST-Enumeration nur für kleine Graphen,
- keine Referenztraces im Simulator-Initialchunk,
- bestehende Lazy-Loading-Struktur bleibt erhalten,
- Entry-Limit bleibt 500000 Byte.

Verifizierte Bundlewerte aus `npm.cmd run verify`:

- Entry-Chunk: `index-D1jt8lMu.js`, 435528 Byte, gzip 127616 Byte.
- Entry-Limit: 500000 Byte; Status: innerhalb des Limits.
- Gesamtbundle: 1358984 Byte, gzip 353715 Byte.
- ChunkCount: 37.
- Größte Chunks: `index-D1jt8lMu.js`, `TrainerComponents-BklZc-bS.js`, `sources-DCoLZ6eH.js`, `SimulatorPages-u3o6v78R.js`, `trainer-service-CElpl9y_.js`.

Der neue Prim-Trainer erhöht die Graph-Tracing-Service-Größe, bleibt aber durch Lazy Loading und Entry-Limit im sicheren Bereich.
