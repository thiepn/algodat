# Phase 12 MST-Konventionsaudit

## Prim-Konventionen

| Konvention | Phase-12-Entscheidung | Quelle |
|---|---|---|
| Eingabe | gewichteter, ungerichteter, zusammenhängender Graph | `src-baa07f0a207a`, Seiten 929 und 939 |
| Ziel | aufspannender Baum mit minimalem Gesamtgewicht | `src-baa07f0a207a`, Seiten 929 und 939 |
| Startknoten | in Aufgabe vorgegeben; produktiv `A` | `src-8f16b2505bbd`, Seite 3; `src-97414623dd81`, Seite 5 |
| Auswahl | minimale Kante über den Schnitt zwischen Baum und Restgraph | `src-baa07f0a207a`, Seiten 955-956 |
| key/parent | `key[r]=0`, andere `∞`, `parent[r]=NIL`, Update bei kleinerem Gewicht | `src-baa07f0a207a`, Seite 958 |
| Sichere Kante | minimale Schnittkante ist sicher | `src-baa07f0a207a`, Seiten 960-964 |
| Laufzeit | `O(|E| log |V|)` | `src-baa07f0a207a`, Seite 965 |
| Gleichstand | keine allgemeine Prim-Regel belegt; Hauptinstanz strict ohne Auswahlgleichstand | dokumentierter Risikoschutz |

## Produktive public-safe Instanz

- Knoten: `A, B, C, D, E, F`.
- Startknoten: `A`.
- Gewählter kanonischer Trace: `A, B, D, E, C, F`.
- Gewählte Kanten: `A-B, B-D, D-E, B-C, D-F`.
- Gesamtgewicht: `18`.

Diese Werte stammen nicht aus einer historischen Aufgabe. Sie sind eine neu formulierte Trainingsinstanz, deren Methode und Darstellung durch die oben genannten Quellen belegt sind.

## Mehrfach-MST-Semantik

Der kanonische Trace ist strict. Für Endbäume nutzt die Engine zusätzlich ein unabhängiges MST-Oracle: Ein anderer gültiger Spannbaum mit Oracle-Minimalgewicht wird semantisch als minimal erkannt, auch wenn die strict-kanonische Prim-Reihenfolge abweicht.

