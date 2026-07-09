# Phase 13 Implementierungsplan

Phase 13 ergänzt genau einen produktiven Divide-and-Conquer-Entwurfstrainer für Aufgabe 7. Bestehende Greedy-Abdeckung bleibt erhalten; D&C erweitert die historische Aufgabe-7-Breite.

## Ausgangslage

- Greedy-Aufgabe 7 ist produktiv durch `trainer-greedy-entwurf-fitnesspunkte-v1` abgedeckt (`src-97414623dd81`, Seite 8; `src-8a588d5ddc35`, Seite 8).
- Divide-and-Conquer-Aufgabe 7 ist im Korpus durch maximale Wertdifferenz belegt (`src-88179ac88dc5`, Seite 7).
- Aufgabe 7 bleibt im Standardprofil eine Entwurfsaufgabe mit Algorithmus, Laufzeit und Korrektheit.

## Kandidatengate

Geprüft werden maximale Wertdifferenz, fehlerhaftes Array, fehlender Wert, MergeSort als Entwurfsaufgabe, weitere Übungsbelege und binäre Suche als Fallback. Nicht kompensierbar sind offizielle Quelle, verifizierte Lösung, sichere Verknüpfung, Basisfall, Split, Combine, Rekurrenz, Beweis, Oracle und public-safe Instanz.

## Geplante Architektur

- Neue Familie `divide_conquer_design`.
- Renderer `divide_conquer_max_difference`.
- Engine `divide-conquer-maxwertdifferenz-v1`.
- Scoring `divide-conquer-design-scoring-v1`.
- Mastery `mastery-v12`.
- Keine IndexedDB-Migration; vorhandenes `PracticeAttempt.answers` bleibt Payload-Träger.

## Domain

Der Solver berechnet für ein Teilfeld `A[l..r]` ein Tripel aus maximaler Differenz, Minimum und Maximum. Das unabhängige Oracle prüft kleine Instanzen mit Brute Force über alle Paare `i <= j`. Gegenbeispiele unterscheiden insbesondere fehlenden Cross-Fall und falsche Richtung.

## Scoring und Tests

Bewertet werden Interpretation, Teilproblem/Basisfall/Split, Combine, Algorithmus, Rekurrenz/Laufzeit und Induktionsbeweis. Folgefehler werden begrenzt: Ein Basisfallfehler begrenzt Algorithmus und Beweis, erzeugt aber keinen erfundenen Rekurrenzfehler.

## Simulator

V1, V2 und V3 bleiben unverändert. V4 wird als bewusst kuratiertes Ersatzpaket erstellt: Es ersetzt im Aufgabe-7-Slot Greedy durch D&C und ist nicht kumulativ.

## Nichtziele

Keine mehreren D&C-Trainer, kein MergeSort-Tracing, kein Strassen/Karatsuba, kein allgemeiner Synthesizer, kein freies LLM-Scoring, kein Backend.
