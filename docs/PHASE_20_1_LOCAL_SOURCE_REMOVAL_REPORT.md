# Phase 20.1 Local Source Removal Report

Version: `1.0.0-rc.7`  
Datum: 2026-07-10  
Screenreader-Gate: offen

## Ergebnis

Die lokale Dokumentbibliothek, lokale PDF-Verknüpfungen, Crop-/Regionenbearbeitung,
Originalseiten-Viewer und die Phase-20-Abdeckungsrouten wurden entfernt. Die App zeigt
weiterhin sichere Quellenmetadaten, Übungs-/Klausurbezüge, Module und Trainer, aber keine
privaten PDF-Dateien, keine Screenshots, keine Volltext-Extrakte und keine lokalen Dateihandles.

## Entfernte Routen

- `/dokumente`, `/dokumente/verbinden`, `/dokumente/:documentId`,
  `/dokumente/indexierung`, `/dokumente/indexierung/qualitaet`,
  `/dokumente/zuordnungen`, `/dokumente/abdeckung`
- `/klausuren/:examId/original`
- `/klausuren/:examId/aufgabe/:taskId/original`
- `/uebungen/:sheetId/aufgabe/:taskId/original`

Alte Dokumentrouten leiten nach `/quellen` um. Alte Originalrouten leiten auf die jeweilige
Klausur-, Klausuraufgaben- oder Übungsaufgabenseite um.

## Erhaltene Lernflächen

- `/uebungen`, `/uebungen/:sheetId`, `/uebungen/:sheetId/aufgabe/:taskId`
- `/klausuren`, `/klausuren/fragen`, Klausurdetails und Frage-/Aufgabendetails
- Themen, Lernmodule, elf Trainer, Diagnose, Lernplan, Simulator und Spickzettel

## Persistenz

IndexedDB-Version 13 entfernt die alten Stores `localDocuments` und `localTaskRegions` sowie
optionale private Cache-/Handle-Stores, falls sie in einem Altbestand existieren. Lernfortschritt,
Präferenzen, Sessions, Spickzettel, Lernpläne und Wiederholungen bleiben erhalten.

Die App zeigt einmalig:

> Die lokale Dokumentbibliothek wurde entfernt. Lokal gespeicherte PDF-Verknüpfungen und
> Ausschnittdaten wurden gelöscht.

## Validierung

- TypeScript-Typecheck: bestanden.
- Neue Unit-/Integrationstests für Hosted-Material-Manifest, Deployment-Gate und IndexedDB v13:
  bestanden.
- Alte Phase-19/20-Indexierungsberichte wurden als archiviert markiert.

