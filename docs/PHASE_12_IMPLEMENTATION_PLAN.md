# Phase 12 Implementierungsplan

Zielversion: `0.12.0-minimum-spanning-tree-tracing`.

Phase 12 ergänzt genau einen produktiven Trainer für Minimum-Spanning-Tree-Tracing. Vor der produktiven Umsetzung werden Prim, Kruskal sowie die Fallbacks BFS und DFS gegen Quellen-, Konventions- und Bewertbarkeitskriterien geprüft. Bellman-Ford bleibt gemäß Phase 11 zurückgestellt.

## Ausgangsarchitektur

- Die Graph-Tracing-Domain liegt in `src/domain/graph-tracing/` und enthält derzeit Floyd-Warshall- und Dijkstra-Engines, Parser, Scoring und gemeinsame Typen.
- Die UI für Graph-Tracing nutzt eine gemeinsame Route-Familie über `GraphTracingTrainerPage`, `GraphTracingAttemptPage`, `GraphTracingResultPage` und den `graph-tracing-service`.
- Content-Schemas in `src/content/schemas/content.ts` validieren produktive Graph-Trainer als diskriminierte Union.
- `scripts/build-content.ts` bündelt produktive Trainerdefinitionen, Rubriken und ExamPackages in generierte Inhalte.
- Der Klausursimulator verwendet `src/domain/exam-simulator/tasks/registry.ts` als Adapter-Schicht.

## Aktuelle Union-Find-Architektur

- Die bestehende Union-Find-Domain liegt in `src/domain/tracing/union-find.ts`.
- Belegt sind Make-Set, Find und Union mit verketteten Listen sowie die kleinere-an-größere-Liste-Regel durch `src-baa07f0a207a`, Seiten 943, 946 und 948-951.
- Für Kruskal kann die fachliche Komponentenidee aus `src-baa07f0a207a`, Seiten 944-945, genutzt werden; eine zweite Union-Find-Engine wird nicht angelegt.

## Aktuelle Greedy-Komponenten

- Der Greedy-Entwurfstrainer liegt in `src/domain/greedy-design/` und bewertet strukturierte Eingaben deterministisch.
- MST-Phase 12 übernimmt kein freies Greedy-Beweis-Scoring, sondern nutzt nur kurze strukturierte Begründungsbausteine zu sicherer Kante, Kreisvermeidung und Gesamtgewicht.

## Wiederverwendbare Dijkstra-Komponenten

- Dijkstra nutzt bereits prioritätsnahe Zustandsfelder: Distanzen, Vorgänger, markierte Knoten und Auswahlreihenfolge.
- Prim darf diese UI-/Trace-Struktur für Tabellen, Knotenstatus und Vorgänger übernehmen, wird fachlich aber nicht mit kürzesten Wegen gleichgesetzt.
- Gemeinsame Bausteine: normalisierte Knotenreihenfolge, deterministische Schrittfolge, Tabellenbewertung, Fehlercodes und Mastery-Aggregation.

## Quellenlage Prim

- Offizielle Probeklausuraufgabe: `src-8f16b2505bbd`, Seite 3. Belegt: ungerichteter Graph, Algorithmus von Prim, Startknoten `a`, Markieren ausgewählter Kanten und Reihenfolge der Kantenauswahl.
- Offizielle Beispiellösung: `src-35405e721f05`, Seite 3. Belegt: ausgewählte Prim-Kanten im Aufgabenbild.
- Reale Prüfungsaufgabe: `src-97414623dd81`, Seite 5. Belegt: ungerichteter Graph, Prim aus der Vorlesung, Initialisierung mit Knoten `a`, Kanten als ungeordnete Paare und Reihenfolge.
- Offizielle reale Prüfungslösung: `src-8a588d5ddc35`, Seite 5. Belegt: Reihenfolge `{a,h}`, `{h,d}`, `{d,f}`, `{f,g}`, `{d,b}`, `{b,c}`.
- Vorlesung: `src-baa07f0a207a`, Seiten 955-958. Belegt: Prim wächst von einem Startknoten, wählt je Runde eine minimale Kante über den Schnitt, `Q`, `A`, `key`, `parent`, `Extract-Min`.
- Korrektheit und Laufzeit: `src-baa07f0a207a`, Seiten 960-965. Belegt: sichere Kante über Schnittsatz und Laufzeit `O(|E| log |V|)`.

## Quellenlage Kruskal

- Vorlesung: `src-baa07f0a207a`, Seiten 929-933 und 939-945. Belegt: MST-Definition, Kreiseigenschaft, Kruskal, aufsteigende Kantensortierung, Union-Find-Integration.
- Laufzeit/Korrektheit: `src-baa07f0a207a`, Seiten 953-954. Belegt: `O(|E| log |E|)`.
- Visuell geprüfte Probeklausurlösungseinträge: `src-a969dc88f8e9`, Seite 3, und exaktes Duplikat `src-fbf39f80037d`, Seite 3. Inventarstatus: `unofficial_solution_only`; deshalb voraussichtlich kein kompensierbares Produktionsgate.

## Quellenlage BFS/DFS-Fallback

- DFS 2024: `src-6df30a9ff1ae`, Seite 1, belegt eine alphabetische Tie-Break-Regel; eine vollständige verknüpfte Lösung fehlt im lokalen Bestand.
- DFS 2020: `src-97414623dd81`, Seite 3, und `src-8a588d5ddc35`, Seite 3, belegen reale Aufgabe und Lösung mit alphabetischer Start- und Zielknotenordnung.
- BFS 2024-Übungsquelle ist im generierten Quellenindex belegt; sie wird nur geprüft, falls beide MST-Kandidaten scheitern.

## Kandidatengate

