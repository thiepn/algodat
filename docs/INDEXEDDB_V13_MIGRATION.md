# IndexedDB v13 Migration

## Ziel

Version 13 entfernt lokale PDF-Bibliotheksdaten aus dem Browser, ohne Lernfortschritt zu löschen.

## Gelöschte Alt-Stores

- `localDocuments`
- `localTaskRegions`
- `privateExtractionCache`, falls in einem Altbestand vorhanden
- `localFileHandles`, falls in einem Altbestand vorhanden

## Erhaltene Stores

- `studySessions`
- `practiceAttempts`
- `masteryRecords`
- `errorRecords`
- `preferences`
- `examSessions`
- `examSnapshots`
- `examResults`
- `diagnosticSessions`
- `studyPlans`
- `studyPlanSettings`
- `reviewSchedules`
- `cheatSheets`

## Nutzerhinweis

Nach dem Update erscheint einmalig:

> Die lokale Dokumentbibliothek wurde entfernt. Lokal gespeicherte PDF-Verknüpfungen und
> Ausschnittdaten wurden gelöscht.

## Testabdeckung

`tests/integration/persistence.test.ts` legt eine simulierte v12-Datenbank mit Lernpräferenzen und
alten lokalen PDF-Stores an, migriert auf v13 und prüft, dass die lokalen Stores entfernt sind,
während Präferenzen erhalten bleiben.

