"""Gemeinsame Konstanten und Hilfsfunktionen fuer das Phase-0-Audit."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
CACHE_DIR = ROOT / "tmp" / "pdfs"

GENERATED_ROOT_NAMES = {
    ".git",
    ".agents",
    ".codex",
    "data",
    "docs",
    "scripts",
    "tmp",
    "output",
}
GENERATED_ROOT_FILES = {"README.md", "AGENTS.md", ".gitignore"}

AUTHORITY_LEVELS = {
    1: "offizielle Primaerquelle",
    2: "studentische oder kursnahe Zusammenfassung",
    3: "erzeugtes Analysedokument",
    4: "erzeugter Lernleitfaden oder Spickzettel",
}

VERIFICATION_STATUSES = {
    "official_verified",
    "verified_against_official_source",
    "official_solution_available",
    "unofficial_solution_only",
    "generated_unverified",
    "conflict_detected",
    "extraction_uncertain",
    "visual_review_required",
}

TOPIC_PATTERNS: dict[str, tuple[str, ...]] = {
    "Grundlagen und Pseudocode": (r"pseudocode", r"algorithm(?:us|en)", r"berechnungsproblem"),
    "Laufzeitanalyse und Landau-Notation": (r"laufzeit", r"landau", r"\b[OoΘ](?:\(|-notation)", r"asymptot"),
    "Induktion und Korrektheit": (r"induktion", r"schleifeninvariante", r"korrektheit", r"terminierung"),
    "InsertionSort": (r"insertionsort", r"insertion sort"),
    "MergeSort": (r"mergesort", r"merge sort", r"\bmerge\b"),
    "Binaere Suche": (r"binäre suche", r"binaere suche", r"binary search"),
    "Master-Theorem und Rekurrenzen": (r"master.?theorem", r"rekurrenz", r"rekursionsbaum"),
    "Karatsuba und Ganzzahlmultiplikation": (r"karatsuba", r"ganzzahlmultiplikation"),
    "Matrixmultiplikation und Strassen": (r"strassen", r"matrixmultiplikation"),
    "Dynamische Programmierung": (r"dynamische programmierung", r"dynamic programming", r"memoization", r"bottom.?up"),
    "Rucksackproblem": (r"rucksack", r"knapsack"),
    "Subset Sum und Partition": (r"subset.?sum", r"teilmengensumme", r"partition"),
    "LCS": (r"longest common subsequence", r"\blcs\b"),
    "Greedy-Algorithmen": (r"greedy", r"austauschargument", r"exchange argument", r"stays.?ahead"),
    "Intervallplanung": (r"interval.?scheduling", r"intervallplanung"),
    "Verspaetungsplanung": (r"lateness.?scheduling", r"verspät", r"verspaet"),
    "Lastverteilung": (r"load.?balanc", r"lastverteil"),
    "Vertex Cover und Approximation": (r"vertex.?cover", r"approximation"),
    "TSP": (r"travelling salesperson", r"traveling salesman", r"\btsp\b"),
    "Listen, Stapel und Warteschlangen": (r"verkettete liste", r"doppelt verkettet", r"\bstack\b", r"\bqueue\b", r"\bdeque\b"),
    "Heaps und Prioritaetswarteschlangen": (r"\bheap", r"prioritätswarteschlange", r"prioritaetswarteschlange"),
    "Binaere Suchbaeume": (r"binärer suchbaum", r"binaerer suchbaum", r"binary search tree", r"baumrotation"),
    "Rot-Schwarz-Baeume": (r"rot.?schwarz", r"red.?black"),
    "Hashing": (r"hash", r"lineares sondieren", r"linear probing", r"offene adressierung"),
    "Union-Find": (r"union.?find", r"make.?set", r"pfadkompression", r"path compression"),
    "Graphgrundlagen": (r"adjazenz", r"graphterminologie", r"gerichteter graph", r"ungerichteter graph"),
    "BFS": (r"breitensuche", r"breadth.?first", r"\bbfs\b"),
    "DFS und topologische Sortierung": (r"tiefensuche", r"depth.?first", r"\bdfs\b", r"topologisch"),
    "Starke Zusammenhangskomponenten": (r"stark zusammenhäng", r"strongly connected", r"scc"),
    "Dijkstra": (r"dijkstra",),
    "Bellman-Ford": (r"bellman.?ford",),
    "Floyd-Warshall": (r"floyd.?warshall",),
    "Minimale Spannbaeume": (r"minimaler spannbaum", r"minimum spanning", r"\bmst\b", r"kruskal", r"prim(?:'s)? algorithm"),
}


def relative_path(path: Path) -> str:
    return path.resolve().relative_to(ROOT.resolve()).as_posix()


def iter_source_files() -> Iterable[Path]:
    for path in sorted(ROOT.rglob("*"), key=lambda item: item.as_posix().casefold()):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        if rel.parts[0] in GENERATED_ROOT_NAMES or rel.as_posix() in GENERATED_ROOT_FILES:
            continue
        yield path


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()


def stable_id(prefix: str, value: str) -> str:
    token = hashlib.sha1(value.encode("utf-8")).hexdigest()[:12]
    return f"{prefix}-{token}"


def read_json(path: Path, default: Any = None) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def normalize_text(text: str) -> str:
    text = text.replace("\u00ad", "").replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def detect_topics(text: str) -> list[str]:
    lowered = text.casefold()
    found: list[str] = []
    for topic, patterns in TOPIC_PATTERNS.items():
        for pattern in patterns:
            try:
                matched = re.search(pattern.casefold(), lowered, re.IGNORECASE)
            except re.error as exc:
                raise RuntimeError(f"Ungültiges Themenmuster {topic}: {pattern!r}") from exc
            if matched:
                found.append(topic)
                break
    return found


def infer_year(path_text: str, text: str = "") -> int | None:
    candidates = re.findall(r"\b(20(?:1\d|2\d))\b", f"{path_text} {text[:2500]}")
    return int(candidates[0]) if candidates else None


def infer_semester(text: str) -> str | None:
    match = re.search(r"\b(WS|WiSe|Wintersemester|SS|SoSe|Sommersemester)\s*([0-9]{2,4}(?:\s*/\s*[0-9]{2,4})?)", text, re.IGNORECASE)
    return " ".join(match.group(0).split()) if match else None


def classify_source(path_text: str, first_text: str = "") -> tuple[int, str, bool, str]:
    haystack = f"{path_text} {first_text[:6000]}".casefold()
    filename = Path(path_text).name.casefold()
    generated_guides = ("cheat_sheet", "cheat sheet", "study_guide", "ultimate_")
    analyses = ("struktur.pdf", "strategien.pdf", "konzepte.pdf", "algorithmen.pdf")
    summary_words = ("zusammenfassung", "summary", "spickzettel")
    official_signals = (
        "universität zu köln",
        "universitaet zu koeln",
        "algorithmische grundlagen und datenstrukturen",
        "algorithmen und datenstrukturen",
        "prof. dr.",
        "christian sohler",
        "übungsblatt",
        "uebungsblatt",
        "probeklausur",
        "klausur",
    )
    if any(word in filename for word in generated_guides):
        return 4, "erzeugter Lernleitfaden", False, "generated_unverified"
    if filename in analyses:
        return 3, "erzeugtes Analysedokument", False, "generated_unverified"
    if any(word in filename for word in summary_words):
        return 2, "Zusammenfassung", False, "generated_unverified"
    if any(signal in haystack for signal in official_signals):
        return 1, "offizielle oder kursattribuierte Quelle", True, "official_verified"
    return 2, "sonstige kursbezogene Quelle", False, "extraction_uncertain"


def infer_category(path_text: str, text: str = "") -> str:
    haystack = f"{path_text} {text[:3000]}".casefold()
    normalized_path = path_text.replace("\\", "/").casefold()
    filename = Path(path_text).name.casefold()
    if "/vorlesungen/" in normalized_path or filename == "vorlesungen.pdf":
        return "Vorlesung"
    if any(word in filename for word in ("cheat", "study_guide", "study guide")):
        return "Spickzettel"
    if filename in {"struktur.pdf", "strategien.pdf", "konzepte.pdf", "algorithmen.pdf"}:
        return "Analysedokument"
    if "lösung" in haystack or "loesung" in haystack or "solution" in haystack or "beispiellösung" in haystack:
        if "klausur" in haystack:
            return "Prüfungslösung"
        return "Übungslösung"
    if "probeklausur" in haystack or "musterklausur" in haystack:
        return "Probeklausur"
    if "klausur" in haystack or re.search(r"\bexam\b", haystack):
        return "Prüfung"
    if "übungsblatt" in haystack or "uebungsblatt" in haystack or "übung" in haystack or "uebung" in haystack:
        return "Übung"
    if "vorlesung" in haystack or "lecture" in haystack:
        return "Vorlesung"
    if "zusammenfassung" in haystack or "summary" in haystack:
        return "Zusammenfassung"
    if "cheat" in haystack or "spickzettel" in haystack:
        return "Spickzettel"
    return "Sonstiges"
