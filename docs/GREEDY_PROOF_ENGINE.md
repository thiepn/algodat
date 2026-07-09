# Greedy-Beweis-Engine

## Beweisform

Die Engine prüft den belegten Widerspruchs-/Austauschbeweis:

- Behauptung: absteigende Sortierung ist optimal.
- Annahme: keine optimale Lösung ist absteigend sortiert.
- Fehlpaar: `Opt[i] < Opt[i+1]`.
- Tausch: die getauschte Lösung ist besser.
- Differenz: `Wert(Opt) - Wert(Getauscht) = Opt[i] - Opt[i+1] < 0`.

## Beleg

Diese Struktur ist durch `src-8a588d5ddc35`, Seite 8 belegt.

## Grenze

Die Engine bewertet keine beliebigen Freitextbeweise. Sie vergleicht strukturierte Bausteine gegen die belegte Kanonik.
