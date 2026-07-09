# Single-Source-Graph-Tracing-Architektur

Phase 11 erweitert den Graph-Tracing-Bereich um genau einen Single-Source-Shortest-Paths-Trainer: `trainer-graph-dijkstra-v1`.

## Komponenten

- Content: `data/training/graph-tracing-trainer-dijkstra.json`
- Rubrik: `data/training-rubrics/trainer-graph-dijkstra-v1.json`
- Engine: `src/domain/graph-tracing/dijkstra.ts`
- Scoring: `src/domain/graph-tracing/scoring.ts`
- UI: `src/features/trainer/GraphTracingTrainerPage.tsx`, `GraphTracingAttemptPage.tsx`, `GraphTracingResultPage.tsx`
- Route: `/trainer/graphen/dijkstra/trainer-graph-dijkstra-v1`
- Prüfungsadapter: `dijkstra_trace` in `src/domain/exam-simulator/tasks/registry.ts`

## Fachliche Grundlage

Dijkstra wird mit `ExtractMin`, `DecreaseKey`, `p[v]=u` und Schwarzfärbung ausgeführt; Quelle: `src-baa07f0a207a`, Seite 846. Die Prioritätenschlange und Gleichstands-Zusatzinformation sind belegt in `src-baa07f0a207a`, Seite 829. Das Tabellenformat mit neu markiertem Knoten ist belegt in `src-1ea0642ec775`, Seite 6.

## Abgrenzung

Bellman-Ford wurde nicht implementiert, weil die geprüften offiziellen Quellen keine vollständige Vorgänger-Konvention für den verlangten Phase-11-Primärpfad belegen.
