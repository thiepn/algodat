# Phase 9 Portfolioentscheidung

## Ergebnis

Phase 9 wählt **Pfad A: Rot-Schwarz-Bäume**. Produktiv umgesetzt wird ein enger Trainer für Invarianten, Einfügung, Rotation und Reparatur.

## Rot-Schwarz-Bäume

Rot-Schwarz besteht die nicht kompensierbaren Gates:

- Offizielle echte Klausuraufgabe: `src-97414623dd81`, Seite 4.
- Offizielle Lösungsskizze zur Aufgabe: `src-8a588d5ddc35`, Seite 4.
- Offizielle Vorlesungsbasis: `src-5c9eadb17ccc`, Seiten 3-5, 7, 10, 13-15, 20, 22-23, 30, 34-36.
- Die Einfügung ist deterministisch bewertbar: BST-Einfügung, roter neuer Knoten, lokale Reparatur, abschließend schwarze Wurzel.
- Die Invarianten sind unabhängig prüfbar: Farbe, schwarze Wurzel, schwarze NIL-Blätter, keine rote Eltern-Kind-Kante, gleiche Schwarzhöhe, BST-Ordnung.

Die Löschung wird nicht produktiv umgesetzt. Sie ist in der echten Aufgabe enthalten, aber der stabile Phase-9-Vertikalschnitt benötigt keine Löschfall-Bewertung.

## Graphtransfer

Graphtransfer bleibt zurückgestellt:

- Reale Graphtransfer-Aufgaben sind belegt, etwa `src-28fe81380661`, Seite 7, und `src-6df30a9ff1ae`, Seite 9.
- Eine Probeklausur-/Lösungskombination zu Schnittknoten ist vorhanden: `src-d233302bcf39`, Seite 10, und `src-a66dd4b4981a`, Seite 18.
- Für die echten neueren Graphtransfer-Varianten fehlen jedoch verknüpfte vollständige Lösungen.
- Die 2021er Lösungslage ist konflikthaft: Die inventarisierte Lösung ist nicht sauber als vollständige Graphtransfer-Musterlösung verifizierbar.

## Auswahlregel

Rot-Schwarz erhält 91 Punkte, Graphtransfer 76 Punkte. Zusätzlich verfehlt Graphtransfer die nicht kompensierbaren Gates „vollständige/verifizierte Lösung“ und „Aufgabe-Lösung eindeutig verknüpft“ für den produktiven Echtklausur-Vertikalschnitt. Daher wird genau Rot-Schwarz implementiert.
