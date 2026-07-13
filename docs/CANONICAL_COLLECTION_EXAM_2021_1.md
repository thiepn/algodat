# Kanonische Sammlung `exam-2021-1`

## Prüfungsstruktur

Die Erstklausur des Sommersemesters 2021 fand am 29.09.2021 statt, dauerte 120 Minuten und umfasst sechs Aufgaben mit insgesamt 60 Punkten. Das Deckblatt weist die Punktefolge 6, 6, 6, 10, 16 und 16 aus. Diese historische Sechs-Aufgaben-Struktur bleibt ein eigenes Profil und wird nicht in das heutige Standardprofil Aufgabe 1 bis 9 umgedeutet. [Quelle: `src-28fe81380661`, S. 1]

Alle sieben Seiten der Klausur und alle 16 Seiten der als Lösung inventarisierten Datei wurden lokal visuell geprüft. Die Klausurquelle besitzt eine exakte Dateidublette in `dup-exact-503c2fc8ed32`; beide Dateien bilden ein einziges Klausurereignis. [Quelle: `src-28fe81380661`, S. 1–7]

| Aufgabe | Inhalt | Punkte | Kanonische ID | Quelle |
| ---: | --- | ---: | --- | --- |
| 1 | Rekurrenz und Master-Theorem | 6 | `exam-2021-1-task-1` | `src-28fe81380661`, S. 2 |
| 2 | LatenessScheduling | 6 | `exam-2021-1-task-2` | `src-28fe81380661`, S. 3 |
| 3 | Improved Bellman-Ford | 6 | `exam-2021-1-task-3` | `src-28fe81380661`, S. 4 |
| 4 | Minimum und Schleifeninvariante | 10 | `exam-2021-1-task-4` | `src-28fe81380661`, S. 5 |
| 5 | Dynamische Programmierung in einer Mine | 16 | `exam-2021-1-task-5` | `src-28fe81380661`, S. 6 |
| 6 | Artikulationsknoten durch wiederholte Suche | 16 | `exam-2021-1-task-6` | `src-28fe81380661`, S. 7 |

## Lösungsstatus und Konflikte

Für keine der sechs Aufgaben wurde eine passende offizielle Lösung gefunden. Alle Lösungen sind deshalb als `authored_solution` beziehungsweise `authored_from_verified_method` gekennzeichnet und bleiben von der Aufgabenquelle unterscheidbar. Die inventarisierte vermeintliche Lösung behandelt auf sämtlichen 16 Seiten andere Aufgabenfamilien und ist weder in den kanonischen Fragen noch in deren Evidenzlinks als Lösung verbunden. [Klausur: `src-28fe81380661`, S. 2–7; abweichende Quelle: `src-39eb3d94f40a`, S. 1–16]

Aufgabe 4 enthält zwei interne Widersprüche: Die Überschrift nennt sechs Punkte, während das Deckblatt zehn Punkte ausweist; außerdem liest die Schleife bei `i = n` den nicht definierten Eintrag `B[n+1]` eines Feldes `B[1..n]`. Die kanonische Punktzahl folgt dem Deckblatt. Der Originalcode wird nicht als korrekt ausgegeben; der Beweis gilt nur für die ausdrücklich korrigierte Schleifengrenze `1` bis `n-1`. [Quelle: `src-28fe81380661`, S. 1 und 5]

## Qualitätssicherung

Graph, Matrix und Pseudocode besitzen textuelle Alternativen beziehungsweise semantisch strukturierte Darstellungen. Deterministische Tests prüfen Rekurrenzwachstum, Deadline-Reihenfolge, Bellman-Ford-Runden, den Indexkonflikt und die korrigierte Minimumberechnung, das DP-Optimum sowie die Artikulationsknotenerkennung auf allen verbundenen ungerichteten Graphen bis fünf Knoten. Ein unabhängiger fachlicher Zweitreview und ein realer NVDA-/Narrator-Durchgang bleiben offen.
