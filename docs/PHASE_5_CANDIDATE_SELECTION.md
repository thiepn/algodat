# Phase 5 Kandidatenauswahl

Ausgewählt wurde `T(n)=8T(n/2)+n^3` mit Basisfall `T(1)=1`.

## Quellen

- `src-25d6340b518c`, Seite 17: offizielle Aufgabe zu Rekursionsgleichungen, Teil a.
- `src-25d6340b518c`, Seite 18: Auflösung, geschlossene Form und Induktionsbeweis.
- `src-25d6340b518c`, Seiten 25–27: offizielle Master-Theorem-Fassung mit Fallunterscheidung.
- `src-baa07f0a207a`, Seiten 209 und 213: Rekursionsbaum und Form `T(n)=aT(n/b)+f(n)`.

## Entscheidung

Der Kandidat erfüllt alle Mindestkriterien: offizielle Primärquelle, verifizierte Lösung, sichere Aufgaben-/Lösungsverknüpfung, eindeutige kanonische Lösung, keine offenen fachlichen Konflikte und deterministisch bewertbarer Lösungsweg.

Die angefragte Probeklausur-Rekurrenz `T(n)=16T(n/4)+n^3` wurde zurückgestellt, weil die offizielle Lösung zwar vorhanden ist (`src-35405e721f05`, Seite 8), der lokal extrahierte Induktionsbeweis aber nicht zuverlässig genug als Golden Truth ist.

Die maschinenlesbare Rangliste liegt in `data/phase5-recurrence-trainer-candidate-ranking.json`.

