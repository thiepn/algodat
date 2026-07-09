# Phase 8 Implementierungsplan

## Ziel

Phase 8 ergänzt genau einen produktiven Lernpfad für Aufgabe 7: Greedy-Algorithmus entwerfen, analysieren und beweisen. Alle sichtbaren Inhalte bleiben deutschsprachig und verwenden belegte Quellen mit Seitenbezug.

## Gate vor Implementierung

Vor produktiver Umsetzung wurden die Kandidaten Fitnesspunkte, Workout, Entsorgungsstationen, Laternen und die Divide-and-Conquer-Breite geprüft. Das Gate ist für Fitnesspunkte bestanden, weil Aufgabenstellung und Lösungsskizze auf offiziellen Seiten vorliegen:

- `src-97414623dd81`, Seite 8: echte Klausuraufgabe 7 „Fitnesspunkte“.
- `src-8a588d5ddc35`, Seite 8: Lösungsskizze mit absteigender Sortierung, Pseudocode, Laufzeit `O(n log n)` und Widerspruchsbeweis.

## Produktionsumfang

- Neuer Trainer `trainer-greedy-entwurf-fitnesspunkte-v1`.
- Strukturierte aktive Eingabe: Problemdeutung, Greedy-Regel, Pseudocode, Austausch-/Widerspruchsbeweis, Laufzeit.
- Deterministisches Oracle: Greedy-Wert wird für kleine Varianten gegen vollständige Permutationssuche geprüft.
- Fehlerdiagnose ohne freie Halluzinationsbewertung: Eingaben werden gegen belegte kanonische Bausteine geprüft.
- Simulator V2 mit genau einem zusätzlichen Greedy-Slot; V1 bleibt unverändert.
- Persistenz ohne künstliche Migration, sofern bestehende flexible Antwortspeicherung genügt.

## Validierung

- JSON gegen explizite Schemas.
- Referenzen gegen vorhandene Quellen und Seiten.
- Unit-Tests für Greedy-Solver, Oracle, Scoring und Mastery.
- Build-, Typecheck-, Lint-, Format- und E2E-Validierung.

## Nichtumfang

- Keine Änderung, Verschiebung oder Umbenennung der PDF-Quellen.
- Keine produktive Umsetzung von Workout oder Entsorgungsstationen ohne Lösungsevidenz.
- Keine Frequenzzählung aus Probeklausuren.
