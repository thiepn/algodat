# Empfehlungs-Engine der Grundlagen-Diagnose

Empfehlungen werden deterministisch aus Fehlern und niedrigen Kompetenzwerten abgeleitet. Die Engine erfindet keine neuen Inhalte.

## Quellen

- Kompetenz-zu-Trainer-Beziehungen liegen in `data/phase14-competency-inventory.json`.
- Fehlvorstellungen liegen in `src/content/generated/diagnostic-misconceptions.json`.
- Regeln liegen in `src/content/generated/diagnostic-recommendation-rules.json`.

## Beispiele

- Rekurrenzfehler empfehlen `trainer-rekurrenz-master-fall1-v1`; Fachbezug: `src-25d6340b518c`, Seiten 17 und 25.
- Union-Find- und Datenstrukturfehler können `trainer-union-find-listen-v1` empfehlen; Fachbezug: `src-35405e721f05`, Seite 6.
- Graphalgorithmusfehler können Dijkstra-, Floyd-Warshall- oder Prim-Trainer empfehlen; Fachbezug: `src-baa07f0a207a`, Seite 846, und `src-35405e721f05`, Seite 4.

Empfehlungen sind Lernhinweise, keine Prüfungsprognosen.
