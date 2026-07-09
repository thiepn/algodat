# Final Migration Matrix

## Versionen

- Version 7: Simulator-Stores.
- Version 8: `diagnosticSessions`.
- Version 9: `studyPlans`, `studyPlanSettings`, `reviewSchedules`.
- Version 10: `cheatSheets`.

## Regel

Version 10 ist additiv. Alte Stores werden nicht verändert. Export/Import nimmt `cheatSheets` auf; ältere Exporte ohne `cheatSheets` bleiben durch Default-Validierung lesbar.

## Getestet

Gezielter Persistenztest: Storeanlage, Export/Import von Spickzetteln und Ablehnung ungültiger Importversion.
