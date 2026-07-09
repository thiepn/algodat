# Beherrschungsmodell V2

## Änderung gegenüber V1

V1 war auf den ersten Rucksack-DP-Trainer zugeschnitten. V2 ergänzt algorithmusübergreifende und Union-Find-spezifische Dimensionen, ohne alte Versuche ungültig zu machen.

## Gemeinsame Dimensionen

- `recognition`: Aufgabenformat und Algorithmuswahl erkennen.
- `tracing`: Zwischenzustände aktiv reproduzieren.
- `rule_application`: zentrale Regel korrekt anwenden.
- `representation_accuracy`: Darstellung konsistent halten.
- `tie_breaking`: explizite Gleichstandsregel anwenden.
- `consistency`: Folgefehler begrenzen und Zustände konsistent halten.
- `timed_performance`: Prüfungsmodus-Evidenz.

## Union-Find-spezifische Dimensionen

- `set_representation`
- `weighted_union`
- `pointer_updates`
- `representative_updates`

## Persistenz

Neue Versuche speichern `masteryModelVersion`. Alte Phase-2-Versuche bleiben lesbar, weil die neuen Felder optional validiert werden.

