"""Validiert das Phase-0A-Gate einschließlich Evidenz- und Review-Regeln."""

from __future__ import annotations

import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from phase0_common import DATA_DIR, ROOT, iter_source_files, relative_path, sha256_file, write_json


def main() -> None:
    manifest = load("source-manifest.json")
    duplicates = load("duplicate-groups.json")
    exams = load("exam-corpus.json")
    blueprint = load("exam-blueprint.json")
    topics = load("topic-map.json")
    inventory = load("question-inventory.json")
    corrections = load("source-corrections.json")
    visual = load("visual-review-results.json")
    by_id = {doc["id"]: doc for doc in manifest["documents"]}
    question_ids = {question["id"] for question in inventory["questions"]}
    checks: list[dict] = []
    errors: list[str] = []

    def check(name: str, condition: bool, detail: str) -> None:
        checks.append({"name": name, "passed": bool(condition), "detail": detail})
        if not condition:
            errors.append(f"{name}: {detail}")

    text_poor = [doc for doc in manifest["documents"] if doc["extension"] == ".pdf" and doc.get("extracted_characters", 0) < 100]
    reviewed_pairs = {(record["sourceId"], record["page"]) for record in visual["pages"]}
    expected_pairs = {(doc["id"], page) for doc in text_poor for page in range(1, doc["page_count"] + 1)}
    check("Alle neun textarmen PDFs erfasst", len(text_poor) == 9 and visual["reviewedDocumentCount"] == 9, f"PDFs={len(text_poor)}")
    check("Alle textarmen Seiten geprüft", reviewed_pairs == expected_pairs, f"erwartet={len(expected_pairs)}, geprüft={len(reviewed_pairs)}")

    visual_errors = []
    for record in visual["pages"]:
        source = by_id.get(record["sourceId"])
        image = ROOT / record["renderedImagePath"]
        if not source or not 1 <= record["page"] <= (source.get("page_count") or 0) or not image.exists():
            visual_errors.append(f'{record["sourceId"]}:{record["page"]}')
    check("Jede Sichtprüfung mit Quelle, Seite und Bild", not visual_errors, f"ungültig={visual_errors}")

    unresolved_reviews = [record for record in visual["pages"] if not record.get("visualReviewStatus")]
    check("Jede Review-Seite mit Ergebnis", not unresolved_reviews, f"ohne Status={len(unresolved_reviews)}")

    correction_errors = [item["id"] for item in corrections["corrections"] if not item.get("reason") or not item.get("correctedAt") or "previousValue" not in item or "correctedValue" not in item]
    check("Jede Korrektur begründet und datiert", not correction_errors, f"ungültig={correction_errors}")

    evidence_values = {"real_exam", "mock_exam", "exercise", "tutorial", "official_solution", "unofficial_solution", "generated_example", "unknown"}
    evidence_errors = [doc["id"] for doc in manifest["documents"] if doc.get("evidenceType") not in evidence_values]
    check("Quellenevidenz normalisiert", not evidence_errors, f"ungültig={len(evidence_errors)}")

    bad_history = [q["id"] for q in inventory["questions"] if q.get("historicalFrequencyEligible") and q.get("evidenceType") != "real_exam"]
    check("Nur reale Klausuren sind historisch frequenzfähig", not bad_history, f"ungültig={len(bad_history)}")

    mock_history = [q["id"] for q in inventory["questions"] if q.get("evidenceType") == "mock_exam" and q.get("historicalFrequencyEligible")]
    exercise_history = [q["id"] for q in inventory["questions"] if q.get("evidenceType") in {"exercise", "tutorial"} and q.get("historicalFrequencyEligible")]
    generated_history = [q["id"] for q in inventory["questions"] if q.get("evidenceType") == "generated_example" and q.get("historicalFrequencyEligible")]
    check("Probeklausuren zählen nicht als reale Klausuren", not mock_history, f"ungültig={len(mock_history)}")
    check("Übungen zählen nicht als reale Klausuren", not exercise_history, f"ungültig={len(exercise_history)}")
    check("Generierte Dokumente erzeugen keine Klausurtreffer", not generated_history, f"ungültig={len(generated_history)}")

    year_2026 = [q["id"] for q in inventory["questions"] if q.get("year") == 2026 and q.get("historicalFrequencyEligible")]
    check("2026-Übungen sind keine realen Klausuraufgaben", not year_2026, f"ungültig={len(year_2026)}")

    bad_topic_occurrences = []
    for topic in topics["topics"]:
        for occurrence in topic.get("evidenceOccurrences", {}).get("realExam", []):
            if not occurrence.startswith("exam-"):
                bad_topic_occurrences.append(f'{topic["id"]}:{occurrence}')
        if topic.get("exam_appearances") != topic.get("evidenceOccurrences", {}).get("realExam", []):
            bad_topic_occurrences.append(f'{topic["id"]}:abweichende Listen')
    check("Themenfrequenz nutzt nur reale Corpus-Events", not bad_topic_occurrences, f"ungültig={len(bad_topic_occurrences)}")

    eligible_sources = [doc for doc in manifest["documents"] if doc.get("historicalFrequencyEligible")]
    duplicate_eligible = []
    for group in duplicates["exact_groups"]:
        count = sum(source_id in {doc["id"] for doc in eligible_sources} for source_id in group["source_ids"])
        if count > 1:
            duplicate_eligible.append(group["id"])
    check("Exakte Duplikate zählen höchstens einmal", not duplicate_eligible, f"ungültig={duplicate_eligible}")

    unknown_examiner_promotions = [item["id"] for item in corrections["corrections"] if item.get("field") == "examiner" and not item.get("previousValue") and item.get("correctedValue") == "Christian Sohler"]
    unknown_year_promotions = [item["id"] for item in corrections["corrections"] if item.get("field") == "year" and item.get("previousValue") is None and item.get("correctedValue") is not None]
    check("Kein unbekannter Prüfer unbelegt zu Sohler geändert", not unknown_examiner_promotions, f"ungültig={unknown_examiner_promotions}")
    check("Kein unbekanntes Jahr unbelegt konkretisiert", not unknown_year_promotions, f"ungültig={unknown_year_promotions}")

    exam_2024 = next(exam for exam in exams["exams"] if exam["id"] == "exam-2024-1")
    check("2024-Metadaten bleiben unbekannt", exam_2024.get("examiner") is None and exam_2024.get("duration_minutes") is None and exam_2024.get("date") is None, "Prüfer/Dauer/Datum müssen null sein")

    visual_pending = [q["id"] for q in inventory["questions"] if q.get("verification_status") == "visual_review_required" and q.get("visualReviewDisposition") not in {"retained_unresolved", "resolved", "resolved_via_exact_duplicate"}]
    check("Visual-Review-Pflicht gelöst oder explizit beibehalten", not visual_pending, f"ungültig={len(visual_pending)}")

    solution_errors = []
    for solution in visual["solutions"]:
        if solution["verificationStatus"] == "official_solution_available" and solution.get("questionId") not in question_ids:
            solution_errors.append(solution["id"])
    check("Offizielle Lösungen mit existierenden Fragen verknüpft", not solution_errors, f"ungültig={solution_errors}")

    profile_errors = [exam["id"] for exam in exams["exams"] if not exam.get("profileEvidence", {}).get("confidence") or not exam.get("examRegime") or not exam.get("evidenceType")]
    check("Jedes Prüfungsset mit Profil, Evidenz und Sicherheit", not profile_errors, f"ungültig={profile_errors}")
    blueprint_profiles = blueprint.get("examProfiles", [])
    check("Standard- und 2021-Profil getrennt", {profile["id"] for profile in blueprint_profiles} == {"standard-praesenz", "klausur-2021"}, f"Profile={len(blueprint_profiles)}")

    changed = [path for path in iter_source_files() if sha256_file(path) != next(doc["sha256"] for doc in manifest["documents"] if doc["path"] == relative_path(path))]
    check("Keine Quelldatei verändert", not changed, f"verändert={[relative_path(path) for path in changed]}")

    staged = staged_source_binaries()
    check("Keine privaten Quellbinärdateien gestaged", not staged, f"gestaged={staged}")

    payload = {
        "schemaVersion": "1.0.0", "validatedAt": datetime.now(timezone.utc).isoformat(), "passed": not errors,
        "checkCount": len(checks), "passedCount": sum(item["passed"] for item in checks),
        "failedCount": sum(not item["passed"] for item in checks), "checks": checks, "errors": errors,
    }
    write_json(DATA_DIR / "phase0a-validation-results.json", payload)
    update_report(payload)
    print(f"Phase-0A-Validierung: {payload['passedCount']}/{payload['checkCount']} Prüfungen bestanden")
    for item in checks:
        print(f"[{'OK' if item['passed'] else 'FEHLER'}] {item['name']}: {item['detail']}")
    if errors:
        raise SystemExit(1)


