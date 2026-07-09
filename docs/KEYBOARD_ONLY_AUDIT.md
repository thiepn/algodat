# Keyboard-only-Audit

## Status

Der Keyboard-only-Fallback-Audit für `1.0.0-rc.2` ist bestanden.

Maschinenlesbarer Audit: `data/accessibility-keyboard-audit.json`.

## Geprüfte Flüsse

- Erststart mit Skip-Link.
- Hauptnavigation und Routenwechsel.
- Diagnose inklusive Fehlerzustand, Matching und Ordering.
- Trainerfamilien inklusive Graph-/Matrix-, Beweis-, Rekurrenz- und Entwurfsformularen.
- Simulator V4 mit Briefing, Aufgabenwechsel, Recovery und Abgabe.
- Lernplan mit Tagesaktionen.
- Spickzettel mit manueller Reihenfolge, Variantenpräferenz und Druckroute.
- Warmes Offline-/PWA-Verhalten.

## Ergebnis

Alle zentralen Produktflüsse besitzen tastaturbedienbare Wege. Drag-and-Drop ist für den Spickzettel nicht erforderlich; die manuelle Reihenfolge ist über Buttons bedienbar. Diagnose-Ordering nutzt ebenfalls Button-Alternativen.

## Offene Einschränkung

Ein sichtbarer öffentlicher Export-/Importdialog wurde im Routeninventar nicht als zentrale Route gefunden. Export und Import sind technisch durch Persistenztests abgesichert; die sichtbare Bedienroute bleibt als Minor-Limit dokumentiert.
