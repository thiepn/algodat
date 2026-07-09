# Phase 1 – Implementierungsplan

## Ziel

Phase 1 überführt die validierten Phase-0/0A-Ergebnisse in ein sicheres, offlinefähiges Anwendungsfundament. Sie liefert noch keinen vollständigen Aufgabentrainer und keine erfundenen Lehrinhalte.

## Umgesetzte Arbeitspakete

1. **Werkzeugkette:** React 19, TypeScript 6 im Strict-Modus, Vite 8, ESLint 10, Prettier 3, Vitest 4 und Playwright 1.
2. **Inhaltsvertrag:** ausführbare Zod-Schemas für Quellen, Fachinhalte, Prüfungsobjekte, Nutzerfortschritt, Konflikte und Korrekturen.
3. **Deterministischer Inhaltsbuild:** normalisierte Phase-0/0A-Daten werden validiert, dedupliziert und als sichere Laufzeitindizes erzeugt.
4. **Anwendungsskelett:** responsives Layout, Dashboard, Profile, Aufgaben, Themen, Quellenmetadaten und Diagnostik.
5. **Lokale Persistenz:** IndexedDB Version 1 mit Migrationen, Repositories, Export, Import und Reset.
6. **PWA und Deployment:** Update auf Bestätigung, bereinigte Caches, GitHub-Pages-Basispfad und Prüfung auf private Artefakte.
7. **Qualitätstor:** Phase-Datenprüfung, Inhaltsschemata, Lint, Typprüfung, Tests, Build, Deployment-Audit, Browser- und Offline-E2E-Test.

## Bewusste Grenzen

- Trainer, Klausursimulator, Fehleranalyse, Beherrschungsmodell und Spickzettel-Builder zeigen ehrliche Planungszustände.
- Der Quellenbrowser zeigt nur Metadaten; er öffnet und verteilt keine Quelldateien.
- Ein leerer Lernstand bleibt leer. Phase 1 erzeugt keine synthetischen Fortschrittswerte.
- Konflikte und offene Sichtprüfungen werden sichtbar ausgewiesen und nicht automatisch aufgelöst.

## Abnahmekriterium

Phase 1 gilt erst als abgeschlossen, wenn alle Prüfskripte erfolgreich sind, die gebaute Anwendung keine privaten Quellen enthält und die Kernrouten im Browser einschließlich Offline-Neuladen funktionieren.
