# Phase 8 Kandidatenauswahl

## Entscheidung

Ausgewählt wird `Fitnesspunkte` aus Aufgabe 7 der echten Klausur 2020-2. Die Auswahl ist produktiv zulässig, weil die Aufgabe und die Lösungsskizze in offiziellen Quellen auf derselben Seite 8 belegt sind.

## Belege

| Kandidat | Status | Beleg | Entscheidung |
| --- | --- | --- | --- |
| Fitnesspunkte | echte Klausur, Lösung vorhanden | `src-97414623dd81`, S. 8; `src-8a588d5ddc35`, S. 8 | produktiv |
| Workout | echte Klausur, Lösung fehlt | `src-c4dde22523d3`, S. 11 | zurückgestellt |
| Entsorgungsstationen | echte Klausur, OCR/ Lösung unvollständig | `src-6df30a9ff1ae`, S. 7 | zurückgestellt |
| Laternen | Probeklausur, Lösung vorhanden | `src-8f16b2505bbd`, S. 9; `src-35405e721f05`, S. 9–10 | Referenz, nicht produktiv |
| Divide-and-Conquer-Breite | nicht Greedy | Korpus-Aufgabe-7-Verteilung | nur Kontext |

## Kanonische Fachbasis für Fitnesspunkte

Die produktive Kanonik ist eng begrenzt:

- Sortiere die Schwierigkeitsgrade `S[1..n]` absteigend.
- Summiere `S[i] · (n - i + 1)` über die sortierte Reihenfolge.
- Die Laufzeit ist durch `O(n log n)` beschränkt, weil Sortieren dominiert.
- Der Beweis ist ein Widerspruchs-/Austauschargument: Wenn in einer optimalen Reihenfolge ein Paar `Opt[i] < Opt[i+1]` steht, verbessert der Tausch dieses Paars den Wert um `Opt[i+1] - Opt[i]`.

Diese Aussagen sind durch `src-8a588d5ddc35`, Seite 8 belegt. Varianten dürfen nur andere numerische Eingaben verwenden; Regel, Ziel und Beweisstruktur bleiben unverändert.
