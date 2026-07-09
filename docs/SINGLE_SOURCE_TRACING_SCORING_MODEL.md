# Single-Source-Tracing-Scoring-Modell

Die Rubrik `rubric-trainer-graph-dijkstra-v1` vergibt 40 interne Punkte:

| Kriterium | Punkte |
|---|---:|
| Startknoten und Initialisierung | 4 |
| ExtractMin- und Markierungsreihenfolge | 8 |
| Distanztabelle | 10 |
| Vorgängertabelle | 8 |
| Verbessernde Relaxationen | 5 |
| Laufzeit und Begründung | 5 |

Die Bewertung ist deterministisch. Distanz- und Vorgängerfehler werden getrennt bewertet; Folgefehler werden nicht als alternative kanonische Spur akzeptiert. Fachliche Grundlage: `src-baa07f0a207a`, Seite 846, und `src-1ea0642ec775`, Seite 6.
