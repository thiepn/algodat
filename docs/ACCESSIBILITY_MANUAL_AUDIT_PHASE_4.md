# Accessibility-Audit Phase 4

Geprüfte Punkte:

- Beweiseditor nutzt Labels für alle Eingabefelder.
- Der Prüfungsmodus enthält keine Hinweise vor der Abgabe.
- Statusmeldungen nutzen `aria-live`.
- Die Ergebnisbewertung ist per Überschriften, Tabellen und Details erreichbar.
- Formeln werden mit KaTeX und `role="math"` gerendert.

Automatisierte Ergänzung: bestehende Playwright-/axe-Flows bleiben aktiv; neue Proof-Routen werden über Router- und E2E-Flows abgedeckt.

