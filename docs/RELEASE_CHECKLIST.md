# Release Checklist

## Archiv: Phase 20.1 / 1.0.0-rc.7

- [x] Version bleibt `1.0.0-rc.7`, nicht `1.0.0`.
- [x] Lokale Dokumentbibliothek, lokale PDF-Verknüpfungen, Originalseitenrouten und Crop-Werkzeuge
  sind entfernt.
- [x] Alte `/dokumente`-URLs leiten auf `/quellen` um; alte Originalrouten leiten auf die
  jeweiligen Metadatenseiten um.
- [x] IndexedDB-Version 13 entfernt `localDocuments`, `localTaskRegions` und optionale private
  Cache-/Handle-Stores, ohne Lernfortschritt zu löschen.
- [x] `data/hosted-materials.json` existiert mit leerem Startzustand und ausführbarem Schema.
- [x] Deployment-Safety erlaubt Hosted Materials nur mit genehmigtem Manifest, Rechtemetadaten,
  passendem Hash und Pfad unter `materials-approved/`.
- [ ] Realer Screenreader-Gate bleibt offen.

## Phase 20 / 1.0.0-rc.6 archiviert

- [x] Phase-20-Quellenabdeckung und Crop-Berichte sind historisch archiviert.

## Phase 19 / 1.0.0-rc.5 archiviert

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
- [x] Vollständiges `npm.cmd run verify` nach der letzten Änderung.
- [x] Bundle-Analyse nach finalem Build.
- [x] Deployment-Audit nach finalem Build.

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
# Zusätzlicher Release-Gate: kanonischer Fragenkorpus

- [ ] Jede Kandidatur aus dem Reconciliation-Report hat eine manuelle Identitätsentscheidung.
- [ ] Jede veröffentlichte kanonische Frage besteht die Korpusvalidierung.
- [ ] Keine offene Kandidatur ist als Übungsaufgabe, Bibliotheksfrage oder Simulatoraufgabe sichtbar.

## Checkpoint `exam-2020-2`

- [x] Genau eine reale Klausursammlung ausgewählt und die Auswahl dokumentiert.
- [x] Neun Aufgabenidentitäten, 50 Punkte und zwei ausgeschlossene Titelseiten validiert.
- [x] Alle zwölf Klausur- und zwölf Lösungsseiten visuell geprüft.
- [x] Graphen, Rot-Schwarz-Bäume, Tabellen und Pseudocode zugänglich rekonstruiert.
- [x] Alle Aufgaben-/Lösungsevidenzen und Ressourcenmappings verbunden.
- [x] DP-Randfallkonflikt dokumentiert und als authored correction getestet.
- [x] Fragenvorschau bleibt feature-geschützt; Review-Route bleibt development-only.
- [x] Version bleibt `1.0.0-rc.8`.
- [ ] Reales NVDA-/Narrator-Gate bleibt offen.
- [ ] Phase 21R.1 bleibt wegen 48 offener Kandidaturen unvollständig.
- [x] `exam-2022-1` ist mit neun Aufgaben, 50 Punkten und transparent authored Lösungen vollständig kanonisiert. [Quelle: `src-c4dde22523d3`, S. 1–16]
- [x] `exam-2022-2` ist mit neun Aufgaben, 50 Punkten, acht authored Lösungen und einer verifizierten offiziellen späteren Lösung vollständig kanonisiert. [Quelle: `src-011d1ee23245`, S. 1–15; Lösung: `src-02be45f603ba`, S. 3–4]
- [ ] Die 36 kanonischen Fragen benötigen weiterhin einen unabhängigen fachlichen Zweitreview.
