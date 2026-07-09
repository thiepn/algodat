# Diagnostic Item Bank Policy

Die Itembank ist ein prüfbares Lernartefakt, keine kanonische Vorlesungsquelle.

## Mindestregeln

- 60 bis 120 produktive Items.
- Mindestens 8 Kompetenzgruppen.
- Mindestens 4 Items pro aktiver Kompetenz.
- Mindestens 2 Schwierigkeitsstufen.
- Mindestens ein Fehlerdiagnosepfad pro Kompetenz.
- Mindestens 8 produktive Itemtypen.
- Keine privaten Pfade, PDF-Links oder Original-PDF-Artefakte.

Phase 14 erfüllt diese Regeln mit 64 Items. Die Kompetenzquellen sind in `data/phase14-competency-inventory.json` dokumentiert, zum Beispiel Asymptotik über `src-35405e721f05`, Seiten 9 und 11, und Graphgrundlagen über `src-35405e721f05`, Seite 3, sowie `src-88179ac88dc5`, Seite 3.

## Validierung

`scripts/validate-content.ts` prüft Itemanzahl, Kompetenzreferenzen, Quellenreferenzen, Trainerreferenzen, Fehlvorstellungsreferenzen, public-safe-Status und deterministische Engine-Markierung.
