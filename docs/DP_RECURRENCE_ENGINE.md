# DP Recurrence Engine

Die Engine bildet exakt die in der Beispiellösung belegten Fälle ab:

- Basis: `G(1,j)=a_1j` für `1<=j<=l`.
- Linker Rand: `G(i,1)=a_i1+max{G(i-1,1),G(i-1,2)}` für `i>1`.
- Rechter Rand: `G(i,l)=a_il+max{G(i-1,l),G(i-1,l-1)}` für `i>1`.
- Innen: `G(i,j)=a_ij+max{G(i-1,j),G(i-1,j-1),G(i-1,j+1)}` für `i>1` und `1<j<l`.

Beleg: `src-35405e721f05`, Seite 11.

Die Implementierung in `solveMineDp` wertet zeilenweise aus und erzeugt für die Matrix aus `src-8f16b2505bbd`, Seite 10, das Optimum `214`.

