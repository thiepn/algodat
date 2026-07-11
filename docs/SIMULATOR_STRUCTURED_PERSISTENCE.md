# Strukturierte Simulator-Persistenz

Jede Antwortänderung erhält pro Aufgabenslot eine monoton steigende `answerRevision`. Schreiboperationen werden pro Sitzung serialisiert und lesen vor der Änderung den neuesten IndexedDB-Datensatz. Eine ältere Revision darf eine neuere Antwort nicht überschreiben.

Antwort, Review-Markierung und Navigation werden als getrennte Teiloperationen gegen den neuesten Sitzungsstand zusammengeführt. Nach jedem erfolgreichen Commit wird ein Recovery-Snapshot geschrieben. „Gespeichert“ erscheint erst, wenn die aktuelle Revision abgeschlossen ist; vorher lauten die Zustände „Ungespeicherte Änderungen“ und „Wird gespeichert …“. Fehler werden als „Speicherfehler“ angezeigt.

Der Browser-Regressionsfall trägt `0` in `Opt[0,0]` ein, wartet auf den abgeschlossenen Save, lädt die Route neu und prüft den exakten Wert. Dadurch werden insbesondere Truthiness-Fehler bei Nullwerten erkannt.
