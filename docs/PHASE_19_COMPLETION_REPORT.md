# Phase 19 Completion Report – lokale Originalquellenbibliothek

Version: `1.0.0-rc.5`  
Datum: 2026-07-10  
Screenreader-Gate: offen

## Ergebnis

Phase 19 ergänzt eine lokale, privacy-sichere Aufgabenbibliothek:

- `/uebungen`
- `/uebungen/:sheetId`
- `/uebungen/:sheetId/aufgabe/:taskId`
- `/klausuren/:examId/original`
- `/klausuren/:examId/aufgabe/:taskId/original`
- `/dokumente/indexierung`
- `/dokumente/zuordnungen`

## Indexzahlen

- Indizierte Übungsblätter: 7
- Indizierte Übungsaufgaben: 15
- Indizierte Klausuren/Probeklausuren: 10
- Indizierte Klausuraufgaben: 81
- Crop-Mappings: 96
- Lösungsmappings: 96
- Gesamtregionen: 96

Öffentlich ausgeliefert werden ausschließlich sichere Metadaten: Quellen-IDs, Dateinamen,
Seitenzahlen, normalisierte Crop-Koordinaten, Aufgaben-/Themen-/Trainer-Zuordnungen. PDF-Bytes,
Screenshots, Base64-Bilder, vollständige Aufgaben- oder Lösungstexte und Browser-Dateihandles
werden nicht veröffentlicht.

## Lokaler Speicher

- Backend: IndexedDB `algodat-study-system`, Schema-Version 12.
- PDF-Bytes: `localDocuments.bytes`, nur im Browser.
- Aufgabenregionen: `localTaskRegions`, nur Metadaten und normalisierte Koordinaten.
- OPFS wird nicht vorausgesetzt; `storageBackend` markiert aktuell `indexeddb_arraybuffer`.

## Matching

Automatische Zuordnung unterstützt:

1. SHA-256 gegen bereits lokal verbundene Dokumente,
2. exakten Dateinamen,
3. normalisierten Dateinamen,
4. Größen-/Dateinamen-Heuristik als wahrscheinlichen Treffer,
5. manuelle Auswahl mit Bestätigung.

Unsichere Treffer werden nicht stillschweigend gebunden.

## Lokaler Viewer

Der PDF-Renderer wird lazy geladen. Er bietet Seitenwahl, Vor/Zurück, Zoom, Fit-Width,
Rotation, Crop-Overlay, nativen PDF-Fallback, lokales Drucken und optionale Lösungsseite
daneben. Für viele importierte Altregionen ist der sichere Startzustand eine Vollseitenregion;
präzise Ausschnitte können lokal über `/dokumente/indexierung` nachgeführt werden.

## Audit

Der Deployment-Audit blockiert:

- `.pdf`,
- nicht freigegebene Bilddateien,
- Base64-Bildpayloads,
- öffentliche PDF-Links,
- lokale Pfade,
- Precache privater Quellen,
- Screenshot-/Volltext-Artefakte,
- Dateihandle-Leaks.

## Validierung

- `npm.cmd run verify`: bestanden.
- Unit/Vitest: 35 Dateien, 215 Tests.
- Playwright: 52 Tests.
- Deployment-Audit: 130 Artefakte geprüft, keine privaten Quellen oder lokalen Pfade.
- Bundle: Entry 485629 Bytes raw / 139625 Bytes gzip; Total 2139884 Bytes raw / 480723 Bytes gzip.
