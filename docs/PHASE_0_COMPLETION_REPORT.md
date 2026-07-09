# Phase-0-Abschlussbericht

## Kennzahlen

- Dateien: **146**
- PDFs / PDF-Seiten: **119 / 2936**
- Bilddateien: **19**
- Prüfungssets: **10** (6 real, 4 Probe; ein reales Set nur plausibel datiert)
- vertretene Prüfungsjahre: **2020, 2021, 2022, 2023, 2024**; 2025 enthält Übungen, aber keine gefundene Klausur
- Fragen-/Seiteninventar: **633**
- exakte Duplikatgruppen: **18**; dokumentierte Nahe-Beziehungen: **5**
- technisch unlesbare Dateien: **0**
- textarme PDFs: **9**; diese bleiben teilweise visuell zuzuordnen

## Verifizierte Struktur

Neun Aufgaben mit 50 Punkten und dem Muster Tracing (A1-A4), Invariante (A5), Rekurrenz (A6), Entwurf (A7), DP (A8), Transfer/Datenstruktur (A9) sind für das Präsenzregime stark gestützt. 2021 widerspricht einer universellen Regel: sechs Aufgaben, 60 Punkte, 120 Minuten.

## Höchste Lernprioritäten

1. Schleifeninvarianten und vollständige Induktion.
2. Rekurrenzen, asymptotische Schranken und Induktionsbeweise.
3. Dynamische Programmierung mit Zustand/Basis/Rekurrenz/Beweis/Bottom-up/Laufzeit.
4. Deterministisches Tracing von Graphalgorithmen, Rot-Schwarz-Bäumen und Union-Find.
5. Algorithmusentwurf mit Laufzeit- und Korrektheitsbeweis (Greedy, Divide and Conquer, Graphtransfer).

## Größte Inhaltsrisiken

1. Bildbasierte bzw. handschriftliche Lösungsscans ohne OCR und sichere Aufgabenzuordnung.
2. Fehlendes Deckblatt der Klausur 2024: Prüfer, Dauer und Hilfsmittel unbekannt.
3. Erzeugte Leitfäden überverallgemeinern das Neun-Aufgaben-Modell; 2021 ist Gegenbeleg.
4. Viele byteidentische Kopien in verschiedenen Jahresordnern verfälschen naive Häufigkeitszählungen.
5. Für 2023 und 2025 fehlt eine eindeutig reale Klausur; Probeklausuren dürfen die Lücke nicht kaschieren.

## Validierung

**21/21 Prüfungen bestanden, 0 Fehler**. Der genaue letzte Lauf steht in `data/validation-results.json`.

## Erzeugte Dateien

`README.md`, `AGENTS.md`, `.gitignore`; alle 16 Markdown-Dateien unter `docs/`; die sieben geforderten JSON-Dateien sowie `validation-results.json` unter `data/`; `scan_sources.py`, `extract_pdf_metadata.py`, `validate_phase0_data.py`, `phase0_common.py` und `build_phase0.py` unter `scripts/`.

Empfohlene nächste Phase ist **Phase 0a: visuelle/OCR-Nachprüfung der verbleibenden textarmen Lösungen**, anschließend Phase 1 mit Schema-/PWA-Fundament. Es wurde keine Produktionsoberfläche implementiert und keine Quelldatei verändert.
