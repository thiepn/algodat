# Inhaltspipeline

## Phase-4-Ergänzung

Der Build erzeugt zusätzlich `proof-trainers.json` und `proof-rubrics.json`. Beide Dateien werden gegen explizite Zod-Schemas validiert und in `content-manifest.json` mit Hash aufgeführt.

## Datenfluss

Die Pipeline liest ausschließlich abgeleitete JSON-Artefakte aus Phase 0/0A sowie geprüfte öffentliche Trainingsdefinitionen. `scripts/build-content.ts` normalisiert diese Daten, wendet Quellenkorrekturen an und schreibt Laufzeitdateien nach `src/content/generated/`.

| Datei | Zweck |
| --- | --- |
| `content-manifest.json` | Inhaltsversion, Prüfsummen, Bestandszahlen und Traineranzahl |
| `sources.json` | sichere Quellenmetadaten ohne lokale Pfade |
| `exam-profiles.json` | bestätigtes Standardprofil und historische Ausnahme 2021 |
| `exam-blueprint.json` | aufgabenorientierte Prüfungsstruktur |
| `topics-index.json` | Themenindex mit getrennten Evidenzklassen |
| `content-health.json` | Prüfstatus, Konflikte und offene Sichtprüfungen |
| `citation-fixtures.json` | kleine, verifizierte Test-Fixtures; kein Inhaltskorpus |
| `tracing-trainers.json` | öffentliche aktive Trainer |
| `tracing-rubrics.json` | validierte Rubriken für aktive Trainer |

## Evidenzregeln

- Nur deduplizierte echte Klausurereignisse zählen zur historischen Klausurhäufigkeit.
- Probeklausuren, Übungen und erzeugte Hinweise werden separat ausgewiesen.
- Exakte Dateiduplikate teilen eine kanonische Dokumentidentität, bleiben aber als Inventareinträge nachvollziehbar.
- Offizielle Quellen haben Vorrang; inoffizielle Lösungen und Zusammenfassungen werden gekennzeichnet.
- Fehlende Prüfer-, Datums- oder Seitenangaben werden als unbekannt gespeichert, nicht geraten.
- Erzeugte Trainingsaufgaben müssen `public_safe` sein und ihre Lösung gegen die Domain-Engine validieren.

## Phase 3

Der Build schreibt zwei aktive Trainer und zwei Rubriken in die Laufzeitdateien. Die Inhaltsversion trägt den Prefix `phase3-`.

## Validierung

`npm run validate:phase-data` führt die Validatoren für Phase 0 und 0A aus und prüft zusätzlich, dass die nach `pdfs/` verschobenen Originaldateien hashgleich zum Manifest sind. `npm run validate:content` parst jede Laufzeitdatei mit Zod, prüft Referenzen, Rubriksummen, Trainerstatus und stellt sicher, dass keine lokalen Pfade oder gebündelten PDF-Inhalte enthalten sind.

Die Inhaltsversion ist aus dem normalisierten Build-Eingang abgeleitet. Dadurch erzeugt derselbe Datenstand dieselbe Versionskennung; Dateiprüfsummen machen Abweichungen sichtbar.

# Phase 16 Nachtrag

Der Build liest zusätzlich `cheat-sheet-blocks.json`, `cheat-sheet-presets.json` und `cheat-sheet-layout-policy.json`. Die erzeugten Dateien werden in `content-manifest.json` gehasht und durch `validate-content` gegen Quellen-, Topic- und Public-Safe-Regeln geprüft.
