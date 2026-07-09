# Exam Readiness Model

Readiness ist keine Notenprognose. Das Modell beschreibt lokale Evidenzqualität je Klausurslot.

Komponenten:

- `masteryLevel`
- `evidenceStrength`
- `evidenceRecency`
- `timedPerformance`
- `transferCoverage`
- `errorStability`
- `completionReliability`

Bänder:

- `insufficient_evidence`
- `foundation_missing`
- `developing`
- `mostly_stable`
- `exam_ready`
- `stale_evidence`

Caps:

- Nur Diagnoseevidenz: maximal `developing`.
- Keine zeitbegrenzte Evidenz: maximal `mostly_stable`.
- Wiederholter gleicher Fehler: maximal `developing`.
- Unsupported Coverage: maximal `developing`.

Schwellen stehen in `data/readiness-policy.json`. Gesamtreadiness mittelt nicht blind: fehlende Evidenz, veraltete Slots und fehlende zeitbegrenzte Prüfung begrenzen das Gesamtband.
