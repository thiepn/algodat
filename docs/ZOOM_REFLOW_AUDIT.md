# Zoom- und Reflow-Audit

## Status

Der Zoom-/Reflow-Fallback-Audit für `1.0.0-rc.2` ist bestanden.

## Methode

Geprüft wurden zentrale Routen bei schmalem Viewport bis 320 px Breite und mit erhöhter Layoutbelastung. Der Test prüft horizontales Überlaufen, erreichbare Navigation und bedienbare Hauptaktionen.

## Ergebnis

Dashboard, Diagnose, Trainerübersicht, Simulator, Lernplan und Spickzettel bleiben bei 320 px Breite ohne dokumentweites horizontales Überlaufen bedienbar. Visualisierungszeilen im Trainer wrappen, statt die Seite seitlich aufzuziehen.

## Grenze der Aussage

Die Prüfung ist ein automatisierter Browser-Fallback. Eine manuelle Prüfung mit unterschiedlichen Browser-Zoomstufen und echter Benutzervergrößerung bleibt für eine finale Barrierefreiheitszusage empfohlen.
