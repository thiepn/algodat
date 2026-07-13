# Kanonische Sammlung `exam-2024-1`

Stand: 13. Juli 2026

## Ergebnis

`exam-2024-1` ist auf Fragenebene vollständig: neun final geprüfte, öffentlich sichere Rekonstruktionen mit insgesamt 50 Punkten. Die Ereignismetadaten bleiben davon getrennt unvollständig. Semester, genaues Datum, Bearbeitungszeit, Hilfsmittel, Prüfer und offizielle Bezeichnung werden im kanonischen Datensatz ausdrücklich als unbekannt geführt. Diese Angaben werden weder aus Dateinamen noch aus benachbarten Dokumenten oder privaten Aufnahmen übernommen. [Aufgabenquelle: `src-6df30a9ff1ae`, S. 1–9]

## Ereignisidentität und Dublette

Die Quellen `src-6df30a9ff1ae` und `src-ce97639c1821` besitzen jeweils neun Seiten und denselben SHA-256-Hash:

`ff0843ff716bb519b8fbc0c8856bcc49f5e32f83bff36d8221fa5fc18a6c88b3`

Beide gehören zur exakten Dublettengruppe `dup-exact-5771ba7f1157`. Seitenfolge, Aufgaben, Punkte, Graph, Baumcrop, handschriftliche Markierungen und Seitenbeschnitt sind identisch. Sie zählen als ein Klausurereignis und neun Fragenidentitäten. Die Evidenz aus `src-6df30a9ff1ae` ist kanonisch; die jeweilige Evidenz aus `src-ce97639c1821` bleibt reine Dublettenevidenz. [Quellen: `src-6df30a9ff1ae`, S. 1–9; `src-ce97639c1821`, S. 1–9]

## Seitenreview und Aufgabenbestand

| Aufgabe | Seite | Punkte | Unteraufgaben | Inhalt | Lösungsstatus |
| ---: | ---: | ---: | --- | --- | --- |
| 1 | 1 | 4 | – | DFS mit alphabetischer Start- und Nachbarschaftsreihenfolge | authored |
| 2 | 2 | 4 | a, b | 0/1-Rucksack, fünf Objekte, Kapazität 9 | authored |
| 3 | 3 | 4 | – | Rot-Schwarz-Einfügen 70, 68; Löschen 66, 24 | authored |
| 4 | 4 | 4 | – | MergeSort für `[74,19,12,34,30,65,56]` | authored |
| 5 | 5 | 5 | a, b, c | Schleifeninvariante zur Summe gerader Einträge | authored |
| 6 | 6 | 5 | a, b | `T(n)=2T(n/4)+n`, Viererpotenzen | offizielle identische Übungslösung |
| 7 | 7 | 8 | a, b, c | Greedy-Entwurf für Entsorgungsstationen | authored |
| 8 | 8 | 8 | a, b, c, d | DP für einseitige Messreihenähnlichkeit | offizielle identische Übungslösung mit dokumentierter Korrektur |
| 9 | 9 | 8 | a, b, c | Ausgabe eines negativen gerichteten Kreises | authored |

Die visuell bestätigte Punktefolge `4, 4, 4, 4, 5, 5, 8, 8, 8` summiert sich zu 50. Jede Seite wurde einzeln auf Aufgabenummer, Punkte, Unteraufgaben, Eingaben, Formeln, Schleifengrenzen, Richtungen, Farben, Laufzeit- und Beweispflichten geprüft. [Quelle: `src-6df30a9ff1ae`, S. 1–9]

## Private visuelle Unterstützung für Aufgabe 3

Die öffentliche PDF-Evidenz schneidet den unteren Teil des Ausgangsbaums ab. Eine private Vergleichsaufnahme wurde nur im Entwicklungsreview verwendet. Die Zuordnung ist hochsicher, weil Aufgabennummer, vier Punkte, vollständiger Wortlaut, umgebendes Seitenlayout und der im PDF noch sichtbare Baumteil übereinstimmen. Rekonstruiert wurde die vollständige Ausgangsstruktur: Wurzel 24 schwarz, linkes Kind 14 rot, rechtes Kind 66 rot; alle fehlenden Kinder sind schwarze NIL-Blätter.

Die Aufnahme erhält intern den Status `private_visual_support_evidence`. Sie ist keine kanonische Frage, keine Lösung und kein freigegebenes Hosted Material. Dokumentation und Produktionsdaten enthalten weder Bild, Bytes, Base64-Daten, lokalen Pfad noch URL. [Öffentliche Aufgabenreferenz: `src-6df30a9ff1ae`, S. 3]

## Suche nach Lösungsevidenz

