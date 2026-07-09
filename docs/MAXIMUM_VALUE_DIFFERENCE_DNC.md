# Maximale Wertdifferenz als D&C-Problem

Quelle: `src-88179ac88dc5`, Seite 7.

Die Aufgabe fordert ein Feld positiver ganzer Zahlen und die größte Differenz `A[i]-A[j]` für `i <= j`. Der belegte D&C-Algorithmus teilt das Feld, löst beide Hälften und kombiniert drei Fälle: optimales Paar links, optimales Paar rechts, Cross-Fall von links nach rechts.

Für konstanten Combine werden zusätzlich Minimum und Maximum des Teilfelds zurückgegeben.
