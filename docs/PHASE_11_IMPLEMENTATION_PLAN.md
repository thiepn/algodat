# Phase 11 Implementierungsplan: Single-Source-Shortest-Paths-Tracing

Status: Quellen- und Konventionsgate läuft. Produktive Trainer-Änderungen sind gesperrt, bis genau ein Kandidat die Phase-11A-Gates besteht.

## Zielversion

`0.11.0-single-source-shortest-paths-tracing`

## Arbeitsregeln

- Alle Lerninhalte, UI-Texte, Fehlermeldungen und Dokumente bleiben deutsch.
- Jede fachliche Aussage wird nur aus lokalen, offiziellen Quellen oder bereits validierten Metadaten übernommen und mit Datei- sowie Seiten-/Folienbezug dokumentiert.
- Die lokalen Original-PDFs in `pdfs/` bleiben private Eingangsmaterialien und werden nicht verlinkt, kopiert, gecacht oder in Produktionsartefakten referenziert.
- Fragen, Lösungen, Laufzeiten, Beweise, Tie-Breaker, Relaxationsreihenfolgen und Negativkreis-Konventionen werden nicht erfunden.
- Genau ein produktiver neuer Trainer darf entstehen: Bellman-Ford bevorzugt, Dijkstra nur als Fallback, kein Doppel-Release.
- Eine Implementierung beginnt erst, wenn die Kandidatenauswahl, der Konventionsaudit und die Ranking-Datei geschrieben sind.

## Phase 11A: Quellen- und Konventionsgate

Die folgenden Kandidaten werden geprüft:

1. Bellman-Ford-Rundentracing
2. Bellman-Ford mit Vorgängern
3. Bellman-Ford mit erreichbarer Negativkreis-Erkennung
4. Dijkstra-Tracing
5. Dijkstra mit Prioritätswarteschlangen-Zuständen
6. Dijkstra mit Distanz-/Vorgängertabelle

Nicht kompensierbare Mindestbedingungen:

- offizielle Primärquelle
- verifizierte vollständige Lösung
- sichere Aufgaben-/Lösungsverknüpfung
- eindeutige Bearbeitungsreihenfolge
- eindeutige Aktualisierungs- und Gleichstandssemantik
- deterministische kanonische Spur
- öffentlich sichere, selbstständige Instanz
- unabhängiges Oracle
- kein ungelöster Quellenkonflikt

Auswahlregel:

- Besteht Bellman-Ford, wird Bellman-Ford implementiert.
- Besteht Bellman-Ford nicht und Dijkstra besteht, wird Dijkstra implementiert.
- Bestehen beide nicht, wird Phase 11 als fachlich blockiert dokumentiert; es wird kein produktiver Trainer erfunden.

## Pflichtartefakte vor Produktänderungen

- `docs/PHASE_11_CANDIDATE_SELECTION.md`
- `docs/PHASE_11_SHORTEST_PATH_CONVENTION_AUDIT.md`
- `data/phase11-shortest-path-candidate-ranking.json`

## Produktpfad nur bei bestandenem Gate

Bei bestandenem Gate wird genau ein neuer Lernpfad ergänzt:

- ein Trainingsdatensatz in `data/training/`
- eine Rubrik in `data/training-rubrics/`
- deterministische Engine-, Oracle-, Linter- und Scoring-Tests
- UI-Route im bestehenden Trainer-Portfolio
- ein Adapter im Prüfungspaket-System
- Mastery-Erweiterung auf `mastery-v10`
- Architektur-, Scoring-, Linter-, Varianten-, Performance-, Accessibility-, Git-Safety- und Completion-Dokumentation

## Validierung

Nach der letzten produktiven Änderung werden mindestens ausgeführt:

- `npm.cmd run format:check`
- `npm.cmd run verify`

Wenn Phase 11 am Quellen-Gate blockiert, werden keine produktiven Artefakte verändert; dann wird nur die Quellenentscheidung dokumentiert und keine vollständige Release-Validierung als Produktabschluss behauptet.
