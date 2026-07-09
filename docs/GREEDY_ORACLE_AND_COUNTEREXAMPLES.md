# Greedy-Oracle und Gegenbeispiele

## Oracle

`solveFitnesspunkteGreedy` sortiert absteigend und berechnet den Zielfunktionswert. Für kleine Instanzen prüft `validateGreedyOracle` das Ergebnis gegen vollständige Permutationssuche.

## Beleg

Die Zielfunktion und der Greedy-Algorithmus sind durch `src-97414623dd81`, Seite 8 und `src-8a588d5ddc35`, Seite 8 belegt.

## Gegenbeispielpolitik

Der produktive Trainer erzeugt keine neuen fachlichen Gegenbeispiele als Wahrheit. Er nutzt kleine Zahleninstanzen nur zur Oracle-Prüfung derselben belegten Regel.
