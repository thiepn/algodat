# Barrierefreiheitsaudit Phase 3

## Ergebnis

Die Phase-3-Trainer wurden mit automatisierter Axe-Prüfung, Tastaturpfaden und mobilem Layout geprüft. Ein echter Screenreader-Lauf mit Windows Narrator oder NVDA wurde in dieser Umgebung nicht durchgeführt und ist daher nicht als bestanden behauptet.

## Geprüfte Punkte

- Navigation per Tastatur zum Start des Versuchs.
- Tastaturaktivierung von Weiter- und Abgabe-Schritten.
- Überschriftenfokus beim Schrittwechsel.
- Keine Hinweise im Prüfungsmodus.
- Keine Axe-Verstöße im geprüften Prüfungsmodus.
- 200-Prozent-Zoom ohne horizontalen Seitenüberlauf im geprüften Pfad.
- Mobile Chromium-E2E-Pfade für Rucksack-DP und Union-Find.

## Offene manuelle Prüfung

Vor Veröffentlichung mit echter Screenreader-Zusage müssen noch geprüft werden:

1. Windows Narrator oder NVDA liest die Union-Find-Listen verständlich.
2. Die Textalternative der Listenvisualisierung reicht ohne SVG-Kontext aus.
3. Dialog „Versuch wirklich abgeben?“ erhält und verlässt Fokus erwartbar.
4. Mobile virtuelle Tastatur verdeckt keine Pflichtaktion dauerhaft.

## Umgesetzte Phase-3-Maßnahme

Der E2E-Pfad aktiviert den finalen Abgabeschritt per Tastatur. Das sichert ab, dass die kritische Abgabe nicht von einem präzisen Pointer-Klick abhängt.

