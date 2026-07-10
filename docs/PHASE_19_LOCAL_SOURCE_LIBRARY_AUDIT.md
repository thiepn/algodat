# Phase 19 Audit – private Quellen und lokale Aufgabenregionen

## Öffentliche Daten

Erlaubt:

- Quellen-IDs,
- erwartete Dateinamen,
- SHA-256-Metadaten nur aus lokaler Bindung/exportierter Zuordnung,
- Seitenzahlen,
- normalisierte Crop-Koordinaten,
- Aufgaben-/Themen-/Trainer-Zuordnungen,
- kurze sichere Zusammenfassungen und Methodenlabels.

Nicht erlaubt:

- PDF-Bytes,
- Screenshots,
- Base64-Bilder,
- vollständige Aufgaben- oder Lösungstexte,
- OCR-Volltexte,
- Browser-Dateihandles,
- lokale absolute Pfade.

## Status der Regionen

Statisch abgeleitete Regionen verwenden `metadata_only`, wenn nur Seiten-/Aufgabenmetadaten
vorliegen. Nutzergeprüfte lokale Regionen verwenden `local_user_indexed`. Quellenkonflikte oder
fehlende Präzision werden nicht stillschweigend als verifiziert markiert.

## Offline-Verhalten

Nach lokaler Verbindung liegen PDF-Bytes in IndexedDB. Die Anzeige nutzt Blob-URLs, die nur im
Browser-Prozess existieren. Bei fehlender oder entfernter Bindung zeigt die App
`Dokument erneut verbinden` bzw. eine sichere Fallback-Karte statt eines leeren Viewers.

