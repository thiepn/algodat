# Architektur der Grundlagen-Diagnose

Die Grundlagen-Diagnose ist eine eigene Produktfamilie unter `/diagnose`. Sie ergänzt die Trainer, ersetzt aber keinen Trainer und erzeugt kein neues Klausurpaket.

## Schichten

- `scripts/phase14-diagnostic-content.ts`: erzeugt 8 Kompetenzgruppen, 64 Items, Session-Templates, Fehlvorstellungen und Empfehlungsregeln.
- `src/domain/foundations-diagnostic/`: validiert Itembank, wählt Items deterministisch, bewertet Antworten, klassifiziert Fehler und aggregiert Kompetenzen.
- `src/content/loaders/diagnostics.ts`: lädt Diagnoseinhalte separat, damit die Itembank nicht Teil des allgemeinen Content-Loaders sein muss.
- `src/features/diagnose/`: stellt Landingpage, Schnellcheck, Standarddiagnose, Themendiagnose, Session und Auswertung bereit.
- `src/persistence/`: speichert Diagnose-Sessions in IndexedDB-Version 8 im Store `diagnosticSessions`.

## Routen

- `/diagnose`
- `/diagnose/schnellcheck`
- `/diagnose/standard`
- `/diagnose/thema`
- `/diagnose/session/:sessionId`
- `/diagnose/auswertung/:sessionId`

## Quellenbindung

Jede Kompetenz und jedes Item trägt `sourceRefs`. Beispielhafte fachliche Bezüge: Landau-Notation in `src-35405e721f05`, Seiten 9 und 11; Rekurrenzen in `src-25d6340b518c`, Seiten 17 und 25; Dijkstra-Auswahl in `src-baa07f0a207a`, Seite 846. Die Original-PDFs werden nicht verlinkt.
