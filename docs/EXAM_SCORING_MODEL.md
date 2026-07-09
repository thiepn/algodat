# Exam Scoring Model

## Exakte Punkte

Exam-Punkte werden als rationale Werte `{ numerator, denominator }` berechnet. Dadurch entstehen keine Rundungsartefakte, wenn interne Trainerpunkte auf 8 Exam-Punkte pro Slot skaliert werden.

Formel je Slot:

```text
mappedExamScore = internalScore / internalMaximum * examMaximum
```

Die Summe von `exam-package-kernkompetenz-v1` beträgt exakt 40 Punkte.

## Keine Noten

Phase 7 erzeugt keine offizielle Note. Der Ergebnisbericht zeigt Punkte, Fehlercluster, Zeitdaten, Mastery-V6-Auswirkung und Empfehlungen.

## Validierung

`scripts/validate-content.ts` prüft Package-Punktesumme, Quellenreferenzen, öffentliche Freigabe, `historicalExam: false`, `fullyAutoGradable: true` und nicht startbare historische Profile.
