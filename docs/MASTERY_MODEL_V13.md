# Mastery Model V13

Mastery V13 beschreibt ausschließlich die Grundlagen-Diagnose. Es ersetzt nicht Mastery V12 der Divide-and-Conquer-Trainer und keine Exam-Mastery.

## Dimensionen

- Kompetenzwert je Grundlagenkompetenz.
- Evidenzanzahl je Kompetenz.
- Fehlvorstellungs-IDs aus falschen Antworten.
- Konfidenzabgleich.
- Session-IDs als rekonstruierbare Evidenz.

## Statuslogik

- `stark`: hoher Score mit ausreichender Evidenz.
- `stabil`: mittlerer bis hoher Score.
- `instabil`: niedriger Score oder starke Fehlvorstellungen.

Die acht Kompetenzgruppen und ihre Quellen sind in `data/phase14-competency-inventory.json` dokumentiert, unter anderem Paradigmen über `src-8f16b2505bbd`, Seite 10, und `src-88179ac88dc5`, Seite 7.
