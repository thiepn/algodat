# Entwicklungsfahrplan

1. Phase 0A Nachprüfung: verbleibende textarme Lösungen und Bildserie visuell/OCR-gestützt zuordnen; unsichere Fragen schließen. **Abgeschlossen.**
2. Phase 1 Fundament: Vite/React/TS/PWA, Schema-Paket, Inhaltsloader, IndexedDB-Migrationen, Quellenansicht. **Abgeschlossen.**
3. Phase 2 vertikaler Tracing-Lernpfad: ein vollständig belegter Trainer mit aktiver Eingabe, Rubrik, Fehlerdiagnose, Persistenz, Mastery und PWA-Prüfung. **Umgesetzt für Rucksack-DP-Tabelle.**
4. Phase 3 zweiter verifizierter Lernpfad: Muster aus Phase 2 auf eine weitere Algorithmusfamilie übertragen. **Umgesetzt für Union-Find mit verketteten Listen.**
5. Phase 4 erster Beweistrainer: Schleifeninvariante, strukturierter Beweis, mathematische Grammatik, Proof-Scoring, Mastery V3 und Routen `/trainer/beweise/...`. **Umgesetzt für gewichtete Array-Summe.**
6. Phase 5 Rekurrenztrainer: Master-Theorem, Rekursionsbaum, induktiver Laufzeitbeweis, Mastery V4 und Routen `/trainer/rekurrenzen/...`. **Umgesetzt für `T(n)=8T(n/2)+n^3`.**
7. Phase 6 DP-Entwurfstrainer: strukturierter dynamischer Programmierentwurf, Zustand/Rekurrenz/Algorithmus/Beweis/Komplexität, deterministisches Orakel, Mastery V5 und Routen `/trainer/entwurf/dp/...`. **Umgesetzt für Mine / Aufgabe 8 aus der Probeklausur.**
8. Phase 7 Klausursimulator: historische Profile als ehrliche Coverage, eine startbare Kernkompetenz-Probeklausur, Timer, Recovery, Adapter, exakte Punkte, Ergebnisbericht, Mastery V6 und Routen `/simulator/...`. **Umgesetzt als nicht historische Probeklausur V1.**
9. Nächste mögliche Phase: weitere verifizierte Trainerfamilien, damit ein historisches Profil irgendwann vollständig startbar werden kann. Start erst nach eigenem Kandidaten- und Quellen-Gate.
10. Spätere Härtung: Spickzettel-Builder, weitere Offline-Szenarien, Export/Import-UX, echte Screenreader-Prüfung und Performance-Budget pro Trainerfamilie.

Gate je Phase: Datenvalidierung grün, Quellenabdeckung dokumentiert, Scoringtests grün, keine ungeprüften Lösungen im Release-Paket, keine privaten Quellen im Build.
# Phase 8 Nachtrag

Phase 8 ist abgeschlossen: Kandidatenaudit, Greedy-Trainer Fitnesspunkte, Simulator V2, Mastery V7, Tests und Abschlussberichte sind implementiert. Zurückgestellt bleiben Workout und Entsorgungsstationen, bis belastbare Lösungsevidenz vorliegt. Produktiver Beleg: `src-97414623dd81`, Seite 8; `src-8a588d5ddc35`, Seite 8.
## Phase 12 abgeschlossen

Phase 12 ergänzt Prim-MST-Tracing als zehnten Lernpfad. Für Phase 13 wird empfohlen, entweder ein kuratiertes neues Simulatorpaket zu prüfen oder Kruskal erst nach belastbarer offizieller Aufgaben-/Lösungsverknüpfung produktiv umzusetzen.
# Phase 13 abgeschlossen

Phase 13 ergänzt Divide-and-Conquer-Algorithmusentwurf als elften Lernpfad und führt `exam-package-kernkompetenz-v4` als kuratiertes Standardprofil mit Aufgabe-7-D&C ein. Für nachfolgende Phasen sollten nur Kandidaten starten, deren Aufgabenstellung, Lösung, Laufzeit und Beweis vollständig offiziell belegt sind.

# Phase 14 abgeschlossen

Phase 14 ergänzt eine eigenständige Grundlagen-Diagnose mit 64 Items, acht Kompetenzgruppen, deterministischem Scoring, Fehlerdiagnose, Konfidenz, Empfehlungen, Mastery V13 und Persistenz. Sie erzeugt kein neues Klausurpaket. Nächste Phasen sollten entweder die Diagnosebank quellenbasiert erweitern oder neue Trainer erst nach Quellen-Gate beginnen.

# Phase 15 abgeschlossen

Phase 15 ergänzt einen adaptiven Lernorchestrator mit Tagesplan, Wochenplan, Spaced Review, Prüfungsreife, Empfehlungserklärungen, lokalen Einstellungen, Verlauf und IndexedDB-Version 9. Sie erzeugt keine neuen fachlichen Aufgaben und keine Notenprognose. Nächste Phasen sollten Release-Härtung, echte Screenreader-Prüfung, weitere quellengebundene Probeklausuren oder einen klar als Referenz markierten Spickzettel fokussieren.

# Phase 16 Release Candidate

Phase 16 erzeugt `1.0.0-rc.2`, ergänzt den lokalen A4-Spickzettel-Builder, IndexedDB-Version 10, finale Coverage-/Release-Dokumentation, erweiterte Deployment-Sicherheit und den Accessibility-Fallback-Audit. Finales `1.0.0` bleibt bis zum echten Screenreader-Gate und finalem Verify gesperrt.
