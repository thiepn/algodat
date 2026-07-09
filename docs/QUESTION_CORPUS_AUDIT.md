# Audit des Fragenkorpus

Inventarisiert wurden **633 aufgaben- oder seitenbezogene Datensätze** und **97 normalisierte Aufgabendubletten-Gruppen**. Ein Datensatz ist keine Behauptung, dass der volle urheberrechtlich geschützte Aufgabentext in die spätere Anwendung kopiert werden darf.

Verifikationsstatus: `extraction_uncertain`=30, `generated_unverified`=156, `official_verified`=372, `verified_against_official_source`=9, `visual_review_required`=66.

Jeder Datensatz enthält stabile ID, Quelldatei, exakte Seite, Jahr (falls belegt), Aufgaben-/Teilaufgabenbezug, Themen, Lösungsweg, Laufzeit-/Beweistyp, Autorität, Duplikatgruppe und Prüfstatus. Bildbasierte Lösungsseiten ohne sichere Aufgabenzuordnung sind bewusst mit `task_number: null` und `visual_review_required` erfasst.

Für Trainingszwecke sind Tracing-Aufgaben, Beweisaufgaben, Entwurfsaufgaben und zeitgeeignete Klausursets anhand `expected_solution_method` und `exam_relevance` filterbar. Vollständige Daten: `data/question-inventory.json`.
