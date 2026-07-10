# Performance Report Phase 17

## Maßnahmen

- Die Klausurenbibliothek liegt in `src/features/exam-library/ExamLibraryPages.tsx` und wird über React-Router `lazy` geladen.
- Dashboard, Aufgabenübersicht und AppShell importieren keine PDF-Dateien.
- Die Fragenliste rendert maximal 120 Treffer und fordert engeres Filtern an.
- `src/content/generated/exam-library.json` enthält sichere Metadaten statt Quelltexte oder Scans.

## Gate

Ergebnis nach Performance-Fix:

- Entry-Chunk: `489736` Bytes raw, `141499` Bytes gzip.
- Limit: `500000` Bytes raw.
- `entryWithinLimit`: `true`.
- Exam-Library-Chunk: `459860` Bytes raw, `23470` Bytes gzip.
- `npm.cmd run check:deployment`: 117 Artefakte geprüft, keine privaten Quellen oder lokalen Pfade.

Damit ist das Phase-17-Performance-Gate lokal erfüllt.
