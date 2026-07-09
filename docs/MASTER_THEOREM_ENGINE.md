# Master-Theorem-Engine

Stand: 2026-07-07

Die Phase-5-Engine akzeptiert produktiv nur die belegte Rekurrenz `T(n)=8T(n/2)+n^3`, `T(1)=1`. Daraus werden `a=8`, `b=2`, `f(n)=n^3`, `log_2(8)=3` und `O(n^3 log n)` bestimmt.

Quellenbasis:

- `src-25d6340b518c`, Seiten 17-18: Aufgabe und offizielle Lösung der Rekursionsgleichung.
- `src-25d6340b518c`, Seiten 25-26: offizielle Master-Theorem-Übung mit Fallauswahl.
- `src-baa07f0a207a`, Seiten 194-198: Vorlesungsform rekursiver Laufzeiten.

Grenze: Andere Rekurrenzen, etwa die Probeklausur-Variante `T(n)=16T(n/4)+n^3`, werden nicht produktiv bewertet, solange keine belastbare Golden-Truth-Lösung extrahiert und validiert ist.
