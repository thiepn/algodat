# Beherrschungsmodell V6

## Zweck

Mastery V6 aggregiert die fünf Exam-Slots nach Abgabe einer kompletten Probeklausur. Es ersetzt nicht die trainerinternen Modelle V2 bis V5, sondern ergänzt eine prüfungsnahe Gesamtsicht.

## Dimensionen

Die Ergebnisdimensionen werden aus Slotpunkten und Fehlerclustern abgeleitet:

- `exam_readiness`: Anteil der erreichten Gesamtpunkte.
- `time_management`: Anteil vollständig bearbeiteter Aufgaben unter Berücksichtigung des Zeitablaufs.
- `cross_topic_consistency`: Streuungsarme Leistung über mehrere Trainerfamilien.
- trainerbezogene Dimensionen aus den jeweiligen Adapterergebnissen.

## Speicherung

Der Simulator speichert nach Abgabe einen `MasteryRecord` mit `masteryModelVersion: mastery-v6` und Evidenz `sessionId`. Vor Abgabe entsteht kein Mastery-Update.
