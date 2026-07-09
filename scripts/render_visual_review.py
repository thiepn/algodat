"""Rendert textarme PDFs seitenweise und erzeugt Kontaktbögen zur Sichtprüfung."""

from __future__ import annotations

import math
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw

from phase0_common import DATA_DIR, ROOT, read_json


OUTPUT_ROOT = ROOT / "tmp" / "visual-review"
POPLER = Path.home() / ".cache" / "codex-runtimes" / "codex-primary-runtime" / "dependencies" / "native" / "poppler" / "Library" / "bin" / "pdftoppm.exe"


def render_pdf(source: Path, source_id: str, page_count: int) -> None:
    target = OUTPUT_ROOT / source_id
    target.mkdir(parents=True, exist_ok=True)
    renderer = shutil.which("pdftoppm") or (str(POPLER) if POPLER.exists() else None)
    if not renderer:
        raise SystemExit("pdftoppm wurde nicht gefunden.")
    expected = [target / f"page-{page:03d}.png" for page in range(1, page_count + 1)]
    if not all(path.exists() for path in expected):
        subprocess.run(
            [renderer, "-png", "-r", "140", str(source), str(target / "page")],
            check=True,
        )
        generated = sorted(target.glob("page-*.png"))
        for index, path in enumerate(generated, start=1):
            normalized = target / f"page-{index:03d}.png"
            if path != normalized:
                path.replace(normalized)
    build_contact_sheets(target, expected)


def build_contact_sheets(target: Path, pages: list[Path]) -> None:
    sheet_dir = target / "kontaktboegen"
    sheet_dir.mkdir(exist_ok=True)
    per_sheet = 4
    thumb_width = 850
    margin = 30
    label_height = 42
    for sheet_index in range(math.ceil(len(pages) / per_sheet)):
        chunk = pages[sheet_index * per_sheet:(sheet_index + 1) * per_sheet]
        thumbs = []
        for path in chunk:
            with Image.open(path) as image:
                image = image.convert("RGB")
                ratio = thumb_width / image.width
                thumbs.append((path, image.resize((thumb_width, int(image.height * ratio)))))
        row_heights = []
        for row in range(2):
            row_items = thumbs[row * 2:(row + 1) * 2]
            row_heights.append(max((image.height for _, image in row_items), default=0) + label_height)
        canvas = Image.new("RGB", (thumb_width * 2 + margin * 3, sum(row_heights) + margin * 3), "white")
        draw = ImageDraw.Draw(canvas)
        y = margin
        for row in range(2):
            row_items = thumbs[row * 2:(row + 1) * 2]
            for column, (path, image) in enumerate(row_items):
                x = margin + column * (thumb_width + margin)
                draw.text((x, y), path.stem, fill="black")
                canvas.paste(image, (x, y + label_height))
            y += row_heights[row] + margin
        canvas.save(sheet_dir / f"kontakt-{sheet_index + 1:03d}.jpg", quality=92)


def main() -> None:
    manifest = read_json(DATA_DIR / "source-manifest.json")
    text_poor = [
        document
        for document in manifest["documents"]
        if document["extension"] == ".pdf" and document.get("extracted_characters", 0) < 100
    ]
    for index, document in enumerate(text_poor, start=1):
        render_pdf(ROOT / document["path"], document["id"], document["page_count"])
        print(f"[{index}/{len(text_poor)}] {document['path']} ({document['page_count']} Seiten)")


if __name__ == "__main__":
    main()

