# Phase 7 Exam Profile Coverage

Die maschinenlesbare Coverage liegt in [exam-profile-coverage.json](../data/exam-profile-coverage.json).

## Klassifikation

- `fully_supported`: vollständig startbar und automatisch bewertbar.
- `partially_supported`: einzelne Slots sind abgedeckt, aber nicht alle.
- `metadata_only`: Profil ist als Metadatum sichtbar, aber nicht startbar.

## Ergebnis

Kein historisches Profil ist in Phase 7 vollständig startbar.

| Profil | Status | Startbar | Begründung |
| --- | --- | --- | --- |
| Standard-Präsenzprofil | `partially_supported` | nein | Neun Slots, aber nicht alle mit Trainer/Rubrik/Instanz abgedeckt. |
| Klausur 2021 | `partially_supported` | nein | Digitale Ausnahme mit sechs Aufgaben; keine vollständige Slotabdeckung. |
| Klausur 2020 | `partially_supported` | nein | Einzelne DP-/Beweisfamilien sind abgedeckt, aber nicht das Gesamtprofil. |
| Klausur 2022 | `partially_supported` | nein | Mehrere Aufgabenfamilien fehlen. |
| Klausur 2024 | `metadata_only` | nein | Prüfer, Datum, Dauer und Hilfsmittel bleiben unbekannt; mehrere Slots fehlen. |

Für 2024 werden keine unbekannten Metadaten ergänzt.
# Phase 8 Nachtrag

Das historische Standardprofil bleibt weiterhin nicht als historische Originalklausur startbar. Der Simulator stellt stattdessen `exam-package-kernkompetenz-v2` als generierte, vollständig bewertbare Probeklausur bereit. Aufgabe 7 ist durch `trainer-greedy-entwurf-fitnesspunkte-v1` produktiv abgedeckt; Belege: `src-97414623dd81`, Seite 8; `src-8a588d5ddc35`, Seite 8.

