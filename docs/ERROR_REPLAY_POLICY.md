# Error Replay Policy

Error Replay nutzt vorhandene Fehlerdaten:

- `errorCode`
- `rootCauseErrorId`
- `rubricCriterionId`
- `misconceptionId`
- `relatedTrainerId`
- empfohlene Review-Aktivität

Phase 15 erzeugt keine neuen Aufgaben. Wenn kein public-safe Inhalt existiert, bleibt die Aktivität blockiert oder der Slot zeigt eine Coverage-Lücke.

Beispiel: Wiederholter Dijkstra-Fehler führt zu `activity-dijkstra-error` und verweist auf `trainer-graph-dijkstra-v1`; Fachbezug `src-baa07f0a207a`, Seite 846.
