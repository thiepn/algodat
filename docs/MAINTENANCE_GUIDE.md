# Maintenance Guide

## Projektstruktur

- `data/`: kuratierte Eingabedaten.
- `src/content/`: generierte Loader und Schemas.
- `src/domain/`: deterministische Fachlogik.
- `src/features/`: UI-Routen.
- `src/persistence/`: IndexedDB, Migration, Export/Import.
- `scripts/`: Build-, Validierungs- und Deployment-Audits.

## Änderungspfade

Neue Inhalte müssen Quellenreferenzen, Schemas, Content-Build, Validierung, Tests und Dokumentation erhalten. Neue Stores benötigen additive Migration und Export/Import-Anschluss. Deployment-Audit darf nicht abgeschwächt werden.
