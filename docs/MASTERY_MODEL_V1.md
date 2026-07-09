# Beherrschungsmodell V1

## Dimensionen

Phase 2 speichert Beherrschung nicht als eine einzige diffuse Zahl, sondern als getrennte Dimensionen:

- Erkennen
- Tracing
- Tie-Breaking
- Korrektheitsverständnis
- Laufzeitwissen
- Zeitdruckleistung

Die Werte liegen zwischen 0 und 1 und werden aus validierten Versuchen abgeleitet.

## Evidenz

Ein Versuch erzeugt Evidenz aus Rubrikpunkten, Fehlertypen, Modus, Hinweisnutzung, Lösungsoffenlegung, Vollständigkeit und Bearbeitungsdauer. Prüfungsmodus zählt stärker als Übungsmodus; Wiederholung zählt als gezielte Reparaturevidenz. Offengelegte Lösungen und sehr wenige Versuche begrenzen den Evidenzwert.

## Speicherung

`MasteryRecord` wird lokal in IndexedDB gespeichert und referenziert Inhaltsversion, Trainer-ID und aktualisierten Zeitstempel. Export und Import validieren dieselben Schemas wie die App-Laufzeit.

## Nichtziele

Das Modell behauptet keine globale Prüfungsprognose. Es beschreibt nur die belegte lokale Evidenz aus dem konkreten Trainer. Weitere Trainer müssen eigene Rubriken und Fehlerprofile hinzufügen, bevor eine breitere Empfehlung belastbar wird.
