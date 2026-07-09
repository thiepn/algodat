# Accessibility Manual Audit Phase 14

## Geprüfter Bereich

- `/diagnose`
- `/diagnose/schnellcheck`
- `/diagnose/session/:sessionId`
- `/diagnose/auswertung/:sessionId`

## Ergebnis

- Alle produktiven Eingaben verwenden native Formularelemente: Radio, Checkbox, Select, Button und Input.
- Jeder Diagnoseabschnitt nutzt Überschriften, Fieldsets und sichtbare Legenden.
- Fehler beim Fortfahren ohne Antwort werden mit `role="alert"` ausgegeben.
- Die Diagnoseauswertung nutzt Textkarten und Links, keine farbabhängige alleinige Codierung.
- Es werden keine PDF-Links exponiert.

## Offene manuelle Prüfung

Eine echte Screenreader-Prüfung mit NVDA/VoiceOver steht weiterhin aus. Die fachliche Diagnose selbst ist quellengebunden, zum Beispiel Graphgrundlagen über `src-35405e721f05`, Seite 3, und `src-88179ac88dc5`, Seite 3.
