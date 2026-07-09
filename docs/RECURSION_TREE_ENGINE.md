# Rekursionsbaum-Engine

Stand: 2026-07-07

Für die produktive Rekurrenz gilt auf Ebene `i`: `8^i` Teilprobleme der Größe `n/2^i`; die Kosten pro Knoten sind `(n/2^i)^3`, also sind die Ebenenkosten `8^i*(n/2^i)^3=n^3`. Bei Höhe `log_2(n)` ergibt sich `(log_2(n)+1)n^3`.

Quellenbasis: `src-25d6340b518c`, Seiten 17-18, belegt die geschlossene Form; `src-baa07f0a207a`, Seiten 209 und 230-238, belegt Rekursionsbaum- und induktive Laufzeitargumente in der Vorlesung.
