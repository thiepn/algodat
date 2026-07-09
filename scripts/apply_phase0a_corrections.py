"""Wendet belegte Phase-0A-Korrekturen an und erzeugt Review-Berichte."""

from __future__ import annotations

import re
import unicodedata
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from pathlib import Path

from build_phase0 import EXAM_CONFIGS, TOPIC_CATALOG, markdown_table, write_md
from phase0_common import DATA_DIR, ROOT, read_json, stable_id, write_json


TODAY = date.today().isoformat()
REVIEWED_AT = datetime.now(timezone.utc).isoformat()

CATEGORY_CORRECTIONS = {
    "Beispielloesung_Probeklausur.pdf": "Probeklausurlösung",
    "info 1 copy/2021/lo╠êsungen/Beispielloesung_Probeklausur.pdf": "Probeklausurlösung",
    "info 1 copy/2022/kl/BspLoesungProbeklausur2021 2.pdf": "Probeklausurlösung",
    "info 1 copy/2022/kl/BspLo╠êsungProbeklausur2022.pdf": "Probeklausurlösung",
    "info 1 copy/2022/kl/PK22L.pdf": "Probeklausurlösung",
    "info 1 copy/2023/kl/Beispielloesung_Probeklausur2023.pdf": "Probeklausurlösung",
    "info 1 copy/2023/kl/beispiello╠êsung (1) 2.pdf": "Probeklausurlösung",
    "info 1 copy/2023/kl/PK23L 2.pdf": "Probeklausurlösung",
    "info 1 copy/2024/kl/Beispielloesung_Probeklausur.pdf": "Probeklausurlösung",
    "info 1 copy/2024/kl/ProbeklausurLoesung.pdf": "Probeklausurlösung",
    "info 1 copy/2024/lo╠êsungen/Loesung6.pdf": "Übungslösung",
    "info 1 copy/2025/lo╠êsungen/Beispielloesung Blatt 5.pdf": "Übungslösung",
    "info 1 copy/u╠êbungen/Beispielloesung Blatt 5.pdf": "Übungslösung",
}

# Path-Normalisierung für auf unterschiedlichen Konsolen verschieden dargestellte
# kombinierende Unicode-Zeichen.
def normalized_path(value: str) -> str:
    return unicodedata.normalize("NFKC", value).replace("\\", "/")


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value.casefold())
    return "".join(char for char in value if not unicodedata.combining(char))


def find_path(documents: list[dict], display_path: str) -> str | None:
    wanted = norm(normalized_path(display_path))
    for document in documents:
        if norm(normalized_path(document["path"])) == wanted:
            return document["path"]
    return None


def question_lookup(questions: list[dict], source_path: str, task: int) -> str | None:
    matches = [q for q in questions if q["source_file"] == source_path and q.get("task_number") == task]
    return matches[0]["id"] if matches else None


