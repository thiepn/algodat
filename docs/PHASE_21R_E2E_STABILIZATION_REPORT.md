# Phase 21R: E2E-Stabilisierungsbericht

Stand: 13. Juli 2026

## Ergebnis

Die vollständige Playwright-Matrix ist stabil: 84 von 84 Fällen bestehen. Die ursprünglichen 13 Fehler sind in `PHASE_21R_E2E_FAILURE_AUDIT.md` einzeln klassifiziert und behoben. Die Matrix wuchs von 76 auf 84 Fälle, weil die Mobilnavigation nun an allen geforderten Größen in beiden Chromium-Projekten geprüft wird.

## Produktkorrektur

Die mobile Navigation speichert nur noch einen booleschen Offen-/Geschlossen-Zustand. Navigations- und Markenlinks schließen das Menü unmittelbar; Browserhistorienwechsel schließen es über `popstate`. Dadurch öffnet ein alter Menüstatus nach Zurück/Vorwärts nicht erneut. Escape schließt weiterhin und setzt den Fokus auf den Menüschalter zurück.

## Testkorrekturen

- Kompakte Navigation wird vor Interaktionen über den sichtbaren Menüschalter geöffnet.
- Diagnose- und Lernplanfluss prüfen den aktiven Link über `aria-current`.
- Die beiden 200%-Fälle verwenden einen halbierten CSS-Viewport statt der nicht äquivalenten CSS-Eigenschaft `zoom`.
- Der Simulator-V4-Test akzeptiert seinen Bestätigungsdialog explizit.
- Der horizontal scrollende Simulator-Aufgabenwechsel wird mobil per Fokus und Enter geprüft, ohne erzwungenen Pointerklick.
- Header-Screenshots warten auf `document.fonts.ready` und reduzierte Bewegung.
- Die Mobilmatrix prüft 320 × 568, 360 × 800, 375 × 812, 390 × 844, 412 × 915 und 768 × 1024: Menüschalter, einmaliges Öffnen, Escape, Routenwechsel, Zurück/Vorwärts, Fokus, `aria-current`, Landmark-Eindeutigkeit, Scrollwiederherstellung, ungebrochene Gruppenlabels und Seitenüberlauf.

## Snapshotentscheidung

Zwei projektspezifische Referenzdateien wurden ergänzt. Sie bilden kein neues Layout ab, sondern sind byteidentisch mit den bereits versionierten und visuell geprüften Dateien des Desktop-Projekts:

- 1326-Pixel-Header: SHA-256 `CBECBAD7F188DF0B205E6FF357C309E3753083E7F6416409203C615DCFA3445B`
- 390-Pixel-Mobilheader: SHA-256 `9EF776721B0D2F39D1877F85B59F15D73E7797FE0446DBF0C513DA898FA706E0`

Es wurden keine Masken ergänzt und keine abweichenden Actuals ungeprüft übernommen.

## Validierung

| Gate | Ergebnis |
| --- | --- |
| Formatprüfung | bestanden |
| ESLint | bestanden, 0 Warnungen |
| TypeScript | bestanden |
| Unit/Integration | 44 Dateien, 264 Tests bestanden |
| Vollständige Playwright-Matrix | 84 Tests bestanden |
| Responsive Navigation, fokussiert | 28 Tests bestanden |
| 200%-Zoom/Reflow | 6 relevante Matrixfälle bestanden: zwei dedizierte Navigationsfälle sowie Accessibility- und Trainerfall in beiden Projekten |
| Produktionsbuild | bestanden; Version bleibt `1.0.0-rc.8` |
| Deployment-Sicherheit | 128 Artefakte geprüft; keine privaten Quellen oder lokalen Pfade |

Der In-App-Browser stand für eine zusätzliche manuelle Browserzoomprüfung nicht zur Verfügung. Die zwei vorhandenen Screenshotpaare wurden dennoch direkt visuell geprüft; der Reflow wurde deterministisch über halbierte CSS-Viewports verifiziert.

## Weiter offene Gates

Phase 21R.1 ist nicht abgeschlossen. Die unabhängige didaktische Zweitprüfung und der reale Narrator-/NVDA-Test bleiben offen. Es erfolgten weder Merge noch Deployment.
