# Informationsarchitektur

## Phase 20.1 Routen

Aktive Quellenroute:

- `/quellen`

Entfernte lokale Dokumentrouten leiten nach `/quellen` um:

- `/dokumente/*`

Entfernte Originalansichten leiten auf die jeweilige Metadatenseite um:

- `/klausuren/:examId/original` → `/klausuren/:examId`
- `/klausuren/:examId/aufgabe/:taskId/original` → `/klausuren/:examId/aufgabe/:taskId`
- `/uebungen/:sheetId/aufgabe/:taskId/original` → `/uebungen/:sheetId/aufgabe/:taskId`

`/uebungen`, `/klausuren`, `/klausuren/fragen`, Themen, Module, Trainer, Diagnose, Lernplan,
Simulator und Spickzettel bleiben erhalten.

## Phase-4-Ergänzung

Die Trainer-Navigation enthält jetzt zwei Familien: Tracing und Beweise. Proof-Routen liegen unter `/trainer/beweise/...`; die themenbasierte Navigation bleibt unverändert parallel erhalten.

```text
Start
├─ Dashboard
├─ Klausurprofile
│  ├─ Standard 9 Aufgaben
│  └─ historische Ausnahme 2021
├─ Aufgaben 1-9
│  ├─ Muster und Strategie
│  └─ Training / historische Fragen
├─ Themen
│  ├─ Grundlagen und Beweise
│  ├─ Entwurfsparadigmen
│  ├─ Datenstrukturen
│  └─ Graphen
├─ Trainer
│  └─ Tracing
│     ├─ Übersicht
│     ├─ Rucksack-DP-Briefing
│     ├─ Union-Find-Briefing
│     ├─ Versuch
│     └─ Auswertung
├─ Klausursimulator
│  ├─ Dashboard
│  ├─ historische Profilabdeckung
│  ├─ startbare Probeklausur
│  ├─ Briefing
│  ├─ laufende Sitzung
│  ├─ Aufgabenübersicht
│  └─ Ergebnisbericht
├─ Fehler und Beherrschung
├─ Spickzettel
└─ Quellen und Konflikte
```

Jede Inhaltsseite verlinkt sowohl in die Themenhierarchie als auch zur passenden Aufgabennummer. Quellenbelege öffnen eine read-only Quellenkarte mit Datei, Seite, Autorität, Verifikationsstatus und Konflikten.

## Phase-3-Routen

- `/trainer`
- `/trainer/tracing`
- `/trainer/tracing/:trainerId`
- `/trainer/tracing/:trainerId/versuch/:attemptId`
- `/trainer/tracing/:trainerId/auswertung/:attemptId`

Die Trainerseiten werden lazy geladen. Rucksack-DP nutzt eine scrollbare Tabellenregion. Union-Find nutzt eine Listenvisualisierung mit Textalternative und aktiver Texteingabe für Kontrollpunkte.

## Phase-7-Routen

- `/simulator`
- `/simulator/profile`
- `/simulator/profile/:profileId`
- `/simulator/pruefungen`
- `/simulator/pruefungen/:examPackageId`
- `/simulator/pruefungen/:examPackageId/briefing`
- `/simulator/sitzung/:sessionId`
- `/simulator/sitzung/:sessionId/aufgabe/:taskSlotId`
- `/simulator/sitzung/:sessionId/uebersicht`
- `/simulator/sitzung/:sessionId/ergebnis`

Historische Profile besitzen keine Startstrecke. Startbar ist nur die Kernkompetenz-Probeklausur.
# Phase 8 Nachtrag

Die Informationsarchitektur ergänzt `/trainer/entwurf/greedy/:trainerId` mit Versuch und Auswertung. Die Trainerübersicht zeigt sechs verifizierte Lernpfade. Der Simulator nutzt V2 als Kernpaket und enthält einen zusätzlichen Aufgabe-7-Slot für `greedy_design_fitnesspunkte`. Quellen: `src-97414623dd81`, Seite 8; `src-8a588d5ddc35`, Seite 8.
## Phase 12 Ergänzung

Neuer Navigationspfad:

- `/trainer/graphen/prim/trainer-graph-prim-mst-v1`
- `/trainer/graphen/prim/trainer-graph-prim-mst-v1/versuch/:attemptId`
- `/trainer/graphen/prim/trainer-graph-prim-mst-v1/auswertung/:attemptId`

Der Lernpfad erscheint in der Trainerübersicht unter der Familie Graphen.
# Phase 13 Nachtrag

Neuer Navigationspfad:

- `/trainer/entwurf/divide-and-conquer/trainer-dc-entwurf-maxwertdifferenz-v1`
- `/trainer/entwurf/divide-and-conquer/trainer-dc-entwurf-maxwertdifferenz-v1/versuch/:attemptId`
- `/trainer/entwurf/divide-and-conquer/trainer-dc-entwurf-maxwertdifferenz-v1/auswertung/:attemptId`

Der Lernpfad erscheint in der Trainerübersicht unter Algorithmusentwurf und bleibt zusätzlich über thematische Navigation zu Divide-and-Conquer erreichbar.

# Phase 14 Nachtrag

Neuer Navigationspfad:

- `/diagnose`
- `/diagnose/schnellcheck`
- `/diagnose/standard`
- `/diagnose/thema`
- `/diagnose/session/:sessionId`
- `/diagnose/auswertung/:sessionId`

Die Diagnose bleibt neben Trainer, Themen und Simulator sichtbar. Sie nutzt kurze Items für Grundlagenkompetenzen und verweist nach Auswertung auf vorhandene Trainer. Fachliche Kompetenzbelege: `src-35405e721f05`, Seiten 9 und 11; `src-25d6340b518c`, Seiten 17 und 25; `src-baa07f0a207a`, Seite 846.

# Phase 15 Nachtrag

Neuer Navigationspfad:

- `/lernplan`
- `/lernplan/heute`
- `/lernplan/woche`
- `/lernplan/pruefungsreife`
- `/lernplan/wiederholungen`
- `/lernplan/einstellungen`
- `/lernplan/verlauf`

Der Lernplan ist eine eigene Hauptnavigation neben Dashboard, Themen, Trainer, Diagnose und Simulator. Er verlinkt zurück in bestehende Trainer-, Diagnose- und Simulatorrouten und erstellt selbst keine neuen Fachinhalte.

# Phase 16 Nachtrag

Neuer Navigationspfad:

- `/spickzettel`
- `/spickzettel/neu`
- `/spickzettel/vorlagen`
- `/spickzettel/einstellungen`
- `/spickzettel/:sheetId`
- `/spickzettel/:sheetId/vorschau`
- `/spickzettel/:sheetId/drucken`

Der Bereich ist route-lazy und enthält keine privaten Quellen oder PDF-Links.
# Phase 17 Informationsarchitektur

Die Hauptnavigation ist gruppiert:

- Lernen: Übersicht, Aufgaben 1–9, Themen, Trainer
- Prüfen: Klausuren, Klausurprofile, Simulator
- Planen: Diagnose, Lernplan, Spickzettel, Quellen

Neue Routen: `/klausuren`, `/klausuren/fragen`, `/klausuren/:examId`, `/klausuren/:examId/aufgabe/:questionId`, `/klausuren/vergleich`.