def visual_definitions(documents: list[dict], questions: list[dict]) -> tuple[dict, list[dict]]:
    paths = {doc["id"]: doc["path"] for doc in documents}
    by_path = {doc["path"]: doc for doc in documents}
    resolved = {}
    solutions = []

    mock_question = find_path(documents, "info 1 copy/2022/kl/BspLoesungProbeklausur2021 2.pdf")
    mock_topics = {
        1: ("Rekurrenzanalyse eines Divide-and-Conquer-Algorithmus", ["Rekursion", "Master-Theorem"]),
        2: ("Rucksack-DP-Tabelle", ["Dynamische Programmierung", "Rucksackproblem"]),
        3: ("Minimaler Spannbaum mit Kruskal", ["Kruskal", "Minimale Spannbäume"]),
        4: ("Schleifeninvariante: ungerade Ausgabe", ["Schleifeninvarianten", "Vollständige Induktion"]),
        5: ("DP zur Anzahl von Teilmengen mit vorgegebener Summe", ["Dynamische Programmierung", "Subset Sum"]),
        6: ("Kreiserkennung mit Tiefensuche", ["DFS", "Korrektheitsbeweise"]),
    }
    mock_pages = {1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 5, 7: 5, 8: 5, 9: 5, 10: 6, 11: 6}
    for source_id in ("src-a969dc88f8e9", "src-fbf39f80037d"):
        method = "manuelle Sichtprüfung" if source_id == "src-a969dc88f8e9" else "Übernahme über bestätigte SHA-256-Identität"
        status = "resolved" if source_id == "src-a969dc88f8e9" else "resolved_via_exact_duplicate"
        for page, task in mock_pages.items():
            meaning, topics = mock_topics[task]
            linked = question_lookup(questions, mock_question, task) if mock_question else None
            solution_id = f"sol-visual-mock2021-a{task}"
            resolved[(source_id, page)] = {
                "task": task, "meaning": meaning, "topics": topics, "linkedQuestionId": linked,
                "linkedSolutionId": solution_id, "status": status, "method": method,
                "confidence": "strongly_supported", "issues": ["Handschriftliche Lösung; Autorenschaft und offizieller Lösungsstatus nicht direkt belegt."],
            }
        for task, (meaning, _) in mock_topics.items():
            solutions.append({
                "id": f"sol-visual-mock2021-a{task}", "questionId": question_lookup(questions, mock_question, task) if mock_question else None,
                "sourceIds": ["src-a969dc88f8e9", "src-fbf39f80037d"], "taskNumber": task,
                "description": meaning, "verificationStatus": "unofficial_solution_only",
            })

    exercise_specs = {
        "src-7a4064a0710d": {
            "question": "info 1 copy/2021/Uebungsblatt3.pdf",
            "pages": {1: (1, "Merge-Operation, Pseudocode und O(n)"), 2: (2, "Induktionsbeweis für Zweierpotenz"), 3: (3, "Schleifeninvariante für Feldprodukt"), 4: (4, "Divide and Conquer: nächster Wert"), 5: (4, "Laufzeit und Korrektheit der Nächster-Wert-Suche")},
        },
        "src-c9cd3fa0f544": {
            "question": "info 1 copy/2021/Uebungsblatt 1.pdf",
            "pages": {1: (1, "Rekursive Summe und Suche nach nächstem Wert; Seite enthält Aufgaben 1 und 2"), 2: (3, "Fehlerkorrektur rekursiver Algorithmen: Potenz, Fakultät, Quersumme")},
        },
        "src-d2005423b398": {
            "question": "info 1 copy/2021/Uebungsblatt6.pdf",
            "pages": {1: (1, "Stirlingzahlen mit dynamischer Programmierung"), 2: (2, "Längste absteigende Teilfolge: Rekurrenz und Algorithmus"), 3: (2, "Längste absteigende Teilfolge: Laufzeit und Schleifeninvariante"), 4: (2, "Längste absteigende Teilfolge: Korrektheitsbeweis"), 5: (3, "Editierdistanz: Rekurrenz und Induktionsbeweis"), 6: (3, "Editierdistanz: Fortsetzung des Induktionsbeweises"), 7: (3, "Editierdistanz: Bottom-up-Algorithmus O(mn)")},
        },
        "src-c7ef1f699742": {
            "question": None,
            "pages": {1: (1, "Rot-Schwarz-Baum: Löschfolge 6, 9, 1, 4, 5"), 2: (1, "Rot-Schwarz-Baum: Fortsetzung der Löschfälle"), 3: (2, "Hashtabelle mit offener Adressierung und linearem Sondieren"), 4: (3, "Datenstruktur für Multimengen mit direkter Adressierung")},
        },
    }
    for source_id, spec in exercise_specs.items():
        question_path = find_path(documents, spec["question"]) if spec["question"] else None
        for page, (task, meaning) in spec["pages"].items():
            linked = question_lookup(questions, question_path, task) if question_path else question_lookup(questions, paths[source_id], task)
            solution_id = f"sol-visual-{source_id[4:]}-a{task}"
            topics = []
            for name, aliases in TOPIC_CATALOG.items():
                if any(alias in norm(meaning) for alias in map(norm, aliases)) or norm(name) in norm(meaning):
                    topics.append(name)
            resolved[(source_id, page)] = {
                "task": task, "meaning": meaning, "topics": topics, "linkedQuestionId": linked,
                "linkedSolutionId": solution_id, "status": "resolved", "method": "manuelle Sichtprüfung",
                "confidence": "confirmed", "issues": ["Aufgabenblatt ist kursattribuiert; handschriftliche Antwortautorenschaft ist nicht belegt."],
            }
        for task in sorted({value[0] for value in spec["pages"].values()}):
            linked = question_lookup(questions, question_path, task) if question_path else question_lookup(questions, paths[source_id], task)
            solutions.append({
                "id": f"sol-visual-{source_id[4:]}-a{task}", "questionId": linked, "sourceIds": [source_id],
                "taskNumber": task, "description": next(value[1] for value in spec["pages"].values() if value[0] == task),
                "verificationStatus": "unofficial_solution_only",
            })

    exam_topics = {
        1: ("DFS mit alphabetischer Tie-Break-Regel", ["DFS", "Entdeckungs- und Abschlusszeiten"]),
        2: ("Rucksack-DP-Tabelle", ["Dynamische Programmierung", "Rucksackproblem"]),
        3: ("Rot-Schwarz-Baum: Einfügen und Löschen", ["Rot-Schwarz-Bäume"]),
        4: ("MergeSort-Tracing", ["MergeSort"]),
        5: ("Schleifeninvariante für alternierende Summe", ["Schleifeninvarianten", "Vollständige Induktion"]),
        6: ("Rekurrenzschranke und Induktionsbeweis", ["Master-Theorem", "Vollständige Induktion"]),
        7: ("Greedy-Entwurf für Entsorgungsstationen", ["Greedy-Algorithmen", "Korrektheitsbeweise"]),
        8: ("Dynamische Programmierung für Messreihenähnlichkeit", ["Dynamische Programmierung", "Korrektheitsbeweise"]),
        9: ("Graphtransfer: negativen Kreis ausgeben", ["Negative Kreise", "Bellman-Ford"]),
    }
    canonical_exam = find_path(documents, "info 1 copy/2024/kl/Klausur 2024.pdf")
    for source_id in ("src-6df30a9ff1ae", "src-ce97639c1821"):
        method = "manuelle Sichtprüfung" if source_id == "src-6df30a9ff1ae" else "Übernahme über bestätigte SHA-256-Identität"
        status = "resolved" if source_id == "src-6df30a9ff1ae" else "resolved_via_exact_duplicate"
        for task, (meaning, topics) in exam_topics.items():
            resolved[(source_id, task)] = {
                "task": task, "meaning": meaning, "topics": topics,
                "linkedQuestionId": question_lookup(questions, canonical_exam, task), "linkedSolutionId": None,
                "status": status, "method": method, "confidence": "confirmed",
                "issues": ["Deckblatt fehlt; Prüfer, Datum, Dauer und Hilfsmittel sind nicht belegt."],
            }

    summary_id = "src-f4acc332df89"
    sections = {
        range(1, 6): "Studentische Zusammenfassung: Grundlagen, Speicher und Datentypen",
        range(6, 15): "Studentische Zusammenfassung: Laufzeitanalyse und Landau-Notation",
        range(15, 21): "Studentische Zusammenfassung: Korrektheitsbeweise und Induktion",
        range(21, 29): "Studentische Zusammenfassung: Rekursion, Divide and Conquer und Master-Theorem",
        range(29, 33): "Studentische Zusammenfassung: dynamische Programmierung",
        range(33, 35): "Studentische Zusammenfassung: Greedy und Scheduling",
        range(35, 42): "Studentische Zusammenfassung: Suchbäume und Rot-Schwarz-Bäume",
        range(42, 46): "Studentische Zusammenfassung: Graphalgorithmen",
    }
    for page in range(1, 46):
        meaning = next(text for pages, text in sections.items() if page in pages)
        resolved[(summary_id, page)] = {
            "task": None, "meaning": meaning, "topics": [], "linkedQuestionId": None, "linkedSolutionId": None,
            "status": "resolved", "method": "manuelle Sichtprüfung", "confidence": "confirmed",
            "issues": ["Studentische Sekundärquelle; fachliche Aussagen sind nicht gegen jede Primärfolie verifiziert."],
        }
    return resolved, solutions


