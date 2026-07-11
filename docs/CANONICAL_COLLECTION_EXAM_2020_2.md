# Kanonische Sammlung `exam-2020-2`

Stand: 11. Juli 2026

## Ergebnis

Die zweite reale Klausur des Sommersemesters 2020 ist als vollständige Sammlung mit neun final geprüften Fragen kanonisiert. Die Punktesumme beträgt 50. [Quelle: `src-97414623dd81`, S. 1]

Alle zwölf Seiten der Klausur und alle zwölf Seiten der offiziellen Lösungsskizze wurden als gerenderte Seiten visuell geprüft. Die beiden Titelseiten sind als Nicht-Fragen ausgeschlossen. Private PDFs, gerenderte Seiten und lokale Pfade sind nicht Bestandteil der Produktionsartefakte.

## Quelldokumente

- Klausur: `src-97414623dd81`, Sommersemester 2020, 7.10.2020, zwölf Seiten; Aufgaben 1–9 auf S. 2–12. [Quelle: S. 1–12]
- Offizielle Lösungsskizze: `src-8a588d5ddc35`, zwölf Seiten; Lösungen 1–9 auf S. 2–12. [Lösung: S. 1–12]
- Erlaubtes Hilfsmittel: ein beidseitig handschriftlich beschriebenes DIN-A4-Blatt; Bearbeitungszeit 180 Minuten. [Quelle: `src-97414623dd81`, S. 1]

## Aufgabeninventar

| Nr. | Kanonische ID | Inhalt | Punkte | Aufgabe | Lösung | Trainerabdeckung |
| ---: | --- | --- | ---: | --- | --- | --- |
| 1 | `exam-2020-2-task-1` | IntervalScheduling | 4 | `src-97414623dd81`, S. 2 | `src-8a588d5ddc35`, S. 2 | fehlt |
| 2 | `exam-2020-2-task-2` | DFS-Zeitstempel | 4 | `src-97414623dd81`, S. 3 | `src-8a588d5ddc35`, S. 3 | fehlt |
| 3 | `exam-2020-2-task-3` | Rot-Schwarz-Einfügen und -Löschen | 4 | `src-97414623dd81`, S. 4 | `src-8a588d5ddc35`, S. 4 | fehlt für den vollständigen Operationsumfang |
| 4 | `exam-2020-2-task-4` | Prim | 4 | `src-97414623dd81`, S. 5 | `src-8a588d5ddc35`, S. 5 | vorhanden |
| 5 | `exam-2020-2-task-5` | Schleifeninvariante | 5 | `src-97414623dd81`, S. 6 | `src-8a588d5ddc35`, S. 6 | vorhanden |
| 6 | `exam-2020-2-task-6` | Rekurrenz und Induktion | 5 | `src-97414623dd81`, S. 7 | `src-8a588d5ddc35`, S. 7 | fehlt für den konkreten Master-Fall |
| 7 | `exam-2020-2-task-7` | Greedy-Entwurf Fitnesspunkte | 8 | `src-97414623dd81`, S. 8 | `src-8a588d5ddc35`, S. 8 | vorhanden |
| 8 | `exam-2020-2-task-8` | unbeschränkte Budget-DP | 8 | `src-97414623dd81`, S. 9–10 | `src-8a588d5ddc35`, S. 9–10 | vorhanden für die DP-Entwurfskompetenz |
| 9 | `exam-2020-2-task-9` | direkt adressierte Multimenge | 8 | `src-97414623dd81`, S. 11–12 | `src-8a588d5ddc35`, S. 11–12 | fehlt |

## Identitäts- und Evidenzentscheidungen

