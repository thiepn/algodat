# Phase 18 Study Product Audit

Stand: 2026-07-10  
Zielversion: `1.0.0-rc.4`  
Screenreader-Gate: offen

## Route-Klassifikation

| Route | Status | Befund | Maßnahme |
|---|---|---|---|
| `/` | useful_but_shallow | Dashboard verbindet Produktbereiche, ist aber kein Lernmodul. | Bleibt Einstieg. |
| `/lernen` | complete_study_experience | Vollständige Modulübersicht mit Fortschritt. | Neu in Phase 18. |
| `/lernen/:moduleSlug` | complete_study_experience | Erklärung, Definition, Verfahren, Beispiel, Beweis, Laufzeit, Fehler, Übungen, Lösungen, Trainer, Fragen, Quellen. | Neu in Phase 18. |
| `/aufgaben` | complete_study_experience | Aufgaben 1–9 als Prüfungshubs. | In Phase 18 vertieft. |
| `/aufgaben/:taskNumber` | complete_study_experience | Jeder Guide enthält Workflow, Beispiel, Modellantwortstruktur, Checkliste und Übungsset. | Roh-IDs werden in lesbare Themen übersetzt. |
| `/themen` | useful_but_shallow | Themenindex bleibt Navigation. | Detailseiten tragen Lerninhalt. |
| `/themen/:topicId` | complete_study_experience für Kernmodule, useful_but_shallow für Randthemen | Kernseiten zeigen Erklärung, Beispiel, Definitionen, Fehler, Klausurrelevanz. | Alte metadata-only-Formulierung entfernt. |
| `/klausuren` | complete_study_experience | Normale Ansicht enthält nur publikationsfähige Fragenmetadaten. | 231 unzulässige Records in Entwickler-Audit verschoben. |
| `/klausuren/fragen` | complete_study_experience | Keine generated_unverified-Fragen, keine generierten Beispiele als Normalfilter. | Validierung im Build. |
| `/pruefungsstruktur` | complete_study_experience | Aktuelles Modell Aufgabe 1–9 statt Profil 2021. | Neu in Phase 18. |
| `/klausurprofile` | redundant | Studentische Profilfläche war redundant. | Redirect nach `/pruefungsstruktur`. |
| `/simulator/profile` | redundant | Historische Profile waren studentisch irreführend. | Redirect nach `/pruefungsstruktur`. |
| `/simulator/profile/:profileId` | redundant | Historische Profile waren studentisch irreführend. | Redirect nach `/pruefungsstruktur`. |
| `/simulator` | useful_but_shallow → complete_study_experience | Vorher V1–V4/Profilfokus; jetzt eine aktuelle Probeklausur. | Startbestätigung entfernt. |
| `/simulator/.../briefing` | complete_study_experience | Eine Briefing-Seite, ein Button „Prüfung starten“. | Keine sechs Checkboxen. |
| `/simulator/sitzung/...` | useful_but_shallow | Keine JSON-Eingabe mehr; sichtbare Aufgabenlabels, Timer, Review, Textantwort. | Tiefe Trainer-Renderer bleiben Folgelücke. |
| `/simulator/sitzung/.../uebersicht` | complete_study_experience | Review vor Abgabe mit Status, Markierung, Punkten und Rücklink. | Neu strukturiert. |
| `/simulator/sitzung/.../ergebnis` | useful_but_shallow | Punkte und Lernhinweise sichtbar. | Modellantworttiefe bleibt Folgelücke. |
| `/quellen` | complete_study_experience | Quellen zeigen Themen, Aufgaben, Module, Trainer und lokale PDF-Aktion. | Technische Details eingeklappt. |
| `/dokumente` | complete_study_experience | Lokale PDF-Bibliothek mit Speicherstatus und Mapping-Export ohne Bytes. | Neu in Phase 18. |
| `/dokumente/verbinden` | complete_study_experience | Lokale PDFs verbinden, Dateinamenmatch gegen Manifest. | Neu in Phase 18. |
| `/dokumente/:documentId` | complete_study_experience | Lokaler Viewer, Seite öffnen, Binding entfernen. | Neu in Phase 18. |
| `/diagnose`, `/lernplan`, `/spickzettel`, `/trainer` | useful_but_shallow bis complete_study_experience | Bereits produktiv aus früheren Phasen. | Über Next-Learning-Actions verbunden. |
| `/diagnostik`, `/fehler`, `/beherrschung`, `/spickzettel-alt` | developer_only oder planned | Nicht primäre Lernflächen. | Keine Phase-18-Produktpriorität. |

## Explizite Befunde aus dem Prompt

- Empty topic pages: Für Kernmodule behoben; Randthemen bleiben als Inhaltslücke sichtbar.
- Shallow modules: Behoben durch 18 vollständige Lernmodule in `src/features/learning/study-module-details.ts`.
- Shallow Aufgabe pages: Behoben durch neun Guides in `src/features/tasks/task-guides.ts`.
- Generated-unverified questions: Aus normaler Bibliothek ausgeschlossen; Audit in `exam-question-publication-audit.json`.
- Redundante 2021-Profil-UI: Aus Navigation entfernt und alte Routen umgeleitet.
- Raw JSON simulator input: Entfernt; Textantworten werden als `student_text_answer` gespeichert.
- Unsichtbare Task-Navigation: Neue `exam-task-nav` mit Textlabels, Status und Punkten.
- Unnötige Startbestätigung: Sechs Checkboxen entfernt.
- Missing original-source access: Lokale PDF-Verbindung über `/dokumente` ergänzt; keine Veröffentlichung privater PDFs.
- Misleading buttons/empty panels: Kernseiten vermeiden leere Verknüpfungspanels und technische IDs im Hauptfluss.

## Manuelle Review-Notizen

Geprüft wurden in der Implementierung: Asymptotik/Pseudocode, Master-Theorem, Schleifeninvarianten, Rot-Schwarz-Bäume, Dijkstra, Floyd-Warshall, Prim, dynamische Programmierung, Aufgabe 1, Aufgabe 5, Aufgabe 8, Quellen mit lokaler PDF-Aktion und der Simulatorstart bis Ergebnisfluss. Screenshots wurden nicht in das Repository gelegt, um keine privaten Artefakte oder Browserzustände zu veröffentlichen.

## Offene Inhaltslücken

- Bellman-Ford und Kruskal werden nur dann als vollständige Module ergänzt, wenn dafür freigegebene, verifizierte Quellen im Produktmodell bestätigt sind.
- Der Simulator nutzt keine rohe JSON-Eingabe mehr, aber die tiefe Einbettung jedes spezialisierten Trainer-Renderers in Exam-Mode bleibt eine Folgephase.
- Der Ergebnisbericht zeigt Lernhinweise und Rubrikfehler; vollständige human-readable Modellantworten pro Task sind noch nicht für alle Adapter gleich tief.
