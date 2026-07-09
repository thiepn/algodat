# MST-Tracing-Architektur

Phase 12 erweitert die bestehende Graph-Tracing-Architektur um `algorithm: "prim"` und `rendererType: "prim_mst_trace"`.

Wiederverwendet werden:

- gemeinsame Graph-Tracing-Contentdateien,
- `GraphTracingTrainerPage`,
- `GraphTracingAttemptPage`,
- `GraphTracingResultPage`,
- `graph-tracing-service`,
- Simulatoradapter-Registry,
- Persistenzmodell für `PracticeAttempt`.

Neu sind:

- `PrimAnswer`,
- Prim-Trace-Schritte mit `key`, `parent`, `treeVertices`, `selectedEdges`, `totalWeight`,
- Mastery V11,
- MST-Oracle und semantische Endbaumprüfung.

Es wurde keine zweite Graph-Domain und keine externe Graphbibliothek eingeführt.

