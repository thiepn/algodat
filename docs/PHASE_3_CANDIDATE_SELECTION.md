# Phase 3 Kandidatenauswahl

## Entscheidung

Ausgewählt wurde **Union-Find mit verketteten Listen**. Die Rangliste liegt zusätzlich maschinenlesbar in `data/phase3-trainer-candidate-ranking.json`.

## Bewertete Kandidaten

| Rang | Kandidat | Status | Begründung |
| --- | --- | --- | --- |
| 1 | Union-Find mit verketteten Listen | ausgewählt | Offizielle Aufgabe, offizielle Lösung und Vorlesungsregeln sind seitenbezogen belegbar. |
| 2 | MergeSort-Tracing | Fallback | Didaktisch geeignet, aber nicht nötig, weil Union-Find alle Gates erfüllt. |
| 3 | Dijkstra-Tracing | blockiert | Ohne neue eindeutige Quellenprüfung bleiben Reihenfolge, Tie-Breaker und Musterlösung zu riskant. |

## Belege für Union-Find

- `src-8f16b2505bbd`, Seite 6: Aufgabenstellung verlangt eine anfangs leere Union-Find-Struktur mit verketteten Listen, Make-Set-/Union-Operationen, Weighted Union und lexikografischem Tie-Breaker.
- `src-35405e721f05`, Seite 6: offizielle Lösung gehört zur selben Probeklausuraufgabe.
- `src-baa07f0a207a`, Seite 943: Union-Find verwaltet eine Partition und nutzt Repräsentanten.
- `src-baa07f0a207a`, Seite 946: eine Menge kann als Liste dargestellt werden; das erste Element ist Repräsentant und Listenelemente zeigen auf den Repräsentanten.
- `src-baa07f0a207a`, Seite 948: Make-Set und Find sind in dieser Darstellung konstant; Union aktualisiert Zeiger der angehängten Liste.
- `src-baa07f0a207a`, Seite 949: die kleinere Liste wird an die größere angehängt.
- `src-baa07f0a207a`, Seiten 950–951: die gewichtete Listenvariante hat für eine Operationsfolge die angegebene logarithmische Aktualisierungsgrenze.

## Sicherheitsentscheidung

Die produktive Aufgabe nutzt neue Elemente `F` bis `K` und eine neu formulierte Operationsfolge. Die Originalelemente und die Originaloperationsfolge aus der Probeklausur werden nicht als öffentliche Trainingsinstanz kopiert.

