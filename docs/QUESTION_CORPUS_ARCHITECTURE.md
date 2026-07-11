# Architektur des kanonischen Fragenkorpus

Kanonische Fragen und Evidenz bleiben getrennt. Eine kanonische Frage besitzt einen vollständigen Blockkörper, Sammlungskontext, Publikationsmodus, Quellen- und Lösungsbezüge sowie Lernzuordnungen. Evidenzlinks dokumentieren, welche Quellseiten und Duplikatgruppen die Frage stützen.

Zulässige Blöcke sind Absatz, Liste, Mathematik, Pseudocode, Array, Matrix, Graph, Baum, DP-Tabelle, Operationsfolge, Definitionsliste, Unteraufgabe und Hinweis. Visuelle Strukturen benötigen immer eine semantische Text- oder Tabellendarstellung.

Der Build darf erst auf den kanonischen Korpus umgestellt werden, wenn jeder Datensatz vollständig und manuell geprüft ist. Bis dahin bleiben die vorhandenen Bibliotheken ausdrücklich Metadatenansichten.
# Aktualisierung Phase 21R.1

`data/canonical-questions.json` ist der einzige Eingang für vollständige veröffentlichungsfähige Fragen. `question-inventory.json` bleibt Evidenzinventar; es darf nicht durch Heuristiken in Aufgaben umgewandelt werden. Der Build validiert jeden kanonischen Körper, lokale Pfade, Publikationsmodus, Quellenbezug und semantische Alternativen.
