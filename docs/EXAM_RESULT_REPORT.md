# Exam Result Report

## Inhalt

Nach endgültiger Abgabe erzeugt `buildExamResultReport`:

- Punkte je Slot,
- Gesamtpunkte und Maximalpunkte,
- Fehlercluster aus den Traineradaptern,
- Timing-Analyse je Aufgabe,
- Mastery-V6-Auswirkung,
- nächste Empfehlungen.

## Sichtbarkeit

Der Bericht erscheint erst nach Abgabe. Vorher zeigt der Strict-Exam-Modus keine fachliche Bewertung.

## Persistenz

Ergebnisse werden in IndexedDB-Store `examResults` gespeichert und in Export/Import aufgenommen. Der Import validiert Ergebnisstrukturen gegen `ExamResultSchema`.
