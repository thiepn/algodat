# DP Oracle und Gegenbeispiele

Das Orakel besteht aus zwei unabhängigen Wegen:

1. Dynamische Programmierung in `solveMineDp`.
2. Vollständige Pfadsuche in `bruteForceMine`.

Für die Matrix der Aufgabe aus `src-8f16b2505bbd`, Seite 10, stimmen beide Verfahren überein. Das Optimum ist `214`. Die DP-Tabelle wird in `tests/unit/dp-design-mine.test.ts` fest geprüft.

Gegenbeispiele werden nicht frei erfunden. Die aktuelle Phase nutzt Fehlercodes und Rubrikabweichungen als gezielte Rückmeldung; neue Gegenbeispielinstanzen dürfen erst aufgenommen werden, wenn sie im Variantenmodell dokumentiert und deterministisch validiert sind.

