# Accessibility-Tree-Audit

## Status

Der Accessibility-Tree-Fallback für `1.0.0-rc.2` ist bestanden. Der Status ist ausdrücklich kein echter Screenreader-Test.

Maschinenlesbarer Audit: `data/accessibility-tree-audit.json`.

## Methode

Geprüft wurden zentrale Routen mit DOM-, axe- und Chromium-Accessibility-Tree-Fallback:

- `/`
- `/diagnose`
- `/trainer`
- `/simulator`
- `/lernplan`
- `/spickzettel`

Zusätzlich wurden aktive Unterflüsse in Diagnose, Simulator V4 und Spickzettel-Druckroute geprüft.

## Prüfkriterien

- Dokument- und App-Sprache Deutsch.
- Hauptnavigation mit Accessible Name.
- `main#hauptinhalt` als fokussierbarer Hauptbereich.
- Überschriftenstruktur inklusive `h1`.
- Benannte Links, Buttons, Eingaben, Checkboxen und Selects.
- Keine kaputten ARIA-Referenzen.
- Keine axe-Verstöße in den geprüften Routen.
- Semantische Alternativen für Graphen, Matrizen, Rot-Schwarz-Farbzustände und Druckausgabe.

## Ergebnis

Alle geprüften Routen besitzen erreichbare Landmarks, benannte Interaktionselemente und gültige ARIA-Referenzen. Die speziellen Strukturen Graph, Matrix, Baumdarstellung und Spickzettel-Druckausgabe sind nicht Canvas-only und enthalten textuelle oder tabellarische Alternativen.

## Grenze der Aussage

Der Browser-Accessibility-Tree zeigt technische Semantik, nicht die tatsächliche Bedienqualität eines Screenreaders. Aussprache, Navigationsmodi und Screenreader-spezifische Heuristiken bleiben ungeprüft.