- Jede kanonische Frage verbindet genau eine reale Klausurevidenz mit genau einer offiziellen Lösungsevidenz derselben Aufgabennummer.
- `q-c2391c1b18d8` und `q-32867772a3cd` sind Titelseitenevidenzen und keine Fragen.
- Die zweiseitigen Aufgaben 8 und 9 bleiben jeweils eine kanonische Frage; ihre Folgeseiten werden über Seitenreferenzen derselben Evidenzbeziehung erfasst.
- Die Sammlung ist `complete`: neun erwartete, neun entschiedene und neun final geprüfte Fragen.

## Fachliche Abweichung

Die offizielle Lösungsskizze von Aufgabe 8 enthält in der Rekurrenz die Bedingung `j-P_i>0`. Damit wäre ein Rechnertyp mit `P_i=j` unzulässig. Der Pseudocode auf derselben Seite prüft hingegen korrekt `j≥P_i`. [Lösung: `src-8a588d5ddc35`, S. 9]

Die kanonische Lösung ist deshalb als `authored_solution` gekennzeichnet und verwendet die konsistente Bedingung `P_i≤j`. Der Randfall wird durch einen deterministischen Test mit `P_i=j` abgesichert. Es wird nicht behauptet, die gedruckte Rekurrenz sei unverändert korrekt.

## Publikations- und Lösungsstatus

Alle neun Fragen verwenden `public_safe_reconstruction`; keine Originalkopie besitzt eine Publikationsfreigabe. Acht Fragen tragen `complete_verified_solution` mit `official_solution`-Provenienz. Aufgabe 8 trägt `authored_solution` mit `authored_from_verified_method`-Provenienz und getrennten offiziellen Lösungsreferenzen.

## Zugänglichkeit

- Die Graphen aus Aufgaben 2 und 4 liegen als koordinierte SVG-Daten mit vollständigen semantischen Kantenlisten und Textalternativen vor.
- Rot-Schwarz-Bäume liegen als strukturierte Knotenlisten mit Schlüssel, Farbe, Kindern und expliziter schwarzer NIL-Konvention vor.
- Farben sind niemals die einzige Information.
- Mathematische Ausdrücke verwenden KaTeX-fähige LaTeX-Blöcke mit Textalternativen.
- Keine Darstellung bindet PDF-Seiten oder Rasterbilder in das Produkt ein.

## Ressourcenmapping

Das Mapping wurde in `data/question-resource-mapping-report.json` erweitert. Fehlende Trainer werden ausdrücklich als `trainerCoverage: missing` ausgewiesen. Ein thematisch nur teilweise passender Trainer wird nicht als vollständige Abdeckung ausgegeben.

## Reviewstatus

Alle neun Fragen tragen `content_reviewed` und `final_reviewed`. Es fand kein unabhängiger zweiter Review statt; diese Einschränkung ist pro Frage dokumentiert. Der reale Screenreader-Gate für NVDA/Narrator bleibt unverändert offen und wird durch diesen Checkpoint nicht als bestanden ausgegeben.

## Verbleibende Unsicherheit

Für die Sammlung selbst ist kein Aufgabeninhalt blockiert. Offen bleiben der unabhängige Zweitreview und ein realer Test mit NVDA beziehungsweise Narrator. Die kanonische DP-Korrektur ist fachlich deterministisch abgesichert, bleibt aber ausdrücklich eine redaktionelle und keine wörtliche offizielle Lösung.

## Validierung

Die Sammlung wird durch Schema-, Referenz-, Sammlungs-, Evidenz- und Mappingregeln geprüft. Deterministische Tests decken insbesondere folgende Ergebnisse ab:

- IntervalScheduling-Auswahlfolge;
- DFS-Entdeckungs- und Abschlusszeiten;
- fünf Rot-Schwarz-Zustände und ihre Invarianten;
- Prim-Auswahlfolge und Gesamtgewicht;
- Schleifeninvariante und Rekurrenzwerte;
- Greedy-Optimalwert gegen vollständige Permutationssuche für kleine Fälle;
- Budget-DP gegen vollständige Suche einschließlich `P_i=j`;
- direkte Multimengenoperationen und Vereinigung.
