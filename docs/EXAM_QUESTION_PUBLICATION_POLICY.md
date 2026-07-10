# Exam Question Publication Policy

Für öffentliche UI und Produktionsartefakte gilt:

- Keine Original-PDFs.
- Keine lokalen Dateipfade.
- Keine PDF-Links.
- Keine vollständigen historischen Aufgabentexte.
- Erlaubt sind Quellen-ID, Seitenzahl, Jahr, Aufgabe, paraphrasierter Titel, Themen-Tags, Evidenztyp, Verifikationsstatus und Lösungsmethoden-Metadaten.
- Häufigkeitsangaben zählen nur deduplizierte reale Klausurereignisse; Probeklausuren, Übungen und generierte Beispiele bleiben getrennt.

Die Policy ist in `src/content/generated/exam-library.json` als `publicationPolicy` dokumentiert und wird durch `tests/unit/phase17-learning-resources.test.ts` abgesichert.
