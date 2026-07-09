# Performance Report Phase 6

`npm.cmd run analyze:bundle` meldete:

- Entry: `411901` Bytes, gzip `123101` Bytes.
- Gesamt: `1086101` Bytes, gzip `294033` Bytes.
- Chunk-Anzahl: `23`.
- Entry-Limit: `500000` Bytes.
- Ergebnis: innerhalb des Limits.

Der DP-Trainer ist lazy geladen:

- `DpDesignTrainerPage`: ca. 4.1 kB.
- `DpDesignAttemptPage`: ca. 4.9 kB.
- `DpDesignResultPage`: ca. 2.1 kB.
- `dp-design-service`: ca. 12.9 kB.

