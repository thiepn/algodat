# Performance Report Phase 15

`npm.cmd run verify` wurde nach der Implementierung vollständig ausgeführt. Der Build- und Bundle-Analyse-Abschnitt lieferte folgende Werte.

Gemessene Werte:

- Entry: `index-C53RS7LD.js`, 458648 Bytes raw, 133606 Bytes gzip.
- Hartes Entry-Limit: 500000 Bytes, eingehalten.
- Weiches Entry-Ziel: 455000 Bytes, knapp überschritten.
- Lernplan-Hauptchunk: `StudyPlanPages-Cuoi60Vi.js`, 41.95 kB raw, 11.09 kB gzip.

Bewertung: Die Orchestrator-Produktfamilie ist route-lazy. Der Entry-Zuwachs entsteht vor allem durch zusätzliche Route-Definitionen und gemeinsame kleine Typ-/Style-Anteile. Der Lernplan-Chunk bleibt deutlich unter dem 70-kB-Ziel. Keine Chartbibliothek, keine Datumsbibliothek und kein externer Client wurden hinzugefügt.
