# Phase 9 Implementierungsplan

## Ausgangslage

Phase 8 ist laut `docs/PHASE_8_COMPLETION_REPORT.md` abgeschlossen: Der Greedy-Trainer `trainer-greedy-entwurf-fitnesspunkte-v1`, das Simulatorpaket `exam-package-kernkompetenz-v2`, der Adapter `greedy_design_fitnesspunkte` und `npm.cmd run verify` sind dort als bestanden dokumentiert.

## Pflicht-Gate vor Produktcode

Vor produktivem Code wird Phase 9A dokumentiert:

- Portfoliovergleich: Rot-Schwarz-Bäume gegen Graphtransfer.
- Nicht kompensierbare Gates: offizielle Primärquelle, vollständige/verifizierte Lösung, eindeutige Aufgabe-Lösung-Verknüpfung, deterministische Bewertung, public-safe Neuformulierung.
- Artefakte: `docs/PHASE_9_PORTFOLIO_DECISION.md` und `data/phase9-portfolio-decision.json`.

## Auswahl

Ausgewählt wird Pfad A: Rot-Schwarz-Bäume, eingeschränkt auf Invarianten, Einfügung, Rotation und Reparatur.

Belege:

- Echte Klausuraufgabe: `src-97414623dd81`, Seite 4.
- Offizielle Lösungsskizze derselben Aufgabe: `src-8a588d5ddc35`, Seite 4.
- Vorlesungsnotation und Invarianten: `src-5c9eadb17ccc`, Seiten 3-5, 7, 10, 13-15, 20, 22-23, 30, 34-36.
- Wiederholende Vorlesungsfolien zur Einfügung: `src-859ed6e00e98`, Seiten 3-6 und 11-17.

Nicht umgesetzt wird Rot-Schwarz-Löschung. Die reale Aufgabe enthält zwar Löschung, aber Phase 9 begrenzt den produktiven Trainer auf den belegten und deterministisch prüfbaren Einfüge-/Repair-Vertikalschnitt.

## Vertikaler Umfang

Phase 9 liefert genau einen neuen produktiven Lernpfad:

- Trainer-ID: `trainer-rot-schwarz-einfuegen-v1`.
- Routenfamilie: `/trainer/baeume/rot-schwarz`.
- Trainerart: aktive strukturierte Eingabe für Invarianten, NIL-Konvention, Einfügefolge, Reparaturfälle, Endbaum, Laufzeit und Begründung.
- Domain: reine TypeScript-Engine für Rot-Schwarz-Einfügung, Rotation, Invariantenprüfung, Trace und Scoring.
- Oracle: unabhängige Validierung über Invarianten, BST-Ordnung, Schlüsselmenge und erwartete Serialisierung.
- Simulator: neues Paket `exam-package-kernkompetenz-v3` mit sieben vollständig bewertbaren Aufgaben; V1 und V2 bleiben erhalten.
- Adapter: genau ein neuer ExamTaskAdapter `red_black_tree_insertion`.
- Mastery: `mastery-v8`.

## Validierung

Nach Implementierung werden mindestens ausgeführt:

- `npm.cmd run format:check`
- `npm.cmd run verify`

Nicht ausgeführte Prüfungen werden nicht als bestanden behauptet.
