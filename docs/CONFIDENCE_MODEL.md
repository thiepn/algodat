# Konfidenzmodell

Konfidenz verändert keine fachliche Punktzahl. Sie ist eine metakognitive Zusatzmessung: sichere korrekte Antworten stärken die Diagnose, sichere falsche Antworten erhöhen die Priorität der Fehlvorstellung.

## Berechnung

`calculateDiagnosticConfidence` normiert Antwortkonfidenz und Korrektheit auf einen Wert zwischen 0 und 1. Die Aggregation je Kompetenz wird in `aggregateCompetencyResults` verwendet.

## Anzeige

Die UI fragt nach jeder Antwort eine Skala von 1 bis 5 ab. Die Auswertung zeigt Konfidenz je Kompetenz, aber keine offizielle Note.

Die Kompetenzgrundlagen sind quellenbelegt, zum Beispiel Datenstrukturen über `src-79ae96ebbccf`, Seite 2, und `src-35405e721f05`, Seite 6.
