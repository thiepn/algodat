# Induktions-Engine für Laufzeitbeweise

Stand: 2026-07-07

Die Engine bewertet acht Beweisbausteine: Behauptung, Induktionsmethode, Anfang, Voraussetzung, Rekurrenzeinsatz, Algebra, O-Konstante und Schluss. Die kanonische Behauptung ist `T(n)=(log_2(n)+1)n^3` für Zweierpotenzen `n>=1`.

Quellenbasis: `src-25d6340b518c`, Seiten 17-18, enthält Induktionsanfang, Induktionsvoraussetzung und Induktionsschritt der offiziellen Lösung. `src-baa07f0a207a`, Seiten 230-238, belegt die Vorlesungspraxis, Laufzeitabschätzungen induktiv zu beweisen.
