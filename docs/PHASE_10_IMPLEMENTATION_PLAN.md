# Phase 10 Implementierungsplan

Phase 10 baut die Graph-Tracing-Grundlage und genau einen produktiven Graphalgorithmus-Trainer. Die Phase beginnt erst nach dem Kandidaten-Gate; produktiv freigegeben wird nur ein Pfad.

## Nicht kompensierbare Gates

Ein Kandidat darf nur implementiert werden, wenn alle Punkte erfüllt sind:

1. Offizielle Primärquelle für Aufgabenstellung oder Vorlesungskonvention.
2. Vollständige, verifizierbare Lösung oder eine deterministische Oracle-Reproduktion, die gegen eine offizielle Lösung geprüft wurde.
3. Eindeutige Knoten-, Matrix-, Kanten- oder Nachbarschaftsreihenfolge.
4. Keine offenen Quellenkonflikte zur verwendeten Konvention.
5. Public-safe Neuformulierung ohne lokale PDF-Pfade, PDF-Links oder historische Aufgabenübernahme.

## Gewählter Pfad

Ausgewählt wird `trainer-graph-floyd-warshall-v1`.

Begründung: Die offizielle Probeklausur enthält Floyd-Warshall als Matrix-Tracing-Aufgabe (`src-8f16b2505bbd`, Seite 4). Die offizielle Beispiellösung enthält die vollständige Matrixfolge `D(0)` bis `D(4)` (`src-35405e721f05`, Seite 5). Die Iterationsreihenfolge ist durch die Matrizenindizes `D(1)` bis `D(4)` und die Knotenlabels `1` bis `4` eindeutig. Die reproduzierte Oracle-Folge stimmt mit der Beispiellösung überein.

## Abgrenzung

- Bellman-Ford, Dijkstra, Prim, BFS und DFS werden in Phase 10 nur auditiert, nicht produktiv implementiert.
- Es wird kein historischer Aufgabentext übernommen.
- Das erzeugte Trainingsproblem ist eine source-aligned generated exercise mit eigener kleiner Matrixinstanz.
- Es wird genau ein neuer Simulatoradapter `floyd_warshall_matrix` ergänzt.
- Ein neues Simulatorpaket V4 wird nur erstellt, wenn dadurch keine blinde Paketaufblähung entsteht. Andernfalls bleibt der Adapter testbar, aber V1 bis V3 bleiben unverändert.

## Arbeitspakete

1. Kandidatenauswahl, Konventionsaudit und Ranking dokumentieren.
2. Graph-Domainmodell, Floyd-Warshall-Oracle, Linter und Scoring implementieren.
3. Ausführbare Schemas, Content-Build und generierte JSON-Artefakte ergänzen.
4. Trainerseiten für Briefing, aktive Eingabe und Auswertung erstellen.
5. Simulatoradapter und Mastery V9 anbinden.
6. Tests für Oracle, Linter, Scoring, Schemas, Loader, Adapter und UI ergänzen.
7. Dokumentation und Abschlussberichte erstellen.
8. Abschließend `npm.cmd run format:check` und `npm.cmd run verify` ausführen.
