# Greedy-Algorithmus-AST

## Kanonische Bausteine

Der Trainer modelliert den Algorithmus als strukturierte Antwort:

1. `Mergesort(S)` in absteigender Reihenfolge.
2. `sum = 0`.
3. Für `i = 1` bis `n`: `sum = sum + S[i] * (n - i + 1)`.
4. `return sum`.

## Beleg

Diese Bausteine folgen der Lösungsskizze `src-8a588d5ddc35`, Seite 8.

## Zweck

Der AST ist absichtlich klein. Er erlaubt deterministische Prüfung ohne frei erfundene Pseudocode-Interpretation.
