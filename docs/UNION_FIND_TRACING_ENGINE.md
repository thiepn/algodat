# Union-Find-Tracing-Engine

## Umfang

Die Engine `src/domain/tracing/union-find.ts` unterstützt ausschließlich Union-Find mit verketteten Listen, Repräsentantenzeigern, Weighted Union und dem in der Aufgabe belegten lexikografischen Tie-Breaker.

Nicht unterstützt sind Baumdarstellung, Union by Rank und Pfadkompression.

## Quellen

- `src-8f16b2505bbd`, Seite 6: Aufgabenformat und Tie-Breaker.
- `src-35405e721f05`, Seite 6: offizielle Lösung.
- `src-baa07f0a207a`, Seiten 943, 946, 948, 949, 950–951: Definition, Listenrepräsentation, Operationen und Laufzeitregel.

## Zustandsmodell

Ein Zustand besteht aus:

- Mengenlisten von `head` nach `tail`
- Repräsentant pro Menge
- `size`, `head`, `tail`
- `next`-Zeiger je Element
- Repräsentantenzeiger je Element
- optionaler Angabe, welche Liste angehängt wurde

Die serialisierte Nutzereingabe nutzt bewusst ein kompaktes Textformat:

```text
J: J>H>K>G>F>I
```

Die Liste links vom Doppelpunkt ist der Repräsentant. Die Reihenfolge rechts beschreibt die `next`-Zeiger.

## Kanonische öffentliche Trace-Instanz

Die öffentliche Phase-3-Aufgabe nutzt die Elemente `F, G, H, I, J, K` und eine neu formulierte Operationsfolge. Die kanonischen Kontrollpunkte sind:

| Schritt | Zustand | angehängt |
| --- | --- | --- |
| 6 | `F: F; G: G; H: H; I: I; J: J; K: K` | `keine` |
| 7 | `F: F; G: G; I: I; J: J>H; K: K` | `H->J` |
| 8 | `G: G>F; I: I; J: J>H; K: K` | `F->G` |
| 9 | `G: G>F; I: I; J: J>H>K` | `K->J` |
| 10 | `I: I; J: J>H>K>G>F` | `G->J` |
| 11 | `J: J>H>K>G>F>I` | `I->J` |

## Determinismus

Alle Operationen sind reine Funktionen. Die Engine nutzt keine Uhrzeit, keinen Zufall und keinen Browserzustand. Tests prüfen Kanonisierung, Invarianten, ungültige Operationen, Fehlerklassifikation und deterministische Serialisierung.

