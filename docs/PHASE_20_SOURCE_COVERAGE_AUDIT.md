# Phase 20 Source Coverage Audit

Version: `1.0.0-rc.6`  
Datum: 2026-07-10  
Screenreader-Gate: offen

## Ergebnis

Phase 20 ergänzt eine vollständige lokale Abdeckungsübersicht für die bekannte Quellenbibliothek.
Die Reports enthalten ausschließlich sichere Metadaten: Quellen-ID, Dateiname, Dokumenttyp, Jahr,
Blattnummer, Klausur-ID, Aufgabennummern, Themen-/Trainer-/Modulbezüge, Coverage-State und
Crop-Präzisionsklasse.

Nicht enthalten sind PDF-Bytes, Screenshots, Base64-Bilder, absolute lokale Pfade, öffentliche
PDF-Links, Browser-Dateihandles oder extrahierte Aufgaben-/Lösungsvolltexte.

## Artefakte

- `data/source-task-coverage.json`
- `data/source-region-validation-report.json`
- `/dokumente/abdeckung`
- `/dokumente/indexierung/qualitaet`

## Inventar

- Bekannte Quellen: 138
- Indizierte Übungsblätter: 7
- Indizierte Übungsaufgaben: 15
- Indizierte Klausuren/Probeklausuren: 10
- Indizierte Klausuraufgaben: 81
- Statische Aufgabenregionen: 96

Die Zahl der 7 Übungsblätter wird nicht als fachlich vollständiger Übungskanon behauptet. Phase 20
inventarisiert alle bekannten Quelldokumente; zusätzliche Übungs- oder Lösungskopien bleiben als
eigene Quellen sichtbar und werden nicht stillschweigend zu Aufgaben erfunden.

## Coverage-State-Modell

Verwendete Zustände:

- `fully_indexed`
- `pages_mapped_crop_pending`
- `tasks_partially_indexed`
- `solution_mapping_missing`
- `document_unmatched`
- `source_metadata_only`

Aktueller Stand:

- `pages_mapped_crop_pending`: 16
- `document_unmatched`: 19
- `source_metadata_only`: 103
- `fully_indexed`: 0
- `tasks_partially_indexed`: 0
- `solution_mapping_missing`: 0

## Lokale Metadaten-Suche

Die neue Seite `/dokumente/abdeckung` sucht ausschließlich in sicheren Feldern:

- Blattnummer
- Klausurjahr
- Aufgabennummer
- Teilaufgabe, soweit lokal gesetzt
- Thema
- Trainer
- Modul
- Dateiname

Die Suche indiziert keine PDF-Inhalte.
