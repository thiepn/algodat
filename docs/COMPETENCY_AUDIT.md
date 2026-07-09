# Kompetenz-Audit Phase 14

Phase 14 führt acht aktive Grundlagenkompetenzen ein. Die fachliche Kanonik liegt in `data/phase14-competency-inventory.json`; die produktive Laufzeitfassung liegt in `src/content/generated/foundation-competencies.json`.

| Kompetenz | Quellenbezug | Produktive Items | Fehlerdiagnose |
| --- | --- | ---: | --- |
| Asymptotik und Landau-Notation | `src-35405e721f05`, Seiten 9 und 11 | 8 | ja |
| Rekurrenzen, Rekursionsbäume und Master-Theorem | `src-25d6340b518c`, Seiten 17 und 25 | 8 | ja |
| Suchen und Sortieren | `src-c0e0f8927c2c`, Seite 1; `src-35405e721f05`, Seite 9 | 8 | ja |
| Datenstrukturen und Operationen | `src-79ae96ebbccf`, Seite 2; `src-35405e721f05`, Seite 6 | 8 | ja |
| Graphgrundlagen | `src-35405e721f05`, Seite 3; `src-88179ac88dc5`, Seite 3 | 8 | ja |
| Graphalgorithmen auswählen | `src-baa07f0a207a`, Seite 846; `src-35405e721f05`, Seite 4 | 8 | ja |
| Entwurfsparadigmen unterscheiden | `src-8f16b2505bbd`, Seite 10; `src-88179ac88dc5`, Seite 7 | 8 | ja |
| Korrektheit und Beweismethoden | `src-25d6340b518c`, Seite 11; `src-35405e721f05`, Seite 12 | 8 | ja |

Audit-Ergebnis: 64 produktive Items, 8 Kompetenzgruppen, 8 produktive Itemtypen, mindestens 4 Items pro aktiver Kompetenz und mindestens ein Fehlerdiagnosepfad pro Kompetenz. Diese Zahlen werden von `scripts/validate-content.ts` gegen die generierten Dateien geprüft.

Nicht produktiv in Phase 14: freie Beweisbewertung, freie Codeausführung, TableCompletion und CodeRecognition als UI-Renderer. Diese Typen bleiben für spätere Domänenpakete vorgesehen und werden nicht als produktive Phase-14-Typen gezählt.
