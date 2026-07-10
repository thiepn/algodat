# Known Limitations

## Phase 20

- Die App bleibt `1.0.0-rc.6`; der reale Screenreader-Gate ist weiterhin offen.
- Exakte Crop-Rechtecke werden für viele alte Dokumente zunächst als sichere Vollseitenregionen
  oder lokal nutzerindexierte Regionen geführt. Präzisere Ausschnitte müssen lokal geprüft und
  nur als normalisierte Metadaten übernommen werden.
- Die neuen Coverage-Reports inventarisieren alle bekannten Quellen, ersetzen aber keine fachliche
  Sichtprüfung der privaten PDFs.
- Bellman-Ford und Kruskal werden erst als vollständige Module freigegeben, wenn die Quellenlage im Produktmodell belastbar bestätigt ist.
- Der Simulator nutzt keine JSON-Eingabe mehr, aber die vollständige direkte Einbettung aller spezialisierten Trainer-Renderer in Exam-Mode bleibt Folgearbeit.
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
