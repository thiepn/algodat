# Release Versioning Policy

## Zustände

- `1.0.0-rc.1`: Release Candidate mit implementierten Phase-16-Funktionen und automatisierten Gates.
- `1.0.0-rc.2`: Release Candidate mit Accessibility-Fallback-Audit und kleineren Tastatur-/Fokus-Fixes.
- `1.0.0`: finaler Release nur nach bestandenem `npm.cmd run verify`, abgeschlossener manueller Accessibility-Prüfung, dokumentiertem Screenreader-Audit oder ehrlichem blockierenden Fallback, geprüfter Migration und 0 Blocking/0 Major Bugs.

## Aktueller Stand

Die Projektmetadaten stehen auf `1.0.0-rc.2`. `1.0.0` wird nicht gesetzt, solange der echte Screenreader-Gate nicht tatsächlich erfüllt ist.

## Regeln

Keine Versionsbehauptung ohne Änderung von `package.json` und `package-lock.json`. Keine globale Git-Konfiguration für Releasezwecke.
