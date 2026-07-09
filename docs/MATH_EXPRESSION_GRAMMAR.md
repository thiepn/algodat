# Mathematische Ausdrucksgrammatik

Unterstützte Formen:

- Zahlen: `0`, `1`, `2`
- Variablen: `s`, `i`, `n`, `j`, `A`
- Operatoren: `+`, `-`, `*`, `^`
- Klammern
- Arrayzugriff: `A[i]`
- Summe: `sum(j,1,n,j*A[j])`

Die Grammatik normalisiert kommutative Summen und Produkte deterministisch. Beispiel: `i*A[i]` und `A[i]*i` werden gleich normalisiert.

Nicht unterstützte Schreibweisen werden als Unsicherheit markiert und nicht erfunden. Das ist bewusst enger als mathematische Wahrheit.

Quellenbezug der genutzten Summenformeln: `src-25d6340b518c`, Seiten 11–12.

