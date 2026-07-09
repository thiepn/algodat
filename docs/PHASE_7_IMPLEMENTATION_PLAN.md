# Phase 7 Implementierungsplan

## Ist-Zustand

Phase 6 hat fünf produktive Trainer bereitgestellt. Alle sind `public_safe`, deterministisch bewertet und einzeln im Prüfungsmodus nutzbar:

1. `trainer-rucksack-dp-v1`
2. `trainer-union-find-listen-v1`
3. `trainer-schleifeninvariante-summe-v1`
4. `trainer-rekurrenz-master-fall1-v1`
5. `trainer-dp-entwurf-mine-v1`

Die Quellenbasis bleibt die bestehende Trainerquellenbasis. Für den Simulator werden keine Originalaufgaben gebündelt und keine historischen Volltexte verwendet.

## Historische Profilabdeckung

Die historischen Profile sind nicht vollständig startbar. Der Standard mit neun Aufgaben, die 2021-Ausnahme sowie reale Profile 2020, 2022 und 2024 haben Lücken. Besonders A1–A4 in voller Breite sowie A7 und A9 besitzen noch keine vollständige interaktive Trainerabdeckung.

Folge: Historische Profile werden als Coverage-Vorschau angezeigt, aber nicht als vollständige Simulation gestartet.

## Geplante Simulatorarchitektur

Die Domain wird ohne React-Abhängigkeit unter `src/domain/exam-simulator/` implementiert. Sie enthält:

- Profile- und Package-Validierung,
- Session-Lifecycle,
- Timer und Zeitablauf,
- Recovery-Snapshots,
- Traineradapter,
- exakte Punkteaggregation,
- Ergebnisbericht,
- Mastery V6.

## Geplante Prüfungsdefinition

Startbar ist genau ein Package:

`exam-package-kernkompetenz-v1`

Typ: `generated_core_mock`, also eine neu zusammengestellte Probeklausur. Sie ist keine historische Originalklausur.

Aufgaben:

1. Rucksack-DP-Tracing
2. Union-Find-Tracing
3. Schleifeninvariante
4. Rekurrenz-Laufzeitbeweis
5. DP-Entwurf Mine

Jede Aufgabe erhält 8 Klausurpunkte. Gesamt: 40 Punkte.

## Zeitlogik

Die Dauer wird als Trainingsableitung aus dem Standardprofil berechnet:

`180 Minuten / 50 Punkte = 3,6 Minuten pro Punkt`

Für 40 Punkte ergibt das `144 Minuten`. Diese Dauer ist nicht offiziell.

## Persistenz

Da eigenständige Prüfungssessions, Snapshots und Ergebnisse gespeichert werden, wird IndexedDB auf Version 7 angehoben. Neue Stores:

- `examSessions`
- `examSnapshots`
- `examResults`

Export und Import werden erweitert.

## Scoringaggregation

Die Adapter nutzen bestehende Trainer-Engines. Interne Punkte werden mit rationaler Arithmetik auf Klausurpunkte abgebildet. Es wird keine offizielle Note angezeigt.

## Mastery V6

Mastery V6 ergänzt prüfungsweite Dimensionen:

- `exam_readiness`
- `exam_time_management`
- `task_switching_discipline`
- `completion_reliability`
- `performance_under_time_pressure`
- `cross_topic_transfer`

Update erfolgt erst nach endgültiger Abgabe.

## Recovery

Sessions speichern Snapshots mit Version, Prüfsumme, Content-Version, Package-Version und Adapterversionen. Beschädigte Snapshots werden erkannt und nicht stillschweigend überschrieben.

## Risiken

- Accessibility: Timer und Aufgabenwechsel benötigen klares Fokusmanagement.
- Performance: Simulator muss lazy geladen bleiben.
- Content: Historische Profile dürfen nicht als vollständig startbar erscheinen.
- Deployment: Keine PDF-Links, keine privaten Pfade und keine `local_only`-Inhalte.

## Nichtziele

- keine vollständige historische Neun-Aufgaben-Klausur,
- keine neuen A7- oder A9-Trainer,
- kein LLM-Scoring,
- kein Backend,
- keine offizielle Notenberechnung,
- keine Anti-Cheat- oder Überwachungstechnik.

