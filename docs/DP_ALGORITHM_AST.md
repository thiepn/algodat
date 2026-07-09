# DP Algorithm AST

Der Trainer speichert den Algorithmus als strukturierte Bausteine:

- `allocation`: Tabelle `G`.
- `initialization`: erste Zeile.
- `loops`: Zeilenschleife und Spaltenfälle.
- `returnStatement`: Maximum der letzten Zeile.
- `renderedPseudocode`: lesbarer Pseudocode für UI und Dokumentation.

Beleg: `src-35405e721f05`, Seite 12.

Diese Struktur verhindert freie Pseudocode-Bewertung. Die Bewertung vergleicht einzelne Pflichtbausteine deterministisch mit der belegten Lösung.

