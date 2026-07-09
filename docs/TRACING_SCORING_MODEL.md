# Scoring-Modell für Tracing

## Umfang

Phase 3 bewertet zwei Trainerfamilien mit getrennten Engines und Rubriken, aber gemeinsamem Prinzip: aktive Eingaben werden gegen kanonische, quellengebundene Zustände geprüft; Folgefehler werden konservativ behandelt; Lösungsoffenlegung begrenzt die Maximalwertung.

## Rucksack-DP-Rubrik

`trainer-rucksack-dp-v1` besitzt 12 Punkte:

1. Vorprüfung und richtige Aufgabenwahl.
2. Initialisierung der DP-Tabelle.
3. Kanonische DP-Zeilen.
4. Methodenkonsistenz/Rekurrenz.
5. Tie-Breaker bei Gleichstand.
6. Endwert und knappe Interpretation.

Quellen: `src-25d6340b518c`, Seite 33–34, und `src-baa07f0a207a`, ab Seite 390.

## Union-Find-Rubrik

`trainer-union-find-listen-v1` besitzt 12 Punkte:

1. Vorprüfung: Repräsentation, Weighted Union und Tie-Breaker.
2. Partition.
3. Repräsentanten.
4. Listenreihenfolge.
5. Metadaten `size`, `head`, `tail`.
6. Weighted Union.
7. Vollständige Kontrollpunkte.

Quellen: `src-8f16b2505bbd`, Seite 6; `src-35405e721f05`, Seite 6; `src-baa07f0a207a`, Seiten 943, 946, 948, 949, 950–951.

## Modi

Die Modi verändern nicht die Musterlösung, sondern nur Hilfen und Rückmeldung:

- Üben: Hinweise, sofortige Rückmeldung und Lösungsoffenlegung erlaubt.
- Prüfung: keine Hinweise und keine Sofortrückmeldung vor Abgabe.
- Wiederholung: Einstieg aus einem abgeschlossenen Versuch mit Fokus auf frühere Fehler.

## Kappungen

- Offengelegte Musterlösung begrenzt die Maximalwertung.
- Unvollständige Abgaben werden gesondert gekappt.
- Inkonsistente Union-Find-Listen begrenzen Strukturpunkte.
- Ein einzelner Versuch kann nur begrenzt Mastery-Evidenz liefern.

## Empfehlungen

Die Empfehlung ist deterministisch aus Fehlercodes und Punktzahl abgeleitet. Beispiele:

- `invalid_algorithm_choice`: Grundlagen und Aufgabenformat wiederholen.
- `runtime_error`: Laufzeitwissen nacharbeiten.
- `tie_breaker_error`: Gleichstandsregel gezielt üben.
- `weighted_union_error`: Weighted Union und Größenvergleich wiederholen.
- `stale_representative_pointer`: Repräsentantenzeiger nach Union prüfen.
