# Phase 16 Implementierungsplan

## Zielzustand

Phase 16 führt das AlgoDat Study System in einen belastbaren Release-Candidate-Stand `1.0.0-rc.2`. Die finale Version `1.0.0` wird nur gesetzt, wenn alle automatisierten und manuellen Release-Gates erfüllt sind. Da ein echter Screenreader-Test in dieser Ausführungsumgebung voraussichtlich nicht verlässlich möglich ist, wird der finale Stand nur bei tatsächlich dokumentiertem manuellem Audit freigegeben; andernfalls bleibt der Stand ehrlich als RC markiert.

## Ist-Zustand

- Produktive Lernpfade: elf tiefe Trainerfamilien.
- Diagnose: Grundlagen-Diagnose mit 64 Items, acht Kompetenzgruppen und acht Itemtypen.
- Lernorchestrator: `/lernplan` mit Tagesplan, Wochenplan, Prüfungsreife, Wiederholungen, Einstellungen und Verlauf.
- Simulator: vier Kernkompetenz-Probeklausuren V1 bis V4.
- Persistenz: IndexedDB-Version 9.
- Letzter verifizierter Gate: Phase 15 mit `npm.cmd run verify`, 190 Vitest-Tests und 30 Playwright-Tests.
- Git: Phase-16-Check durch `dubious ownership` blockiert; keine Ausnahme gesetzt.

## Release-Blocker

- Spickzettel-Builder existiert bisher nur als Platzhalterroute.
- Version ist noch `0.1.0`; RC-Metadaten fehlen.
- Kein finaler Coverage-Audit für Themen, Klausurslots und historische Instanzen.
- Kein finaler Route-Audit als maschinenlesbares Manifest.
- Kein finaler Migrationstest für Version 10, falls `cheatSheets` ergänzt wird.
- Kein echter Screenreader-Test im aktuellen Arbeitskontext dokumentiert.
- Entry liegt zuletzt knapp über dem Release-Ziel von 450 kB, aber unter dem harten 500-kB-Limit.

## Coverage-Lücken

Viele Themen sind diagnostisch oder thematisch erfasst, aber nicht als tiefer Trainer abgedeckt. Historische Originalinstanzen werden nicht vollständig simuliert; startbare Pakete bleiben bewusst neu zusammengestellte `public_safe`-Probeklausuren. Coverage wird mit den Stufen `exact_historical_instance_supported`, `same_problem_family_supported`, `same_task_format_supported`, `diagnostic_only` und `unsupported` dokumentiert.

## Technische Schulden

- Simulatorseiten formulieren teils noch Phase-7-Texte, obwohl V1 bis V4 existieren.
- Import/Export arbeitet aktuell als Replace-Import ohne UI-Konfliktvorschau.
- Onboarding ist indirekt über Dashboard/Navigation vorhanden, aber noch nicht als Release-Startpfad dokumentiert.
- Spickzettel-Daten, Layout und Persistenz fehlen vollständig.

## Performance-Risiken

- Entry-Ziel `≤ 450000` Byte wurde in Phase 15 knapp verfehlt.
- Neue Spickzettel-Produktfamilie darf keine Daten oder große UI in den Entry ziehen.
- Route-Manifest, Cheat-Sheet-Content und Policies müssen lazy bleiben.

## Persistenz- und Migrationsrisiken

- Neuer Store `cheatSheets` erfordert additive Migration auf Version 10.
- Export/Import muss CheatSheets aufnehmen und ältere Exporte weiterhin akzeptieren.
- Beschädigte CheatSheet-Daten dürfen nicht stillschweigend als gültig importiert werden.

## Offline- und Update-Risiken

- Neue Spickzettelroute muss nach vorherigem Laden offline verfügbar sein.
- Laufende Trainer-, Diagnose-, Simulator-, Lernplan- und Spickzettelarbeit darf durch PWA-Updates nicht zerstört werden.
- Private PDFs dürfen nie in Service-Worker-Cache oder Buildartefakte gelangen.

## Accessibility-Risiken

- Spickzettel darf nicht auf Drag-and-Drop angewiesen sein.
- Print-Vorschau muss per Tastatur erreichbar sein.
- Statuswerte müssen textlich verständlich bleiben und dürfen nicht nur über Farbe kommunizieren.
- Ein echter Screenreader-Test kann nur dokumentiert werden, wenn er wirklich ausgeführt wurde.

## Simulatorportfolio

V1 bis V4 bleiben unverändert und reproduzierbar. Phase 16 prüft, ob Abschluss-Probeklausur A und B verantwortbar erstellt werden können. Wenn keine zwei strukturell vergleichbaren Pakete ohne Aufgabenidentität möglich sind, wird nur ein Paket erstellt oder die Grenze dokumentiert.

## Spickzettel-Konzept

Der A4-Spickzettel ist eine lokale, nicht-generative Referenz. Inhalte kommen aus verifizierten Kurzblöcken mit Quellenreferenzen. Unterstützte Modi: Standard, schwächenorientiert, klausurslot-orientiert, manuell und minimal. Layoutziel sind exakt zwei A4-Seiten mit deterministischem Packing, Mindestschriftgröße und Overflow-Behandlung durch Entfernen oder Kompaktvarianten.

## Release-Testmatrix

1. Content-Build und Content-Validierung.
2. Cheat-Sheet-Content- und Layout-Validierung.
3. Route-Manifest-Validierung.
4. Persistenzmigration auf Version 10.
5. Export-/Import-Roundtrip einschließlich CheatSheets.
6. Deployment-Audit mit neuen Blockern.
7. Unit-/Integrations-/E2E-Tests.
8. Coverage-Lauf.
9. Produktionsbuild, Bundle-Analyse und Import-Audit.
10. Offline-, PWA-Update- und Accessibility-Audit.
11. `npm.cmd run format:check`.
12. `npm.cmd run verify` nach der letzten Änderung.

## Nichtziele

Keine neue Algorithmusfamilie, keine freie LLM-/CAS-Bewertung, keine Cloud-Synchronisation, keine Nutzerkonten, keine Telemetrie, keine historische Originalklausur im Build und keine globale Git-Sicherheitsausnahme.

## Arbeitsstränge

1. Release-Governance, Versionierung, Bugklassifikation und Known Limits.
2. Finale Coverage-, Route- und Prüfungspaket-Audits.
3. Cheat-Sheet-Domain, Daten, Layout, UI, Persistenz und Tests.
4. Migration, Export/Import, Recovery, PWA und Deployment-Härtung.
5. Performance- und Bundle-Audit.
6. Nutzer-, Wartungs- und Release-Dokumentation.
7. Finale Validierung und wahrheitsgemäßer Abschlussbericht.
