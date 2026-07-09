# Phase 6 Implementierungsplan

## Ziel

Phase 6 ergänzt einen deutschen, deterministisch bewerteten Entwurfstrainer für dynamische Programmierung. Der Trainer adressiert das bestätigte Standardprofil Aufgabe 8, ohne historische Frequenzen zu verfälschen.

## Gate vor Implementierung

Die Kandidatenauswahl ist in [PHASE_6_CANDIDATE_SELECTION.md](PHASE_6_CANDIDATE_SELECTION.md) und [phase6-dp-candidate-ranking.json](../data/phase6-dp-candidate-ranking.json) dokumentiert.

Gewählt wurde `trainer-dp-entwurf-mine-v1`, weil Aufgabe und offizielle Beispiellösung lokal belegbar sind:

- Aufgabe: `src-8f16b2505bbd`, Seite 10.
- Lösung/Rekurrenz: `src-35405e721f05`, Seite 11.
- Lösung/Beweis/Algorithmus: `src-35405e721f05`, Seite 12.

## Arbeitspakete

1. Content-Schemas um `trainerKind: design`, `designFamily: dynamic_programming`, DP-Problem, Varianten, Rubrik und deterministische Validierungsstatus erweitern.
2. Content-Build um `dp-design-trainers.json`, `dp-design-problems.json`, `dp-design-rubrics.json` und `dp-design-variants.json` erweitern.
3. Deterministische Domain-Engine für Mine-DP, Brute-Force-Orakel, Rubrik, Fehlercodes und Mastery V5 implementieren.
4. Persistenzschema auf IndexedDB-Version 6 anheben.
5. Deutsche Routen hinzufügen: `/trainer/entwurf`, `/trainer/entwurf/dp`, `/trainer/entwurf/dp/:trainerId`, `/versuch/:attemptId`, `/auswertung/:attemptId`.
6. Learn/Practice/Exam/Review-Modi in der UI anbieten.
7. Unit-, Integrations-, Build-, Deployment- und Playwright-Tests erweitern.

