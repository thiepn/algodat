# Phase 14 Implementierungsplan

Zielversion: `0.14.0-foundations-diagnostic`.

## Aktuelle thematische Coverage

Der Projektstand enthält elf tiefe Lernpfade: Rucksack-DP, Union-Find, Schleifeninvariante, Rekurrenzbeweis, DP-Entwurf, Greedy-Entwurf, Rot-Schwarz-Einfügen, Floyd-Warshall, Dijkstra, Prim und Divide-and-Conquer. Die Themenmatrix weist 76 textuell belegte Themen aus. Für Phase 14 werden nur Themen produktiv verwendet, deren Kurzfakten durch offizielle Quellen mit Seitenbezug belegt sind.

## Bereits tief abgedeckte Themen

- Dynamische Programmierung: Rucksack und DP-Entwurf, Quellen u. a. `src-25d6340b518c`, Seiten 33-34, sowie `src-8f16b2505bbd`, Seite 10.
- Union-Find: `src-8f16b2505bbd`, Seite 6; `src-35405e721f05`, Seite 6.
- Schleifeninvarianten: `src-25d6340b518c`, Seiten 11-12.
- Rekurrenzen und Master-Theorem: `src-25d6340b518c`, Seiten 17-18 und 25-26.
- Greedy, Rot-Schwarz-Bäume, Graphalgorithmen, Prim und D&C über die Phasen 8 bis 13.

## Fehlende Kurzkompetenzen

Phase 14 ergänzt keine neue große Engine, sondern eine kuratierte Diagnosebank für schnelle Erkennungs- und Zuordnungsaufgaben:

- Asymptotik und Landau-Notation.
- Rekurrenzform, Rekursionsbaum und Master-Theorem-Fälle.
- Suchen und Sortieren.
- Datenstruktur-Operationen.
- Graphgrundlagen.
- Graphalgorithmus-Auswahl.
- Entwurfsparadigmen.
- Korrektheit und Beweismethoden.

## Itemkandidaten

Produktiv werden nur Itemkandidaten mit deterministischer Antwortmenge und offizieller Quelle. Nicht produktiv bleiben Kandidaten, bei denen die Kurskonvention in der extrahierten Quelle unklar ist, etwa tiefe Heap-Implementierungsdetails ohne ausreichende Seitenbindung oder frei interpretierbare Pseudocodefragen.

## Quellenlage

Die V1-Bank nutzt Quellen-IDs und Seiten aus `data/topic-map.json`, insbesondere:

- `src-35405e721f05`, Seiten 2-12.
- `src-25d6340b518c`, Seiten 11-12, 17-18, 25-26, 51-52.
- `src-baa07f0a207a`, Seiten 829, 846, 928, 943, 955-965.
- `src-88179ac88dc5`, Seiten 3-7.
- `src-97414623dd81`, Seiten 3, 5, 7-8.
- `src-5c9eadb17ccc`, Seiten 5, 7, 15, 20 und 36.

## Itemtypen

V1 aktiviert acht produktive Typen:

1. SingleChoice
2. MultipleChoice
3. TrueFalseWithReason
4. Matching
5. Ordering
6. NumericShortAnswer
7. AlgorithmSelection
8. ComplexityClassification

Weitere Typen wie TableCompletion und CodeRecognition bleiben als Domain-Typen vorgesehen, aber nicht produktiv befüllt, solange keine V1-Items mit sicherer Quellenlage freigegeben sind.

## Bewertung

Die Domain bewertet ohne Freitext-Grading. Optionen werden über stabile IDs bewertet, nicht über sichtbare Texte oder Arraypositionen. Teilpunkte gelten für MultipleChoice, Matching und Ordering; SingleChoice bleibt binär. Konfidenz beeinflusst Diagnose und Empfehlungen, aber nicht die fachliche Punktzahl.

## Diagnoseaggregation

Itemergebnisse werden pro Kompetenz aggregiert. Der Bericht enthält Score, Evidenzanzahl, Konfidenzkalibrierung, häufige Fehlvorstellungen und Verweise auf passende tiefe Trainer oder Review-Aktivitäten.

## Mastery-Integration

Phase 14 führt `mastery-v13` als Diagnose-Mastery ein. Es rekonstruiert Kompetenzdimensionen aus Itemergebnissen, Modus, Konfidenz und Evidenzstärke. Alte Mastery-Daten bleiben gültig.

## Performance-Risiken

Der Entry-Chunk liegt nahe am harten Limit. Diagnose-Routen werden deshalb lazy geladen; die Itembank wird über Generated-JSON geladen und nicht im AppLayout importiert. Keine neue Chart- oder Math-Bibliothek wird eingeführt.

## Accessibility-Risiken

Matching und Ordering erhalten keine Drag-and-Drop-Pflicht, sondern zugängliche Select- und Button-/Listen-Alternativen. Zeitänderungen werden nicht live angekündigt. Der Screenreader-Status wird ehrlich dokumentiert.

## Persistenzbedarf

Diagnosesitzungen benötigen eigene Autosave- und Wiederaufnahme-Daten. Deshalb wird IndexedDB gezielt auf Version 8 erweitert und ein Store `diagnosticSessions` ergänzt. Export und Import werden um diesen Store erweitert.

## Simulatorstrategie

V1 bis V4 bleiben unverändert. Phase 14 erstellt keine V5-Vollklausur. Die Diagnose bleibt ein eigener Bereich; die Assessment-Strategie dokumentiert optional ein kurzes Grundlagenpaket, aber koppelt es nicht an den bestehenden Simulator.

## Teststrategie

Geplant sind:

- Unit-Tests für Itemvalidierung, Auswahl, Bewertung, Teilpunkte, Fehlerklassifikation, Aggregation, Konfidenz, Empfehlungen, Mastery V13 und Restore.
- Integrationstests für Generated Content und Persistenz/Export/Import.
- E2E für Schnellcheck mit Reload, Abschluss, Ergebnisbericht und Trainerempfehlung.
- Deployment-Audit-Erweiterung für produktive Diagnoseitems.

## Nichtziele

Keine neue Vollklausur, kein Kruskal-/Bellman-Ford-/BFS-/DFS-Tracing, keine freie Pseudocode- oder Beweisbewertung, kein LLM-Scoring, keine Notenprognose, keine Cloud-Synchronisation.
