# Phase 18 Completion Report

Version: `1.0.0-rc.4`  
Screenreader-Gate: offen  
Status: implementiert, lokale Validierung läuft noch in dieser Arbeitsphase.

## Produktänderungen

- 18 vollständige Lernmodule unter `/lernen` und `/lernen/:moduleSlug`.
- 9 vollständige Aufgabe-Guides für Aufgabe 1–9.
- Themen-Detailseiten zeigen Lerninhalt oberhalb von Evidenzdaten.
- Redundante `Klausurprofile`-Navigation entfernt.
- `/klausurprofile`, `/simulator/profile` und `/simulator/profile/:profileId` leiten auf `/pruefungsstruktur` um.
- Neue Seite `/pruefungsstruktur` für das aktuelle Aufgabe-1–9-Modell.
- Klausurenbibliothek filtert `generated_unverified`, `generated_example` und Platzhalterfragen aus normalen Ansichten.
- Entwickler-Audit für ausgeschlossene Fragen: `exam-question-publication-audit.json`.
- Neue lokale PDF-Bibliothek unter `/dokumente`.
- Quellenbibliothek zeigt Lernaktionen und lokale PDF-Verbindung statt primär technischer Metadaten.
- Simulator zeigt eine aktuelle Probeklausur, keine V1–V4-Auswahl als Primärprodukt.
- Sechs Checkboxen vor Prüfungsstart entfernt.
- JSON-Antwortfeld entfernt; normale Textantworten werden lokal gespeichert.
- Sichtbare Prüfungsnavigation mit Aufgabe, Status, Review-Markierung und Punkten.
- Bundle-Policy entspannt: 500 kB/1 MB Warnungen, 5 MB harte Notfallgrenze.

## Inhalte und Zahlen

- Vollständige Lernmodule: 18
- Vollständige Aufgabe-Guides: 9
- Öffentliche Klausurfragen nach Filter: 402
- Ausgeschlossene Entwickler-Audit-Fragen: 231
- Produktiver aktueller Exam-Package-Fokus: `exam-package-kernkompetenz-v4`
- Unterstützte Rendererfamilien im aktuellen Paket: Rucksack-DP, Union-Find, Rot-Schwarz-Einfügen, Schleifeninvariante, Rekurrenz, Divide-and-Conquer-Entwurf, DP-Entwurf.

## Datenschutz und Copyright

- Private PDFs bleiben im lokalen Browser-Storage.
- Kein PDF wird in Git, `dist`, Service-Worker-Precache oder GitHub Pages eingebunden.
- Mapping-Export enthält keine PDF-Bytes.
- Öffentliche Quellenlinks bleiben auf explizite Allowlist-Folgearbeit beschränkt.

## Noch ehrlich offen

- Vollständige Screenreader-Freigabe bleibt offen.
- Exam-Mode nutzt sichtbare, strukturierte Aufgabenansicht ohne JSON; die vollständige Einbettung aller spezialisierten Trainer-Renderer ist noch nicht für jede Familie abgeschlossen.
- Modellantworten im Ergebnisbericht sind nicht für alle Adapter gleich tief ausformuliert.
