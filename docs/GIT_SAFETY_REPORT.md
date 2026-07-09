# Git-Sicherheitsbericht

## Ergebnis

Zum Zeitpunkt der Phase-3-Implementierung wurde kein Commit erstellt und keine Git-Konfiguration verändert.

## Beobachtung

Ein normaler Git-Status war in dieser Umgebung nicht sicher verfügbar, weil Git eine übergeordnete Repository-Struktur als zweifelhaftes Besitzverhältnis meldete. Deshalb wurde keine globale `safe.directory`-Ausnahme gesetzt.

## Arbeitsregel

Bis die Repository-Grenze eindeutig geklärt ist:

- keine Commits durch Codex,
- kein `git reset`,
- keine Änderung an globaler Git-Konfiguration,
- kein Verschieben oder Löschen von Quelldateien,
- Änderungen nur im Arbeitsbaum dokumentieren.

## PDF-Schutz

Der lokale Ordner `pdfs/` bleibt Eingangsmaterial. Produktionsartefakte dürfen keine PDFs, privaten Verzeichnisse, absoluten Benutzerpfade oder PDF-Links enthalten.