def main() -> None:
    manifest = read_json(DATA_DIR / "source-manifest.json")
    duplicates = read_json(DATA_DIR / "duplicate-groups.json")
    exams = read_json(DATA_DIR / "exam-corpus.json")
    blueprint = read_json(DATA_DIR / "exam-blueprint.json")
    topics = read_json(DATA_DIR / "topic-map.json")
    inventory = read_json(DATA_DIR / "question-inventory.json")
    conflicts = read_json(DATA_DIR / "source-conflicts.json")
    documents = manifest["documents"]
    questions = inventory["questions"]
    by_path = {doc["path"]: doc for doc in documents}
    by_id = {doc["id"]: doc for doc in documents}
    corrections = []

    exact_membership = {}
    exact_canonical = {}
    preferred_paths = {config["question_path"] for config in EXAM_CONFIGS if config["question_path"]}
    for group in duplicates["exact_groups"]:
        members = [by_id[source_id] for source_id in group["source_ids"]]
        canonical = next((doc for doc in members if doc["path"] in preferred_paths), sorted(members, key=lambda doc: doc["path"])[0])
        exact_canonical[group["id"]] = canonical["id"]
        for member in members:
            exact_membership[member["id"]] = group["id"]

    event_by_path = {}
    event_kind = {}
    for config in EXAM_CONFIGS:
        event_kind[config["id"]] = "real_exam" if config["kind"] == "reale Prüfung" else "mock_exam"
        for role in ("question_path", "solution_path"):
            if config.get(role):
                event_by_path[config[role]] = (config, role)

    actual_category_corrections = {}
    for display_path, new_value in CATEGORY_CORRECTIONS.items():
        actual = find_path(documents, display_path)
        if actual:
            actual_category_corrections[actual] = new_value

    reviewed_unofficial = {"src-a969dc88f8e9", "src-fbf39f80037d", "src-c9cd3fa0f544", "src-c7ef1f699742", "src-d2005423b398"}
    reviewed_official_context = {"src-7a4064a0710d"}
    for doc in documents:
        old_category = doc.get("document_category")
        if doc["path"] in actual_category_corrections and old_category != actual_category_corrections[doc["path"]]:
            doc["document_category"] = actual_category_corrections[doc["path"]]
            corrections.append({
                "id": stable_id("corr", f'{doc["id"]}:document_category'), "recordType": "SourceDocument", "recordId": doc["id"],
                "field": "document_category", "previousValue": old_category, "correctedValue": doc["document_category"],
                "reason": "Dateiname und visueller/inhaltlicher Befund belegen Probe- bzw. Übungskontext; keine reale Klausur.",
                "supportingSource": {"sourceId": doc["id"], "page": 1}, "correctedAt": TODAY,
            })
        group_id = exact_membership.get(doc["id"])
        doc["duplicateGroupId"] = group_id
        doc["canonicalDocumentId"] = exact_canonical.get(group_id, doc["id"])
        event = event_by_path.get(doc["path"])
        if event:
            config, role = event
            doc["corpusEventId"] = config["id"]
            doc["examRegime"] = "klausur_2021_digital" if config["id"] == "exam-2021-1" else ("standard_praesenz" if config["kind"] == "reale Prüfung" else "probeklausur")
            doc["evidenceType"] = event_kind[config["id"]] if role == "question_path" else "official_solution"
            if doc["id"] in reviewed_unofficial:
                doc["evidenceType"] = "unofficial_solution"
            doc["examinerAttributionStatus"] = "direct_evidence" if config.get("examiner") and doc.get("authors") else "unknown"
            doc["dateAttributionStatus"] = "direct_evidence" if config.get("date") else ("archive_only" if config.get("year") else "unknown")
            doc["historicalFrequencyEligible"] = bool(config["kind"] == "reale Prüfung" and role == "question_path" and doc["id"] == doc["canonicalDocumentId"])
        else:
            category = doc.get("document_category", "")
            if doc.get("source_authority_level") in {3, 4}:
                evidence = "generated_example"
            elif category == "Übung":
                evidence = "exercise"
            elif category == "Übungslösung":
                evidence = "unofficial_solution" if doc["id"] in reviewed_unofficial else "official_solution"
            elif category == "Probeklausur":
                evidence = "mock_exam"
            elif category == "Probeklausurlösung":
                evidence = "unofficial_solution" if doc["id"] in reviewed_unofficial else "official_solution"
            elif "praesenz" in norm(doc["path"]):
                evidence = "tutorial"
            else:
                evidence = "unknown"
            doc["evidenceType"] = evidence
            doc["examRegime"] = None
            doc["corpusEventId"] = None
            doc["historicalFrequencyEligible"] = False
            doc["examinerAttributionStatus"] = "direct_evidence" if doc.get("authors") else "unknown"
            doc["dateAttributionStatus"] = "direct_evidence" if doc.get("semester") else ("archive_only" if doc.get("document_year") else "unknown")
        if doc["id"] in reviewed_official_context:
            doc["evidenceType"] = "official_solution"

    # Exakte Duplikate erben Event/Regime vom kanonischen Dokument, zählen aber nie erneut.
    for doc in documents:
        canonical = by_id[doc["canonicalDocumentId"]]
        if doc["id"] != canonical["id"] and canonical.get("corpusEventId"):
            for field in ("corpusEventId", "examRegime"):
                doc[field] = canonical.get(field)
            if canonical.get("evidenceType") in {"real_exam", "mock_exam"}:
                doc["evidenceType"] = canonical["evidenceType"]
            doc["historicalFrequencyEligible"] = False

    visual_map, visual_solutions = visual_definitions(documents, questions)
    visual_pages = []
    for doc in documents:
        if doc["extension"] != ".pdf" or doc.get("extracted_characters", 0) >= 100:
            continue
        for page in range(1, doc["page_count"] + 1):
            review = visual_map[(doc["id"], page)]
            visual_pages.append({
                "sourceId": doc["id"], "page": page,
                "renderedImagePath": f"tmp/visual-review/{doc['id']}/page-{page:03d}.png",
                "visualReviewStatus": review["status"], "reviewerMethod": review["method"],
                "extractedMeaning": review["meaning"], "linkedQuestionId": review["linkedQuestionId"],
                "linkedSolutionId": review["linkedSolutionId"], "confidence": review["confidence"],
                "unresolvedIssues": review["issues"], "reviewedAt": REVIEWED_AT,
            })

    retained = []
    for doc in documents:
        if doc["extension"] in {".jpg", ".jpeg", ".png"} and doc.get("visual_review_required"):
            retained.append({
                "sourceId": doc["id"], "page": 1, "visualReviewStatus": "retained_unresolved",
                "reason": "Eigenständige Smartphone-Aufnahme; Zuordnung ist nicht für das Phase-0A-PDF-Gate erforderlich und wird nicht als historische Evidenz verwendet.",
            })

    for question in questions:
        source = by_id[question["source_id"]]
        question["evidenceType"] = source["evidenceType"]
        question["examRegime"] = source["examRegime"]
        question["corpusEventId"] = source["corpusEventId"]
        question["canonicalDocumentId"] = source["canonicalDocumentId"]
        question["historicalFrequencyEligible"] = source["historicalFrequencyEligible"]
        question["examinerAttributionStatus"] = source["examinerAttributionStatus"]
        question["dateAttributionStatus"] = source["dateAttributionStatus"]
        review = visual_map.get((question["source_id"], question["page"]))
        if review:
            question["visualReviewDisposition"] = review["status"]
            if review["task"] is not None:
                question["task_number"] = review["task"]
                question["title"] = f'Aufgabe {review["task"]}: {review["meaning"]}'
                question["topic_tags"] = review["topics"]
            question["linkedQuestionIds"] = [review["linkedQuestionId"]] if review["linkedQuestionId"] else []
            question["solutionId"] = review["linkedSolutionId"]
            if source["evidenceType"] == "real_exam":
                question["verification_status"] = "verified_against_official_source"
            elif source["evidenceType"] in {"official_solution", "unofficial_solution"}:
                question["verification_status"] = "unofficial_solution_only" if source["id"] in reviewed_unofficial else "official_solution_available"
            else:
                question["verification_status"] = "generated_unverified"
        elif question["verification_status"] == "visual_review_required":
            question["visualReviewDisposition"] = "retained_unresolved"

    for exam in exams["exams"]:
        exam["evidenceType"] = "real_exam" if exam["kind"] == "reale Prüfung" else "mock_exam"
        exam["examRegime"] = "klausur_2021_digital" if exam["id"] == "exam-2021-1" else ("standard_praesenz" if exam["kind"] == "reale Prüfung" else "probeklausur")
        exam["corpusEventId"] = exam["id"]
        exam["canonicalDocumentId"] = exam.get("question_source_id")
        exam["historicalFrequencyEligible"] = bool(exam["kind"] == "reale Prüfung" and exam["id"] != "exam-2020-1")
        exam["examinerAttributionStatus"] = "direct_evidence" if exam.get("examiner") else "unknown"
        exam["dateAttributionStatus"] = "direct_evidence" if exam.get("date") else ("archive_only" if exam.get("year") and exam["id"] != "exam-2024-1" else "unknown")
        exam["profileEvidence"] = {
            "sourceIds": [source_id for source_id in [exam.get("question_source_id"), *exam.get("solution_source_ids", [])] if source_id],
            "confidence": exam["confidence"],
        }
        if exam["id"] == "exam-2024-1":
            exam["examiner"] = None
            exam["duration_minutes"] = None
            exam["allowed_aids"] = "unbekannt; Deckblatt fehlt im Foto-PDF"

    # Frequenzen vollständig nach Evidenztyp und Event deduplizieren.
    event_kind_by_id = {exam["id"]: exam["evidenceType"] for exam in exams["exams"]}
    for topic in topics["topics"]:
        aliases = TOPIC_CATALOG.get(topic["name"], (topic["name"],))
        needles = {norm(topic["name"]), *(norm(alias) for alias in aliases)}
        occurrences = defaultdict(set)
        for question in questions:
            haystack = norm(" ".join([question.get("title", ""), *question.get("topic_tags", [])]))
            if not any(needle and needle in haystack for needle in needles):
                continue
            event_id = question.get("corpusEventId")
            task = question.get("task_number")
            source = by_id[question["source_id"]]
            if event_id:
                kind = event_kind_by_id.get(event_id, "unknown")
                if kind == "real_exam" and question.get("historicalFrequencyEligible"):
                    occurrences["real_exam"].add((event_id, task))
                elif kind == "mock_exam" and source["id"] == source["canonicalDocumentId"]:
                    occurrences["mock_exam"].add((event_id, task))
            elif question["evidenceType"] in {"exercise", "tutorial", "generated_example"}:
                if source["id"] == source["canonicalDocumentId"]:
                    occurrences[question["evidenceType"]].add((source["canonicalDocumentId"], task))
            else:
                occurrences["unknown"].add((source["canonicalDocumentId"], task))
        def labels(kind: str) -> list[str]:
            return sorted(f"{event}/A{task if task is not None else '?'}" for event, task in occurrences[kind])
        previous = topic.get("exam_appearances", [])
        topic["exam_appearances"] = labels("real_exam")
        topic["evidenceOccurrences"] = {
            "realExam": labels("real_exam"), "mockExam": labels("mock_exam"), "exercise": labels("exercise"),
            "tutorial": labels("tutorial"), "generatedExample": labels("generated_example"), "unknown": labels("unknown"),
        }
        topic["historicalFrequency"] = len(occurrences["real_exam"])
        topic["importance"] = "sehr hoch" if topic["historicalFrequency"] >= 3 else ("hoch" if topic["historicalFrequency"] else "mittel")
        if previous != topic["exam_appearances"]:
            corrections.append({
                "id": stable_id("corr", f'{topic["id"]}:exam_appearances'), "recordType": "Topic", "recordId": topic["id"],
                "field": "exam_appearances", "previousValue": previous, "correctedValue": topic["exam_appearances"],
                "reason": "Historische Häufigkeit verwendet ausschließlich kanonische reale Prüfungsereignisse; Übungen, Probeklausuren, erzeugte Beispiele und Duplikate sind getrennt.",
                "supportingSource": {"sourceId": None, "page": None, "rule": "Phase-0A-Evidenznormalisierung"}, "correctedAt": TODAY,
            })

    blueprint["evidenceType"] = "real_exam"
    blueprint["frequencyPolicy"] = "Nur kanonische reale Prüfungsereignisse; Probeklausuren, Übungen, erzeugte Beispiele und Dateiduplikate sind ausgeschlossen."
    blueprint["examProfiles"] = [
        {"id": "standard-praesenz", "title": "Standard-Präsenzprofil", "tasks": 9, "points": 50, "durationMinutes": 180, "durationEvidence": "direkt für 2020-2 und 2022-1/2; nicht auf 2024 übertragen", "confidence": "strongly_supported", "supportingExamIds": ["exam-2020-2", "exam-2022-1", "exam-2022-2", "exam-2024-1"]},
        {"id": "klausur-2021", "title": "Klausurprofil 2021", "tasks": 6, "points": 60, "durationMinutes": 120, "durationEvidence": "Deckblatt der Klausur 2021, Seite 1", "confidence": "confirmed", "supportingExamIds": ["exam-2021-1"]},
    ]

    conflicts["conflicts"].append({
        "id": "conflict-handwritten-solution-status", "topic": "Status handschriftlicher Lösungen",
        "higher_authority_claim": "Kursattribuierte Aufgabenblätter sind offiziell; die Autorenschaft handschriftlicher Antworten ist nicht separat belegt.",
        "higher_authority_source": {"source_id": "src-7a4064a0710d", "page": 1},
        "lower_authority_claim": "Dateinamen wie Lösung oder Beispiellösung allein belegen keinen offiziellen Lösungsstatus.",
        "lower_authority_sources": [], "resolution": "Aufgabenstellung und Lösungsteil erhalten getrennte Verifikationsstatus; Handschrift bleibt unofficial_solution_only.",
        "status": "conflict_detected",
    })

    visual_payload = {
        "schemaVersion": "1.0.0", "reviewedDocumentCount": 9, "reviewedPageCount": len(visual_pages),
        "reviewer": "Codex, manuelle Bildprüfung", "ocrUsed": False, "pages": visual_pages,
        "solutions": visual_solutions, "retainedVisualRecords": retained,
    }
    correction_payload = {"schemaVersion": "1.0.0", "correctionCount": len(corrections), "corrections": corrections}
    manifest["phase0aCorrectedAt"] = REVIEWED_AT
    inventory["phase0aCorrectedAt"] = REVIEWED_AT
    inventory["questions"] = questions
    write_json(DATA_DIR / "source-manifest.json", manifest)
    write_json(DATA_DIR / "exam-corpus.json", exams)
    write_json(DATA_DIR / "exam-blueprint.json", blueprint)
    write_json(DATA_DIR / "topic-map.json", topics)
    write_json(DATA_DIR / "question-inventory.json", inventory)
    write_json(DATA_DIR / "source-conflicts.json", conflicts)
    write_json(DATA_DIR / "visual-review-results.json", visual_payload)
    write_json(DATA_DIR / "source-corrections.json", correction_payload)
    build_reports(documents, visual_payload, correction_payload, topics, questions)
    print(f"Phase 0A korrigiert: {len(corrections)} Korrekturen, {len(visual_pages)} geprüfte PDF-Seiten")


