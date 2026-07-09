# Phase 7 Trainer Coverage Audit

Die maschinenlesbare Matrix liegt in [phase7-trainer-coverage.json](../data/phase7-trainer-coverage.json).

| Trainer | Familie | Prüfungsmodus | Scoring | Rubrik | Offline/Recovery | Simulator |
| --- | --- | --- | --- | --- | --- | --- |
| `trainer-rucksack-dp-v1` | Tracing | ja | deterministisch | vollständig | ja | geeignet |
| `trainer-union-find-listen-v1` | Tracing | ja | deterministisch | vollständig | ja | geeignet |
| `trainer-schleifeninvariante-summe-v1` | Beweis | ja | deterministisch | vollständig | ja | geeignet |
| `trainer-rekurrenz-master-fall1-v1` | Beweis | ja | deterministisch | vollständig | ja | geeignet |
| `trainer-dp-entwurf-mine-v1` | Entwurf | ja | deterministisch | vollständig | ja | geeignet |

## Ergebnis

Alle fünf vorhandenen Trainer sind für eine Kernkompetenz-Probeklausur geeignet. Das reicht nicht aus, um eine vollständige historische Neun-Aufgaben-Klausur zu behaupten.

## Quellenhinweise

Die Quellenreferenzen bleiben die jeweiligen Trainerreferenzen:

- Rucksack-DP: `src-25d6340b518c`, Seiten 33–34; `src-baa07f0a207a`, ab Seite 390.
- Union-Find: `src-8f16b2505bbd`, Seite 6; `src-35405e721f05`, Seite 6; `src-baa07f0a207a`, Seiten 943, 946, 948, 949, 950–951.
- Schleifeninvariante: `src-25d6340b518c`, Seiten 11–12; `src-baa07f0a207a`, Seiten 132–135 und 140.
- Rekurrenz: `src-25d6340b518c`, Seiten 17–18 und 25–26; `src-baa07f0a207a`, Seiten 194–198 und 230–238.
- DP-Entwurf: `src-8f16b2505bbd`, Seite 10; `src-35405e721f05`, Seiten 11–12.

