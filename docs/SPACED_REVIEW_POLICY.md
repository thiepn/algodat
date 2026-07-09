# Spaced Review Policy

`data/spaced-review-policy.json` definiert die Basisintervalle 1, 3, 7, 14 und 30 Tage.

Review-Einheiten werden aus Kompetenzen, Fehlercodes und Fehlvorstellungen gebildet. Es wird nicht jeder Rohdatensatz einzeln wiederholt.

Regeln:

- Falsch: kurzes Intervall.
- Richtig mit Hinweis: begrenzte Verlängerung.
- Richtig ohne Hinweis: normales Intervall.
- Wiederholt richtig im Prüfungsmodus: längeres Intervall.
- Falsch und sehr sicher: priorisierte Fehlvorstellungswiederholung.
- Korrekt aber unsicher: moderate Wiederholung.

Es gibt keine automatische Benachrichtigung. Fälligkeiten bleiben lokal und werden in den Tagesplan integriert.
