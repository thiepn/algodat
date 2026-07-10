# Hosted-Material-Datenmodell

Manifest: `data/hosted-materials.json`  
Runtime-Schema: `src/content/loaders/hosted-materials.ts`

## Felder

| Feld | Bedeutung |
| --- | --- |
| `materialId` | stabile ID des veröffentlichbaren Materials |
| `title` | deutscher Anzeigetitel |
| `sourceId` | Bezug zur sicheren Quellenmetadaten-ID |
| `documentType` | Dokumentart, z. B. Übung, Prüfung, Vorlesung |
| `assetType` | `pdf`, `image`, `external_url` oder `worksheet` |
| `assetPath` | lokaler öffentlicher Pfad, nur unter `/materials-approved/` |
| `officialUrl` | externe offizielle URL |
| `distributionBasis` | `author_owned`, `explicit_permission`, `open_license`, `official_public_url` |
| `rightsHolder` | Rechteinhaber oder veröffentlichende Stelle |
| `permissionNote` | konkrete Erlaubnis-/Lizenznotiz |
| `licenseName` | Lizenzname, falls vorhanden |
| `licenseUrl` | Lizenz-URL, falls vorhanden |
| `sha256` | Hash kopierter Assets |
| `publicationStatus` | `approved`, `pending` oder `rejected` |

## Startzustand

Das Manifest ist in `1.0.0-rc.7` leer. Es gibt keine genehmigten eingebetteten
Originalmaterialien, weil keine dokumentierte Veröffentlichungserlaubnis im Repository vorliegt.

## Regeln

- `official_public_url` benötigt `officialUrl` und darf kein `assetPath` setzen.
- Kopierte Assets benötigen `assetPath` unter `/materials-approved/` und `sha256`.
- Nur `publicationStatus: "approved"` darf in UI oder Deployment als Material behandelt werden.
- `pending` und `rejected` bleiben rein dokumentarisch und werden nicht verlinkt.

