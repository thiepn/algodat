# DP-Entwurfstrainer Architektur

Der Phase-6-Trainer ist ein strukturierter Design-Trainer, kein Freitext-Grader.

- Content: `data/training/dp-design-trainer-mine.json`.
- Rubrik: `data/training-rubrics/trainer-dp-entwurf-mine-v1.json`.
- Domain-Engine: `src/domain/dp-design/mine.ts`.
- Service/Persistenz: `src/features/trainer/dp-design-service.ts`.
- UI: `DpDesignTrainerPage`, `DpDesignAttemptPage`, `DpDesignResultPage`.

Quellenbasis:

- Aufgabe: `src-8f16b2505bbd`, Seite 10.
- Lösung: `src-35405e721f05`, Seiten 11–12.

Die UI fragt Interpretation, Zustand, Rekurrenz, Auswertungsordnung, Algorithmus, Beweis und Komplexität aktiv ab. KaTeX bleibt für mathematische Darstellung verfügbar; die Phase-6-Eingabe selbst ist bewusst strukturiert.

