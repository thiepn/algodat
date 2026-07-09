# Produktspezifikation

## Ziel

Ziel ist eine deutschsprachige, lokale, offlinefähige Prüfungsvorbereitung mit nachvollziehbaren Quellen und aktiver Reproduktion. Inhalte werden nur produktiv freigegeben, wenn Quelle, Seite/Folie, Verifikationsstatus und deterministische Auswertung dokumentiert sind.

## Kernmodule

1. Dashboard: Bereitschaft, Beherrschung pro Aufgabe/Thema, Fehler, nächste Aktion.
2. Prüfungsstruktur: A1-A9-Sicht mit Häufigkeit, Punkten, Strategie und Training.
3. Themenseiten: Intuition, Definition, Originalnotation, Pseudocode, Beispiel, Korrektheit, Laufzeit, Speicher, Fehler, Quellen und Übungen.
4. Tracing-Trainer: aktive Eingabe von Zwischenzuständen.
5. Beweistrainer: aktive Eingabe strukturierter Korrektheitsbeweise.
6. Entwurfstrainer: aktive Eingabe strukturierter Algorithmusentwürfe.
7. Klausursimulator: ehrliche Coverage historischer Profile und genau eine startbare Kernkompetenz-Probeklausur.
8. Fehleranalyse: vorgegebene Fehlercodes mit konkreter Evidenz aus Nutzereingaben.
9. Beherrschung: lokal berechnete Mastery-Dimensionen.
10. Spickzettel-Builder: spätere Phase.

## Aktueller Funktionsumfang

Der Trainerbereich bietet fünf verifizierte Lernpfade:

- Rucksack-DP-Tabelle: aktive Eingabe von DP-Zeilen, Rekurrenz, Tie-Breaker und Endwert.
- Union-Find mit Listen: aktive Eingabe von Mengenlisten, Repräsentanten, angehängter Liste und Kontrollpunkten.
- Schleifeninvariante für gewichtete Summe: aktive Eingabe von Behauptung, Invariante, IA, IV, IS, Terminierung und Schluss.
- Rekurrenz-Laufzeitbeweis: aktive Eingabe von Rekurrenz, Master-Theorem, Rekursionsbaum und Induktion.
- DP-Algorithmusentwurf Mine: aktive Eingabe von Zustand, Rekurrenz, Auswertungsordnung, Algorithmus, Beweis und Komplexität.

Trainer bieten je nach Familie Lern-, Übungs-, Prüfungs- und Wiederholungsmodus. Nutzende erhalten je nach Modus Hinweise oder erst nach Abgabe Feedback, sehen Rubrik-Auswertung, Fehlerdiagnose, Musterlösung, Mastery-Auswirkung und nächste Empfehlung. Entwürfe und abgeschlossene Versuche werden lokal gespeichert.

Der Klausursimulator bietet eine `KERNKOMPETENZ-PROBEKLAUSUR V1` mit fünf automatisch bewertbaren Aufgaben. Die Probeklausur verwendet die vorhandenen Trainerfamilien, zeigt vor Abgabe keine fachliche Bewertung und erzeugt nach Abgabe Punkte, Fehlercluster, Timing-Auswertung, Mastery V6 und Empfehlungen. Historische Profile werden nur als nicht startbare Abdeckung angezeigt.

## Fachliche Quellen

- Rucksack-DP: `src-25d6340b518c`, Seiten 33–34, und `src-baa07f0a207a`, ab Seite 390.
- Union-Find: `src-8f16b2505bbd`, Seite 6; `src-35405e721f05`, Seite 6; `src-baa07f0a207a`, Seiten 943, 946, 948, 949, 950–951.
- Schleifeninvariante: `src-25d6340b518c`, Seiten 11–12; `src-baa07f0a207a`, Seiten 132–135 und 140.
- Rekurrenztrainer: `src-25d6340b518c`, Seiten 17–18 und 25–26; `src-baa07f0a207a`, Seiten 194–198 und 230–238.
- DP-Entwurf Mine: `src-8f16b2505bbd`, Seite 10; `src-35405e721f05`, Seiten 11–12.

Die Kernkompetenz-Probeklausur bündelt diese fünf Quellenfamilien. Sie ist neu zusammengestellt und nicht als historische Originalklausur oder Häufigkeitsbeleg zulässig.

## Nichtziele

Kein Backend, keine Anmeldung, kein gemeinsames Bearbeiten, keine freie LLM-Bewertung, keine freie CAS-Bewertung und keine ungeprüft generierten Musterlösungen. Barrierefreiheit, Tastaturbedienung und mobile Lesbarkeit sind Abnahmekriterien.
# Phase 8 Nachtrag

Der Produktumfang umfasst jetzt einen sechsten produktiven Lernpfad für Aufgabe 7: Greedy-Algorithmusentwurf zu Fitnesspunkten. Die kanonische Lösung ist durch `src-97414623dd81`, Seite 8 und `src-8a588d5ddc35`, Seite 8 belegt. Der Simulator verwendet standardmäßig `exam-package-kernkompetenz-v2` mit sechs Aufgaben, 48 Punkten und 173 Minuten Trainingszeit; V1 bleibt als vorheriges Paket erhalten.

# Phase 9 Nachtrag

