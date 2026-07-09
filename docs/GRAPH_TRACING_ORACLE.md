# Graph Tracing Oracle

Das Oracle erzeugt die kanonische Matrixfolge aus dem gespeicherten Graphen und der gespeicherten Knotenreihenfolge.

## Validierungsentscheidung

Für das Gate wurde die offizielle 2023er Beispiellösung nachgerechnet. Die dort sichtbare Folge `D(0)` bis `D(4)` (`src-35405e721f05`, Seite 5) stimmt mit der Floyd-Warshall-Rekurrenz in der Reihenfolge `1,2,3,4` überein. Das produktive Problem nutzt eine neue Instanz mit Knoten `A,B,C,D`, aber dasselbe geprüfte Oracle-Prinzip.

## Keine erfundene Lösung

Die produktive Musterlösung entsteht nicht durch freie Textgenerierung. Sie wird aus Kantenliste und Reihenfolge deterministisch berechnet und anschließend gegen die im JSON gespeicherte kanonische Matrixfolge validiert.
## Phase 12 Ergänzung

Für MST-Endbäume ergänzt Phase 12 ein separates Oracle durch exhaustive Enumeration kleiner Graphen. Es prüft Zusammenhang, Azyklizität, Kantenanzahl, Knotendeckung und Minimalgewicht.
