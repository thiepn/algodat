# Phase 3 Implementierungsplan

## Ziel

Phase 3 ergänzt genau einen zweiten produktiven, quellenvalidierten Trainer neben `trainer-rucksack-dp-v1`: `trainer-union-find-listen-v1`.

## Gates

1. Kandidatenauswahl mit offizieller Aufgaben-, Lösungs- und Vorlesungsquelle.
2. Öffentliche Trainingsaufgabe ohne Originalwerte, ohne PDF-Link und ohne private Pfade.
3. Ausführbares Schema für beide Trainerfamilien.
4. Deterministische Engine, Scoring, Fehlercodes und Mastery-Evidenz.
5. Registry für mehrere Trainer.
6. Migration auf IndexedDB-Version 3 ohne Datenverlust.
7. Unit-, Integrations-, Komponenten- und E2E-Tests.
8. Abschlussdokumentation und Git-Sicherheitsbericht.

## Umgesetzte Reihenfolge

1. Union-Find-Quellen verifiziert.
2. `content.ts` auf diskriminierte Problemtypen erweitert.
3. Union-Find-Trainings- und Rubrik-JSON ergänzt.
4. Union-Find-Engine in `src/domain/tracing/union-find.ts` implementiert.
5. Trainer-Service zur Registry ausgebaut.
6. UI auf Rucksack-DP und Union-Find verzweigt.
7. Persistenzschema auf Version 3 migriert.
8. Tests und Dokumentation ergänzt.

## Quellenbindung

- `src-8f16b2505bbd`, Seite 6: Probeklausuraufgabe zu Union-Find mit verketteten Listen, Weighted Union und lexikografischem Tie-Breaker.
- `src-35405e721f05`, Seite 6: offizielle Beispiellösung zur Probeklausuraufgabe.
- `src-baa07f0a207a`, Seite 943: Definition von Union-Find, Partition und Repräsentant.
- `src-baa07f0a207a`, Seite 946: Listenrepräsentation mit Repräsentantenzeiger.
- `src-baa07f0a207a`, Seite 948: Make-Set, Find und Union in der Listenstruktur.
- `src-baa07f0a207a`, Seite 949: kleinere Liste an größere Liste anhängen.
- `src-baa07f0a207a`, Seiten 950–951: Laufzeit der gewichteten Listenvariante.

