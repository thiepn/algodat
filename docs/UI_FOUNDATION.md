# UI-Fundament

## Gestaltungsprinzip

Die Oberfläche ist ruhig, akademisch und auf aktive Prüfungsvorbereitung ausgerichtet. Navigation und Statusangaben bleiben auch ohne Farbe verständlich. Alle sichtbaren Texte sind deutsch.

## Routen

| Route | Funktion |
| --- | --- |
| `/` | Dashboard mit Profil, Datenzustand und Einstiegspunkten |
| `/klausurprofile` | Standardprofil und historische Ausnahme 2021 |
| `/aufgaben`, `/aufgaben/:taskNumber` | Aufgabenstruktur und Detailansicht |
| `/themen`, `/themen/:topicId` | filterbarer Themenindex und Evidenzdetails |
| `/quellen` | Metadatenbrowser ohne Quelldateizugriff |
| `/diagnostik` | Inhaltsversion, Prüfstatus und offene Punkte |
| `/trainer`, `/trainer/tracing/*` | aktive Tracing-Trainer |
| `/trainer/beweise/*` | aktiver Schleifeninvarianten-Beweistrainer |
| `/simulator`, `/fehler`, `/beherrschung`, `/spickzettel` | ausdrücklich markierte spätere Ausbaustufen |

## Barrierefreiheit und Responsivität

Das Layout verwendet semantische Landmarks, eine Sprungnavigation, sichtbare Fokuszustände, beschriftete Eingaben und ausreichend große Bedienziele. Inhalte brechen auf schmalen Bildschirmen in eine lineare Struktur um. `prefers-reduced-motion` wird respektiert. Automatisierte axe-Prüfungen decken Kernrouten und Trainerkomponenten ab; Playwright ergänzt Desktop-, Mobile- und Offline-Flows.

## Datenwahrheit

Die UI unterscheidet echte Klausurhäufigkeit, Probe-, Übungs- und erzeugte Vorkommen. Zitationen zeigen Quelle, Seitenbereich, Verifikationsstatus und Konfliktwarnung. Nicht implementierte Bereiche zeigen einen konkreten Planungszustand statt Platzhalterdaten.

Der Trainerbereich zeigt nur öffentliche, quellenausgerichtete Aufgaben mit validierter Musterlösung. Phase 4 umfasst Rucksack-DP, Union-Find mit verketteten Listen und den ersten Schleifeninvarianten-Beweistrainer.
