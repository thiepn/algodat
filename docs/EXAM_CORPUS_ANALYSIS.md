# Analyse des Klausurkorpus

Der Bestand erlaubt die Trennung von **6 realen Prüfungssets** (davon ein nur plausibel datiertes Lösungspaket) und **4 Probeklausuren**. Alle eindeutig attribuierten realen Klausuren 2020-2022 nennen Christian Sohler. Für 2024 fehlt das Deckblatt; eine Sohler-Zuordnung wäre nur eine unbelegte Inferenz. Nicht-Sohler-Klausuren sind im Bestand nicht sicher identifiziert, daher ist ein Prüfervergleich nicht möglich.

| ID | Art | Jahr | Prüfer | Aufgaben | Punkte | Minuten | Evidenz |
| --- | --- | --- | --- | --- | --- | --- | --- |
| exam-2020-1 | reale Prüfung | 2020 | unbekannt | 9 | 50 | 180 | plausible |
| exam-2020-2 | reale Prüfung | 2020 | Christian Sohler | 9 | 50 | 180 | confirmed |
| exam-2021-1 | reale Prüfung | 2021 | Christian Sohler | 6 | 60 | 120 | confirmed |
| exam-2022-1 | reale Prüfung | 2022 | Christian Sohler | 9 | 50 | 180 | confirmed |
| exam-2022-2 | reale Prüfung | 2022 | Christian Sohler | 9 | 50 | 180 | confirmed |
| exam-2024-1 | reale Prüfung | 2024 | unbekannt | 9 | 50 | unbekannt | strongly supported |
| mock-2021 | Probeklausur | 2021 | Christian Sohler | 3 | unbekannt | 120 | confirmed |
| mock-2022 | Probeklausur | 2022 | Christian Sohler | 9 | 50 | 180 | confirmed |
| mock-2023 | Probeklausur | 2023 | Christian Sohler | 9 | 50 | 180 | confirmed |
| mock-2024 | Probeklausur | 2024 | Christian Sohler | 9 | 50 | 180 | confirmed |

## Zentrale Befunde

- 2020 (zweite Klausur) und beide Klausuren 2022 bestätigen 9 Aufgaben, 50 Punkte, 180 Minuten und 4/4/4/4/5/5/8/8/8 Punkte.
- Die visuell geprüfte Klausur 2024 bestätigt dieselbe Aufgaben- und Punktefolge; Dauer und Hilfsmittel sind wegen des fehlenden Deckblatts unbekannt.
- 2021 ist eine echte Ausnahme: 6 Aufgaben, 60 Punkte, 120 Minuten und digitales Open-Material-Format.
- Im Neun-Aufgaben-Regime sind A5 Schleifeninvariante, A6 Rekurrenz+Induktion und A8 DP außerordentlich stabil. A1-A4 bleiben Tracing, aber die konkrete Algorithmuszuordnung rotiert.
- Probeklausuren sind strukturell wertvoll, dürfen aber nicht als Nachweis dafür dienen, dass ein Thema tatsächlich in einer realen Klausur vorkam.

## Aufgabenmatrix (Kurzfassung)

| Set | A1 | A2 | A3 | A4 | A5 | A6 | A7 | A8 | A9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| exam-2020-1 | MergeSort-Tracing | Hashing mit Verkettung | Bellman-Ford und negative Kreise | Union-Find mit Listen | Schleifeninvariante | Rekurrenz, Master-Theorem und Induktion | Divide and Conquer: maximale Wertdifferenz | Dynamische Programmierung: Pausentage | Greedy: Graphfärbung |
| exam-2020-2 | IntervalScheduling | DFS | Rot-Schwarz-Bäume | Prim | Schleifeninvariante | Rekurrenz, Master-Theorem und Induktion | Greedy: Fitnesspunkte | Dynamische Programmierung: Rechnerbudget | Datenstruktur: Multimenge |
| exam-2021-1 | Rekurrenz und Master-Theorem | LatenessScheduling | Bellman-Ford | Schleifeninvariante | Dynamische Programmierung: Mine | Graphtransfer: Schnittknoten |
| exam-2022-1 | GreedyLoadBalancing | Rot-Schwarz-Bäume | Floyd-Warshall | Prim | Schleifeninvariante | Rekurrenz und Induktion | Greedy: Workout | Dynamische Programmierung: Frosch-Distanz | Graphtransfer: Zusammenhang durch eine Kante |
| exam-2022-2 | LatenessScheduling | Union-Find | Dijkstra | Rucksack-DP-Tabelle | Schleifeninvariante | Rekurrenz und Induktion | Divide and Conquer: fehlerhaftes Array | Dynamische Programmierung: Windpark | Graphtransfer: kostenbeschränkter Spannbaum |
| exam-2024-1 | DFS | Rucksack-DP-Tabelle | Rot-Schwarz-Bäume | MergeSort | Schleifeninvariante | Rekurrenz und Induktion | Greedy: Entsorgungsstationen | Dynamische Programmierung: Messreihen | Graphtransfer: negativer Kreis |
| mock-2021 | Rekurrenzanalyse | Rucksack-DP-Tabelle | weitere Aufgaben nur in Lösung dokumentiert |
| mock-2022 | Rekurrenzanalyse | Tracing | Graphalgorithmus | Tracing | Schleifeninvariante | Rekurrenz und Induktion | Algorithmusentwurf | Dynamische Programmierung | Graphtransfer |
| mock-2023 | GreedyLoadBalancing | Prim | Floyd-Warshall | Union-Find | Schleifeninvariante | Rekurrenz und Induktion | Greedy: Laternen | Dynamische Programmierung: Mine | Datenstruktur: Deque-Funktionalität |
| mock-2024 | LCS-Tabelle | LatenessScheduling | Floyd-Warshall | Union-Find | Schleifeninvariante | Rekurrenz und Induktion | Divide and Conquer: fehlender Wert | Dynamische Programmierung: Pausentage | Greedy: unabhängige Menge |
