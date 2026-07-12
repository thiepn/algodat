# Manuelle Freigabe kanonischer Fragen

Eine Schema-Validierung ersetzt keine redaktionelle Prüfung. Für jede kanonische Frage sind vor der Freigabe zu dokumentieren:

- Identität, Sammlung, Aufgabe und Unteraufgaben sind anhand der sichtbaren Quelle geprüft.
- Der Körper enthält alle nötigen Eingabedaten, Konventionen, Tie-Breaks und erwarteten Ergebnisse.
- Jede Matrix, Tabelle, Folge, Grafik oder Baumdarstellung hat eine semantische Alternative.
- Punkte, Abgabeanforderungen und Lösungsbezug sind geprüft.
- Der Publikationsmodus ist zulässig; `exact_approved` besitzt eine explizite Rechtefreigabe.
- Themen, Aufgabe-1–9-Slot, Lernmodul, Trainer und Diagnostik folgen dem tatsächlichen Inhalt.
- Der Seitenbezug bleibt eine Quellen-ID mit Seite; kein lokaler Pfad und keine PDF-Abhängigkeit gelangen in den öffentlichen Build.

## Aktueller Stand

Alle neun Fragen `mock-2023-task-1` bis `mock-2023-task-9` wurden am 11.07.2026 gegen Aufgaben- und Lösungsseiten manuell geprüft. Die Veröffentlichungen sind neu formulierte `public_safe_reconstruction`-Fassungen; sie enthalten keine Originalabbildung und keinen OCR-Text.

Inhalts- und Finalreview wurden nacheinander von derselben Reviewinstanz ausgeführt. Ein unabhängiger Zweitreview war in diesem Checkpoint nicht verfügbar und ist in jedem Datensatz als Limitation erfasst.

Zusätzlich wurden alle neun Fragen `exam-2020-2-task-1` bis `exam-2020-2-task-9` gegen die vollständige Klausur und offizielle Lösungsskizze geprüft. Die Graphen sind als SVG mit Kantenlisten, die Rot-Schwarz-Zustände als strukturierte farbtextuelle Bäume und Tabellen als semantisches HTML rekonstruiert. [Quelle: `src-97414623dd81`, S. 2–12; Lösung: `src-8a588d5ddc35`, S. 2–12]

Aufgabe 8 besitzt wegen des dokumentierten Randfallfehlers der gedruckten Rekurrenz eine korrigierte `authored_solution`; alle übrigen acht Lösungen der realen Sammlung sind als vollständig verifizierte offizielle Lösungen erfasst. [Lösung: `src-8a588d5ddc35`, S. 9]

Zusätzlich ist `exam-2022-1` mit neun realen Klausurfragen final geprüft. Die Aufgabenseiten S. 2–7, 9, 11, 13 und 15 sowie alle Leerseiten wurden visuell kontrolliert. Mangels offizieller Musterlösung sind die neun Lösungen als authored gekennzeichnet; ihr Aufgabenbezug ist jeweils `src-c4dde22523d3`. [Quelle: `src-c4dde22523d3`, S. 1–16]

Die übrigen 57 Kandidaturen sind nicht freigegeben. Ein unabhängiger Zweitreview der insgesamt 27 Fragen steht weiterhin aus.