Der Produktumfang umfasst jetzt einen siebten produktiven Lernpfad für Rot-Schwarz-Einfügung. Die fachliche Grundlage ist durch `src-97414623dd81`, Seite 4, `src-8a588d5ddc35`, Seite 4, und `src-5c9eadb17ccc`, Seiten 5, 7, 15, 20 und 36 belegt. Der Simulator verwendet `exam-package-kernkompetenz-v3` mit sieben Aufgaben, 56 Punkten und 202 Minuten Trainingszeit; V1 und V2 bleiben erhalten.

# Phase 10 Nachtrag

Der Produktumfang umfasst jetzt einen achten produktiven Lernpfad für Floyd-Warshall-Matrixtracing. Das Aufgabenformat ist durch `src-8f16b2505bbd`, Seite 4, die Kontrolllösung durch `src-35405e721f05`, Seite 5, und die reale Klausurrelevanz durch `src-c4dde22523d3`, Seite 4, belegt. Phase 10 ergänzt den Adapter `floyd_warshall_matrix`, erstellt aber kein neues V4-Paket.

# Phase 11 Nachtrag

Der Produktumfang umfasst jetzt einen neunten produktiven Lernpfad für Dijkstra-Tracing. Die Algorithmussemantik mit `ExtractMin`, `DecreaseKey` und `p[v]=u` ist durch `src-baa07f0a207a`, Seite 846, belegt; die Prioritätenschlange durch `src-baa07f0a207a`, Seite 829; das Tabellenformat durch `src-1ea0642ec775`, Seite 6; die Klausurrelevanz durch `src-011d1ee23245`, Seite 4. Phase 11 ergänzt den Adapter `dijkstra_trace`.
## Phase 12 Ergänzung

Das Produkt enthält nun zehn produktive Lernpfade. Neu ist Prim-MST-Tracing mit aktiver Eingabe von Startknoten, Knotenfolge, Baumkanten, `key`-/`parent`-Tabellen, Gesamtgewicht, sicherer-Kante-Begründung und Laufzeit. Die public-safe Instanz ist neu formuliert und vermeidet Gleichstände.
# Phase 13 Nachtrag

Der Produktumfang umfasst jetzt elf produktive Lernpfade. Neu ist ein Divide-and-Conquer-Algorithmusentwurf für Aufgabe 7 zur maximalen Wertdifferenz. Die produktive fachliche Grundlage ist `src-88179ac88dc5`, Seite 7. Andere geprüfte Kandidaten ohne vollständige offizielle Aufgaben-/Lösungskette bleiben nicht-produktiv dokumentiert.

Das Standardprofil kann `exam-package-kernkompetenz-v4` verwenden: sieben Aufgaben, 56 Punkte, 202 Minuten, mit Divide-and-Conquer statt Greedy in Aufgabe 7. V1, V2 und V3 bleiben als historische Produktstände erhalten.

# Phase 14 Nachtrag

Der Produktumfang umfasst jetzt eine Grundlagen-Diagnose unter `/diagnose`. Sie enthält Schnellcheck, Standarddiagnose und Themendiagnose mit 64 quellengebundenen Items über acht Kompetenzgruppen. Die Diagnose ist ein Item- und Empfehlungssystem, kein neues ExamPackage und keine Notenprognose.

Die Kompetenzquellen liegen in `data/phase14-competency-inventory.json`: unter anderem Asymptotik `src-35405e721f05`, Seiten 9 und 11; Rekurrenzen `src-25d6340b518c`, Seiten 17 und 25; Graphalgorithmen `src-baa07f0a207a`, Seite 846; Paradigmen `src-8f16b2505bbd`, Seite 10; Beweise `src-25d6340b518c`, Seite 11.

# Phase 15 Nachtrag

Der Produktumfang umfasst jetzt einen adaptiven Lernorchestrator unter `/lernplan`. Er erzeugt einen Tagesplan, Wochenplan, eine Wiederholungsqueue, eine Prüfungsreifeansicht, Einstellungen und einen Verlauf. Grundlage sind lokale Trainer-, Diagnose-, Simulator- und Mastery-Ereignisse; es gibt keine Telemetrie, kein Backend und keine Notenprognose.

Phase 15 erzeugt keine neuen fachlichen Aufgaben. Der Aktivitätskatalog verweist ausschließlich auf bestehende produktive Trainer, Diagnosevorlagen und ExamPackages. Fachliche Quellen bleiben die bereits dokumentierten Quellen dieser Artefakte, zum Beispiel Phase 14 `data/phase14-competency-inventory.json`, Phase 13 `src-88179ac88dc5`, Seite 7, und die Trainerquellen aus den vorherigen Phasen.

# Phase 16 Nachtrag

Der Produktumfang umfasst jetzt den lokalen A4-Spickzettel-Builder unter `/spickzettel`. Er erzeugt keine neuen fachlichen Wahrheiten, sondern stellt verifizierte Kurzblöcke mit Quellenreferenzen zusammen. Unterstützt werden Standard-, Schwächen-, Slot-, manuelle und Minimalmodi.

Der Release-Stand ist `1.0.0-rc.2`. `1.0.0` bleibt gesperrt, bis echte Screenreader-Prüfung und finales Verify erfüllt sind.
