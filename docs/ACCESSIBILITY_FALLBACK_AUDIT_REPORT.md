# Accessibility-Fallback-Audit-Bericht

## Ergebnis

Der Accessibility-Fallback-Audit für `1.0.0-rc.2` ist bestanden. Der Audit fand ohne echten Screenreader statt und darf deshalb nicht als Screenreader-Freigabe gelesen werden.

Status der Release-Entscheidung:

- Fallback-Gate: bestanden.
- Blocking-Issues im Fallback-Audit: 0.
- Major-Issues im Fallback-Audit: 0.
- Minor-Issues: 1, weil kein sichtbarer öffentlicher Export-/Importdialog als zentrale Route gefunden wurde; die Persistenzübertragung ist technisch getestet.
- Echter Screenreader-Test: `not_executed`.
- Finaler Screenreader-Gate: `open`.
- `1.0.0`: weiterhin blockiert.
- Freigabestand: `1.0.0-rc.2`.

## Geprüfter Umfang

Geprüft wurden Erststart, Hauptnavigation, Skip-Link, Routenfokus, Diagnose, Trainerfamilien, Simulator V4, Lernplan, Spickzettel-Editor, Druckroute, Offline-/PWA-Verhalten, Zoom/Reflow, Forced Colors und Reduced Motion.

Maschinenlesbare Nachweise:

- `data/accessibility-keyboard-audit.json`
- `data/accessibility-tree-audit.json`

Automatisierte Nachweise:

- `tests/unit/accessibility-audit-data.test.ts`
- `tests/e2e/accessibility-fallback.spec.ts`

## Durchgeführte Fallback-Methoden

- Tastaturbedienung ohne Maus für zentrale Produktflüsse.
- Fokus- und Skip-Link-Prüfung.
- axe-Prüfungen auf zentralen Routen.
- DOM-Prüfung auf kaputte ARIA-Referenzen.
- Prüfung auf benannte interaktive Elemente.
- Chromium-Accessibility-Tree-Fallback über `Accessibility.getFullAXTree`.
- 320-px-Reflow- und Zoom-nahe Layoutprüfung.
- Forced-Colors-Prüfung.
- Reduced-Motion-Prüfung.
- HTML-Druckroutenprüfung für den Spickzettel.

## Nicht durchgeführt

Es wurde kein Test mit Narrator, NVDA, JAWS, VoiceOver oder einem anderen echten Screenreader durchgeführt. Es wurden keine Screenreader-Aussprache, kein Browse-/Forms-Mode, keine Rotor-/Elementlisten und keine tatsächlichen Screenreader-Navigationsmodi geprüft.

Der Browser-Accessibility-Tree ist nur ein technischer Fallback. Er reduziert Risiken, ersetzt aber keinen echten Screenreader-Test.

## Gefundene und behobene Probleme

- Routenwechsel setzten den Fokus nicht zuverlässig auf den Hauptinhalt. Behoben durch Routenfokus auf `main#hauptinhalt`.
- Der Spickzettel-Editor hatte keine vollständige tastaturfreundliche manuelle Reihenfolge mit Variantenpräferenz. Behoben durch Hoch-/Runter-Buttons und Checkbox für erweiterte Varianten.
- Die Spickzettel-Druckroute hatte keinen robusten `h1`-Semantikanker. Behoben durch druckausgeblendete, aber semantische Hauptüberschrift.
- Reflow bei 320 px konnte durch Visualisierungszeilen überlaufen. Behoben durch flexibles Wrapping.
- Forced Colors erzeugten Kontrastverstöße in Navigations- und Kartenflächen. Behoben durch systemfarbige `forced-colors`-Regeln.

## Verbleibende Einschränkungen

Die verbleibenden Einschränkungen sind in `docs/ACCESSIBILITY_REMAINING_LIMITATIONS.md` dokumentiert. Keine davon hebt den bestandenen Fallback-Audit auf, aber der offene Screenreader-Gate verhindert die finale Version `1.0.0`.
