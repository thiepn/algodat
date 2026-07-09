# Richtlinie für Trainingsinhalte

## Grundsatz

Offizielle Quellen haben Vorrang. Trainingsinhalte dürfen nur produktiv erscheinen, wenn Methode, Notation und Lösungspfad belegt sind. Erzeugte Aufgaben sind erlaubt, wenn sie klar als erzeugt markiert sind, keine privaten Originalwerte oder Formulierungen übernehmen und durch eine deterministische Engine gelöst werden.

## Statusfelder

Trainingsdaten verwenden unter anderem:

- `contentOrigin`: Herkunft, zum Beispiel `source_aligned_generated_exercise`
- `verificationStatus`: fachlicher Prüfstatus
- `publicDistributionStatus`: Veröffentlichbarkeit
- `solutionValidationStatus`: Validierung der Lösung
- `trainerKind`: `tracing` oder `proof`

Nur `public_safe`-Trainer werden in die Laufzeitdateien geschrieben.

## Aktive Trainer

- `trainer-rucksack-dp-v1`: quellenorientiert erzeugte Rucksack-DP-Aufgabe. Quellen: `src-25d6340b518c`, Seiten 33–34, und `src-baa07f0a207a`, ab Seite 390.
- `trainer-union-find-listen-v1`: quellenorientiert erzeugte Union-Find-Aufgabe. Quellen: `src-8f16b2505bbd`, Seite 6; `src-35405e721f05`, Seite 6; `src-baa07f0a207a`, Seiten 943, 946, 948, 949, 950–951.
- `trainer-schleifeninvariante-summe-v1`: quellenorientiert erzeugter Schleifeninvarianten-Beweistrainer. Quellen: `src-25d6340b518c`, Seiten 11–12; `src-baa07f0a207a`, Seiten 132–135 und 140.
- `trainer-rekurrenz-master-fall1-v1`: quellenorientierter Rekurrenz-Laufzeitbeweistrainer. Quellen: `src-25d6340b518c`, Seiten 17–18 und 25–26; `src-baa07f0a207a`, Seiten 194–198 und 230–238.
- `trainer-dp-entwurf-mine-v1`: quellenorientierter DP-Entwurfstrainer. Quellen: `src-8f16b2505bbd`, Seite 10; `src-35405e721f05`, Seiten 11–12.

## Klausursimulator

Startbare Exam-Packages müssen `public_safe`, vollständig automatisch bewertbar und klar als historisch oder nicht historisch markiert sein. Phase 7 erlaubt nur `exam-package-kernkompetenz-v1`. Es ist eine neu zusammengestellte Probeklausur und darf nicht als historische Originalklausur, offizielle Notensimulation oder Häufigkeitsbeleg erscheinen.

## Beweisaufgaben

Beweisaufgaben werden nur produktiv freigegeben, wenn Aufgabenstellung, kanonische Beweisidee und Rubrik durch offizielle Quellen mit Seitenbezug belegbar sind. Alternative korrekte Beweise außerhalb der unterstützten Grammatik werden als manuell prüfungsbedürftig markiert, nicht automatisch erfunden.

## PDF-Schutz

Die lokalen Original-PDFs liegen im Projektordner `pdfs/`, bleiben aber privates Eingangsmaterial. Sie werden per `.gitignore`, Content-Build, Workbox-Konfiguration und Deployment-Audit vom öffentlichen Artefakt ausgeschlossen. Die Validierung prüft nur Hashgleichheit gegen das Manifest; sie kopiert oder verändert die Dateien nicht.

## Quellenkonflikte

Konflikte werden nicht stillschweigend aufgelöst. Dijkstra bleibt deshalb blockiert, solange Aufgabe, Lösung und Tie-Breaker nicht gemeinsam verifiziert sind.
# Phase 8 Nachtrag

Greedy-Varianten dürfen nur numerische Fitnesspunkte-Instanzen der belegten Aufgabe variieren. Regel, Zielfunktion, Laufzeit und Austauschbeweis bleiben unverändert. Workout und Entsorgungsstationen dürfen ohne offizielle Lösungsskizze nicht produktiv bewertet werden. Quellen: `src-97414623dd81`, Seite 8; `src-8a588d5ddc35`, Seite 8.
## Phase 12 Ergänzung

Der Prim-MST-Trainer ist public-safe neu formuliert. Er übernimmt keine historischen Graphwerte; er nutzt ausschließlich belegte Methode, Notation und Konventionen mit Source-IDs und Seitenangaben.
# Phase 13 Nachtrag

Divide-and-Conquer-Varianten dürfen nur public-safe Zahlenfolgen zur belegten Aufgabe „maximale Wertdifferenz“ verwenden. Zielfunktion, Indexbedingung `i <= j`, Rückgabetripel, Kombinationsfall, Rekurrenz, Laufzeit und Beweisstruktur bleiben an `src-88179ac88dc5`, Seite 7, gebunden.

Die Original-PDFs bleiben private Eingangsquellen und werden nicht verlinkt, kopiert oder als Produktionsartefakt veröffentlicht.

# Phase 14 Nachtrag

Diagnoseitems sind public-safe neu formulierte Kuraufgaben. Sie dürfen nur produktiv sein, wenn sie eine Kompetenz aus `foundation-competencies.json`, mindestens eine Quelle mit Seite, deterministische Bewertung, Fehlvorstellungszuordnung und Distraktorbegründung besitzen.

Phase 14 übernimmt keine Originalformulierungen aus lokalen PDFs. Beispiele für Quellenbindung: Asymptotik `src-35405e721f05`, Seiten 9 und 11; Datenstrukturen `src-79ae96ebbccf`, Seite 2; Graphalgorithmen `src-baa07f0a207a`, Seite 846.
