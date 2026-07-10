# Performance Report Phase 18

Phase 18 priorisiert nützlichen Lerninhalt vor einer künstlichen 500-kB-Hartgrenze.

## Neue Bundle-Policy

- `500000` Byte Einstiegschunk: informative Warnung.
- `1000000` Byte Einstiegschunk: starke Warnung.
- `5000000` Byte Einstiegschunk: harte Notfallgrenze.

Das Analyse-Script gibt aus:

- `entryRawBytes`
- `entryGzipBytes`
- `totalRawBytes`
- `totalGzipBytes`
- `warning500k`
- `warning1MB`
- `withinEmergencyLimit`

Route-Level-Lazy-Loading bleibt erhalten. Private PDFs und lokale Dokumentbytes sind weiterhin von Build, Precache und Deployment ausgeschlossen.
