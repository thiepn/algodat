# Diagnostic Item Model

Produktive Items sind kurze, objektiv bewertbare Aufgaben. Sie werden in `src/domain/foundations-diagnostic/schemas.ts` validiert und in `src/content/generated/diagnostic-items-*.json` gespeichert.

## Pflichtfelder

- `id`, `schemaVersion`, `contentVersion`
- `competencyIds`, `itemType`, `difficulty`
- `prompt` mit deutscher Aufgabenstellung
- `options` oder strukturierte Antwortdefinition
- `rubric` mit maximaler Punktzahl
- `sourceRefs` mit Quellen-ID und Seite
- `misconceptionIds` und `relatedTrainerIds`
- `publicDistributionStatus: "public_safe"`
- `deterministicEngineVerified: true`

## Produktive Itemtypen

Phase 14 aktiviert genau acht Renderer: `single_choice`, `multiple_choice`, `true_false_reason`, `matching`, `ordering`, `numeric_short_answer`, `algorithm_selection` und `complexity_classification`.

Fachliche Beispiele sind quellengebunden: Rekurrenz-Items referenzieren `src-25d6340b518c`, Seiten 17 und 25; Graphalgorithmus-Items referenzieren unter anderem `src-baa07f0a207a`, Seite 846.

## Abgrenzung

`symbolic_choice`, `table_completion`, `code_recognition` und `error_diagnosis` bleiben als Modelltypen vorgesehen, sind aber in Phase 14 nicht als produktive UI-Renderer gezählt. Fehlerdiagnose entsteht in V1 über Distraktoren, Fehlvorstellungs-IDs und Auswertungsfehler, nicht über einen separaten Vollrenderer.
