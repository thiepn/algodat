# Phase 17 Implementation Plan

Version: `1.0.0-rc.3`  
Status: umgesetzt, Screenreader-Gate bleibt offen

## Audit vor Umsetzung

- Leere oder zu dünne Seiten: `/aufgaben/:taskNumber` und `/themen/:topicId` zeigten vor Phase 17 überwiegend Profil- bzw. Evidenzmetadaten; echte nächste Lernaktionen fehlten.
- Fehlende Links: Trainer, Diagnose, Aufgaben, Themen und Klausurmetadaten waren fachlich vorhanden, aber nicht als Lernpfad verbunden.
- Trainer-Mapping: Die elf produktiven Trainer sind jetzt über `data/task-slot-learning-map.json` mindestens einem Aufgabenhub zugeordnet.
- Unterstützte Themen: Vollere Lernseiten existieren dort, wo `data/study-modules.json` ein quellengebundenes Modul enthält; nicht unterstützte Themen bleiben bewusst Evidenz-/Navigationsseiten.
- Korpus: `src/content/generated/exam-library.json` enthält ausschließlich Metadaten, Quellen-IDs und Seiten. Original-PDFs, lokale Pfade und Volltexte werden nicht veröffentlicht.
- Copyright-Sicherheit: Historische Fragen werden als paraphrasierte Titel/Metadaten angezeigt; vollständige Aufgabentexte bleiben privat.
- Private PDFs: Der Ordner `pdfs/` bleibt Eingabematerial und ist nicht Teil der Produktionsartefakte.
- Header/Branding: Die AppShell nutzt nun ein einheitliches A-Logo, gruppierte Navigation, Skip-Link, aktive Zustände und rc.3-Version.
- Bundle-/Performance-Risiko: Die Klausurenbibliothek ist route-lazy unter `/klausuren` eingebunden; die Detaildaten werden nicht in der initialen Dashboard-Route gebraucht.

## Umsetzungsumfang

1. Aufgaben-Hubs für Aufgabe 1 bis 9.
2. Themen-Lernseiten mit Modulen, Trainerlinks und Aufgabenbezug.
3. Neue Klausuren-Familie: `/klausuren`, `/klausuren/fragen`, `/klausuren/:examId`, `/klausuren/:examId/aufgabe/:questionId`, `/klausuren/vergleich`.
4. `NextLearningActions` als wiederverwendbare nächste Aktion.
5. Neue Phase-17-Daten: Lernmodule, Task-Slot-Lernkarte, Ressourcen-Graph.

## Offene Grenzen

- `1.0.0` wird nicht gesetzt.
- Der reale Screenreader-Gate bleibt offen.
- Lernmodule sind Referenzen und Einstiegspunkte, keine neue kanonische Wahrheit.
