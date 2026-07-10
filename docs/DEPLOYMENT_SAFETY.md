# Deployment-Sicherheit

## Phase 20.1 Hosted Materials

Produktionsartefakte dürfen weiterhin keine privaten PDFs, lokalen Quellordner, Screenshots,
Volltext-Extrakte, Base64-Bilder oder lokalen Dateihandles enthalten. Kopierte Originalmaterialien
sind nur erlaubt, wenn sie:

- unter `public/materials-approved/` liegen,
- in `data/hosted-materials.json` mit `publicationStatus: "approved"` stehen,
- eine zulässige Veröffentlichungsbasis und Rechte-/Erlaubnisnotiz besitzen,
- einen passenden SHA-256-Hash im Manifest tragen.

Offizielle öffentliche PDF-URLs sind nur mit genehmigtem Manifesteintrag und
`distributionBasis: "official_public_url"` zulässig. Ohne Manifestfreigabe blockiert
`npm run check:deployment` PDF-Dateien und PDF-Links.

## Schutzgrenze

Die Originalquellen sind privates Eingangsmaterial. Sie dürfen weder verändert noch in das Webartefakt, den Service-Worker-Cache oder öffentliche Links aufgenommen werden. Das gilt auch für den lokalen Projektordner `pdfs/`.

## Technische Sicherungen

- `.gitignore` schließt PDF-Dateien, `pdfs/`, Bildableitungen aus `pdfs/` sowie OCR-, Extraktions- und Sichtprüfungsartefakte aus.
- Vite baut ohne Source Maps und Produktionsbuilds mit dem GitHub-Pages-Basispfad `/algodat/`; lokale Entwicklung bleibt unter `/`.
- Workbox precacht nur JavaScript, CSS, HTML, SVG, WOFF2 und JSON; PDFs, `pdfs/`, Quellordner und temporäre Daten sind explizit ausgeschlossen.
- Der Quellenbrowser stellt ausschließlich abgeleitete Metadaten dar und erzeugt keine PDF-Links.
- Der Content-Build schreibt nur Trainingsdaten mit `publicDistributionStatus: "public_safe"`.
- `npm run check:deployment` durchsucht jedes Buildartefakt nach privaten Binärdateien, Quellordnernamen, absoluten Windows-/Benutzerpfaden, PDF-Links und unerlaubten Precache-Einträgen.
- Seit Phase 15 blockiert das Deployment-Audit zusätzlich vollständige Nutzerhistorien, ungültig markierte Orchestrator-Policies und private Testfixtures im Buildartefakt.
- Seit Phase 16 blockiert das Deployment-Audit zusätzlich Exportnutzdaten, ungültige Spickzettelmarker, unbewertbare ExamSlots und Referenzlösungen vor Abgabe.
- Ein statischer `404.html`-Fallback unterstützt Client-Routing auf GitHub Pages.

## Update- und Offline-Verhalten

Neue Service-Worker-Versionen werden angeboten, aber erst nach Bestätigung aktiviert. Veraltete Caches werden bereinigt; `skipWaiting` ist deaktiviert. Der Offline-Test prüft, dass eine zuvor geladene Kernroute ohne Netzwerk neu geladen werden kann.

## Veröffentlichungstor

Eine Veröffentlichung ist nur zulässig, wenn `npm run verify` erfolgreich ist. Die Prüfung schützt das erzeugte Artefakt; eine zusätzliche Kontrolle der Hosting-Konfiguration bleibt vor der ersten Veröffentlichung erforderlich.
# Phase 17 Deployment Safety

Zusätzlich gilt: Produktionsartefakte dürfen `pdfs/`, lokale Benutzerpfade, Original-PDF-Links und vollständige historische Aufgabentexte nicht enthalten. `tests/unit/phase17-learning-resources.test.ts` prüft die neue Klausurenbibliothek auf diese Veröffentlichungskante.
