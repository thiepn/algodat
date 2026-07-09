# Trainer-Architekturaudit Phase 3

## Ergebnis

Die Phase-2-Architektur war für einen einzelnen Rucksack-DP-Trainer gebaut. Phase 3 trennt nun Registry, Problemtyp, Engine und Renderer so, dass mehrere verifizierte Trainer parallel existieren können.

## Geänderte Schnittstellen

- `src/content/schemas/content.ts`: `TracingProblemSchema` ist eine diskriminierte Union nach `algorithm`.
- `src/features/trainer/trainer-service.ts`: `trainerRegistry` beschreibt Trainer unabhängig vom konkreten Renderer.
- `src/domain/tracing/`: Rucksack-DP und Union-Find liegen als getrennte deterministische Engines vor.
- `src/persistence/database/schema.ts`: `DATABASE_VERSION = 3`; Versuche können per Trainer indexiert werden.

## Stabilitätsprüfung

- Der bestehende Rucksack-DP-Pfad bleibt unter `trainer-rucksack-dp-v1` erhalten.
- Der neue Union-Find-Pfad verwendet `trainer-union-find-listen-v1`.
- Abgaben speichern Engine-, Problem-, Scoring-, Mastery- und Antwortschema-Version.
- Registry-Einträge enthalten Status, Modi, Quellen, Renderer-Typ und öffentliche Freigabe.

## Erkannte Architekturgrenzen

- Renderer-Verzweigung liegt noch in React-Komponenten und ist für zwei Trainer tragbar.
- Für eine dritte oder vierte sehr unterschiedliche Trainerfamilie sollte ein explizites Renderer-Plugin-Interface eingeführt werden.
- Die gemeinsamen Fehlercodes sind erweitert, aber noch kein eigenständiges Taxonomie-Modul.

