# Bundle Import Audit

## Ergebnis

Cheat-Sheet-Seiten liegen unter `src/features/cheat-sheet/` und werden ausschließlich über lazy Routen importiert. Cheat-Sheet-JSONs werden nicht im allgemeinen `content`-Loader referenziert, sondern über `src/content/loaders/cheat-sheet.ts`.

## Risiken

Der Router selbst bleibt im Entry. Weitere Entry-Reduktion müsste Route-Metadaten oder Layoutbasis verschlanken.
