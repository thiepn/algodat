# Final Recovery Model

Recovery beruht auf lokalem Autosave:

- Trainer speichern Entwürfe als `PracticeAttempt`.
- Diagnose speichert `DiagnosticSession`.
- Simulator speichert Sessions und Snapshots.
- Lernplan speichert Pläne und Review-Zustände.
- Spickzettel speichern Dokumente im Store `cheatSheets`.

Abgegebene Ergebnisse bleiben unveränderlich. Doppelte Abgabe und doppelte Mastery-Buchung bleiben Blocking-Bugs.
