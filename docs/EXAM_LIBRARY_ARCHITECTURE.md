# Exam Library Architecture

Die Klausurenbibliothek ist eine sichere Produktfamilie für historische Orientierung.

## Routen

- `/klausuren`: Übersicht der Korpusereignisse.
- `/klausuren/fragen`: filterbare Fragenmetadaten.
- `/klausuren/:examId`: Metadaten einer Klausur.
- `/klausuren/:examId/aufgabe/:questionId`: sichere Fragedetailseite.
- `/klausuren/vergleich`: Slotvergleich mit getrennten Häufigkeiten.

## Datenfluss

`scripts/build-content.ts` liest `data/exam-corpus.json` und `data/question-inventory.json` und erzeugt `src/content/generated/exam-library.json`. Die Ausgabe enthält keine lokalen Pfade, keine PDF-Links und keine vollständigen Originalaufgaben.

## Häufigkeiten

Reale deduplizierte Ereignisse werden getrennt von Probe-, Übungs- und generierten Vorkommen angezeigt.
