# Auswahl der nächsten realen Klausursammlung

## Abschluss `exam-2021-1`

Die zunächst wegen einer falschen Lösungszuordnung zurückgestellte Erstklausur 2021 wurde als fünfte Sammlung vollständig kanonisiert. Ihre sechs Aufgaben, 60 Punkte und 120 Minuten bleiben als historische Ausnahmestruktur erhalten. Die falsche Lösungsquelle wurde nach vollständigem Vergleich aller 16 Seiten nicht verbunden; sämtliche sechs Lösungen sind transparent authored. Damit betrifft die nächste Auswahlentscheidung noch 42 offene Kandidaturen. [Klausur: `src-28fe81380661`, S. 1–7; abweichende Quelle: `src-39eb3d94f40a`, S. 1–16]

## Abschluss `exam-2022-2`

Die zuvor zurückgestellte Zweitklausur 2022 wurde nach vollständigem Seitenreview als vierte Sammlung kanonisiert. Deckblatt, neun Aufgabenseiten und fünf leere Rückseiten sind eindeutig; vier byteidentische Dateien werden als ein Ereignis dedupliziert. Aufgaben 1 bis 8 sind transparent authored. Für Aufgabe 9 wurde eine wortgleiche spätere offizielle Übungslösung gefunden und verifiziert. [Quelle: `src-011d1ee23245`, S. 1–15; Lösung: `src-02be45f603ba`, S. 3–4]

Der damalige nächste Auswahlschritt betraf 48 offene Kandidaturen; dieser Zähler ist durch `exam-2021-1` überholt. `exam-2022-2` bleibt abgeschlossen und ist kein offener Auswahlkandidat mehr.

Stand: 13. Juli 2026

## Folgeentscheidung nach Abschluss von `exam-2020-2`

Die zunächst priorisierte Sammlung `exam-2021-1` wurde vollständig visuell geprüft, aber nicht kanonisiert: Die sechs Aufgaben der Klausur auf den Seiten 2 bis 7 stimmen fachlich nicht mit der als Lösung inventarisierten 16-seitigen Quelle überein. Die vermeintliche Lösung enthält andere Aufgabenvarianten und darf deshalb nicht als Lösungsevidenz verbunden werden. Der Konflikt ist in `data/source-conflicts.json` dokumentiert. [Klausur: `src-28fe81380661`, S. 2–7; abweichende Quelle: `src-39eb3d94f40a`, S. 1–16]

Als nächste Sammlung wurde deshalb `exam-2022-1` gewählt und abgeschlossen. Die digitale Klausur ist auf allen 16 Seiten lesbar, enthält neun Aufgaben mit insgesamt 50 Punkten und fünf ausdrücklich leere Rückseiten. Eine offizielle Musterlösung derselben Ereignisidentität ist nicht vorhanden. Die neun Lösungen werden daher transparent als `authored_from_verified_method` beziehungsweise `authored_solution` geführt und beziehen sich jeweils auf die Aufgabenquelle, nicht auf eine behauptete Lösungsquelle. [Quelle: `src-c4dde22523d3`, S. 1–16]

Die Auswahl ist gegenüber `exam-2022-2` und `exam-2024-1` belastbarer: `exam-2022-1` besitzt vollständige Deckblattdaten, eine durchgehende digitale Fassung und ein bestätigtes Neun-Aufgaben-/50-Punkte-Profil. Das Fehlen einer offiziellen Lösung wird nicht verdeckt, sondern durch deterministische Rechen- und Invariantentests sowie die authored Kennzeichnung kontrolliert. [Quelle: `src-c4dde22523d3`, S. 1–15]

## Frühere Entscheidung für den ersten realen Abschluss

## Entscheidung

Als nächste vollständig zu kanonisierende reale Klausursammlung wurde `exam-2020-2` ausgewählt. Sie besitzt eine eindeutig zugeordnete, verifizierte Klausur mit zwölf Seiten und eine getrennte offizielle Lösungsskizze mit ebenfalls zwölf Seiten. Die Titelseite nennt neun Aufgaben und insgesamt 50 Punkte. [Quelle: `src-97414623dd81`, S. 1; Lösung: `src-8a588d5ddc35`, S. 1]

Die erwartete Aufgabenanzahl beträgt daher neun. Der fachliche Inhalt liegt geschlossen auf den Seiten 2 bis 12 vor; die Aufgaben 8 und 9 werden jeweils auf einer Folgeseite fortgesetzt. [Quelle: `src-97414623dd81`, S. 2–12; Lösung: `src-8a588d5ddc35`, S. 2–12]

## Vergleich der Kandidaten

