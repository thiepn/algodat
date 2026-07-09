# Phase 2 – Implementierungsplan

## Ziel

Phase 2 liefert genau einen vollständigen vertikalen Lernpfad für eine verifizierte Tracing-Aufgabe. Der Pfad muss von der sicheren Kandidatenauswahl über aktives Eingeben, deterministisches Scoring, Fehlerdiagnose, Persistenz, Beherrschungsupdate, Empfehlung und Offline-Nutzung bis zur Dokumentation reichen.

## Kandidatengate

Der bevorzugte Kandidat Dijkstra wurde nur zugelassen, wenn Aufgabe, Lösung und Tie-Breaker gemeinsam offiziell belegbar sind. Dieses Gate wurde nicht erfüllt. Stattdessen wurde **Rucksack-DP-Tabelle** gewählt, weil `src-25d6340b518c`, Seite 33–34, eine offizielle Aufgabe mit typgesetzter Lösung enthält und `src-baa07f0a207a`, ab Seite 390, die Vorlesungsgrundlage liefert.

Die öffentliche Trainingsinstanz ist neu formuliert und übernimmt keine privaten Aufgabenformulierungen oder Zahlenwerte aus den PDFs. Sie verwendet nur die belegte Methode, Notation und Tabellenstruktur.

## Arbeitspakete

1. Kandidatenranking und Quellenentscheidung dokumentieren.
2. Schemas für Trainer, Tracing-Schritte, Rubrik, Fehler, Empfehlungen und öffentliche Verteilbarkeit ergänzen.
3. Einen öffentlichen, quellenausgerichteten Rucksack-DP-Trainer mit deterministisch berechneter Musterlösung erzeugen.
4. Eine reine Domain-Engine für Validierung, Trace-Erzeugung, Scoring, Fehlerklassifikation, Mastery und Empfehlungen implementieren.
5. IndexedDB auf Version 2 migrieren: Entwurf, Abgabe, Fehler, Rubrik, Hinweise, Lösungsoffenlegung und Mastery speichern.
6. Deutsche UI-Routen für Übersicht, Aufgabe, Versuch und Auswertung bauen.
7. Code-Splitting, KaTeX-Lazy-Load, PWA-Cache-Schutz und Deployment-Audit aktualisieren.
8. Unit-, Integrations-, Komponenten-, Accessibility-, Offline- und E2E-Tests ergänzen.
9. Abschlussdokumentation und Phase-3-Empfehlung erstellen.

## Akzeptanzkriterien

- Alle sichtbaren Texte sind deutsch.
- Jede fachliche Behauptung verweist auf Datei und Seite.
- Original-PDFs bleiben privat, unverändert und außerhalb des Build-Artefakts.
- `npm run verify` besteht.
- Der Trainer funktioniert auf Desktop und Mobile, mit Tastatur, Offline-Neuladen und validierter lokaler Persistenz.
- Bekannte Grenzen werden im Abschlussbericht ausdrücklich genannt.
