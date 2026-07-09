# Exam Timer und Recovery

## Timer

`exam-package-kernkompetenz-v1` verwendet 144 Minuten. Die Dauer ist eine Trainingsableitung aus `180/50` Minuten pro Punkt und 40 Punkten; sie ist keine offizielle Dauer einer historischen Klausur.

`src/domain/exam-simulator/timer/` berechnet:

- verstrichene Zeit aus Startzeit und aktueller Uhrzeit,
- Restzeit aus Deadline und aktueller Uhrzeit,
- Warnungen bei 50 %, 25 %, 10 % und 5 % Restzeit,
- automatische Abgabe bei Zeitablauf.

## Recovery

`createRecoverySnapshot` serialisiert die Domain-Session, Adapterversionen und Payloadversionen mit deterministischer Prüfsumme. `restoreRecoverySnapshot` akzeptiert nur unveränderte Snapshots mit passender Version und Checksumme.

## Lokale Grenzen

Recovery ist browserlokal. Es gibt kein Backend und keine geräteübergreifende Synchronisierung. Ein Reload setzt den Timer nicht zurück, weil Startzeit und Deadline in der Session gespeichert sind.
