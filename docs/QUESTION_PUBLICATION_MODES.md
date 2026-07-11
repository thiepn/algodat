# Publikationsmodi für Fragen

- `exact_approved`: exakter Inhalt nur mit genehmigtem Hosted-Material-Datensatz, Rechteangabe und passendem SHA-256.
- `public_safe_reconstruction`: vollständig lösbare, fachlich äquivalente und neu formulierte Rekonstruktion mit nachgezeichneten HTML-/SVG-Strukturen.
- `authored_equivalent`: klar als neu erstellte vergleichbare Übungsaufgabe bezeichnet; niemals als historische Originalaufgabe dargestellt.

Jede Frage benötigt genau einen Modus. Ein bloßer Metadatentitel, eine lokale PDF-Abhängigkeit oder ein generischer Methodenhinweis ist kein veröffentlichungsfähiger Fragenkörper.
# Durchsetzung im Build

Der kanonische Validator akzeptiert `exact_approved` nur mit Rechteinhaber, Rechtsgrundlage, Lizenz-/Erlaubnisnotiz, SHA-256 und Status `approved`. Alle anderen historischen Fragen müssen als vollständige `public_safe_reconstruction` oder klar markierte `authored_equivalent` vorliegen.