| Sammlung | Identität und Dublette | Prüfungsdaten | Aufgaben-/Lösungsumfang | Lesbarkeit und visuelles Risiko | Entscheidung |
| --- | --- | --- | --- | --- | --- |
| `exam-2020-2` | `src-97414623dd81`, keine exakte Dublettengruppe | Sommersemester 2020, 7.10.2020, 180 Minuten, ein beidseitig handschriftliches DIN-A4-Blatt; 9 Aufgaben, 50 Punkte | Aufgabe S. 2–12; offizielle Lösung `src-8a588d5ddc35`, S. 2–12, vollständig | Beide digitalen Quellen gut lesbar; nach Vollreview 0 ungelöste Diagramme | Ausgewählt: geringstes Identitätsrisiko, vollständige Lösungsevidenz und vollständiges Neun-Aufgaben-Profil. [Quelle/Lösung jeweils S. 1–12] |
| `exam-2021-1` | `src-28fe81380661`; exakte Klausurdublette `dup-exact-503c2fc8ed32` | Sommersemester 2021, 29.09.2021, 120 Minuten; 6 Aufgaben, 60 Punkte; umfangreiche physische/digitale Hilfsmittel erlaubt | Aufgaben S. 2–7; keine passende offizielle Lösung gefunden; `src-39eb3d94f40a`, S. 1–16, ist nachweislich unpassend | Alle sieben Klausurseiten und alle 16 Seiten der abweichenden Quelle visuell geprüft; benötigte Strukturen zugänglich rekonstruiert | Abgeschlossen: historische Sechs-Aufgaben-Struktur bewahrt, Dubletten versöhnt, sechs authored Lösungen geprüft und falsche Lösung getrennt. [Klausur: `src-28fe81380661`, S. 1–7; abweichende Quelle: `src-39eb3d94f40a`, S. 1–16] |
| `exam-2022-1` | `src-c4dde22523d3`; vier Dateien in `dup-exact-307863e0562a` | Sommersemester 2022, 29.07.2022, 180 Minuten, ein beidseitiges DIN-A4-Blatt; 9 Aufgaben, 50 Punkte | Aufgaben S. 2–16; keine offizielle Lösung derselben Ereignisidentität im Inventar | Alle 16 Seiten einschließlich fünf leerer Rückseiten visuell geprüft | Abgeschlossen: vierfache Dublette versöhnt und neun authored Lösungen transparent gekennzeichnet. [Quelle: `src-c4dde22523d3`, S. 1–16] |
| `exam-2022-2` | `src-011d1ee23245`; vier Dateien in `dup-exact-b05448680a76` | Sommersemester 2022, 17.09.2022, 180 Minuten, ein beidseitiges DIN-A4-Blatt; 9 Aufgaben, 50 Punkte | Aufgaben S. 2–15; offizielle spätere Übungslösung zu Aufgabe 9 | Alle 15 Seiten einschließlich fünf leerer Rückseiten visuell geprüft | Abgeschlossen: vierfache Dublette versöhnt, acht authored Lösungen und eine verifizierte spätere offizielle Lösung. [Quelle: `src-011d1ee23245`, S. 1–15; Lösung: `src-02be45f603ba`, S. 3–4] |
| `exam-2024-1` | `src-6df30a9ff1`; zwei Dateien in `dup-exact-5771ba7f1157` | Jahr 2024; Semester, Datum, Dauer, Hilfsmittel und Gesamtpunktzahl sind in der vorliegenden neunseitigen Aufgabenfassung nicht ausgewiesen | Aufgaben 1–9 auf S. 1–9; keine offizielle Lösung im Inventar | Fotografierter, aber lesbarer Bestand; bereits Aufgabe 1 enthält einen Graphen, weitere visuelle Strukturen sind ohne Vollreview offen | Zurückgestellt: fehlende Deckblattdaten, fotografische Quelle, Dublette und fehlende Lösungsevidenz. [Quelle: `src-6df30a9ff1`, S. 1] |

Die Vergleichsaussagen beziehen sich ausschließlich auf `data/question-inventory.json`, `data/source-manifest.json` und die visuell geprüften Titelseiten. „Diagrammzahl offen“ bedeutet bewusst, dass für eine zurückgestellte Sammlung noch kein vollständiger visueller Seitenreview durchgeführt wurde; sie wird nicht als null ausgegeben. Die Tabelle ist keine Aussage darüber, ob außerhalb des lokalen Bestands weitere Lösungen existieren.

## Auswahlkriterien

- reale, offiziell verifizierte Klausurquelle;
- explizite Ereignisidentität `exam-2020-2`;
- vollständige Aufgabenfolge 1–9;
- getrennte offizielle Lösungsskizze derselben Ereignisidentität;
- überschaubares Dublettenrisiko;
- vollständige visuelle Prüfbarkeit aller Aufgaben- und Lösungsseiten.

## Bekannte Risiken vor der Bearbeitung

1. Die Klausurkopie enthält bereits sichtbare Lösungseinträge. Deshalb wird sie nur als Aufgabenevidenz verwendet; die getrennte Lösungsskizze bleibt die maßgebliche Lösungsevidenz.
2. Aufgabe 3 verwendet die visuelle Konvention „rote Knoten werden weiß dargestellt“. Die kanonische Fassung nennt Farben zusätzlich textuell. [Quelle: `src-97414623dd81`, S. 4]
3. Die gedruckte Rekurrenz von Aufgabe 8 verwendet stellenweise die strikte Bedingung `j-P_i>0`, während der Pseudocode derselben Seite den Randfall `j=P_i` zulässt. Dieser Konflikt muss dokumentiert und deterministisch geprüft werden. [Lösung: `src-8a588d5ddc35`, S. 9]

## Abgrenzung

Die Auswahl verändert weder private Quelldateien noch die Produktionsfreigabe. Sie eröffnet genau eine neue kanonische Sammlung; alle anderen realen Klausurkandidaten bleiben offen.
