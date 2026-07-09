# Trainer-Registry

## Zweck

Die Registry ist die zentrale Liste produktiver Trainer. Sie verhindert, dass UI, Persistenz, Scoring und Prüfungssimulator implizit nur einen Trainer kennen.

## Produktive Einträge

| Trainer | Familie | Renderer | Mastery | Status |
|---|---|---|---|---|
| `trainer-rucksack-dp-v1` | Dynamische Programmierung | `knapsack` | `mastery-v2` | `verified` |
| `trainer-union-find-listen-v1` | Union-Find | `union_find` | `mastery-v2` | `verified` |
| `trainer-schleifeninvariante-summe-v1` | Beweise | `proof_loop_invariant` | `mastery-v3` | `verified` |
| `trainer-rekurrenz-master-fall1-v1` | Rekurrenzen | `recurrence_runtime_proof` | `mastery-v4` | `verified` |
| `trainer-dp-entwurf-mine-v1` | Dynamische Programmierung | `dp_design_mine` | `mastery-v5` | `verified` |
| `trainer-greedy-entwurf-fitnesspunkte-v1` | Greedy-Entwurf | `greedy_design_fitnesspunkte` | `mastery-v7` | `verified` |
| `trainer-rot-schwarz-einfuegen-v1` | Bäume | `red_black_tree_insertion` | `mastery-v8` | `verified` |
| `trainer-graph-floyd-warshall-v1` | Graphen | `floyd_warshall_matrix` | `mastery-v9` | `verified` |
| `trainer-graph-dijkstra-v1` | Graphen | `dijkstra_trace` | `mastery-v10` | `verified` |

## Mindestfelder

Jeder Registry-Eintrag enthält Trainer-ID, Trainerart, Titel, Beschreibung, Themen-IDs, Aufgabentypen, Algorithmusfamilie, verfügbare Modi, Schwierigkeitsstufen, Quellenreferenzen, Verifikationsstatus, öffentliche Freigabe sowie Engine-, Renderer-, Scoring- und Mastery-Version.

## Quellenpflicht

Registry-Einträge dürfen nur auf Quellen-IDs und Seiten verweisen. Produktionsartefakte dürfen keine lokalen PDF-Pfade, absoluten Benutzerpfade oder PDF-Links enthalten.

## Phasennachträge

- Phase 4: `trainer-schleifeninvariante-summe-v1`; Quellen: `src-25d6340b518c`, Seiten 11-12; `src-baa07f0a207a`, Seiten 132-135 und 140.
- Phase 5: `trainer-rekurrenz-master-fall1-v1`; Quellen: `src-25d6340b518c`, Seiten 17-18 und 25-26.
- Phase 6: `trainer-dp-entwurf-mine-v1`; Quellen: `src-8f16b2505bbd`, Seite 10; `src-35405e721f05`, Seiten 11-12.
- Phase 8: `trainer-greedy-entwurf-fitnesspunkte-v1`; Quellen: `src-97414623dd81`, Seite 8; `src-8a588d5ddc35`, Seite 8.
- Phase 9: `trainer-rot-schwarz-einfuegen-v1`; Quellen: `src-97414623dd81`, Seite 4; `src-8a588d5ddc35`, Seite 4; `src-5c9eadb17ccc`, Seiten 5, 7, 15, 20 und 36.
- Phase 10: `trainer-graph-floyd-warshall-v1`; Quellen: `src-8f16b2505bbd`, Seite 4; `src-35405e721f05`, Seite 5; `src-c4dde22523d3`, Seite 4.
- Phase 11: `trainer-graph-dijkstra-v1`; Quellen: `src-baa07f0a207a`, Seiten 829 und 846; `src-1ea0642ec775`, Seite 6; `src-011d1ee23245`, Seite 4.
## Phase 12 Ergänzung

`trainer-graph-prim-mst-v1` ist als zehnter produktiver Lernpfad registriert.

- Renderer: `prim_mst_trace`
- Route: `/trainer/graphen/prim/trainer-graph-prim-mst-v1`
- Engine: `graph-tracing-prim-mst-v1`
- Scoring: `single-source-tracing-scoring-v1`
- Mastery: `mastery-v11`
- Quellen: `src-8f16b2505bbd`, Seite 3; `src-35405e721f05`, Seite 3; `src-baa07f0a207a`, Seiten 955-958 und 960-965.
# Phase 13 Ergänzung

`trainer-dc-entwurf-maxwertdifferenz-v1` ist als elfter produktiver Lernpfad registriert.

- Renderer: `divide_conquer_max_difference`
- Route: `/trainer/entwurf/divide-and-conquer/trainer-dc-entwurf-maxwertdifferenz-v1`
- Engine: `divide-conquer-maxwertdifferenz-v1`
- Scoring: `divide-conquer-design-scoring-v1`
- Mastery: `mastery-v12`
- Quellen: `src-88179ac88dc5`, Seite 7.

# Phase 14 Ergänzung

Phase 14 registriert keinen zwölften Trainer. Die Diagnose empfiehlt vorhandene Trainer über Kompetenz- und Fehlvorstellungsregeln, zum Beispiel `trainer-rekurrenz-master-fall1-v1` für Rekurrenzen (`src-25d6340b518c`, Seiten 17 und 25), Graphtrainer für Graphalgorithmusfragen (`src-baa07f0a207a`, Seite 846) und den Beweistrainer für Korrektheitsgrundlagen (`src-25d6340b518c`, Seite 11).

# Phase 16 Ergänzung

Phase 16 registriert keinen neuen Trainer. Der Spickzettel-Builder verweist auf bestehende Trainer- und Diagnosekompetenzen, bewertet aber keine neuen Aufgaben.
