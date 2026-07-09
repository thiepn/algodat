# Phase 12 Exam-Package-Strategie

Phase 12 fügt keinen neuen startbaren Klausurpaketstandard hinzu.

Begründung:

- V1, V2 und V3 bleiben unverändert und regressionstestbar.
- Prim ist historisch vor allem Aufgabe 4 zugeordnet, aber ein blind kumulatives V4-Paket würde die Paketstrategie verwässern.
- Der neue Adapter `prim_mst_trace` ist vorhanden und separat golden-getestet.

Empfehlung: Phase 13 sollte ein bewusst kuratiertes neues Standardpaket nur dann erzeugen, wenn Aufgabe-4-Abdeckung und Simulatordauer gemeinsam neu austariert werden.

