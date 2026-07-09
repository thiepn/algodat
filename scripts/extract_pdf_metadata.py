"""Extrahiert PDF-Metadaten und Text mit stabiler Seitenzuordnung.

Der Cache unter tmp/pdfs ist ein reproduzierbares Zwischenprodukt und keine
Produktionsquelle. Bei zu wenig Text wird die Seite zur visuellen Pruefung
markiert; OCR wird bewusst nicht automatisch ausgefuehrt.
"""

from __future__ import annotations

import re
import sys
import traceback
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from pypdf import PdfReader

from phase0_common import (
    CACHE_DIR,
    DATA_DIR,
    ROOT,
    classify_source,
    detect_topics,
    infer_category,
    infer_semester,
    infer_year,
    normalize_text,
    read_json,
    stable_id,
    write_json,
)


def clean_metadata(value: object) -> str | None:
    if value is None:
        return None
    result = normalize_text(str(value))
    return result or None


def count_page_images(page: object) -> tuple[int, str | None]:
    """Zaehlt Bild-XObjects, ohne potentiell defekte Bilddaten zu dekodieren."""
    try:
        resources = page.get("/Resources") or {}
        resources = resources.get_object() if hasattr(resources, "get_object") else resources
        xobjects = resources.get("/XObject") or {}
        xobjects = xobjects.get_object() if hasattr(xobjects, "get_object") else xobjects
        count = 0
        for value in xobjects.values():
            obj = value.get_object() if hasattr(value, "get_object") else value
            if obj.get("/Subtype") == "/Image":
                count += 1
        return count, None
    except Exception as exc:
        return 0, f"Bildzaehlung: {type(exc).__name__}: {exc}"


def extract_one(document: dict) -> dict:
    source = ROOT / document["path"]
    cache_path = CACHE_DIR / f'{document["id"]}.json'
    try:
        reader = PdfReader(source, strict=False)
        metadata = reader.metadata or {}
        pages = []
        full_text_parts = []
        for index, page in enumerate(reader.pages, start=1):
            error = None
            try:
                raw_text = page.extract_text(extraction_mode="layout") or ""
            except Exception as exc:  # einzelne defekte Seite darf Dokument nicht verwerfen
                raw_text = ""
                error = f"{type(exc).__name__}: {exc}"
            text = normalize_text(raw_text)
            full_text_parts.append(text)
            image_count, image_error = count_page_images(page)
            if image_error:
                error = f"{error}; {image_error}" if error else image_error
            char_count = len(text)
            review = char_count < 80 or image_count >= 3
            pages.append(
                {
                    "id": f'{document["id"]}-p{index:04d}',
                    "page": index,
                    "char_count": char_count,
                    "word_count": len(text.split()),
                    "image_count": image_count,
                    "text_extracted": bool(text),
                    "visual_review_required": review,
                    "extraction_error": error,
                    "text": text,
                }
            )
        full_text = "\n".join(full_text_parts)
        first_text = "\n".join(full_text_parts[:4])
        authority_level, authority_reason, official, status = classify_source(document["path"], first_text)
        title = clean_metadata(metadata.get("/Title"))
        if not title or title.casefold() in {"untitled", "microsoft word - document1"}:
            title = next((line.strip() for line in first_text.splitlines() if len(line.strip()) >= 5), source.stem)
        authors = []
        metadata_author = clean_metadata(metadata.get("/Author"))
        if metadata_author:
            authors.append(metadata_author)
        for known in ("Christian Sohler", "Hartmut Schmeck", "Thomas Jansen"):
            if known.casefold() in full_text[:12000].casefold() and known not in authors:
                authors.append(known)
        topic_counts = Counter()
        for page in pages:
            for topic in detect_topics(page["text"]):
                topic_counts[topic] += 1
        low_text_pages = [page["page"] for page in pages if page["char_count"] < 80]
        visual_pages = [page["page"] for page in pages if page["visual_review_required"]]
        result = {
            **document,
            "page_count": len(pages),
            "document_title": title,
            "document_year": infer_year(document["path"], first_text),
            "semester": infer_semester(first_text),
            "authors": authors,
            "official": official,
            "source_authority_level": authority_level,
            "source_authority_reason": authority_reason,
            "document_category": infer_category(document["path"], first_text),
            "topics": sorted(topic_counts),
            "topic_page_counts": dict(sorted(topic_counts.items())),
            "exam_relevance": "hoch" if any(word in f'{document["path"]} {first_text}'.casefold() for word in ("klausur", "prüfung", "pruefung")) else "mittel",
            "contains_questions": bool(re.search(r"\b(aufgabe|question)\s*\d+", full_text, re.IGNORECASE)),
            "contains_solutions": bool(re.search(r"\b(lösung|loesung|solution|beispiellösung)\b", f'{document["path"]} {full_text[:5000]}', re.IGNORECASE)),
            "readable": True,
            "extraction_succeeded": any(page["text_extracted"] for page in pages),
            "visual_review_required": bool(visual_pages),
            "low_text_pages": low_text_pages,
            "visual_review_pages": visual_pages,
            "extracted_characters": len(full_text),
            "verification_status": status if full_text else "visual_review_required",
            "failure_reason": None,
        }
        write_json(
            cache_path,
            {
                "schema_version": "1.0.0",
                "source_id": document["id"],
                "source_path": document["path"],
                "page_count": len(pages),
                "pages": pages,
            },
        )
        return result
    except Exception as exc:
        if "--debug" in sys.argv:
            traceback.print_exc()
        return {
            **document,
            "readable": False,
            "extraction_succeeded": False,
            "verification_status": "extraction_uncertain",
            "failure_reason": f"{type(exc).__name__}: {exc}",
        }


def inspect_image(document: dict) -> dict:
    try:
        from PIL import Image

        with Image.open(ROOT / document["path"]) as image:
            return {
                **document,
                "readable": True,
                "extraction_succeeded": True,
                "image_width": image.width,
                "image_height": image.height,
                "image_mode": image.mode,
                "visual_review_required": True,
                "verification_status": "visual_review_required",
            }
    except Exception as exc:
        return {**document, "readable": False, "extraction_succeeded": False, "failure_reason": f"{type(exc).__name__}: {exc}"}


def main() -> None:
    manifest_path = DATA_DIR / "source-manifest.json"
    manifest = read_json(manifest_path)
    if not manifest:
        raise SystemExit("Zuerst scripts/scan_sources.py ausführen.")
    failed_only = "--failed-only" in sys.argv
    updated = []
    total = len(manifest["documents"])
    for index, document in enumerate(manifest["documents"], start=1):
        suffix = document["extension"]
        if failed_only and suffix == ".pdf" and not document.get("failure_reason"):
            result = document
        elif suffix == ".pdf":
            result = extract_one(document)
        elif suffix in {".jpg", ".jpeg", ".png", ".tif", ".tiff"}:
            result = inspect_image(document)
        else:
            result = {**document, "extraction_succeeded": False if not document["ignored_for_content"] else None}
        updated.append(result)
        if index % 10 == 0 or index == total:
            print(f"Verarbeitet: {index}/{total}", flush=True)
    manifest["generated_at"] = datetime.now(timezone.utc).isoformat()
    manifest["documents"] = updated
    write_json(manifest_path, manifest)
    pdfs = [item for item in updated if item["extension"] == ".pdf"]
    print(f"PDFs: {len(pdfs)}, Seiten: {sum(item.get('page_count') or 0 for item in pdfs)}")
    failures = [item for item in pdfs if item.get("failure_reason")]
    print(f"PDF-Fehler: {len(failures)}")


if __name__ == "__main__":
    main()
