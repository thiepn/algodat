# Hosted-Material-Veröffentlichungsrichtlinie

## Grundsatz

Private Original-PDFs im Projektordner `pdfs/` bleiben privates Eingangsmaterial. Sie dürfen nicht
veröffentlicht, gecacht, verlinkt, gerendert oder als Screenshot-/Crop-Ableitung in
Produktionsartefakte aufgenommen werden.

## Zulässige Veröffentlichungsbasis

Ein Material darf nur erscheinen, wenn `data/hosted-materials.json` einen Eintrag mit
`publicationStatus: "approved"` enthält und eine der folgenden Grundlagen dokumentiert ist:

- `author_owned`
- `explicit_permission`
- `open_license`
- `official_public_url`

Kopierte Assets sind nur unter `public/materials-approved/` zulässig und müssen einen passenden
SHA-256-Hash im Manifest tragen. Offizielle öffentliche URLs dürfen nur als externe Verweise
erscheinen; sie dürfen nicht als lokale Datei kopiert werden.

## Freigabeanforderungen

Jeder genehmigte Eintrag benötigt mindestens Titel, `sourceId`, Dokumenttyp, Assettyp,
Rechteinhaber, Erlaubnisnotiz, Veröffentlichungsstatus und entweder:

- `assetPath` unter `/materials-approved/` plus `sha256`, oder
- `officialUrl` mit `distributionBasis: "official_public_url"`.

Ohne genehmigten Manifest-Eintrag bleibt die UI bei sicherer Quellenmetadatenanzeige ohne
Originaldokument.

## Deployment-Gate

`npm run check:deployment` blockiert weiterhin PDF-Dateien, private Quellordner, absolute
Benutzerpfade, Base64-Bilder, Screenshots, Volltextartefakte und ungeprüfte PDF-Links. Hosted
Materials passieren das Gate nur mit genehmigtem Manifest, Rechtemetadaten, passendem Hash und
Pfad unter `materials-approved/`.