def build_reports(documents: list[dict], visual: dict, corrections: dict, topics: dict, questions: list[dict]) -> None:
    by_id = {doc["id"]: doc for doc in documents}
    document_rows = []
    for source_id, records in sorted(_group_by(visual["pages"], "sourceId").items()):
        statuses = Counter(record["visualReviewStatus"] for record in records)
        document_rows.append([source_id, by_id[source_id]["path"], len(records), ", ".join(f"{key}: {value}" for key, value in statuses.items()), records[0]["extractedMeaning"]])
    write_md("VISUAL_REVIEW_REPORT.md", f"""# Bericht zur visuellen Prüfung

Alle **{visual['reviewedDocumentCount']} textarmen PDFs** wurden mit insgesamt **{visual['reviewedPageCount']} Seiten** gerendert und visuell geprüft. OCR wurde nicht verwendet. Byteidentische Kopien besitzen eigene Review-Einträge, deren Bedeutung über SHA-256-Identität vom vollständig visuell geprüften kanonischen Dokument übernommen wurde.

{markdown_table(["Quellen-ID", "Datei", "Seiten", "Status", "erster Befund"], document_rows)}

Wesentliche Befunde: Die textarmen `Lösung…`-Dateien sind Übungs- oder Probeklausurlösungen, keine realen Klausuren. Kursattribuierte Aufgabenstellungen sind offiziell; handschriftliche Antworten bleiben ohne Autorennachweis `unofficial_solution_only`. `Zusammenfassung Info.pdf` ist eine studentische Sekundärquelle. Die Klausur 2024 bestätigt neun Aufgaben, enthält aber kein Deckblatt; Prüfer, Dauer, Datum und Hilfsmittel bleiben unbekannt.

Die gerenderten Seiten liegen ausschließlich lokal unter `tmp/visual-review/` und sind durch `.gitignore` vom Commit und Deployment ausgeschlossen. Vollständige Seitendaten: `data/visual-review-results.json`.
""")
    correction_rows = [[item["recordType"], item["recordId"], item["field"], str(item["previousValue"])[:90], str(item["correctedValue"])[:90], item["reason"]] for item in corrections["corrections"]]
    write_md("SOURCE_CORRECTION_REPORT.md", f"""# Quellenkorrekturen Phase 0A

Es wurden **{corrections['correctionCount']} nachvollziehbare Korrekturen** mit altem Wert, neuem Wert, Begründung, Beleg und Datum protokolliert.

{markdown_table(["Typ", "Datensatz", "Feld", "vorher", "korrigiert", "Grund"], correction_rows)}

Die 2026-Einträge stammen aus dem Übungssammelband `Uebungen 0-9.pdf`; das Jahr bleibt als Dokumentkontext erhalten, aber `historicalFrequencyEligible` ist `false`. `?/A…`-Treffer aus erzeugten Leitfäden, unbekannten Quellen oder Lösungskopien wurden aus der realen Klausurhäufigkeit entfernt und in getrennte Evidenzmengen verschoben.
""")
    evidence_counts = Counter(q.get("evidenceType", "unknown") for q in questions)
    unresolved = sum(q.get("verification_status") == "visual_review_required" and q.get("visualReviewDisposition") == "retained_unresolved" for q in questions)
    write_md("PHASE_0A_COMPLETION_REPORT.md", f"""# Phase-0A-Abschlussbericht

- Visuell geprüfte textarme PDFs: **{visual['reviewedDocumentCount']}/9**
- geprüfte PDF-Seiten: **{visual['reviewedPageCount']}**
- protokollierte Korrekturen: **{corrections['correctionCount']}**
- bewusst beibehaltene, nicht frequenzwirksame Bilddatensätze: **{unresolved}**
- Evidenztypen im Frageninventar: {', '.join(f'`{key}`={value}' for key, value in sorted(evidence_counts.items()))}
- 2026-Übungen als reale Klausurtreffer: **0**
- 2024: Prüfer, Dauer, Datum und Hilfsmittel weiterhin **unbekannt**

Das Gate ist erst nach erfolgreichem Lauf von `validate_phase0_data.py` und `validate_phase0a_data.py` geöffnet. Genaue Resultate stehen in `data/validation-results.json` und `data/phase0a-validation-results.json`.
""")


def _group_by(records: list[dict], key: str) -> dict[str, list[dict]]:
    grouped = defaultdict(list)
    for record in records:
        grouped[record[key]].append(record)
    return grouped


if __name__ == "__main__":
    main()

