# Release Checklist

## Automatisch

- [x] Content-Build mit Phase-16-Spickzetteldaten.
- [x] Content-Validierung inklusive Cheat-Sheet-Referenzen.
- [x] TypeScript-Typecheck.
- [x] ESLint.
- [x] Gezielte neue Tests.
- [x] Accessibility-Fallback-E2E für Keyboard, Fokus, axe, Accessibility Tree, Zoom/Reflow, Forced Colors, Reduced Motion und Spickzettel-Druckroute.
- [x] Accessibility-Auditdaten gegen ausführbare Schemas validiert.
- [ ] Vollständiges `npm.cmd run verify` nach der letzten Änderung.
- [ ] Bundle-Analyse nach finalem Build.
- [ ] Deployment-Audit nach finalem Build.

## Manuell

- [ ] Echte Screenreader-Prüfung mit Narrator oder NVDA.
- [x] Tastatur-Fallback für Diagnose, Trainer, Simulator, Lernplan und Spickzettel automatisiert und dokumentiert.
- [x] Drucksemantik der Spickzettelansicht im Browser-Fallback geprüft.
- [x] RC-Fallback-Review: 0 Blocking, 0 Major im Accessibility-Fallback-Audit.
- [ ] Finales RC-Review inklusive echtem Screenreader-Gate.

## Finalfreigabe

`1.0.0` bleibt gesperrt, bis der echte Screenreader-Gate erfüllt oder ausdrücklich als offene Einschränkung akzeptiert wurde.
