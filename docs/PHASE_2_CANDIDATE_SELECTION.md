# Phase 2A – Auswahl des Tracing-Kandidaten

## Entscheidung

Ausgewählt ist **Rucksack-DP-Tabelle**. Der Kandidat erreicht 24 von 24 Punkten und erfüllt alle Pflichtkriterien. Produktionsgrundlage ist nicht der Originaltext, sondern eine neu formulierte, quellenausgerichtete Trainingsinstanz.

## Verifizierte Grundlage

- `src-25d6340b518c`, Seite 33: offizielles 6. Übungsblatt 2026, Aufgabe 1, Eingabe, Definition von `Opt[i,w]` und Rekurrenz.
- `src-25d6340b518c`, Seite 34: typgesetzte offizielle Lösungstabelle und Endwert `Opt[5,13] = 17`.
- `src-baa07f0a207a`, ab Seite 390: offizielle Vorlesungsgrundlage zum Rucksackproblem und zur dynamischen Programmierung.
- Der SHA-256-Wert der nach `pdfs/Uebungen 0-9.pdf` verschobenen Datei stimmt exakt mit dem Phase-0-Manifest überein.
- Für diese Seiten existiert kein Quellenkonflikt. Die einzige offene Sichtprüfung des Sammelbands betrifft Seite 54, nicht den Kandidaten.

## Warum nicht Dijkstra?

Dijkstra bleibt die fachliche Präferenz, erfüllt das Gate aber nicht. Die reale Klausur 2022 enthält eine Dijkstra-Aufgabe, jedoch keine verknüpfte Lösung. Die als Dijkstra getaggten 2021-Lösungsseiten widersprechen der Klausurmatrix, die Aufgabe 3 als Bellman-Ford ausweist. Eine Übungslösung ist nur als nicht mehr zugängliche Einzelquelle inventarisiert. Tie-Breaker und vollständiger offizieller Trace sind damit nicht gemeinsam belegt.

## Bewertung

Jedes der zwölf Kriterien erhält 0, 1 oder 2 Punkte. Pflichtkriterien müssen jeweils 2 Punkte erreichen; außerdem sind mindestens 20 Gesamtpunkte erforderlich. Das vollständige maschinenlesbare Ranking steht in `data/trainer-candidate-ranking.json`.

| Kandidat | Punkte | Gate | Hauptgrund |
| --- | ---: | --- | --- |
| Rucksack-DP-Tabelle | 24 | bestanden | zugängliche, typgesetzte offizielle Aufgabe und Lösung |
| MergeSort | 21 | nicht bestanden | historische Einzellösung aktuell nicht zugänglich |
| Union-Find | 19 | nicht bestanden | aktuell zugängliche Bearbeitung handschriftlich |
| Floyd-Warshall | 19 | nicht bestanden | aktuell zugängliche Bearbeitung handschriftlich |
| LCS-Tabelle | 19 | nicht bestanden | Einzelquelle aktuell nicht zugänglich |
| GreedyLoadBalancing | 18 | nicht bestanden | aktuell zugängliche Bearbeitung handschriftlich |
| Hashing | 18 | nicht bestanden | vollständiges Paar aktuell nicht zugänglich |
| Dijkstra | 17 | nicht bestanden | keine verknüpfte Lösung, widersprüchliches Tagging |
| Prim | 16 | nicht bestanden | kein belegter Tie-Breaker, handschriftliche Bearbeitung |

## Veröffentlichungsschutz

Die öffentliche Instanz übernimmt weder Zahlen noch Formulierungen der Übungsaufgabe. Sie verwendet ausschließlich die verifizierte Algorithmusregel, Notation, Tabellenorientierung und deterministisch von der Engine berechnete Lösung. Sie trägt `source_aligned_generated_exercise`, `verified_against_official_source` und `public_safe`.
