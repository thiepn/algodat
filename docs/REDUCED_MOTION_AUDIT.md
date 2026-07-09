# Reduced-Motion-Audit

## Status

Der Reduced-Motion-Fallback-Audit für `1.0.0-rc.2` ist bestanden.

## Methode

Playwright emuliert `prefers-reduced-motion: reduce` in zentralen Flows. Geprüft wurden Navigation, Diagnose, Simulator und Spickzettel auf Bedienbarkeit ohne bewegungsabhängige Pflichtinteraktionen.

## Ergebnis

Die geprüften Flüsse benötigen keine Animation als Informationsträger und keine bewegungsbasierte Eingabe. Status- und Fehlerzustände werden textuell kommuniziert.

## Grenze der Aussage

Die Prüfung bestätigt keine vollständige visuelle Komfortbewertung für alle Geräte, sondern einen automatisierten Fallback gegen bewegungsabhängige Bedienblocker.
