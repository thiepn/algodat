# Schleifeninvarianten-Beweisengine

Die Engine bewertet genau den Phase-4-Trainer zur gewichteten Summe.

Kanonische Struktur:

1. Programmanalyse
2. Behauptung
3. Invariante mit Zeitpunkt vor Iteration `i`
4. Induktionsanfang für `i=1`
5. Induktionsvoraussetzung für `1<=i<n+1`
6. Induktionsschritt durch Einsetzen von `s=s+i*A[i]`
7. Terminierung mit hypothetischem Index `n+1`
8. Rückgabe und Schlussfolgerung

Der Kern arbeitet rein lokal und deterministisch. Er nutzt keine LLM-Bewertung, kein CAS und keine externen Dienste.

Fachlicher Beleg: `src-25d6340b518c`, Seiten 11–12. Methodischer Beleg: `src-baa07f0a207a`, Seiten 132–135 und 140.

