# Audit öffentlicher Quelldaten

Stand: 11. Juli 2026

Vor Phase 21R enthielten mindestens 80 von 138 öffentlichen Quellenobjekten ein `title`-Feld mit mehr als 160 Zeichen. Der längste Wert umfasste 4.532 Zeichen; darunter befanden sich Prüfungsanweisungen, Aufgabenbestandteile und Lösungstext aus der PDF-Extraktion.

Der öffentliche Build verwendet nun ausschließlich einen kurzen, aus dem ursprünglichen Dateinamen abgeleiteten Anzeigenamen. `SourceDocumentSchema` begrenzt `title` auf 160 Zeichen. Der Content-Build bricht zusätzlich bei mehrzeiligen Titeln, mehr als 24 Wörtern oder gehäuften Markern wie „Aufgabe“, „Matrikelnummer“ und „Seite“ ab.

`data/source-manifest.json` bleibt privater Entwicklungsinput und wird nicht als Produktionsartefakt ausgeliefert. Die Git-Historienprüfung mit einer inhaltlichen Suche nach „Matrikelnummer“ führt die frühere Veröffentlichung mindestens bis Commit `7864918` („Prepare release candidate 1.0.0-rc.2“) zurück. Die Historie wurde nicht umgeschrieben; dafür wäre eine gesonderte Freigabe notwendig.
