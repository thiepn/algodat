# Phase 13 D&C-Konventionsaudit

## Maximale Wertdifferenz

- Eingabe: Feld `A[1..n]` positiver ganzer Zahlen (`src-88179ac88dc5`, Seite 7).
- Ziel: größte gerichtete Differenz `A[i]-A[j]` mit `i <= j` (`src-88179ac88dc5`, Seite 7).
- Basisfall: `l = r` liefert Differenz `0`, Minimum `A[l]`, Maximum `A[l]` (`src-88179ac88dc5`, Seite 7).
- Split: `m = floor((l+r)/2)` (`src-88179ac88dc5`, Seite 7).
- Rekursive Aufrufe: links `A[l..m]`, rechts `A[m+1..r]` (`src-88179ac88dc5`, Seite 7).
- Combine: `max(L[1], R[1], L[3]-R[2])`, Minimum `min(L[2],R[2])`, Maximum `max(L[3],R[3])` (`src-88179ac88dc5`, Seite 7).
- Laufzeit: `T(n)=2T(n/2)+O(1)`, daraus `O(n)` (`src-88179ac88dc5`, Seite 7).
- Beweis: Induktion über `k=r-l+1`, Fallanalyse links/rechts/cross (`src-88179ac88dc5`, Seite 7).

Keine absolute Differenz, kein Aktiengewinn-Modell und kein Tie-Breaker für Zeugenindizes werden produktiv erfunden.
