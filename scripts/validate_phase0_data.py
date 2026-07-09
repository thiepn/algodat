"""Validiert Phase-0-JSON, Quellenintegrität und referenzielle Beziehungen."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from phase0_common import (
    DATA_DIR,
    ROOT,
    VERIFICATION_STATUSES,
    iter_source_files,
    relative_path,
    sha256_file,
    write_json,
)


REQUIRED_JSON = [
    "source-manifest.json",
    "duplicate-groups.json",
    "exam-corpus.json",
    "exam-blueprint.json",
    "topic-map.json",
    "question-inventory.json",
    "source-conflicts.json",
]


def main() -> None:
    errors: list[str] = []
    checks: list[dict] = []

    def check(name: str, condition: bool, detail: str) -> None:
        checks.append({"name": name, "passed": bool(condition), "detail": detail})
        if not condition:
            errors.append(f"{name}: {detail}")

    parsed = {}
    for filename in REQUIRED_JSON:
        path = DATA_DIR / filename
        try:
            parsed[filename] = json.loads(path.read_text(encoding="utf-8"))
            check(f"JSON parsebar: {filename}", True, "ok")
        except Exception as exc:
            check(f"JSON parsebar: {filename}", False, f"{type(exc).__name__}: {exc}")
    if errors:
        finish(checks, errors)

    manifest = parsed["source-manifest.json"]
    documents = manifest["documents"]
    by_id = {doc["id"]: doc for doc in documents}
    by_path = {doc["path"]: doc for doc in documents}
    actual_paths = {relative_path(path) for path in iter_source_files()}
    check("Jede Quelldatei im Manifest", actual_paths == set(by_path), f"Ist={len(actual_paths)}, Manifest={len(by_path)}")
    check("Eindeutige Quellen-IDs", len(by_id) == len(documents), f"{len(by_id)}/{len(documents)} eindeutig")

    changed = []
    missing = []
    for source_path in actual_paths:
        path = ROOT / source_path
        expected = by_path[source_path]["sha256"]
        if not path.exists():
            missing.append(source_path)
        elif sha256_file(path) != expected:
            changed.append(source_path)
    check("Keine fehlenden Quellpfade", not missing, f"fehlend={missing}")
    check("Keine Quelle verändert", not changed, f"verändert={changed}")

    pdf_errors = []
    for doc in documents:
        if doc["extension"] == ".pdf" and not doc.get("page_count") and not doc.get("failure_reason"):
            pdf_errors.append(doc["path"])
    check("PDF-Seitenzahl oder Fehlergrund", not pdf_errors, f"problematisch={pdf_errors}")

    generated_official = [doc["path"] for doc in documents if doc.get("source_authority_level") in {3, 4} and doc.get("official")]
    check("Keine erzeugte Quelle als offiziell", not generated_official, f"problematisch={generated_official}")

    duplicate_data = parsed["duplicate-groups.json"]
    duplicate_ids = {group["id"] for group in duplicate_data["exact_groups"]}
    duplicate_source_errors = [source_id for group in duplicate_data["exact_groups"] for source_id in group["source_ids"] if source_id not in by_id]
    check("Duplikatquellen gültig", not duplicate_source_errors, f"ungültig={duplicate_source_errors}")

    questions = parsed["question-inventory.json"]
    question_ids = {question["id"] for question in questions["questions"]}
    question_duplicate_ids = {group["id"] for group in questions["duplicate_question_groups"]}
    q_errors = []
    status_errors = []
    duplicate_errors = []
    solution_errors = []
    for question in questions["questions"]:
        source = by_id.get(question["source_id"])
        if not source or not question.get("page") or (source.get("page_count") and question["page"] > source["page_count"]):
            q_errors.append(question["id"])
        if question["verification_status"] not in VERIFICATION_STATUSES:
            status_errors.append(question["id"])
        duplicate_id = question.get("duplicate_group_id")
        if duplicate_id and duplicate_id not in duplicate_ids | question_duplicate_ids:
            duplicate_errors.append(question["id"])
        if question["official_solution_available"] and not question["solution_source_ids"]:
            solution_errors.append(question["id"])
        if any(source_id not in by_id for source_id in question["solution_source_ids"]):
            solution_errors.append(question["id"])
    check("Fragen referenzieren Quelle und Seite", not q_errors, f"ungültig={len(q_errors)}")
    check("Verifikations-Enuma gültig", not status_errors, f"ungültig={len(status_errors)}")
    check("Fragen-Duplikat-IDs gültig", not duplicate_errors, f"ungültig={len(duplicate_errors)}")
    check("Offizielle Lösungen verknüpft", not solution_errors, f"ungültig={len(solution_errors)}")

    topics = parsed["topic-map.json"]
    topic_errors = []
    for topic in topics["topics"]:
        refs = topic.get("source_refs", [])
        if not refs or any(ref["source_id"] not in by_id for ref in refs):
            topic_errors.append(topic["id"])
    check("Jedes Topic mit gültiger Quelle", not topic_errors, f"ungültig={len(topic_errors)}")

    exams = parsed["exam-corpus.json"]
    exam_errors = []
    for exam in exams["exams"]:
        if exam["question_source_id"] and exam["question_source_id"] not in by_id:
            exam_errors.append(exam["id"])
        if any(source_id not in by_id for source_id in exam["solution_source_ids"]):
            exam_errors.append(exam["id"])
        if exam["official_solution_available"] and not exam["solution_source_ids"]:
            exam_errors.append(exam["id"])
        for task in exam["tasks"]:
            if any(question_id not in question_ids for question_id in task["question_ids"]):
                exam_errors.append(exam["id"])
    check("Prüfungen und Lösungen referenziell gültig", not exam_errors, f"ungültig={sorted(set(exam_errors))}")

    conflicts = parsed["source-conflicts.json"]
    conflict_errors = []
    for conflict in conflicts["conflicts"]:
        refs = [conflict.get("higher_authority_source"), *conflict.get("lower_authority_sources", [])]
        if any(ref and ref.get("source_id") not in by_id for ref in refs):
            conflict_errors.append(conflict["id"])
    check("Konfliktreferenzen gültig", not conflict_errors, f"ungültig={conflict_errors}")
    finish(checks, errors)


def finish(checks: list[dict], errors: list[str]) -> None:
    payload = {
        "schema_version": "1.0.0",
        "validated_at": datetime.now(timezone.utc).isoformat(),
        "passed": not errors,
        "check_count": len(checks),
        "passed_count": sum(check["passed"] for check in checks),
        "failed_count": sum(not check["passed"] for check in checks),
        "checks": checks,
        "errors": errors,
    }
    write_json(DATA_DIR / "validation-results.json", payload)
    print(f"Validierung: {payload['passed_count']}/{payload['check_count']} Prüfungen bestanden")
    for check in checks:
        print(f"[{'OK' if check['passed'] else 'FEHLER'}] {check['name']}: {check['detail']}")
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()

