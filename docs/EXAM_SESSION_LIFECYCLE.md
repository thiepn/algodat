# Exam Session Lifecycle

## Zustände

Der Domainkern verwendet `created`, `briefing`, `ready`, `running`, `recovery_required`, `time_expired`, `submitted`, `graded`, `archived` und `invalid`.

## Erlaubte Übergänge

Die Übergänge sind in `src/domain/exam-simulator/sessions/lifecycle.ts` zentral definiert. Unzulässige Übergänge liefern eine deutsche Fehlermeldung und ändern die Sitzung nicht.

Typischer Ablauf:

1. `created` beim Erzeugen aus `exam-package-kernkompetenz-v1`.
2. `briefing` für Startbestätigungen.
3. `ready` unmittelbar vor dem Start.
4. `running` nach Timerstart.
5. `submitted` nach endgültiger Abgabe oder Zeitablauf.
6. `graded` nach deterministischer Bewertung und Ergebnisbericht.

## Persistenz

Jede produktive Session wird mit Schema-, Content- und Quellenmetadaten in `examSessions` gespeichert. Snapshots liegen getrennt in `examSnapshots`, Ergebnisse getrennt in `examResults`.

## Prüfungsmodus

Im Modus `strict_exam` zeigt die UI vor Abgabe keine fachliche Bewertung, keine Hinweise und keine Lösung. Statuslabels wie „beantwortet“ oder „teilweise beantwortet“ beschreiben nur Eingabezustände, nicht Richtigkeit.