| Geprüfte Quelle | Befund |
| --- | --- |
| `src-02c9bed0177d`, S. 1–11 und `src-5a4d89dac601`, S. 1–11 | Byteidentische Kopien einer anderen Klausurlösung: abweichende Aufgaben zu MergeSort, Hashing, Bellman-Ford, Union-Find, Potenzberechnung, anderer Rekurrenz, Teile-und-Herrsche, anderer DP und Färbung. Alle 18 Evidenzzeilen sind `mismatched_solution_evidence`. |
| `src-a9c498f9af7b`, S. 1–17 | Enthält fotografische Ausschnitte und handschriftliche Bearbeitung derselben Klausur, aber keine autorisierte Musterlösung. Nur Vergleichsevidenz. |
| `src-fbf39f80037d`, S. 1–11 | Lösung einer fachlich anderen Probeklausur; keine Aufgabenidentität. |
| `src-fd725d118ee1`, S. 1–15 | Probeklausurlösung mit anderer Aufgabenfolge; keine Aufgabenidentität. |
| `src-10a4e5432d36`, S. 3 und 7 | Offizielle Übungslösung zur exakt identischen Rekurrenz aus Aufgabe 6; Ergebnis `T(n)=2n−√n`. |
| `src-618e7da9bab3`, S. 1–3 | Offizielle spätere Übungsaufgabe mit identischer Messreihendefinition und Lösung für Aufgabe 8. |

Die Messreihenlösung schreibt in Rekurrenz und Pseudocode `B[i]`, obwohl Zustand, Definition und der Fall `m<n` zwingend `B[j]` verlangen. Die kanonische Lösung verwendet `B[j]`; der Konflikt bleibt unter `conflict-exam-2024-task-8-index` dokumentiert. [Aufgabe: `src-6df30a9ff1ae`, S. 8; Lösung: `src-618e7da9bab3`, S. 2–3]

Handschriftliche Antworten der Klausurkopie wurden weder als offizielle Lösung noch als Korrektur oder Bewertungsraster behandelt. Die sieben ohne passende offizielle Lösung entstandenen Lösungen tragen `authored_from_verified_method` und `authored_solution`.

## Lösungsverifikation

| Aufgabe | Verifikation | Erwartetes Ergebnis |
| ---: | --- | --- |
| 1 | deterministische DFS auf der strukturierten Kantenliste | Zeiten `(a:1/16, b:2/15, c:3/14, d:8/9, e:4/5, f:6/11, g:7/10, h:12/13)` |
| 2 | vollständige DP-Auswertung und Teilmengenvergleich | `R[5,9]=33`, Objekte 2, 4, 5 |
| 3 | Prüfung von BST-Ordnung, Wurzelfarbe, Rot-Rot-Verbot und Schwarz-Höhen nach jeder Operation | Endbaum `68B(14B,70B)` |
| 4 | deterministische MergeSort-Rekursion | `[12,19,30,34,56,65,74]` |
| 5 | exhaustive kleine Zahlenfelder plus strukturierter manueller Beweischeck | Summe aller geraden Einträge |
| 6 | Rekurrenzwerte auf Viererpotenzen und Induktionsidentität | `T(n)=2n−√n∈Θ(n)` |
| 7 | exhaustive Teilmengenvergleiche kleiner Kapazitätsfelder | kleinstes Präfix der absteigend sortierten Kapazitäten mit Summe mindestens `m` |
| 8 | exhaustive Aufzählung aller zulässigen Verbindungen kleiner Instanzen | Beispielwert 3, Laufzeit `O(nm)` |
| 9 | exhaustive kleine gerichtete Graphen gegen Floyd-Warshall-Negativdiagonale | geschlossener Kreis mit negativer Gewichtssumme oder korrekte Negativmeldung |

Die freien Beweise wurden strukturiert auf Behauptung, Basis, Erhaltung beziehungsweise Induktionsschritt, Terminierung und Schluss geprüft. Das ist kein automatischer Theorembeweis.

## Barrierefreie Rekonstruktion

- Aufgabe 1 enthält positionierte Graphknoten, vollständige gerichtete Kantenliste, alphabetische Regeln und Textalternative.
- Aufgabe 2 enthält semantische Objekt- und DP-Tabellen mit Spaltenköpfen und vollständiger Textalternative.
- Aufgabe 3 enthält für Ausgangsbaum und alle vier Ergebnisse Schlüssel, Farbe, linkes und rechtes Kind sowie die NIL-Konvention als strukturierte Daten und Text.
- Aufgabe 4 verwendet ein semantisches Array und textuell vollständige Operationsfolgen.
- Aufgaben 5 bis 9 verwenden KaTeX-fähige Formeln und eingerückten Pseudocode mit Klartextalternative.

Keine Frage hängt von einer Originalseite oder Aufnahme ab.

## Ressourcenabdeckung und offene Lücken

Vollständig abgedeckt sind Aufgabe 2 durch den Rucksacktrainer und Aufgabe 5 durch den Invariantentrainer. Aufgaben 6 bis 8 sind methodisch teilweise durch vorhandene Rekurrenz-, Greedy- und DP-Entwurfstrainer abgedeckt. Für DFS, Rot-Schwarz-Löschen, MergeSort-Rekursionsebenen und Negativkreisrekonstruktion fehlt eine produktive vollständige Trainerabdeckung. Unverwandte Trainer wurden nicht zugeordnet.

## Reviewgrenzen

Alle neun Fragen besitzen Inhalts- und Finalreview, jedoch keinen unabhängigen fachlichen Zweitreview. Der reale Narrator-/NVDA-Test bleibt ebenfalls offen. Deshalb bleiben Phase 21R und Phase 21R.1 trotz abgeschlossener Sammlung unvollständig. Nach dieser Versöhnung sind 51 Identitäten entschieden und 33 Kandidaturen offen.
