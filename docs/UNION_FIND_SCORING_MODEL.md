# Union-Find-Scoring-Modell

## Rubrik

`trainer-union-find-listen-v1` hat 12 Punkte:

1. Vorprüfung: Repräsentation, Weighted Union und Tie-Breaker erkennen.
2. Partition: Elemente in den richtigen Mengen.
3. Repräsentanten: korrekte Repräsentantenzeiger.
4. Listenreihenfolge: `next`-Zeiger von `head` nach `tail`.
5. Metadaten: `size`, `head`, `tail`.
6. Weighted Union: kleinere Liste wird an größere Liste gehängt; bei Gleichstand entscheidet der belegte Tie-Breaker.
7. Vollständigkeit: alle Kontrollpunkte bearbeitet.

## Fehlercodes

Der Union-Find-Trainer kann unter anderem folgende Codes erzeugen:

- `invalid_algorithm_choice`
- `wrong_set_membership`
- `wrong_representative`
- `list_order_error`
- `next_pointer_error`
- `wrong_size`
- `wrong_head_tail`
- `weighted_union_error`
- `stale_representative_pointer`
- `missing_element_error`
- `duplicate_element_error`
- `cycle_error`
- `incomplete_state_error`

## Kappungen

- Eine unvollständige Abgabe kann nicht voll punkten.
- Ungültige oder inkonsistente Listen begrenzen Strukturpunkte.
- Offengelegte Lösung begrenzt die Maximalwertung.
- Mastery-Evidenz wird konservativ gewichtet, damit passives Anzeigen nicht wie aktives Können zählt.

## Quellenbezug

Weighted Union und Listenrepräsentation sind durch `src-8f16b2505bbd`, Seite 6, und `src-baa07f0a207a`, Seiten 946–951, belegt.

