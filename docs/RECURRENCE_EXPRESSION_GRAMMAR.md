# Rekurrenz-Ausdrucksgrammatik

Stand: 2026-07-07

Produktiv akzeptiert wird nur die normalisierte Form `T(n)=8T(n/2)+n^3; T(1)=1` mit äquivalenten Leerzeichenvarianten. Die Grammatik ist bewusst eng, weil Phase 5 keine allgemeine symbolische Algebra verspricht.

Belegte mathematische Bestandteile:

- Rekurrenz und Basisfall: `src-25d6340b518c`, Seite 17.
- Geschlossene Form und Umformung: `src-25d6340b518c`, Seite 18.

Nicht unterstützt: beliebige `a,b,f(n)`, verschobene Basisfälle, nicht ganzzahlige Teilproblemgrößen oder freie deutschsprachige Beweise.
