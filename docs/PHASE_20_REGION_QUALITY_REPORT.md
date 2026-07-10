# Archived: local source indexing was removed in 1.0.0-rc.7.

# Phase 20 Region Quality Report

Version: `1.0.0-rc.6`  
Datum: 2026-07-10  
Screenreader-Gate: offen

## Crop-Präzisionsmodell

Phase 20 unterscheidet fünf Klassen:

- `exact_task_crop`
- `exact_subtask_crop`
- `page_section_crop`
- `full_page_fallback`
- `unmapped`

Aktueller statischer Stand:

- Exakte Aufgaben-Crops: 0
- Exakte Teilaufgaben-Crops: 0
- Seitenabschnitt-Crops: 0
- Vollseiten-Fallbacks in der Quellenabdeckung: 30
- Nicht gemappte Quellen: 108
- Statische Aufgabenregionen: 96

Die 96 vorhandenen Aufgabenregionen bleiben bewusst als sichere Seiten- und Vollseiten-Fallbacks
markiert. Sie werden nicht als präzise Aufgaben-Crops bezeichnet.

## Validierung

`data/source-region-validation-report.json` prüft:

- Aufgabe ohne Seitenmapping
- Lösung ohne Quellenmapping
- Crop-Grenzen außerhalb der normalisierten Seite
- Null-Crops
- doppelte Aufgabenregionen
- falschen Dokumenttyp
- ungültige Aufgabennummern
- fehlende Themenzuordnung
- fehlende Lernaktion
- als präzise fehlklassifizierte Vollseiten-Fallbacks
- mehrfach geteilte Vollseiten-Fallbacks

Aktueller Stand:

- Geprüfte Regionen: 96
- Blockierende Fehler: 0
- Warnungen: 9
- Hinweise: 9

Die Warnungen betreffen doppelte statische Aufgaben-/Quellenkombinationen im vorhandenen
Klausurindex. Die Hinweise betreffen Vollseiten-Fallbacks, die lokal präzisiert werden können.

## Indexierungswerkbank

`/dokumente/indexierung` bietet nun:

- dokumentbezogene Aufgabenliste
- vorherige/nächste Aufgabe
- Crop von benachbarter Aufgabe kopieren
- mehrere Teilaufgaben pro Region
- Lösungsregion verknüpfen
- Aufgaben- und Lösungsvorschau nebeneinander
- Tastaturjustage per Pfeiltasten
- Undo/Redo
- Speichern-und-weiter
- Validierungswarnungen
- Fortschrittsstatus
