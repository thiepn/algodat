# Release Checklist

## Phase 20 / 1.0.0-rc.6

- [x] Version bleibt `1.0.0-rc.6`, nicht `1.0.0`.
- [x] `data/source-task-coverage.json` enthält nur sichere Metadaten.
- [x] `data/source-region-validation-report.json` validiert Aufgaben-, Lösungs- und Crop-Regeln.
- [x] `/dokumente/abdeckung` bietet lokale Metadaten-Suche.
- [x] `/dokumente/indexierung/qualitaet` trennt Vollseiten-Fallbacks von präzisen Crops.
- [x] `/dokumente/indexierung` bietet Aufgabenliste, Nachbar-Navigation, Undo/Redo, Lösungsmapping,
  Side-by-side-Vorschau, Tastaturjustage und Speichern-und-weiter.
- [ ] Realer Screenreader-Gate bleibt offen.

## Phase 19 / 1.0.0-rc.5

- [x] Version bleibt `1.0.0-rc.5`, nicht `1.0.0`.
- [x] Übungen, Altklausuren und Aufgabenregionen sind als sichere Metadaten indexiert.
- [x] Lokale PDF-Bindungen speichern Bytes ausschließlich in IndexedDB.
- [x] Matching unterscheidet Hash-, Dateinamen-, wahrscheinliche, manuelle und ungebundene Fälle.
- [x] Deployment-Audit blockiert PDFs, Screenshots, Base64-Bilder, Volltext- und Dateihandle-Leaks.
- [x] PDF-Renderer ist lazy geladen und nicht Teil des initialen Entry-Chunks.
- [ ] Realer Screenreader-Gate bleibt offen.

## Phase 18 / 1.0.0-rc.4

- [x] Version bleibt `1.0.0-rc.4`, nicht `1.0.0`.
- [x] `Klausurprofile` ist aus der primären Navigation entfernt.
- [x] `/pruefungsstruktur` ersetzt die studentische Profilfläche.
- [x] Normale Klausurenansichten enthalten keine `generated_unverified`-Fragen.
- [x] Lokale PDFs bleiben device-local und werden nicht deployed.
- [x] 500-kB-Bundle-Grenze ist Warnung; 5 MB ist harte Notfallgrenze.
- [ ] `npm.cmd run format:check`
- [ ] `npm.cmd run verify`
- [ ] GitHub Actions nach Push prüfen.
- [ ] Live-Smoke für Lernen, Aufgaben, Prüfungsstruktur, Dokumente und Simulator ausführen.

## Automatisch

- [x] Content-Build mit Phase-16-Spickzetteldaten.
- [x] Content-Validierung inklusive Cheat-Sheet-Referenzen.
- [x] TypeScript-Typecheck.
- [x] ESLint.
- [x] Gezielte neue Tests.
- [x] Accessibility-Fallback-E2E für Keyboard, Fokus, axe, Accessibility Tree, Zoom/Reflow, Forced Colors, Reduced Motion und Spickzettel-Druckroute.
- [x] Accessibility-Auditdaten gegen ausführbare Schemas validiert.
- [ ] Vollständiges `npm.cmd run verify` nach der letzten Änderung.
- [ ] Bundle-Analyse nach finalem Build.
- [ ] Deployment-Audit nach finalem Build.

## Manuell

- [ ] Echte Screenreader-Prüfung mit Narrator oder NVDA.
- [x] Tastatur-Fallback für Diagnose, Trainer, Simulator, Lernplan und Spickzettel automatisiert und dokumentiert.
- [x] Drucksemantik der Spickzettelansicht im Browser-Fallback geprüft.
- [x] RC-Fallback-Review: 0 Blocking, 0 Major im Accessibility-Fallback-Audit.
- [ ] Finales RC-Review inklusive echtem Screenreader-Gate.

## Finalfreigabe

`1.0.0` bleibt gesperrt, bis der echte Screenreader-Gate erfüllt oder ausdrücklich als offene Einschränkung akzeptiert wurde.
# Phase 17 Release Checklist

- [ ] `npm.cmd run format:check`
- [ ] `npm.cmd run verify`
- [ ] Build-Artefakte enthalten keine privaten PDFs, lokalen Pfade oder PDF-Links.
- [ ] Live-Smoke für `/`, `/aufgaben/3`, `/themen`, `/klausuren`, `/klausuren/fragen`, `/klausuren/vergleich`.
- [ ] Screenreader-Gate bleibt als offen dokumentiert; keine Version `1.0.0`.