Bewertet werden Prim, Kruskal, BFS und DFS je Kriterium mit 0, 1 oder 2 Punkten. Nicht kompensierbar sind:

- offizielle Primärquelle,
- verifizierte vollständige Lösung,
- sichere Aufgaben-/Lösungsverknüpfung,
- eindeutige Verarbeitungsreihenfolge oder eindeutige semantische Akzeptanzregeln,
- deterministischer kanonischer Trace,
- public-safe Trainingsinstanz,
- unabhängiges Oracle,
- kein ungelöster fachlicher Konflikt.

Prim wird nur gewählt, wenn die fehlende allgemeine Gleichstandsregel durch eine strict-public-safe Instanz ohne Auswahlgleichstände und eine semantische MST-Endbaumprüfung ohne erfundene Tie-Breaker sauber beherrschbar ist.

## Geplante MST-Domain

- Neue Datei `src/domain/graph-tracing/mst.ts`.
- Wiederverwendung der bestehenden Graph-Tracing-Typen.
- Keine zweite Graph-Domain und keine externe Graphbibliothek.
- Diskriminierte Zustände für MST/Prim statt universeller optionaler Felder.
- Public-safe Trainingsgraph wird neu formuliert und enthält keine historischen Originalwerte.

## Geplante Trace-Repräsentation

Für Prim:

- Initialzustand mit Wurzel, `Q`, `key`, `parent`, `A`.
- Pro Schritt: gewählter Knoten, gewählte Baumkante, `Q` nach Schritt, `key`-Tabelle, `parent`-Tabelle, ausgewählte Kanten und kumuliertes Gewicht.
- Final: Kantenmenge, Gesamtgewicht, Reihenfolge.

Falls Kruskal gewählt würde:

- sortierte Kantenliste,
- Find/Union-Komponenten,
- Entscheidung akzeptiert/verworfen,
- `A` und Gesamtgewicht.

## Geplantes Oracle

- Unabhängiges MST-Oracle durch exhaustive Enumeration kleiner Graphen.
- Validierung: Spannbaum, Zusammenhang, Azyklizität, `|V|-1` Kanten und Minimalgewicht.
- Bei mehreren MSTs wird der Endbaum semantisch akzeptiert, sofern Gewicht und Baumvalidität stimmen.
- Für große Graphen wird ein deklarierter `not_checked_too_large`-Status verwendet; produktive Phase-12-Instanz bleibt klein.

## Geplante Scoringstrategie

- Kein LLM-Scoring.
- Strukturpunkte für Initialisierung, Schrittentscheidungen, Zustandsupdates, Endbaum, Gesamtgewicht und Begründung.
- Folgefehler werden begrenzt: Ein falscher früher Schritt darf spätere intern konsistente Zustände nicht doppelt bestrafen.
- Fehlercodes erhalten konkrete Evidenz: Kante, Knoten, Schritt oder Feld.

## Mehrfach-MST-Behandlung

- Kanonischer Trace wird nur für die deklarierte strict-Instanz bewertet.
- Endbaumprüfung nutzt Oracle-Äquivalenz: anderer gültiger MST mit gleichem minimalem Gewicht gilt als fachlich korrekt, sofern keine verbindliche Reihenfolge gefordert ist.
- Die produktive Hauptinstanz vermeidet Auswahlgleichstände; mögliche Varianten dürfen Mehrfach-MSTs nur explizit deklarieren.

## Simulatorintegration

- Genau ein neuer ExamTaskAdapter für den gewählten MST-Renderer.
- V1, V2 und V3 bleiben unverändert.
- Eine neue Paketentscheidung wird dokumentiert; ein neues Paket wird nur angelegt, wenn es nicht blind kumulativ ist und alle Adapter startbar bleiben.

## Mastery-Erweiterung

- Mastery V11 ergänzt MST-spezifische Signale: Initialisierung, sichere Kante, Zyklusvermeidung, Zustandsupdate, Endbaum, Gesamtgewicht.
- Bestehende Mastery-V10-Daten bleiben lesbar; keine IndexedDB-Versionserhöhung, falls der bestehende Payload generisch genug bleibt.

## Persistenzbedarf

- Bestehende Trainer-Autosave-Struktur soll wiederverwendet werden.
- Migration nur bei zwingendem Schemawechsel.
- Export/Import validieren unbekannte oder beschädigte MST-Payloads deterministisch.

## Accessibility-Risiken

- Graphdarstellung darf nicht allein visuell sein.
- Jede Kante, jeder Schritt und jeder Zustandswert braucht textuelle Tabellenalternative.
- Fokusreihenfolge, Tastaturbedienung, Live-Region nach Bewertung und 200-%-Zoom werden geprüft.

## Performance-Risiken

- Exhaustive Oracle nur für kleine Graphen und Tests.
- Produktive Trace-Engine deterministisch und ohne schwere Graphbibliothek.
- Entry-Chunk-Limit bleibt 500000 Byte.

## Teststrategie

- Unit-Tests für MST-Validierung, Prim-Trace, Oracle, Mehrfach-MST-Äquivalenz und Scoring.
- Integrationstest für Content-Loader und TrainerRegistry.
- Simulatoradapter-Test.
- Regression für Floyd-Warshall, Dijkstra, Union-Find und bestehende Packages.
- `npm.cmd run format:check` und `npm.cmd run verify` nach der letzten Änderung.

## Nichtziele

- Kein paralleler Prim- und Kruskal-Trainer.
- Kein Bellman-Ford-Trainer.
- Kein Graphtransfer.
- Kein allgemeiner Graphalgorithmus-Synthesizer.
- Kein freier Graph-Editor.
- Kein Backend, keine Cloud-Synchronisation, kein LLM-Scoring.
- Keine Veröffentlichung privater Quellen, PDFs, Scans, lokaler Pfade oder PDF-Links.
