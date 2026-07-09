# Exam Task Adapter

## Zweck

Adapter übersetzen die vorhandenen Trainerantworten in ein einheitliches Exam-Scoring. Die Trainer-Engines bleiben fachliche Quelle der Bewertung; der Simulator skaliert nur die Punkte auf den Exam-Slot.

## Produktive Adapter

| Adapter | Trainer | Max. intern | Exam-Punkte | Quelle |
| --- | --- | ---: | ---: | --- |
| `adapter-knapsack-v1` | `trainer-rucksack-dp-v1` | 12 | 8 | `src-25d6340b518c`, Seiten 33-34; `src-baa07f0a207a`, ab Seite 390 |
| `adapter-union-find-v1` | `trainer-union-find-listen-v1` | 12 | 8 | `src-8f16b2505bbd`, Seite 6; `src-35405e721f05`, Seite 6; `src-baa07f0a207a`, Seiten 943, 946, 948, 949, 950-951 |
| `adapter-loop-invariant-v1` | `trainer-schleifeninvariante-summe-v1` | 16 | 8 | `src-25d6340b518c`, Seiten 11-12; `src-baa07f0a207a`, Seiten 132-135 und 140 |
| `adapter-recurrence-v1` | `trainer-rekurrenz-master-fall1-v1` | 23 | 8 | `src-25d6340b518c`, Seiten 17-18 und 25-26; `src-baa07f0a207a`, Seiten 194-198 und 230-238 |
| `adapter-dp-design-v1` | `trainer-dp-entwurf-mine-v1` | 54 | 8 | `src-8f16b2505bbd`, Seite 10; `src-35405e721f05`, Seiten 11-12 |

## Fehlende oder ungültige Antworten

Ungültige JSON-Payloads, leere Antworten oder inkompatible Strukturen werden nicht geraten. Sie erhalten deterministisch 0 Punkte mit Fehlercode statt erfundener Teilbewertung.
# Phase 8 Nachtrag

`adapter-greedy-design-v1` verbindet `trainer-greedy-entwurf-fitnesspunkte-v1` mit dem Simulator. Er skaliert 40 interne Punkte auf 8 Exam-Punkte und nutzt die belegte Fitnesspunkte-Kanonik aus `src-97414623dd81`, Seite 8 und `src-8a588d5ddc35`, Seite 8.
## Phase 12 Ergänzung

`trainer-graph-prim-mst-v1` besitzt den neuen Adapter `prim_mst_trace`. V1, V2 und V3 der Klausurpakete bleiben unverändert; der Adapter wird separat mit einer kanonischen Golden-Antwort getestet.
# Phase 13 Nachtrag

`adapter-divide-conquer-design-v1` verbindet `trainer-dc-entwurf-maxwertdifferenz-v1` mit dem Simulator. Er skaliert 48 interne Punkte auf 8 Exam-Punkte und nutzt ausschließlich die kanonische Lösung aus `src-88179ac88dc5`, Seite 7.
