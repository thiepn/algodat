# Accessibility Fallback Audit Plan

## Status und Grenze

Auditziel ist der stärkstmögliche Accessibility-Audit für `1.0.0-rc.2` ohne echten Screenreader. In dieser Umgebung steht kein Narrator, NVDA, JAWS, VoiceOver oder anderer Screenreader zur Verfügung. Es wird deshalb kein Screenreader-Test behauptet. Browser-Accessibility-Tree, Tastaturtests, axe, Zoom-, Reflow-, Forced-Colors- und Reduced-Motion-Prüfungen reduzieren Risiken, ersetzen aber keinen echten Screenreader-Durchlauf.

Der finale Screenreader-Gate bleibt offen. Eine finale Version `1.0.0` darf durch diesen Fallback-Audit nicht gesetzt werden.

## Verfügbare Testmethoden

- Playwright-E2E mit Desktop- und Mobile-Chromium.
- axe-core über `@axe-core/playwright` und `vitest-axe`.
- DOM-basierte Rollen-, Name-, State- und ARIA-Referenzprüfungen.
- Browser-seitige Fokusprüfungen mit `document.activeElement`.
- Tastatur-only-Prüfungen mit Tab, Shift+Tab, Enter, Leertaste, Escape und Pfeiltasten.
- Viewport-/Reflow-Prüfungen für Desktop, Mobil, 320 CSS-Pixel und simulierten Zoom.
- Playwright-Emulation für `prefers-reduced-motion: reduce`.
- Playwright-Emulation für `forced-colors: active`, soweit Chromium dies unterstützt.
- Accessibility-Tree-nahe Prüfungen über ARIA-Rollen, Accessible Names, Landmarks, Überschriften und semantische Tabellen.
- PWA-/Offline-Regression über bestehende Playwright-Flows.

## Nicht verfügbare Testmethoden

- Tatsächliche Screenreader-Nutzung mit Narrator, NVDA, JAWS oder VoiceOver.
- Prüfung realer Aussprache, Verbosität, Browse-/Forms-Mode-Wechsel und virtueller Puffer.
- Betriebssystemweite Windows-High-Contrast-Prüfung außerhalb der Browser-Emulation.
- Manuelle DevTools-Accessibility-Panel-Sichtprüfung durch eine sehende Person außerhalb der automatisierten Browserausgabe.

## Kritische Nutzerflüsse

- Erststart: Titel, Hauptüberschrift, Skip-Link, Hauptnavigation, Datenschutz-/Offline-Hinweis.
- Diagnose: Schnellcheck, Single Choice, Multiple Choice, Matching, Ordering, Konfidenz, Fehlerzustand, Auswertung, Empfehlungen.
- Tiefe Trainer: Graphtrainer, Entwurfstrainer, Beweis- oder Rekurrenztrainer mit Start, Eingabe, Hinweis, Fehler, Abgabe, Rubrik, Musterlösung und Wiederholung.
- Simulator: V4, Briefing, Aufgabenwechsel, Timer, unvollständige Aufgabe, Reload/Recovery, Abgabe, Ergebnisbericht.
- Lernplan: Tagesplan, Aktivitätsgrund, Start, Snooze/Skip, Wochenplan, Prüfungsreife, Slotdetails, Einstellungen.
- Spickzettel: Übersicht, neuer Spickzettel, Moduswahl, Blockauswahl, Verschieben ohne Drag-and-Drop, Varianten, Overflow, Vorschau, Druck, Quellenanker, Wiederöffnen.
- Export/Import: lokale Datenbereiche, ungültige Datei, Konflikt-/Merge-/Replace-Erklärung, Fokus nach Fehler.
- Offline/PWA: warmer Offline-Start, Update-Hinweis, später aktualisieren, laufende Arbeit vor Update.

## Automatisierte Prüfungen

- axe auf zentralen Routen und Zuständen.
- Rollen-/Name-/State-Prüfung für Buttons, Links, Inputs, Radiogruppen, Checkboxen, Dialoge, Tabellen und Statusmeldungen.
- Validierung gültiger `aria-labelledby`- und `aria-describedby`-Referenzen.
- Prüfung, dass keine namenlosen Buttons oder Links existieren.
- Prüfung, dass interaktive Elemente mit Tastatur erreichbar sind.
- Prüfung von Tabellen-Captions, Scrollregionen und Textalternativen für Graphen, Matrizen und Bäume.
- Prüfung der Druckroute des Spickzettels ohne Canvas-only-Ausgabe.

## Manuelle Tastaturprüfungen

Die manuelle Fallback-Prüfung wird als `manual_non_screenreader_accessibility_audit` dokumentiert. Sie nutzt keine Maus und keinen Screenreader. Geprüft werden Erreichbarkeit, sichtbarer Fokus, Fokusreihenfolge, Fokusfallen, Dialogöffnung/-schluss, Fehlermeldungen, Abgabezustände, Routenwechsel und Reflow.

## Accessibility-Tree-Prüfungen

Da kein echter Screenreader verfügbar ist, werden zentrale Accessibility-Tree-Eigenschaften indirekt geprüft:

- `html[lang="de"]`
- Dokumenttitel
- Landmark-Struktur: Navigation, Main, Footer
- Überschriftenhierarchie
- eindeutige Namen für interaktive Elemente
- Formularlabels
- Tabellenstruktur mit Captions und Headern
- Status- und Fehlermeldungen
- keine kaputten ARIA-Referenzen

## Zoom- und Reflow-Prüfungen

Geprüft werden 100 %, 200 %, 400 %-ähnliche Darstellung per Browser-Zoom/CSS-Zoom, 320-CSS-Pixel-Viewport, mobile und Desktop-Viewports. Akzeptiert wird horizontaler Scroll nur für fachlich notwendige Tabellenregionen mit eigener Tastaturfokussierung.

## High-Contrast- und Forced-Colors-Prüfungen

Chromium-Forced-Colors-Emulation wird verwendet, soweit verfügbar. Fokusindikatoren, Buttons, Links, Statuslabels, Tabellen, Graph-/Baumzustände und Spickzettel-Blöcke müssen ohne reine Farbcodierung verständlich bleiben.

## Reduced-Motion-Prüfungen

Mit `prefers-reduced-motion: reduce` wird geprüft, dass keine notwendige Information an Animation hängt, keine starke Bewegung erzwungen wird und Fokus nicht durch Animation verzögert wird.

## Fokusprüfungen

- Routenwechsel fokussieren Main oder Hauptüberschrift.
- Skip-Link springt zum Hauptinhalt.
- Dialoge verwenden semantische Rollen und schließen tastaturbedienbar.
- Fehlerzusammenfassungen und Statusmeldungen sind nicht ausschließlich visuell.
- Autosave, Timer und Updates verschieben Fokus nicht unaufgefordert.

## Dynamische Zustände

Geprüft werden Autosave, Planregeneration, Diagnosefortschritt, Simulatorstatus, Spickzettel-Overflow, Export/Import-Hinweise, Offline-/PWA-Update-Hinweise und Ergebniszustände. Timer-Ticks dürfen keine dauernde Live-Region-Flut erzeugen.

## Release-Grenzen

Fallback-Abnahme bedeutet:

- `fallback_accessibility_audit_passed`, wenn 0 Blocking und 0 Major offen sind.
- `screenreader_gate_passed` bleibt ausdrücklich falsch.
- `real_screenreader_test` bleibt `not_executed`.
- `final_screenreader_gate` bleibt `open`.
- Releaseentscheidung bleibt `release_candidate`.
