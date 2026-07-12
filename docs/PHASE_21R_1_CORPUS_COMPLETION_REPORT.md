# Phase 21R.1 – Zwischenstand kanonischer Fragenkorpus

Phase 21R.1 ist **nicht abgeschlossen**. Der Korpus-Gate ist eingeführt, die vollständige manuelle Versöhnung der Evidenz steht noch aus.

| Kennzahl | Stand |
| --- | ---: |
| Evidenzdatensätze | 633 |
| Vorläufige Identitäten | 84 |
| Manuell entschiedene Identitäten | 27 |
| Veröffentlichungsfähige kanonische Fragen | 27 |
| Offene Kandidaturen | 57 |
| Öffentlich freigegebene Originalkopien | 0 |
| Public-safe Rekonstruktionen | 27 |
| Vollständige geprüfte offizielle Lösungen | 16 |
| Vollständige authored solutions | 11 |
| Abgeschlossene Sammlungen | 3 |
| Automatisierte Tests | 248 grün |
| Deployment-Sicherheitsprüfung | 128 Artefakte, keine privaten Quellen oder lokalen Pfade |

Die Probeklausur SS 2023 ist als erste Sammlung vollständig abgeschlossen. Alle elf Seiten der Aufgabenquelle und alle vierzehn Seiten der Beispiellösung wurden lokal visuell geprüft. Die neun Aufgaben besitzen eigenständig lösbare Körper, explizite Lösungen, Seitenbezüge, Ressourcenmappings und barrierefreie Alternativen für Graphen, Matrizen und Ablaufdarstellungen.

Die Aufgaben- und Lösungstitelseiten sind als Nicht-Fragen ausgeschlossen. Bei Aufgabe 9 vertauscht die offizielle Lösung die Bezeichnungen der Lese- und Löschoperationen. Dieser Konflikt ist dokumentiert; die kanonische authored solution folgt den eindeutigen Operationsdefinitionen der Aufgabe.

Als zweite Sammlung ist `exam-2020-2` vollständig abgeschlossen. Die neun realen Klausuraufgaben ergeben 50 Punkte; zwölf Klausur- und zwölf Lösungsseiten wurden visuell geprüft. [Quelle: `src-97414623dd81`, S. 1–12; Lösung: `src-8a588d5ddc35`, S. 1–12]

Die gedruckte DP-Rekurrenz von Aufgabe 8 schließt mit `j-P_i>0` den Randfall `j=P_i` aus, während der Pseudocode ihn zulässt. Die kanonische Fassung dokumentiert den Konflikt und führt eine unabhängig getestete `authored_solution` mit `P_i≤j`. [Lösung: `src-8a588d5ddc35`, S. 9]

Als dritte Sammlung ist `exam-2022-1` vollständig abgeschlossen. Die neun Aufgaben ergeben 50 Punkte; alle 16 Seiten einschließlich der fünf leeren Rückseiten wurden visuell geprüft. Da keine offizielle Musterlösung derselben Ereignisidentität vorliegt, sind alle neun Lösungen transparent als authored markiert und durch deterministische Tests für Lastverteilung, Rot-Schwarz-Invarianten, Floyd-Warshall, Prim, Rekurrenz und DP abgesichert. [Quelle: `src-c4dde22523d3`, S. 1–16]

Die zuvor geprüfte Sammlung `exam-2021-1` blieb zurückgestellt, weil die inventarisierte Lösungsdatei andere Aufgaben behandelt. Sie wurde nicht stillschweigend verbunden. [Klausur: `src-28fe81380661`, S. 2–7; abweichende Lösung: `src-39eb3d94f40a`, S. 1–16]

Die nächste Arbeitseinheit muss die verbleibenden 57 Kandidaturen sammlungsweise in der festgelegten Priorität visuell prüfen. Bis dahin dürfen offene Evidenzkandidaturen weder als abgeschlossene Übungsaufgaben noch als Fragen im Simulator erscheinen.
