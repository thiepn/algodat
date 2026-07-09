# Accessibility-Audit Phase 2

## Ergebnis

Die automatisierten Prüfungen für den Phase-2-Trainer bestehen auf Desktop und Mobile. Die Oberfläche ist per Tastatur bedienbar, besitzt sichtbare Fokuszustände, deutschsprachige Beschriftungen, semantische Formularfelder, skip-link-nahe Navigation und eine mobil scrollbar begrenzte DP-Tabelle.

## Geprüfte Bereiche

- Trainerübersicht
- Aufgabenbriefing
- Moduswahl
- DP-Tabelle und Zeileneingabe
- Hinweise und Rückmeldungen
- Rubrik-Auswertung
- Fehleranalyse
- Lösungseinblendung
- Offline-Neuladen der Ergebnisansicht

## Automatisierte Werkzeuge

Vitest/Testing Library prüft Rollen, Namen, Fokus und axe-Verstöße in Komponenten. Playwright prüft Desktop- und Mobile-Flows einschließlich 200-Prozent-Zoom-ähnlicher CSS-Situation ohne horizontalen Body-Overflow.

## Manuelle Grenze

Die in Codex integrierte Browser-Ansicht war in dieser Sitzung nicht verfügbar (`agent.browsers.list()` lieferte keine Browser). Eine echte Screenreader-Smoke-Prüfung mit NVDA/VoiceOver wurde deshalb nicht durchgeführt. Vor einer öffentlichen Freigabe bleibt diese manuelle Prüfung empfohlen.