def load(name: str) -> dict:
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


def staged_source_binaries() -> list[str]:
    git_dir = ROOT / ".git"
    if not (git_dir / "HEAD").exists():
        return []
    result = subprocess.run(["git", "diff", "--cached", "--name-only"], cwd=ROOT, text=True, capture_output=True, check=False)
    if result.returncode:
        return ["GIT_STATUS_UNPRÜFBAR"]
    forbidden = []
    for path in result.stdout.splitlines():
        low = path.casefold()
        if low.endswith((".pdf", ".jpg", ".jpeg", ".png")) or low.startswith("info 1 copy/"):
            forbidden.append(path)
    return forbidden


def update_report(payload: dict) -> None:
    path = ROOT / "docs" / "PHASE_0A_COMPLETION_REPORT.md"
    text = path.read_text(encoding="utf-8").split("\n## Gate-Validierung\n", 1)[0].rstrip()
    lines = [
        "", "## Gate-Validierung", "",
        f"**{payload['passedCount']}/{payload['checkCount']} Prüfungen bestanden; {payload['failedCount']} Fehler.**",
        "",
    ]
    lines.extend(f"- {'OK' if item['passed'] else 'FEHLER'}: {item['name']} - {item['detail']}" for item in payload["checks"])
    path.write_text(text + "\n" + "\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

