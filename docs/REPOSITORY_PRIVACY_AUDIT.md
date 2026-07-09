# Repository-Privacy-Audit für Veröffentlichung

## Status

Auditdatum: 2026-07-09.

Release-Label: `1.0.0-rc.2`.

Ergebnis: Der Quellstand ist nur veröffentlichbar, wenn alle ausgeschlossenen lokalen Materialien durch `.gitignore` ungestaged bleiben. Der finale Screenreader-Gate bleibt offen; dieser Audit ist keine Freigabe für `1.0.0`.

## Klassifikation der gefundenen Materialien

| Fundgruppe | Klassifikation | Behandlung |
| --- | --- | --- |
| `pdfs/` mit lokalen Original-PDFs | `exclude_from_repository` | Durch `.gitignore` ausgeschlossen; nicht stagebar. |
| `info 1 copy/` mit Vorlesungs-, Übungs-, Klausur- und Bildquellen | `exclude_from_repository` | Durch `.gitignore` ausgeschlossen; nicht stagebar. |
| `tmp/` mit gerenderten PDF-Seiten, Kontaktbögen und Review-Bildern | `exclude_from_repository` | Durch `.gitignore` ausgeschlossen; nicht stagebar. |
| `dist/` | `exclude_from_repository` | Build-Artefakt; Deployment erfolgt über GitHub-Actions-Artefakt. |
| `coverage/` | `exclude_from_repository` | Lokaler Testbericht; nicht veröffentlichen. |
| `test-results/` | `exclude_from_repository` | Lokale Playwright-Traces und Fehlerkontexte; nicht veröffentlichen. |
| `node_modules/` | `exclude_from_repository` | Reproduzierbar über `npm ci`; nicht veröffentlichen. |
| `debug.log` und andere `*.log` | `exclude_from_repository` | Lokale Logs; nicht veröffentlichen. |
| `.env`, `.env.*` | `exclude_from_repository` | Secrets-/Konfigurationsschutz; `.env.example` bleibt erlaubt. |
| `src/`, `data/`, `docs/`, `tests/`, `scripts/`, Konfigurationsdateien | `safe_to_commit` | Public-safe Inhalte, Schemas, Tests und Dokumentation. |
| `.github/workflows/deploy-pages.yml` | `safe_to_commit` | Deployment-Workflow ohne Secrets. |

## Secret- und Pfadprüfung

In commit-relevanten Quellen wurden keine Treffer für private Schlüssel, GitHub-Tokens, typische Cloud-API-Keys, `.env`-Dateien, `file:///`-URLs oder absolute lokale Benutzerpfade gefunden.

Die öffentlichen Produktionsartefakte werden zusätzlich durch `npm run check:deployment` geprüft. Dieser Repository-Audit ist strenger als der reine Deployment-Audit, weil er lokale Quellen, Tests, Dokumentation und Konfiguration einschließt.

Der öffentliche CI-Build enthält absichtlich kein `pdfs/`-Verzeichnis. `npm run validate:phase-data` prüft lokal weiterhin vorhandene PDFs gegen die bekannten Manifest-Hashes; im öffentlichen Build wird nur dieser lokale PDF-Hashabgleich übersprungen, während die Phase-0-/Phase-0A-Validierungsartefakte weiterhin geprüft werden.

## Copyright- und Quellenbefund

Die privaten Originalquellen und Scans bleiben lokal und werden nicht in Git aufgenommen. Öffentlich committed werden nur abgeleitete, quellenreferenzierte Lernartefakte, Schemas, Tests und Dokumentation. Die App verlinkt keine lokalen PDFs und precacht keine PDFs.

## Verbleibende Veröffentlichungsgrenzen

- Kein echter Screenreader-Test wurde ausgeführt.
- `1.0.0` bleibt blockiert.
- GitHub Pages muss auf die Quelle `GitHub Actions` gestellt sein; kein Branch-Deploy aus ungebautem Vite-Quellcode.
