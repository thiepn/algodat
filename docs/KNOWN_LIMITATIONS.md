# Known Limitations

## Aktualisierung `exam-2022-2`

Der Korpus enthält nun 36 public-safe Rekonstruktionen; 48 Kandidaturen bleiben offen. Aufgaben 1 bis 8 der neuen Sammlung besitzen authored Lösungen, Aufgabe 9 eine verifizierte spätere offizielle Übungslösung. Unabhängiger fachlicher Zweitreview und realer NVDA-/Narrator-Gate bleiben offen. [Quelle: `src-011d1ee23245`, S. 1–15; Lösung: `src-02be45f603ba`, S. 3–4]

## Phase 20.1

- Die App bleibt `1.0.0-rc.8`; der reale Screenreader-Gate ist weiterhin offen.
- Die lokale Dokumentbibliothek und alle lokalen PDF-/Crop-/Originalseitenansichten wurden
  entfernt. Alte `/dokumente`-URLs leiten auf `/quellen` um.
- Es gibt initial keine genehmigten eingebetteten Originalmaterialien. Künftige Materialien
  benötigen `data/hosted-materials.json`, Rechte-/Lizenzmetadaten, Status `approved` und bei
  kopierten Assets einen passenden SHA-256-Hash unter `public/materials-approved/`.
- Die archivierten Phase-19/20-Coverage-Reports ersetzen keine fachliche Sichtprüfung der
  privaten PDFs und sind kein aktives Produktfeature mehr.
- Bellman-Ford und Kruskal werden erst als vollständige Module freigegeben, wenn die Quellenlage im Produktmodell belastbar bestätigt ist.
- Der Simulator verwendet strukturierte, aufgabenspezifische Eingaben; ein echter Narrator-/NVDA-Durchgang aller Renderer bleibt erforderlich.
- Ergebnisberichte enthalten Lernhinweise und Rubrikpunkte; vollständig ausgearbeitete Modellantworten sind noch nicht für jeden Adapter gleich tief.

- Historische Originalklausuren werden nicht als öffentliche Pakete gebündelt.
- V1 bis V4 sind neu zusammengestellte Kernkompetenz-Probeklausuren, keine offiziellen Notensimulationen.
- Es gibt keinen freien LLM-/CAS-Scorer und keinen universellen Beweischecker.
- Kruskal, Bellman-Ford, BFS/DFS und viele Transferaufgaben sind nicht als tiefe Trainer implementiert.
- Spickzettel sind quellengebundene Referenzen, keine kanonische Wahrheit.
- Browserdaten-Löschung kann lokale Lernstände entfernen; regelmäßiger Export bleibt empfohlen.
- `1.0.0` ist blockiert, bis ein echter Screenreader-Audit durchgeführt oder als nicht erfülltes Gate akzeptiert wurde.
- Der Accessibility-Fallback-Audit für `1.0.0-rc.2` ersetzt keine reale Screenreader-Prüfung.
- Screenreader-Aussprache, Browse-/Forms-Mode, Elementlisten, Tabellenmodus und reale KaTeX-Wahrnehmung bleiben ungeprüft.
- Ein sichtbarer öffentlicher Export-/Importdialog wurde im Routeninventar nicht als zentrale Route gefunden; die technische Persistenzübertragung ist getestet.
# Phase 17 bekannte Grenzen

- Die App bleibt `1.0.0-rc.3`; der reale Screenreader-Gate ist offen.
- Lernmodule sind quellengebundene Referenzen, keine neue kanonische Wahrheit.
- Nicht jedes Thema besitzt ein vollständiges Lernmodul.
- Die Klausurenbibliothek zeigt keine vollständigen Originalaufgaben und ersetzt nicht die privaten Ausgangs-PDFs.
# Phase 21R.1: Korpus noch unvollständig

Der kanonische Fragenkorpus enthält derzeit neun manuell geprüfte, public-safe rekonstruierte Fragen aus der vollständigen Probeklausur 2023. 75 Identitätskandidaturen müssen noch visuell mit privaten Originalquellen abgeglichen werden. Sie sind weder im Simulator noch in der öffentlichen Fragenvorschau sichtbar. Ein unabhängiger Zweitreview der neun Fragen steht noch aus.

Aktualisierung 11.07.2026: Zusätzlich ist `exam-2020-2` mit neun realen Klausurfragen abgeschlossen. Der Korpus enthält damit 18 final geprüfte public-safe Rekonstruktionen; 66 Kandidaturen bleiben offen. Ein unabhängiger Zweitreview der 18 Fragen sowie der reale NVDA-/Narrator-Gate stehen weiterhin aus. Aufgabe 8 der realen Sammlung verwendet eine ausdrücklich als authored markierte Korrektur des dokumentierten Rekurrenz-Randfallfehlers. [Lösung: `src-8a588d5ddc35`, S. 9]

Aktualisierung 12.07.2026: `exam-2022-1` ergänzt neun vollständig geprüfte reale Klausurfragen. Der Korpus enthält nun 27 public-safe Rekonstruktionen; 57 Kandidaturen bleiben offen. Für die neue Sammlung existiert keine offizielle Musterlösung im Korpus, daher sind alle neun Lösungen authored und benötigen weiterhin einen unabhängigen fachlichen Zweitreview. `exam-2021-1` bleibt wegen einer nachgewiesenen falschen Lösungszuordnung zurückgestellt. Der reale NVDA-/Narrator-Gate bleibt ebenfalls offen. [Quelle 2022: `src-c4dde22523d3`, S. 1–16; Quelle 2021: `src-28fe81380661`, S. 2–7; abweichende Lösung: `src-39eb3d94f40a`, S. 1–16]
