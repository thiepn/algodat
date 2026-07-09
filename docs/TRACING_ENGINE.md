# Tracing-Engine

## Umfang von Phase 3

Die produktive Engine unterstützt zwei verifizierte Trainer:

- `trainer-rucksack-dp-v1` für 0/1-Rucksack-DP-Tabellen.
- `trainer-union-find-listen-v1` für Union-Find mit verketteten Listen.

Beide Implementierungen liegen in `src/domain/tracing/` und sind unabhängig von React, IndexedDB, Uhrzeit, Zufall und Browserzustand. Dadurch sind Trace, Bewertung und Empfehlungen deterministisch testbar.

## Rucksack-DP

Quellen:

- `src-25d6340b518c`, Seite 33: offizielle Definition von `Opt[i,w]` und Rekurrenz für das Rucksackproblem.
- `src-25d6340b518c`, Seite 34: offizielle Lösungstabelle mit Endwert `Opt[5,13] = 17`.
- `src-baa07f0a207a`, ab Seite 390: Vorlesungsgrundlage zu dynamischer Programmierung und Rucksackproblem.

Die Engine validiert eine 0/1-Rucksack-Instanz mit ganzzahligen Gewichten, ganzzahligen Werten, Kapazität `W >= 0` und mindestens einem Gegenstand. Für jedes Item `i` und jede Kapazität `w` berechnet sie:

```text
Opt[i,w] = Opt[i-1,w]                                      falls w_i > w
Opt[i,w] = max(Opt[i-1,w], v_i + Opt[i-1,w-w_i])            sonst
```

Bei Gleichstand gilt der explizite Tie-Breaker `exclude_on_equal`.

## Union-Find mit Listen

Quellen:

- `src-8f16b2505bbd`, Seite 6: Aufgabenformat mit Weighted Union und lexikografischem Tie-Breaker.
- `src-35405e721f05`, Seite 6: offizielle Lösung zur Probeklausuraufgabe.
- `src-baa07f0a207a`, Seite 943: Union-Find, Partition und Repräsentant.
- `src-baa07f0a207a`, Seite 946: Listenrepräsentation mit Repräsentantenzeiger.
- `src-baa07f0a207a`, Seite 948: Make-Set, Find und Union.
- `src-baa07f0a207a`, Seite 949: kleinere Liste an größere Liste anhängen.
- `src-baa07f0a207a`, Seiten 950–951: Laufzeit der gewichteten Listenvariante.

Die Engine berechnet Make-Set- und Union-Schritte, hält Mengenlisten, Repräsentantenzeiger, `next`, `head`, `tail` und `size` konsistent und serialisiert Kontrollpunkte in ein aktiv eingebbares Textformat.

## Fehlerklassen

Die gemeinsame Fehlerunion deckt DP- und Union-Find-Codes ab. Aktive Phase-3-Codes sind unter anderem:

- Rucksack-DP: `initialization_error`, `tracing_error`, `tie_breaker_error`, `runtime_error`, `notation_error`, `invalid_algorithm_choice`, `incomplete_answer`.
- Union-Find: `wrong_representative`, `wrong_set_membership`, `wrong_size`, `wrong_head_tail`, `next_pointer_error`, `list_order_error`, `weighted_union_error`, `stale_representative_pointer`, `missing_element_error`, `duplicate_element_error`, `cycle_error`, `incomplete_state_error`.

## Determinismus

Musterlösungen werden kanonisch serialisiert. Tests prüfen gleiche Ausgabe bei gleicher Eingabe, Randfälle, ungültige Instanzen, Tie-Breaker, Folgefehler, Invarianten und UI-Abgaben.
