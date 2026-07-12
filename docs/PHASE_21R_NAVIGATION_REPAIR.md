# Phase 21R: Reparatur der responsiven Hauptnavigation

Stand: 12. Juli 2026

## Fehlerursache

Die Hauptnavigation verwendete schrumpfbare Flex-Elemente. Gleichzeitig galt global `overflow-wrap: anywhere`. Nur die Navigationslinks besaßen `white-space: nowrap`; die Gruppenlabels `LERNEN`, `ÜBEN`, `PLANEN` und `QUELLEN` konnten daher bei knapper Breite bis auf eine Zeichenbreite zusammengedrückt und buchstabenweise umgebrochen werden.

## Struktur- und CSS-Änderung

- Topbar und Hauptnavigation bilden nun gemeinsam einen semantischen Seitenkopf.
- Desktopgruppen verwenden `flex: 0 0 auto`, `min-width: max-content` und nicht umbrechende Gruppenlabels.
- Die Label-Laufweite wurde moderat reduziert; Linkabstände und Schriftgrößen skalieren kompakt.
- Trennlinien liegen innerhalb nicht schrumpfbarer Gruppen und erzeugen keine schmalen Rasterspalten.
- Unterhalb von 1200 CSS-Pixeln werden nur vollständige Gruppen in eine weitere Zeile umgebrochen.
- Unterhalb von 841 CSS-Pixeln wechselt die Navigation in ein eigenes, vertikales Menü.

## Responsive Zustände

| Bereich | Verhalten |
| --- | --- |
| ab 1200 px | Einzeilige, zentrierte und kompakte Gruppennavigation. |
| 841–1199 px | Mehrzeilige Navigation; jede Gruppe bleibt ungeteilt und horizontal. |
| bis 840 px | Separater Menüschalter und vertikale Gruppenstruktur im normalen Dokumentfluss. |

Die Zustände wurden bei 1440×900, 1366×768, 1326×768, 1280×720, 1024×768, 768×1024 und 390×844 geprüft. Es trat weder Überlagerung noch unbeabsichtigter horizontaler Dokumentüberlauf auf. Bei 1326 px bleiben alle vier Gruppenlabels einzeilig und deutlich breiter als ein einzelnes Zeichen.

## Mobiles Menü und Tastatur

Der Menüschalter besitzt `aria-expanded` und `aria-controls="hauptnavigation"`. Das Menü benötigt keinen Hoverzustand. Escape schließt es und setzt den Fokus auf den Schalter zurück. Ein Routenwechsel schließt den Zustand automatisch, weil der offene Zustand an den aktuellen Pfad gebunden ist. Die Navigation bleibt im Dokumentfluss; Inhalte werden nicht durch einen überlagernden Header verdeckt.

`NavLink` setzt `aria-current="page"` für die aktive Route. Die visuelle Tab-Reihenfolge entspricht der DOM-Reihenfolge. Der globale sichtbare Fokusindikator bleibt erhalten.

## Barrierefreiheitsprüfung

- genau eine benannte Hauptnavigation;
- sichtbarer, beschrifteter Menüschalter;
- Bedienung per Tab, Enter, Leertaste und Escape;
- aktive Route nicht nur farblich, sondern auch über `aria-current` ausgezeichnet;
- nutzbarer Kompaktzustand bei einer 200-%-Zoom-äquivalenten reduzierten CSS-Breite;
- explizite Darstellung in `forced-colors: active`;
- keine neue Bewegung; bestehende Reduced-Motion-Regel bleibt wirksam.

Der reale Test mit NVDA beziehungsweise Narrator bleibt offen und wird durch diese automatisierten Prüfungen nicht ersetzt.

## Regressionstests

- Komponentenprüfungen für ARIA-Verknüpfung, Escape-Fokus, Routenwechsel und `aria-current`;
- Playwright-Prüfungen für sieben geforderte Viewports;
- explizite Breiten-/Höhenprüfung der Gruppenlabels bei 1326 px;
- paarweise Überlagerungsprüfung aller Labels und Links;
- Prüfung auf horizontalen Dokumentüberlauf;
- Kompaktzustand bei 200-%-Zoom-äquivalenter Breite;
- Forced-Colors- und Tastaturprüfung;
- stabile Screenshots für 1326 px Desktop und 390 px Mobile.
