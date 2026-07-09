# Rot-Schwarz-Trainer-Architektur

## Umfang

`trainer-rot-schwarz-einfuegen-v1` trainiert Invarianten, Einfügung, Rotation, Umfärbung, Schwarzhöhe und Laufzeit für Rot-Schwarz-Bäume. Die produktive Aufgabe ist neu formuliert und public-safe.

## Quellenbasis

- Echte Klausuraufgabe: `src-97414623dd81`, Seite 4.
- Offizielle Lösungsskizze: `src-8a588d5ddc35`, Seite 4.
- Rot-Schwarz-Eigenschaften: `src-5c9eadb17ccc`, Seite 5.
- NIL-Konvention: `src-5c9eadb17ccc`, Seite 7.
- Linksrotation: `src-5c9eadb17ccc`, Seite 15.
- Neuer Knoten rot und Wiederherstellung: `src-5c9eadb17ccc`, Seiten 20, 22-23 und 36.

## Domain

Die reine Engine liegt in `src/domain/red-black-tree`:

- `operations.ts`: BST-Einfügung, Linksrotation, Rechtsrotation, Farben, Suche und Serialisierung.
- `invariants.ts`: Farbe, schwarze Wurzel, NIL-schwarz, Rot-Rot-Verbot, gleiche Schwarzhöhe, BST-Ordnung und Elternreferenzen.
- `insertion.ts`: deterministischer Einfügesolver mit Trace.
- `scoring.ts`: strukturierte Antwortbewertung und Mastery V8.

## Darstellung

Der Trainer verwendet aktive Texteingaben statt passiver Animation. Bewertet werden NIL-Konvention, Einfügefolge, Reparaturfälle, Endbaum, Schwarzhöhe, Laufzeit und Invariantenbegründung.

Der Endbaum wird kompakt serialisiert, z. B. `20B(10B(N,15R(N,N)),30B(N,N))`. `N` steht für ein schwarzes NIL-Blatt.
