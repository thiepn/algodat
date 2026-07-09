# Grenzen der mathematischen Gleichwertigkeit

Die Phase-4-Engine ist kein Computer-Algebra-System.

Sie erkennt:

- identische Normalformen,
- kommutative Umordnung bei `+` und `*`,
- Summen in der dokumentierten Schreibweise,
- Arrayzugriffe auf `A[...]`.

Sie erkennt nicht sicher:

- frei umgeformte Summen mit anderem Indexnamen,
- implizite Multiplikation,
- natürliche Sprache als Formel,
- alternative, mathematisch korrekte Beweise außerhalb der Strukturmaske.

Bei unsicherer Gleichwertigkeit wird `manual_review_recommended` erzeugt, statt Korrektheit zu erfinden.

