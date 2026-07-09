"""Inventarisiert unveraendert alle Quelldateien und schreibt SHA-256-Pruefsummen."""

from __future__ import annotations

import mimetypes
from collections import Counter
from datetime import datetime, timezone

from phase0_common import DATA_DIR, ROOT, iter_source_files, relative_path, sha256_file, stable_id, write_json


def main() -> None:
    documents = []
    for path in iter_source_files():
        rel = relative_path(path)
        checksum = sha256_file(path)
        stat = path.stat()
        suffix = path.suffix.casefold()
        ignored = path.name == ".DS_Store"
        documents.append(
            {
                "id": stable_id("src", rel.casefold()),
                "path": rel,
                "original_name": path.name,
                "extension": suffix or None,
                "mime_type": mimetypes.guess_type(path.name)[0] or "application/octet-stream",
                "size_bytes": stat.st_size,
                "modified_utc": datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat(),
                "sha256": checksum,
                "ignored_for_content": ignored,
                "readable": not ignored,
                "extraction_succeeded": None,
                "visual_review_required": suffix in {".jpg", ".jpeg", ".png", ".tif", ".tiff"},
                "page_count": None,
                "failure_reason": None,
            }
        )

    checksum_counts = Counter(item["sha256"] for item in documents)
    for document in documents:
        document["exact_duplicate"] = checksum_counts[document["sha256"]] > 1

    payload = {
        "schema_version": "1.0.0",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "root": ROOT.name,
        "source_count": len(documents),
        "documents": documents,
    }
    write_json(DATA_DIR / "source-manifest.json", payload)
    by_extension = Counter(item["extension"] or "ohne Erweiterung" for item in documents)
    print(f"Inventarisiert: {len(documents)} Dateien")
    for extension, count in sorted(by_extension.items()):
        print(f"  {extension}: {count}")


if __name__ == "__main__":
    main()

