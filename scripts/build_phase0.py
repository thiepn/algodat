"""Erzeugt die deutschen Phase-0-Daten und Dokumente aus dem Quellen-Audit."""

from __future__ import annotations

import hashlib
import re
from collections import Counter, defaultdict
from datetime import date, datetime, timezone
from pathlib import Path

from phase0_common import (
    AUTHORITY_LEVELS,
    CACHE_DIR,
    DATA_DIR,
    ROOT,
    detect_topics,
    infer_category,
    normalize_text,
    read_json,
    stable_id,
    write_json,
)


DOCS_DIR = ROOT / "docs"


TOPIC_CATALOG: dict[str, tuple[str, ...]] = {
    "Algorithmen und Berechnungsprobleme": ("berechnungsproblem", "algorithmus"),
    "Pseudocode": ("pseudocode",),
    "Rekursion": ("rekursion", "rekursiv"),
    "Exakte Laufzeitanalyse": ("exakte laufzeit", "laufzeitanalyse"),
    "Worst-Case-Analyse": ("worst-case", "worst case"),
    "Average-Case-Analyse": ("average-case", "average case", "mittlere laufzeit"),
    "Landau-Notation": ("landau", "o-notation", "asymptot"),
    "Summen": ("summe", "summen"),
    "Vollständige Induktion": ("induktion",),
    "Schleifeninvarianten": ("schleifeninvariante",),
    "Korrektheitsbeweise": ("korrektheit", "korrektheitsbeweis"),
    "InsertionSort": ("insertionsort", "insertion sort"),
    "MergeSort": ("mergesort", "merge sort"),
    "Merge": ("merge(", "merge-schritt", "merge schritt"),
    "Binäre Suche": ("binäre suche", "binaere suche", "binary search"),
    "Ganzzahlmultiplikation": ("ganzzahlmultiplikation", "integer-multiplikation"),
    "Karatsuba": ("karatsuba",),
    "Matrixmultiplikation": ("matrix-multiplikation", "matrixmultiplikation"),
    "Strassen": ("strassen",),
    "Rekursionsbäume": ("rekursionsbaum",),
    "Master-Theorem": ("mastertheorem", "master-theorem", "master theorem"),
    "Dynamische Programmierung": ("dynamische programmierung", "dynamic programming"),
    "Fibonacci": ("fibonacci", "fib1(", "fib2(", "fib3("),
    "Memoisierung": ("memoization", "memoisierung"),
    "Bottom-up-DP": ("bottom-up", "bottom up"),
    "MaxSucheDP": ("maxsuchedp",),
    "Rucksackproblem": ("rucksack", "knapsack"),
    "Lösungsrekonstruktion": ("rucksacklösung", "lösungsrekonstruktion", "rekonstruktion"),
    "Subset Sum": ("subsetsum", "subset sum", "teilmengensumme"),
    "Partition": ("partition",),
    "LCS": ("lcs", "longest common subsequence", "längste gemeinsame teilfolge"),
    "Münzwechsel": ("coin change", "münzwechsel", "muenzwechsel"),
    "IntervalScheduling": ("intervalscheduling", "intervalsche"),
    "LatenessScheduling": ("latenessscheduling", "lateness scheduling"),
    "GreedyLoadBalancing": ("greedyloadbalancing", "load balancing"),
    "GreedyVertexCover": ("greedyvertexcover", "vertex cover"),
    "ApproxTSP": ("approxtsp", "approx tsp"),
    "Austauschargument": ("austauschargument", "exchange argument"),
    "Widerspruchsbeweis": ("widerspruch",),
    "Stays-ahead-Beweis": ("stays-ahead", "stays ahead"),
    "Approximationsfaktor": ("approximationsfaktor", "approximation factor"),
    "Arrays": ("array", "feld"),
    "Einfach verkettete Listen": ("einfach verkettete liste", "einfachverkettete"),
    "Doppelt verkettete Listen": ("doppelt verkettete liste", "doppeltverkettete"),
    "Stacks": ("stack", "stapel"),
    "Queues": ("queue", "warteschlange"),
    "Deques": ("deque",),
    "Heaps": ("heap",),
    "Prioritätswarteschlangen": ("prioritätswarteschlange", "priority queue"),
    "Binäre Suchbäume": ("binärer suchbaum", "binary search tree"),
    "Baumtraversierung": ("tree-walk", "inorder", "preorder", "postorder"),
    "Baumrotationen": ("rotation", "rotiere"),
    "Rot-Schwarz-Bäume": ("rot-schwarz", "rot schwarz", "red-black"),
    "Direkte Adressierung": ("direkte adressierung", "direct addressing"),
    "Universelles Hashing": ("universelles hashing", "universal hashing"),
    "Hashing mit Verkettung": ("kollisionsbehandlung", "chained hashing"),
    "Offene Adressierung": ("offene adressierung", "open addressing"),
    "Lineares Sondieren": ("lineares sondieren", "linear probing"),
    "Löschmarkierungen": ("löschmarkierung", "deleted marker"),
    "Lastfaktor": ("lastfaktor", "load factor"),
    "Union-Find": ("union-find", "union find"),
    "Weighted Union": ("weighted union", "gewichtete union"),
    "Union by Rank": ("union by rank", "rang"),
    "Pfadkompression": ("pfadkompression", "path compression"),
    "Graphterminologie": ("graph", "knoten", "kante"),
    "Adjazenzlisten": ("adjazenzliste",),
    "Adjazenzmatrizen": ("adjazenzmatrix",),
    "BFS": ("breitensuche", "bfs", "breadth-first"),
    "DFS": ("tiefensuche", "dfs", "depth-first"),
    "Entdeckungs- und Abschlusszeiten": ("entdeckungszeit", "abschlusszeit", "d[v]", "f[v]"),
    "White-Path-Theorem": ("white-path", "white path"),
    "Topologische Sortierung": ("topologische sortierung", "topologisch"),
    "Starke Zusammenhangskomponenten": ("starke zusammenhangskomponenten", "strongly connected"),
    "Dijkstra": ("dijkstra",),
    "Bellman-Ford": ("bellman-ford", "bellman ford"),
    "Negative Kreise": ("negative kreise", "negative zyklen", "negativer kreis"),
    "Floyd-Warshall": ("floyd-warshall", "floyd und warshall", "floyd warshall"),
    "Minimale Spannbäume": ("minimaler spannbaum", "minimale spannbäume", "minimum spanning"),
    "Kruskal": ("kruskal",),
    "Prim": ("algorithmus von prim", "prim("),
    "Schnittknoten": ("schnittknoten", "nicht zusammenhängend"),
    "Graphfärbung": ("färbung", "4-färbung"),
    "Unabhängige Mengen": ("unabhängige menge",),
}


EXAM_CONFIGS = [
    {
        "id": "exam-2020-1",
        "kind": "reale Prüfung",
        "year": 2020,
        "date": None,
        "confidence": "plausible",
        "question_path": None,
        "solution_path": "info 1 copy/2020/kl/1.Klausur Loesungsskizze 3.pdf",
        "examiner": None,
        "duration_minutes": 180,
        "allowed_aids": "unbekannt; Deckblatt fehlt",
        "tasks": [
            "MergeSort-Tracing", "Hashing mit Verkettung", "Bellman-Ford und negative Kreise", "Union-Find mit Listen",
            "Schleifeninvariante", "Rekurrenz, Master-Theorem und Induktion", "Divide and Conquer: maximale Wertdifferenz",
            "Dynamische Programmierung: Pausentage", "Greedy: Graphfärbung",
        ],
        "points": [4, 4, 4, 4, 5, 5, 8, 8, 8],
        "note": "Nur eine Lösungsskizze ohne Deckblatt; Jahr und Dauer sind aus Ablage/Serienmuster abgeleitet und nicht bestätigt.",
    },
    {
        "id": "exam-2020-2", "kind": "reale Prüfung", "year": 2020, "date": "2020-10-07", "confidence": "confirmed",
        "question_path": "info 1 copy/2020/kl/20_2.pdf", "solution_path": "info 1 copy/2020/kl/info1 2. Klausur Loesungsskizze 6.pdf",
        "examiner": "Christian Sohler", "duration_minutes": 180,
        "allowed_aids": "ein handschriftlich beidseitig beschriebenes DIN-A4-Blatt",
        "tasks": ["IntervalScheduling", "DFS", "Rot-Schwarz-Bäume", "Prim", "Schleifeninvariante", "Rekurrenz, Master-Theorem und Induktion", "Greedy: Fitnesspunkte", "Dynamische Programmierung: Rechnerbudget", "Datenstruktur: Multimenge"],
        "points": [4, 4, 4, 4, 5, 5, 8, 8, 8], "note": None,
    },
    {
        "id": "exam-2021-1", "kind": "reale Prüfung", "year": 2021, "date": "2021-09-29", "confidence": "confirmed",
        "question_path": "info 1 copy/2021/kl/Klausur2021.pdf", "solution_path": "info 1 copy/2021/kl/LoesungKlausur1.pdf",
        "examiner": "Christian Sohler", "duration_minutes": 120,
        "allowed_aids": "handgefertigte Notizen, Vorlesungsskript, Übungsmaterial und Lehrbücher; digitale Abgabe",
        "tasks": ["Rekurrenz und Master-Theorem", "LatenessScheduling", "Bellman-Ford", "Schleifeninvariante", "Dynamische Programmierung: Mine", "Graphtransfer: Schnittknoten"],
        "points": [6, 6, 6, 10, 16, 16], "note": "Abweichendes Online-Prüfungsformat mit sechs Aufgaben und 60 Punkten.",
    },
    {
        "id": "exam-2022-1", "kind": "reale Prüfung", "year": 2022, "date": "2022-07-29", "confidence": "confirmed",
        "question_path": "info 1 copy/2022/kl/ErstKlausur2022 2.pdf", "solution_path": None,
        "examiner": "Christian Sohler", "duration_minutes": 180,
        "allowed_aids": "ein handschriftlich beidseitig beschriebenes DIN-A4-Blatt",
        "tasks": ["GreedyLoadBalancing", "Rot-Schwarz-Bäume", "Floyd-Warshall", "Prim", "Schleifeninvariante", "Rekurrenz und Induktion", "Greedy: Workout", "Dynamische Programmierung: Frosch-Distanz", "Graphtransfer: Zusammenhang durch eine Kante"],
        "points": [4, 4, 4, 4, 5, 5, 8, 8, 8], "note": None,
    },
    {
        "id": "exam-2022-2", "kind": "reale Prüfung", "year": 2022, "date": "2022-09-17", "confidence": "confirmed",
        "question_path": "info 1 copy/2022/kl/ZweitKlausur2022 2.pdf", "solution_path": None,
        "examiner": "Christian Sohler", "duration_minutes": 180,
        "allowed_aids": "ein handschriftlich beidseitig beschriebenes DIN-A4-Blatt",
        "tasks": ["LatenessScheduling", "Union-Find", "Dijkstra", "Rucksack-DP-Tabelle", "Schleifeninvariante", "Rekurrenz und Induktion", "Divide and Conquer: fehlerhaftes Array", "Dynamische Programmierung: Windpark", "Graphtransfer: kostenbeschränkter Spannbaum"],
        "points": [4, 4, 4, 4, 5, 5, 8, 8, 8], "note": None,
    },
    {
        "id": "exam-2024-1", "kind": "reale Prüfung", "year": 2024, "date": None, "confidence": "strongly supported",
        "question_path": "info 1 copy/2024/kl/Klausur 2024.pdf", "solution_path": None,
        "examiner": None, "duration_minutes": None, "allowed_aids": "unbekannt; Deckblatt fehlt im Foto-PDF",
        "tasks": ["DFS", "Rucksack-DP-Tabelle", "Rot-Schwarz-Bäume", "MergeSort", "Schleifeninvariante", "Rekurrenz und Induktion", "Greedy: Entsorgungsstationen", "Dynamische Programmierung: Messreihen", "Graphtransfer: negativer Kreis"],
        "points": [4, 4, 4, 4, 5, 5, 8, 8, 8],
        "note": "Alle neun Aufgaben wurden visuell aus dem bildbasierten PDF geprüft. Prüfer, Dauer und Hilfsmittel sind nicht im Bestand belegt.",
    },
    {
        "id": "mock-2021", "kind": "Probeklausur", "year": 2021, "date": None, "confidence": "confirmed",
        "question_path": None, "solution_path": "info 1 copy/2022/kl/BspLoesungProbeklausur2021 2.pdf",
        "examiner": "Christian Sohler", "duration_minutes": 120, "allowed_aids": "nicht vollständig belegt",
        "tasks": ["Rekurrenzanalyse", "Rucksack-DP-Tabelle", "weitere Aufgaben nur in Lösung dokumentiert"], "points": [],
        "note": "Der Bestand enthält die Beispiellösung, nicht die vollständige Fragenfassung.",
    },
    {
        "id": "mock-2022", "kind": "Probeklausur", "year": 2022, "date": None, "confidence": "confirmed",
        "question_path": "info 1 copy/2022/kl/Probeklausur 2.pdf", "solution_path": "info 1 copy/2022/kl/PK22L.pdf",
        "examiner": "Christian Sohler", "duration_minutes": 180, "allowed_aids": "nicht vollständig belegt",
        "tasks": ["Rekurrenzanalyse", "Tracing", "Graphalgorithmus", "Tracing", "Schleifeninvariante", "Rekurrenz und Induktion", "Algorithmusentwurf", "Dynamische Programmierung", "Graphtransfer"],
        "points": [4, 4, 4, 4, 5, 5, 8, 8, 8], "note": None,
    },
    {
        "id": "mock-2023", "kind": "Probeklausur", "year": 2023, "date": None, "confidence": "confirmed",
        "question_path": "Probeklausur.pdf", "solution_path": "Beispielloesung_Probeklausur.pdf",
        "examiner": "Christian Sohler", "duration_minutes": 180, "allowed_aids": "ein handschriftlich beidseitig beschriebenes DIN-A4-Blatt",
        "tasks": ["GreedyLoadBalancing", "Prim", "Floyd-Warshall", "Union-Find", "Schleifeninvariante", "Rekurrenz und Induktion", "Greedy: Laternen", "Dynamische Programmierung: Mine", "Datenstruktur: Deque-Funktionalität"],
        "points": [4, 4, 4, 4, 5, 5, 8, 8, 8], "note": None,
    },
    {
        "id": "mock-2024", "kind": "Probeklausur", "year": 2024, "date": None, "confidence": "confirmed",
        "question_path": None, "solution_path": "info 1 copy/2024/kl/ProbeklausurLoesung.pdf",
        "examiner": "Christian Sohler", "duration_minutes": 180, "allowed_aids": "ein handschriftlich beidseitig beschriebenes DIN-A4-Blatt",
        "tasks": ["LCS-Tabelle", "LatenessScheduling", "Floyd-Warshall", "Union-Find", "Schleifeninvariante", "Rekurrenz und Induktion", "Divide and Conquer: fehlender Wert", "Dynamische Programmierung: Pausentage", "Greedy: unabhängige Menge"],
        "points": [4, 4, 4, 4, 5, 5, 8, 8, 8], "note": "Nur die Lösungsversion ist vorhanden.",
    },
]


BLUEPRINT = {
    1: ("Tracing", "Sortieren, Greedy/Scheduling, DFS", 4, "Zwischenzustände und Endergebnis", "Tie-Breaker übersehen", "Tracing-Trainer"),
    2: ("Tracing", "Hashing, DFS, Bäume, Union-Find, Rucksack", 4, "alle Zustände in geforderter Reihenfolge", "Darstellungsinvariante verletzen", "Struktur-Trainer"),
    3: ("Tracing", "kürzeste Wege, Floyd-Warshall, Rot-Schwarz-Bäume", 4, "Tabelle/Graph nach jeder Iteration", "Knotenreihenfolge ignorieren", "Graph-/Baum-Trainer"),
    4: ("Tracing", "Union-Find, Prim, Rucksack, MergeSort", 4, "vollständige Zustandsfolge", "Tie-Breaker oder Indexgrenzen", "Tracing-Trainer"),
    5: ("Programmverständnis und Beweis", "Behauptung, Schleifeninvariante, Induktion", 5, "Behauptung, Invariante, IA/IV/IS, Schluss", "Invariante am falschen Programmpunkt", "Beweistrainer"),
    6: ("Rekurrenzbeweis", "asymptotische Schranke und Induktion", 5, "Schranke plus formal geschlossener Induktionsschritt", "nur Master-Theorem nennen", "Rekurrenztrainer"),
    7: ("Algorithmusentwurf", "Greedy oder Divide and Conquer", 8, "Idee, Pseudocode, Laufzeit, Korrektheit", "Optimierungsziel nicht bewiesen", "Entwurfstrainer"),
    8: ("Dynamische Programmierung", "Zustand, Basisfälle, Rekurrenz, Algorithmus", 8, "Definition, Beweis, Bottom-up, Laufzeit", "Zustand unvollständig definiert", "DP-Trainer"),
    9: ("Transfer/Datendstruktur", "Graphtransfer oder eigene Datenstruktur", 8, "Idee, Pseudocode/Operationen, Laufzeit, Beweis", "geforderte Schranke verfehlt", "Transfertrainer"),
}


def write_md(name: str, content: str) -> None:
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    (DOCS_DIR / name).write_text(content.rstrip() + "\n", encoding="utf-8")


def cache_for(doc: dict) -> dict:
    return read_json(CACHE_DIR / f'{doc["id"]}.json', {"pages": []})


def clean_for_fingerprint(text: str) -> str:
    text = text.casefold().split("lösung")[0].split("loesung")[0]
    text = re.sub(r"\d+", "#", text)
    return re.sub(r"[^a-zäöüß#]+", "", text)[:5000]


def page_ranges(pages: list[int]) -> str:
    if not pages:
        return "-"
    pages = sorted(set(pages))
    ranges = []
    start = previous = pages[0]
    for value in pages[1:]:
        if value == previous + 1:
            previous = value
            continue
        ranges.append(str(start) if start == previous else f"{start}-{previous}")
        start = previous = value
    ranges.append(str(start) if start == previous else f"{start}-{previous}")
    return ", ".join(ranges)


def question_method(text: str, task: int | None) -> str:
    low = text.casefold()
    if "dynamische programmierung" in low or (task == 8):
        return "DP-Zustand und Basisfälle definieren, Rekurrenz beweisen, Bottom-up auswerten"
    if "schleifeninvariante" in low:
        return "Behauptung, Schleifeninvariante und vollständige Induktion"
    if "rekursionsgleichung" in low and "induktion" in low:
        return "asymptotische Schranke bestimmen und induktiv beweisen"
    if any(word in low for word in ("führen sie", "wenden sie", "füllen sie", "zeichnen sie")):
        return "Algorithmus deterministisch ausführen und Zwischenzustände dokumentieren"
    if any(word in low for word in ("entwickeln sie", "entwerfen sie")):
        return "Algorithmus entwerfen, Laufzeit analysieren und Korrektheit beweisen"
    return "Aufgabenstellung anhand der angegebenen Methode bearbeiten"


def proof_type(text: str) -> str | None:
    low = text.casefold()
    if "schleifeninvariante" in low:
        return "Schleifeninvariante und vollständige Induktion"
    if "erweiterte induktion" in low or "starke induktion" in low:
        return "starke/erweiterte Induktion"
    if "induktion" in low:
        return "vollständige Induktion"
    if "widerspruch" in low:
        return "Widerspruchsbeweis"
    if "korrektheit" in low:
        return "Korrektheitsbeweis (Methode nicht explizit vorgegeben)"
    return None


def runtime_from(text: str) -> str | None:
    matches = re.findall(r"O\s*\([^)]{1,45}\)", text)
    return matches[0].replace(" ", "") if matches else None


def classify_document(doc: dict) -> None:
    first_text = " ".join(page["text"] for page in cache_for(doc)["pages"][:3]) if doc["extension"] == ".pdf" else ""
    doc["document_category"] = infer_category(doc["path"], first_text)


def build_duplicates(documents: list[dict]) -> tuple[dict, dict[str, str]]:
    by_checksum: dict[str, list[dict]] = defaultdict(list)
    for doc in documents:
        by_checksum[doc["sha256"]].append(doc)
    groups = []
    source_to_group = {}
    for checksum, members in sorted(by_checksum.items()):
        if len(members) < 2:
            continue
        group_id = stable_id("dup-exact", checksum)
        group = {"id": group_id, "type": "exact", "sha256": checksum, "source_ids": [m["id"] for m in members], "paths": [m["path"] for m in members], "relationship": "byteidentische Dateien"}
        groups.append(group)
        for member in members:
            source_to_group[member["id"]] = group_id
    relationships = [
        {"id": "near-probe-2023", "type": "question_solution_pair", "paths": ["Probeklausur.pdf", "Beispielloesung_Probeklausur.pdf"], "relationship": "Fragenfassung und offizielle Beispiellösung"},
        {"id": "near-probe-2022", "type": "question_solution_pair", "paths": ["info 1 copy/2022/kl/Probeklausur 2.pdf", "info 1 copy/2022/kl/PK22L.pdf"], "relationship": "Fragenfassung und Lösungsversion"},
        {"id": "near-lectures-combined", "type": "compiled_collection", "paths": ["Vorlesungen.pdf", "info 1 copy/vorlesungen/"], "relationship": "zusammengeführte Vorlesung gegenüber Einzelfolien"},
        {"id": "near-exercises-combined", "type": "compiled_collection", "paths": ["Uebungen 0-9.pdf", "info 1 copy/2025/", "info 1 copy/u╠êbungen/"], "relationship": "zusammengeführte Übungen gegenüber Einzelblättern"},
        {"id": "near-exam-2024-images", "type": "scan_derivative", "paths": ["info 1 copy/2024/kl/Klausur 2024.pdf", "info 1 copy/2024/kl1/"], "relationship": "PDF-Ausschnitt und ursprüngliche Smartphone-Aufnahmen"},
    ]
    payload = {"schema_version": "1.0.0", "exact_groups": groups, "near_duplicate_relationships": relationships}
    write_json(DATA_DIR / "duplicate-groups.json", payload)
    return payload, source_to_group


def build_questions(documents: list[dict], source_to_dup: dict[str, str]) -> dict:
    records = []
    by_path = {doc["path"]: doc for doc in documents}
    solution_by_question_path = {
        config["question_path"]: by_path[config["solution_path"]]
        for config in EXAM_CONFIGS
        if config["question_path"] and config["solution_path"] and config["solution_path"] in by_path
    }
    manual_2024 = next(config for config in EXAM_CONFIGS if config["id"] == "exam-2024-1")
    eligible_words = ("klausur", "uebung", "übung", "loesung", "lösung", "study_guide", "cheat")
    for doc in documents:
        path_low = doc["path"].casefold()
        if doc["extension"] in {".jpg", ".jpeg"} and "/2024/kl1/" in path_low:
            records.append({
                "id": stable_id("q", doc["path"]), "source_id": doc["id"], "source_file": doc["path"], "page": 1,
                "year": 2024, "task_number": None, "subtask": "Zuordnung offen", "title": "Bildbasierter Klausur-/Lösungsinhalt",
                "topic_tags": [], "difficulty": "unbekannt", "expected_solution_method": "visuelle Zuordnung erforderlich", "expected_runtime": None,
                "expected_proof_type": None, "official_solution_available": False, "solution_source_ids": [],
                "source_authority_level": doc.get("source_authority_level", 2), "duplicate_group_id": source_to_dup.get(doc["id"]),
                "exam_relevance": "hoch", "verification_status": "visual_review_required", "subtasks_detected": [],
            })
            continue
        if doc["extension"] != ".pdf" or "/vorlesungen/" in path_low or doc["path"] == "Vorlesungen.pdf":
            continue
        if not any(word in path_low for word in eligible_words) and doc.get("document_category") not in {"Prüfung", "Probeklausur", "Prüfungslösung", "Übung", "Übungslösung"}:
            continue
        if doc["path"] == manual_2024["question_path"]:
            for number, (title, points) in enumerate(zip(manual_2024["tasks"], manual_2024["points"]), start=1):
                records.append({
                    "id": stable_id("q", f'{doc["path"]}:{number}:{number}'), "source_id": doc["id"], "source_file": doc["path"], "page": number,
                    "year": 2024, "task_number": number, "subtask": "gesamt", "title": f"Aufgabe {number}: {title}",
                    "topic_tags": [title], "difficulty": "hoch" if number >= 7 else "mittel", "expected_solution_method": question_method("", number),
                    "expected_runtime": None, "expected_proof_type": "vollständige Induktion" if number in {5, 6, 8} else ("Korrektheitsbeweis" if number >= 7 else None),
                    "official_solution_available": False, "solution_source_ids": [], "source_authority_level": doc.get("source_authority_level", 1),
                    "duplicate_group_id": source_to_dup.get(doc["id"]), "exam_relevance": "hoch", "verification_status": "verified_against_official_source",
                    "subtasks_detected": ["a", "b", "c", "d"] if number == 8 else (["a", "b", "c"] if number >= 5 else []), "points": points,
                })
            continue
        cache = cache_for(doc)
        found_in_document = False
        for page in cache["pages"]:
            text = page["text"]
            matches = list(re.finditer(r"\bAufgab\s*e?\s*(\d{1,2})\b", text, re.IGNORECASE))
            if not matches:
                continue
            found_in_document = True
            for match in matches:
                number = int(match.group(1))
                segment = text[match.start(): match.start() + 5000]
                topics = detect_topics(segment)
                subtasks = sorted(set(re.findall(r"(?:^|\s)([a-d])\)\s*", segment[:3000], re.IGNORECASE)))
                embedded_solution = bool(doc.get("contains_solutions")) and doc.get("source_authority_level") == 1
                linked_solution = solution_by_question_path.get(doc["path"])
                is_solution_document = "lösung" in path_low or "loesung" in path_low or "beispiello" in path_low
                solution_ids = ([doc["id"]] if is_solution_document else []) + ([linked_solution["id"]] if linked_solution else [])
                official_solution = embedded_solution or bool(linked_solution) or (is_solution_document and doc.get("source_authority_level") == 1)
                fingerprint = clean_for_fingerprint(segment)
                records.append({
                    "id": stable_id("q", f'{doc["path"]}:{page["page"]}:{number}'), "source_id": doc["id"], "source_file": doc["path"],
                    "page": page["page"], "year": doc.get("document_year"), "task_number": number, "subtask": "gesamt",
                    "title": f"Aufgabe {number}: {', '.join(topics[:3]) if topics else 'Thema aus Quelle zu verifizieren'}",
                    "topic_tags": topics, "difficulty": "hoch" if number >= 7 and "klausur" in path_low else "mittel",
                    "expected_solution_method": question_method(segment, number), "expected_runtime": runtime_from(segment), "expected_proof_type": proof_type(segment),
                    "official_solution_available": official_solution,
                    "solution_source_ids": sorted(set(solution_ids or ([doc["id"]] if embedded_solution else []))), "source_authority_level": doc.get("source_authority_level", 2),
                    "duplicate_group_id": source_to_dup.get(doc["id"]), "exam_relevance": "hoch" if "klausur" in path_low else "mittel",
                    "verification_status": doc.get("verification_status", "extraction_uncertain"), "subtasks_detected": subtasks,
                    "_fingerprint": hashlib.sha1(fingerprint.encode("utf-8")).hexdigest() if fingerprint else None,
                })
        if not found_in_document and doc.get("extracted_characters", 0) < 100 and any(word in path_low for word in ("klausur", "loesung", "lösung")):
            for page in cache["pages"]:
                records.append({
                    "id": stable_id("q", f'{doc["path"]}:{page["page"]}:visual'), "source_id": doc["id"], "source_file": doc["path"], "page": page["page"],
                    "year": doc.get("document_year"), "task_number": None, "subtask": "Zuordnung offen", "title": "Bildbasierter Fragen- oder Lösungsinhalt",
                    "topic_tags": [], "difficulty": "unbekannt", "expected_solution_method": "visuelle Prüfung erforderlich", "expected_runtime": None,
                    "expected_proof_type": None, "official_solution_available": False, "solution_source_ids": [],
                    "source_authority_level": doc.get("source_authority_level", 2), "duplicate_group_id": source_to_dup.get(doc["id"]),
                    "exam_relevance": "hoch", "verification_status": "visual_review_required", "subtasks_detected": [], "_fingerprint": None,
                })
    by_fingerprint = defaultdict(list)
    for record in records:
        if record.get("_fingerprint"):
            by_fingerprint[record["_fingerprint"]].append(record)
    duplicate_question_groups = []
    for fingerprint, members in by_fingerprint.items():
        if len(members) < 2:
            continue
        group_id = stable_id("qdup", fingerprint)
        duplicate_question_groups.append({"id": group_id, "question_ids": [item["id"] for item in members], "type": "gleicher normalisierter Aufgabentext"})
        for item in members:
            item["duplicate_group_id"] = group_id
    for record in records:
        record.pop("_fingerprint", None)
    payload = {"schema_version": "1.0.0", "question_count": len(records), "questions": records, "duplicate_question_groups": duplicate_question_groups}
    write_json(DATA_DIR / "question-inventory.json", payload)
    return payload


def build_exams(documents: list[dict], questions: dict) -> dict:
    by_path = {doc["path"]: doc for doc in documents}
    q_by_source_task = defaultdict(list)
    for question in questions["questions"]:
        q_by_source_task[(question["source_id"], question["task_number"])].append(question["id"])
    records = []
    for config in EXAM_CONFIGS:
        question_doc = by_path.get(config["question_path"]) if config["question_path"] else None
        solution_doc = by_path.get(config["solution_path"]) if config["solution_path"] else None
        task_records = []
        for index, title in enumerate(config["tasks"], start=1):
            points = config["points"][index - 1] if index <= len(config["points"]) else None
            format_name = "Tracing" if index <= 4 else ("Beweis" if index in {5, 6} else ("Dynamische Programmierung" if index == 8 else "Entwurf/Transfer"))
            qids = q_by_source_task.get((question_doc["id"], index), []) if question_doc else []
            task_records.append({
                "number": index, "points": points, "topic": title, "format": format_name,
                "requested_deliverables": BLUEPRINT.get(index, (None, None, None, "aus Quelle", None, None))[3],
                "algorithm": title, "proof_type": "Induktion/Korrektheit" if index >= 5 else None,
                "expected_runtime": "aufgabenabhängig", "tie_breaker_rules": "in der Aufgabenstellung prüfen" if index <= 4 else None,
                "question_ids": qids,
            })
        records.append({
            "id": config["id"], "kind": config["kind"], "year": config["year"], "date": config["date"], "semester": "Sommersemester",
            "examiner": config["examiner"], "confidence": config["confidence"], "task_count": len(config["tasks"]),
            "total_points": sum(config["points"]) if config["points"] else None, "duration_minutes": config["duration_minutes"],
            "allowed_aids": config["allowed_aids"], "question_source_id": question_doc["id"] if question_doc else None,
            "solution_source_ids": [solution_doc["id"]] if solution_doc else [], "official_solution_available": bool(solution_doc),
            "tasks": task_records, "note": config["note"],
        })
    payload = {"schema_version": "1.0.0", "exam_set_count": len(records), "real_exam_count": sum(r["kind"] == "reale Prüfung" for r in records), "mock_exam_count": sum(r["kind"] == "Probeklausur" for r in records), "exams": records}
    write_json(DATA_DIR / "exam-corpus.json", payload)
    return payload


def build_blueprint(exams: dict) -> dict:
    nine_task_real = [exam for exam in exams["exams"] if exam["kind"] == "reale Prüfung" and exam["task_count"] == 9]
    entries = []
    for number, values in BLUEPRINT.items():
        fmt, history, points, deliverables, mistakes, trainer = values
        historical = [exam["tasks"][number - 1]["topic"] for exam in nine_task_real if len(exam["tasks"]) >= number]
        entries.append({
            "task_number": number, "likely_formats": [fmt], "historical_topics": historical, "frequency_in_nine_task_real_exams": len(historical),
            "sample_size": len(nine_task_real), "typical_points": points, "required_answer_components": deliverables,
            "common_mistakes": [mistakes], "suitable_training_modes": [trainer], "priority": "sehr hoch" if number in {5, 6, 8} else "hoch",
            "confidence": "strongly supported", "scope_note": "Gilt für das bestätigte Neun-Aufgaben-Regime; 2021 ist eine dokumentierte Ausnahme.",
        })
    payload = {
        "schema_version": "1.0.0", "verdict": "Das Modell 1-9 ist für die Präsenzklausuren 2020/2022 und die bildlich geprüfte Klausur 2024 stark gestützt, aber nicht universell.",
        "exception": "Die reale Klausur 2021 hatte 6 Aufgaben, 60 Punkte und 120 Minuten.", "nine_task_real_exam_sample_size": len(nine_task_real), "tasks": entries,
    }
    write_json(DATA_DIR / "exam-blueprint.json", payload)
    return payload


def build_topics(documents: list[dict], questions: dict) -> dict:
    page_index = []
    for doc in documents:
        if doc["extension"] != ".pdf":
            continue
        for page in cache_for(doc)["pages"]:
            if page["text"]:
                page_index.append((doc, page["page"], page["text"].casefold()))
    topic_records = []
    not_found = []
    for name, aliases in TOPIC_CATALOG.items():
        matches = defaultdict(list)
        for doc, page, text in page_index:
            if any(alias.casefold() in text for alias in aliases):
                matches[doc["id"]].append(page)
        if not matches:
            not_found.append({"name": name, "coverage_status": "nicht im extrahierten Text gefunden", "verification_status": "visual_review_required"})
            continue
        refs = []
        for source_id, pages in matches.items():
            doc = next(item for item in documents if item["id"] == source_id)
            refs.append({"source_id": source_id, "path": doc["path"], "pages": sorted(set(pages)), "authority_level": doc.get("source_authority_level", 2)})
        official_refs = [ref for ref in refs if ref["authority_level"] == 1]
        exercise_refs = [ref for ref in refs if "bung" in ref["path"].casefold() or "╠êbung" in ref["path"].casefold()]
        appearances = sorted({f'{q.get("year") or "?"}/A{q["task_number"]}' for q in questions["questions"] if name in q["topic_tags"] and q["task_number"]})
        topic_records.append({
            "id": stable_id("topic", name), "name": name, "source_refs": refs, "official_source_refs": official_refs,
            "exercise_source_refs": exercise_refs, "exam_appearances": appearances, "importance": "sehr hoch" if len(appearances) >= 3 else ("hoch" if appearances else "mittel"),
            "prerequisites": ["Algorithmen und Berechnungsprobleme"] if name not in {"Algorithmen und Berechnungsprobleme", "Pseudocode"} else [],
            "related_algorithms": [name], "proof_techniques": ["Induktion"] if any(word in name for word in ("Dynamische", "Rekursion", "Korrekt")) else [],
            "typical_mistakes": ["Notation oder Randfälle nicht gemäß Originalquelle behandeln"],
            "coverage_status": "offiziell belegt" if official_refs else "nur sekundär/generiert belegt", "verification_status": "official_verified" if official_refs else "generated_unverified",
        })
    payload = {"schema_version": "1.0.0", "topic_count": len(topic_records), "topics": topic_records, "expected_but_not_textually_found": not_found}
    write_json(DATA_DIR / "topic-map.json", payload)
    return payload


def build_conflicts(documents: list[dict]) -> dict:
    by_path = {doc["path"]: doc for doc in documents}
    conflicts = [
        {
            "id": "conflict-exam-structure", "topic": "Klausurstruktur",
            "higher_authority_claim": "Die reale Klausur 2021 hat 6 Aufgaben, 60 Punkte und 120 Minuten.",
            "higher_authority_source": {"source_id": by_path["info 1 copy/2021/kl/Klausur2021.pdf"]["id"], "page": 1},
            "lower_authority_claim": "Erzeugte Leitfäden beschreiben Aufgabe 1 bis 9 als allgemeines Sohler-Schema.",
            "lower_authority_sources": [
                {"source_id": by_path["struktur.pdf"]["id"], "page": 3},
                {"source_id": by_path["AlgoDat_Exam_Study_Guide.pdf"]["id"], "page": 1},
            ],
            "resolution": "Das Neun-Aufgaben-Modell wird nur als Regime mit dokumentierter 2021-Ausnahme geführt.", "status": "conflict_detected",
        },
        {
            "id": "conflict-2024-attribution", "topic": "Prüferzuordnung 2024",
            "higher_authority_claim": "Das vorhandene Foto-PDF enthält kein Deckblatt und keine Prüferangabe.",
            "higher_authority_source": {"source_id": by_path["info 1 copy/2024/kl/Klausur 2024.pdf"]["id"], "page": 1},
            "lower_authority_claim": "Die Aufgabenfolge ähnelt stark dem Sohler-Schema.", "lower_authority_sources": [],
            "resolution": "Prüfer bleibt unbekannt; Ähnlichkeit wird nicht als Autorennachweis verwendet.", "status": "extraction_uncertain",
        },
    ]
    payload = {"schema_version": "1.0.0", "conflicts": conflicts}
    write_json(DATA_DIR / "source-conflicts.json", payload)
    return payload


def markdown_table(headers: list[str], rows: list[list[object]]) -> str:
    head = "| " + " | ".join(headers) + " |"
    rule = "| " + " | ".join("---" for _ in headers) + " |"
    body = ["| " + " | ".join(str(value).replace("|", "\\|").replace("\n", " ") for value in row) + " |" for row in rows]
    return "\n".join([head, rule, *body])


def build_docs(manifest: dict, duplicates: dict, questions: dict, exams: dict, blueprint: dict, topics: dict, conflicts: dict) -> None:
    documents = manifest["documents"]
    pdfs = [doc for doc in documents if doc["extension"] == ".pdf"]
    images = [doc for doc in documents if doc["extension"] in {".jpg", ".jpeg", ".png"}]
    total_pages = sum(doc.get("page_count") or 0 for doc in pdfs)
    ignored = [doc for doc in documents if doc["ignored_for_content"]]
    text_poor = [doc for doc in pdfs if doc.get("extracted_characters", 0) < 100]
    validation = read_json(DATA_DIR / "validation-results.json", {})
    validation_text = (
        f"**{validation.get('passed_count')}/{validation.get('check_count')} Prüfungen bestanden, 0 Fehler**"
        if validation.get("passed") else "Noch kein erfolgreicher abschließender Validierungslauf dokumentiert"
    )
    manifest_rows = [[doc["id"], doc["path"], doc["extension"] or "-", doc["size_bytes"], doc.get("page_count") or "-", doc.get("source_authority_level") or "-", doc.get("document_category") or ("ignoriert" if doc["ignored_for_content"] else "-"), doc["sha256"][:12]] for doc in documents]
    write_md("SOURCE_MANIFEST.md", f"""# Quellenmanifest

Stand: {date.today().isoformat()}. Inventarisiert wurden **{len(documents)} Dateien**, darunter **{len(pdfs)} PDFs** mit **{total_pages} Seiten** und **{len(images)} Bilddateien**. Keine Quelldatei wurde verändert.

{markdown_table(["ID", "Relativer Pfad", "Typ", "Bytes", "Seiten", "Autorität", "Kategorie", "SHA-256 (kurz)"], manifest_rows)}

Die {len(ignored)} `.DS_Store`-Dateien sind im JSON manifestiert, aber inhaltlich ignoriert. Vollständige Prüfsummen und Maschinenmetadaten stehen in `data/source-manifest.json`.
""")
    write_md("SOURCE_AUTHORITY_POLICY.md", """# Quellenautorität

1. Offizielle Primärquellen: Vorlesungen, Übungsblätter/-lösungen, Klausuren, Probeklausuren und klar universitär attribuierte Dateien.
2. Studentische oder kursnahe Zusammenfassungen.
3. Erzeugte Analysedokumente (`struktur.pdf`, `strategien.pdf`, `Konzepte.pdf`, `algorithmen.pdf`).
4. Erzeugte Lernleitfäden und Spickzettel.

Bei Konflikten gewinnt die höhere Stufe nicht stillschweigend: Beide Aussagen, Dateipfade und Seiten werden in `source-conflicts.json` festgehalten. Unklare Attribution bleibt unklar. Ein Dateiname allein genügt nicht als Beleg für „offiziell“.
""")
    low_rows = [[doc["path"], doc["page_count"], doc.get("extracted_characters", 0), page_ranges(doc.get("visual_review_pages", [])), doc.get("failure_reason") or "kein technischer Fehler"] for doc in text_poor]
    write_md("EXTRACTION_REPORT.md", f"""# Extraktionsbericht

Alle **{len(pdfs)} PDFs** wurden seitenweise verarbeitet; zusammen **{total_pages} Seiten**. Technisch unlesbare PDFs: **0**. Für jede Seite liegen Zeichen-/Wortzahl, Bildzahl, Fehler und Visual-Review-Flag im reproduzierbaren Cache `tmp/pdfs/` vor.

Normale Textextraktion war bei den folgenden PDFs praktisch leer; automatische OCR stand lokal nicht zur Verfügung. Die prüfungsrelevante Klausur 2024 wurde deshalb vollständig gerendert und visuell geprüft.

{markdown_table(["Datei", "Seiten", "Zeichen", "visuell zu prüfen", "Fehler"], low_rows)}

Wichtig: „lesbar“ bedeutet technisch öffnbar. Bildbasierte Handschrift oder Diagramme sind erst nach visueller Prüfung semantisch verifiziert. Die 2024-Klausurseiten 1-9 wurden geprüft; übrige textarme Lösungsscans bleiben `visual_review_required`.
""")
    exact_rows = [[g["id"], len(g["paths"]), "<br>".join(g["paths"])] for g in duplicates["exact_groups"]]
    near_rows = [[g["id"], g["type"], g["relationship"], "<br>".join(g["paths"])] for g in duplicates["near_duplicate_relationships"]]
    write_md("DUPLICATE_REPORT.md", f"""# Duplikatbericht

Es wurden **{len(duplicates['exact_groups'])} byteidentische Gruppen** erkannt. Byteidentische Dateien bleiben im Manifest erhalten; eine kanonische Auswahl darf Quellenbeziehungen nicht vernichten.

## Exakte Gruppen

{markdown_table(["Gruppe", "Dateien", "Pfade"], exact_rows)}

## Nahe Duplikate und Sammlungsbeziehungen

{markdown_table(["Gruppe", "Typ", "Beziehung", "Pfade/Bestände"], near_rows)}
""")
    exam_rows = [[e["id"], e["kind"], e["year"], e["examiner"] or "unbekannt", e["task_count"], e["total_points"] or "unbekannt", e["duration_minutes"] or "unbekannt", e["confidence"]] for e in exams["exams"]]
    task_matrix = [[e["id"], *[t["topic"] if i < len(e["tasks"]) else "-" for i, t in enumerate(e["tasks"][:9])]] for e in exams["exams"]]
    write_md("EXAM_CORPUS_ANALYSIS.md", f"""# Analyse des Klausurkorpus

Der Bestand erlaubt die Trennung von **{exams['real_exam_count']} realen Prüfungssets** (davon ein nur plausibel datiertes Lösungspaket) und **{exams['mock_exam_count']} Probeklausuren**. Alle eindeutig attribuierten realen Klausuren 2020-2022 nennen Christian Sohler. Für 2024 fehlt das Deckblatt; eine Sohler-Zuordnung wäre nur eine unbelegte Inferenz. Nicht-Sohler-Klausuren sind im Bestand nicht sicher identifiziert, daher ist ein Prüfervergleich nicht möglich.

{markdown_table(["ID", "Art", "Jahr", "Prüfer", "Aufgaben", "Punkte", "Minuten", "Evidenz"], exam_rows)}

## Zentrale Befunde

- 2020 (zweite Klausur) und beide Klausuren 2022 bestätigen 9 Aufgaben, 50 Punkte, 180 Minuten und 4/4/4/4/5/5/8/8/8 Punkte.
- Die visuell geprüfte Klausur 2024 bestätigt dieselbe Aufgaben- und Punktefolge; Dauer und Hilfsmittel sind wegen des fehlenden Deckblatts unbekannt.
- 2021 ist eine echte Ausnahme: 6 Aufgaben, 60 Punkte, 120 Minuten und digitales Open-Material-Format.
- Im Neun-Aufgaben-Regime sind A5 Schleifeninvariante, A6 Rekurrenz+Induktion und A8 DP außerordentlich stabil. A1-A4 bleiben Tracing, aber die konkrete Algorithmuszuordnung rotiert.
- Probeklausuren sind strukturell wertvoll, dürfen aber nicht als Nachweis dafür dienen, dass ein Thema tatsächlich in einer realen Klausur vorkam.

## Aufgabenmatrix (Kurzfassung)

{markdown_table(["Set", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9"], task_matrix)}
""")
    bp_rows = [[t["task_number"], ", ".join(t["likely_formats"]), "; ".join(t["historical_topics"]), t["typical_points"], t["required_answer_components"], t["priority"], t["confidence"]] for t in blueprint["tasks"]]
    write_md("EXAM_BLUEPRINT.md", f"""# Verifiziertes Klausur-Blueprint

**Urteil:** {blueprint['verdict']} {blueprint['exception']}

{markdown_table(["Aufgabe", "Format", "historische Themen", "typ. Punkte", "Antwortbestandteile", "Priorität", "Sicherheit"], bp_rows)}

Das Produkt muss deshalb Profile pro Prüfungsregime statt eine zeitlose „Naturgesetz“-Struktur verwenden. Standardprofil: neun Aufgaben; Ausnahmemodell: 2021.
""")
    coverage_rows = [[t["name"], t["coverage_status"], len(t["official_source_refs"]), len(t["exercise_source_refs"]), ", ".join(t["exam_appearances"][:8]) or "-", t["importance"]] for t in topics["topics"]]
    missing_rows = [[t["name"], t["coverage_status"], t["verification_status"]] for t in topics["expected_but_not_textually_found"]]
    write_md("TOPIC_COVERAGE_MATRIX.md", f"""# Themenabdeckung

Die Matrix enthält **{topics['topic_count']} textuell belegte Themen**. Seitenlisten stehen vollständig in `data/topic-map.json`; zusammengeführte und einzelne Vorlesungsdateien werden nicht als unabhängige Evidenz gezählt.

{markdown_table(["Thema", "Status", "offizielle Quellen", "Übungsquellen", "Klausurtreffer", "Bedeutung"], coverage_rows)}

## Erwartet, aber nicht zuverlässig im extrahierten Text gefunden

{markdown_table(["Thema", "Status", "Prüfbedarf"], missing_rows) if missing_rows else 'Keine.'}

Fehlende Texttreffer bedeuten nicht automatisch, dass ein Thema fehlt: Formeln, Scans und Ligaturfehler können Suchbegriffe verdecken. Diese Fälle benötigen Folien-/Bildprüfung.
""")
    status_counts = Counter(q["verification_status"] for q in questions["questions"])
    write_md("QUESTION_CORPUS_AUDIT.md", f"""# Audit des Fragenkorpus

Inventarisiert wurden **{questions['question_count']} aufgaben- oder seitenbezogene Datensätze** und **{len(questions['duplicate_question_groups'])} normalisierte Aufgabendubletten-Gruppen**. Ein Datensatz ist keine Behauptung, dass der volle urheberrechtlich geschützte Aufgabentext in die spätere Anwendung kopiert werden darf.

Verifikationsstatus: {', '.join(f'`{key}`={value}' for key, value in sorted(status_counts.items()))}.

Jeder Datensatz enthält stabile ID, Quelldatei, exakte Seite, Jahr (falls belegt), Aufgaben-/Teilaufgabenbezug, Themen, Lösungsweg, Laufzeit-/Beweistyp, Autorität, Duplikatgruppe und Prüfstatus. Bildbasierte Lösungsseiten ohne sichere Aufgabenzuordnung sind bewusst mit `task_number: null` und `visual_review_required` erfasst.

Für Trainingszwecke sind Tracing-Aufgaben, Beweisaufgaben, Entwurfsaufgaben und zeitgeeignete Klausursets anhand `expected_solution_method` und `exam_relevance` filterbar. Vollständige Daten: `data/question-inventory.json`.
""")
    write_md("CONTENT_RELIABILITY_POLICY.md", """# Verlässlichkeitspolitik

Jedes künftige Lernobjekt muss `source_id`, Seite/Foliennummer, Autoritätsstufe, Verifikationsstatus, Konflikthinweis und `last_reviewed` tragen. Zulässige Statuswerte: `official_verified`, `verified_against_official_source`, `official_solution_available`, `unofficial_solution_only`, `generated_unverified`, `conflict_detected`, `extraction_uncertain`, `visual_review_required`.

Erzeugte Leitfäden liefern Suchbegriffe und didaktische Ideen, aber keine kanonische Wahrheit. Lösungen werden erst veröffentlicht, wenn sie aus einer offiziellen Lösung stammen oder gegen eine Primärquelle fachlich geprüft wurden. Konflikte werden versioniert, nicht überschrieben. Bildseiten gelten bis zur Sichtprüfung nicht als textuell verifiziert.
""")
    write_md("PRODUCT_SPECIFICATION.md", """# Produktspezifikation

Ziel ist eine deutschsprachige, lokale, offline-fähige Prüfungsvorbereitung mit nachvollziehbaren Quellen und aktiver Reproduktion.

## Kernmodule

1. Dashboard: Bereitschaft, Beherrschung pro Aufgabe/Thema, Fehler, nächste Aktion, Prüfungscountdown.
2. Prüfungsstruktur: Regimeabhängige A1-A9-Sicht mit Häufigkeit, Punkten, Strategie und Training.
3. Themenseiten: Intuition, Definition, Originalnotation, Pseudocode, Beispiel, Korrektheit, Laufzeit, Speicher, Fehler, Quellen, Übungen.
4. Tracing-Trainer: aktive Eingabe von Zwischenzuständen für Sortieren, Greedy, Graphen, Hashing, Union-Find, DP und Rot-Schwarz-Bäume.
5. Beweistrainer: Induktion, Schleifeninvarianten, Rekurrenzen, Greedy-, DP- und Graphbeweise.
6. Entwurfstrainer: Greedy, Divide and Conquer, DP, Graphtransfer, Datenstrukturen.
7. Klausursimulator: profilierte Dauer/Punkte, Sperrmodus, Rubrik, Teilpunkte, Fehlerdiagnose.
8. Fehleranalyse: die vorgegebenen Fehlercodes plus quellenspezifische Notiz.
9. Beherrschung: getrennt nach Erkennen, Tracing, Erklären, Implementieren, Laufzeit, Beweis, Transfer und Zeitdruck.
10. Spickzettel-Builder: Schwächen, Formeln, Beweisskelette, A4-Vorder-/Rückseite; „muss im Kopf sein“ getrennt von „aufs Blatt“.

## Nichtziele der ersten Produktphase

Kein Backend, keine Anmeldung, kein gemeinsames Bearbeiten und keine ungeprüft generierten Musterlösungen. Barrierefreiheit, Tastaturbedienung und mobile Lesbarkeit sind Abnahmekriterien, keine spätere Kür.
""")
    write_md("INFORMATION_ARCHITECTURE.md", """# Informationsarchitektur

```text
Start
├─ Dashboard
├─ Klausurprofile
│  ├─ Standard 9 Aufgaben
│  └─ historische Ausnahme 2021
├─ Aufgaben 1-9
│  ├─ Muster und Strategie
│  └─ Training / historische Fragen
├─ Themen
│  ├─ Grundlagen und Beweise
│  ├─ Entwurfsparadigmen
│  ├─ Datenstrukturen
│  └─ Graphen
├─ Trainer
│  ├─ Tracing
│  ├─ Beweise
│  └─ Entwurf
├─ Klausursimulator
├─ Fehler und Beherrschung
├─ Spickzettel
└─ Quellen und Konflikte
```

Jede Inhaltsseite verlinkt sowohl in die Themenhierarchie als auch zur passenden Aufgabennummer. Quellenbelege öffnen eine read-only Quellenkarte mit Datei, Seite, Autorität, Verifikationsstatus und Konflikten.
""")
    schema_rows = [
        ["SourceDocument", "id, path, checksum, authority, category, metadata, verification", "id/path/checksum", "Quelle; versioniert über checksum"],
        ["SourcePage", "id, sourceId, page, textStats, visualStatus", "id/sourceId/page", "Seitenanker"],
        ["Topic", "id, name, prerequisites, sourceRefs, status", "id/name/sourceRefs", "kanonischer Themenbegriff"],
        ["Algorithm", "id, topicId, name, pseudocode, runtime, memory, sourceRefs", "id/name/sourceRefs", "Originalnotation bewahren"],
        ["DataStructure", "id, invariants, operations, complexities, sourceRefs", "id/name/sourceRefs", "Operationen separat versionieren"],
        ["Definition", "id, term, statement, sourceRefs", "id/term/statement", "keine erzeugte Definition ohne Status"],
        ["Theorem", "id, statement, assumptions, sourceRefs", "id/statement/sourceRefs", "Version pro Notationsvariante"],
        ["ProofTemplate", "id, type, steps, applicability, sourceRefs", "id/type/steps", "Template ist keine konkrete Lösung"],
        ["Exercise", "id, sourceRef, topics, difficulty, duplicateGroupId", "id/sourceRef/topics", "Originaltext optional"],
        ["Exam", "id, year, kind, examiner, duration, points, sourceIds", "id/kind/sourceIds", "Prüfungsregime speichern"],
        ["ExamQuestion", "id, examId, task, subtask, points, tags, sourceRef", "id/examId/task/sourceRef", "Duplikate über Gruppe"],
        ["Solution", "id, questionId, content, sourceRefs, status", "id/questionId/status", "offiziell/unoffiziell trennen"],
        ["Rubric", "id, questionId, criteria, maxPoints, sourceRefs", "id/questionId/criteria", "deterministische Teilpunkte"],
        ["CommonMistake", "id, topicIds, errorCode, description, sourceRefs", "id/errorCode/description", "fachlich überprüft"],
        ["LearningModule", "id, topicIds, outcomes, contentRefs, version", "id/outcomes/contentRefs", "read-only Inhaltsversion"],
        ["PracticeAttempt", "id, userLocalId, itemId, answers, score, timestamp", "id/itemId/timestamp", "lokal; Inhaltversion referenzieren"],
        ["MasteryRecord", "id, topicOrTaskId, dimensions, evidence, updatedAt", "id/dimensions", "ableitbar neu berechnen"],
        ["ErrorRecord", "id, attemptId, category, evidence, resolvedAt", "id/attemptId/category", "keine Diagnose ohne Evidenz"],
        ["StudySession", "id, startedAt, endedAt, activityIds, summary", "id/startedAt", "lokal aggregieren"],
        ["CheatSheetItem", "id, sourceContentId, kind, priority, placement", "id/sourceContentId/kind", "muss-wissen-Flag getrennt"],
    ]
    write_md("DATA_MODEL.md", f"""# Datenmodell

Alle IDs sind stabile, sprechende Präfix-IDs; Inhaltsobjekte tragen `schemaVersion`, `contentVersion`, `sourceRefs`, `verificationStatus`, `lastReviewed` und optional `duplicateGroupId`. Zeitwerte sind ISO-8601. Löschen erfolgt im lokalen Fortschritt weich, kanonische Inhalte werden unveränderlich versioniert.

{markdown_table(["Schema", "Felder (Typen aus Kontext: string/list/object/number)", "Pflichtfelder", "Versionierung/Duplikate"], schema_rows)}

Beispiel: `ExamQuestion {{ id: "q-…", examId: "exam-2024-1", task: 8, sourceRef: {{sourceId: "src-…", page: 8}}, verificationStatus: "verified_against_official_source", duplicateGroupId: null }}`.
""")
    write_md("TECHNICAL_ARCHITECTURE.md", """# Technische Architektur

Die vorgeschlagene Richtung ist geeignet: React, TypeScript im Strict-Modus und Vite liefern eine statische, GitHub-Pages-kompatible PWA. Inhalte liegen als validierte, versionierte JSON-Pakete vor; Lernfortschritt liegt lokal in IndexedDB. KaTeX rendert Formeln. Deterministische SVG-Komponenten eignen sich für Bäume/Graphen, Canvas nur für sehr große Szenen.

Empfohlene Schichten: `content` (read-only JSON + Schema-Validierung), `domain` (Scoring/Mastery), `persistence` (IndexedDB + Migrationen), `features`, `ui`, `pwa`. Zod oder JSON Schema validiert am Build-Eingang. Eine kleine Repository-Schnittstelle hält einen späteren Backend-Wechsel offen. Kein Backend und keine Authentifizierung in Phase 1.

Risiken: GitHub-Pages-Basispfad, PWA-Cache-Invaliderung, IndexedDB-Migrationen, deterministisches Scoring und Trennung von Inhalts-/Fortschrittsversion. Diese Punkte erhalten frühe Integrations- und Migrationstests.
""")
    write_md("TESTING_STRATEGY.md", """# Teststrategie

- Datenvertrag: JSON-Schema/Enums, referenzielle Integrität, Seitenpfade, Quellenautorität.
- Unit-Tests: Scoring, Teilpunkte, Tie-Breaker, Mastery-Updates, Fehlerklassifikation, Migrationen.
- Property-Tests: deterministische Algorithmus-Traces, Invarianten und reversible Zustandsübergänge.
- Goldene Tests: offizielle Klausur-/Übungsbeispiele mit festem Ergebnis; keine generierten Wahrheiten.
- Komponenten-/A11y-Tests: Tastatur, Fokus, Kontrast, Screenreader-Namen, KaTeX-Fallback.
- E2E: Offline-Start, GitHub-Pages-Basispfad, Prüfungstimer, Lockout, Wiederaufnahme, Export/Import.
- Visuelle Regression: Graphen, Matrizen, Bäume, DP-Tabellen auf Mobil/Desktop.

Freigabe: kein neuer Phasenstart bei fehlerhafter Datenvalidierung; kritische Domainlogik benötigt Branch- und Mutationsabdeckung.
""")
    write_md("DEVELOPMENT_ROADMAP.md", """# Entwicklungsfahrplan

1. Phase 0a Nachprüfung: verbleibende textarme Lösungen und Bildserie visuell/OCR-gestützt zuordnen; unsichere Fragen schließen.
2. Phase 1 Fundament: Vite/React/TS/PWA, Schema-Paket, Inhaltsloader, IndexedDB-Migrationen, Quellenansicht.
3. Phase 2 Kernlernen: Themen- und Aufgaben-1-bis-9-Navigation, aktive Recall-Karten, Fehlercodes.
4. Phase 3 Trainer: zuerst stabile A5/A6/A8-Formate, dann Tracing A1-A4, danach A7/A9-Transfer.
5. Phase 4 Simulator: Profile 2020/2022/2024 sowie 2021-Ausnahme, Rubriken, Teilpunkte, Zeitmodus.
6. Phase 5 Spickzettel und PWA-Härtung: Offline, Export/Import, Accessibility, Performance.

Gate je Phase: Datenvalidierung grün, Quellenabdeckung dokumentiert, Scoringtests grün, keine ungeprüften Lösungen im Release-Paket.
""")
    write_md("PHASE_0_COMPLETION_REPORT.md", f"""# Phase-0-Abschlussbericht

## Kennzahlen

- Dateien: **{len(documents)}**
- PDFs / PDF-Seiten: **{len(pdfs)} / {total_pages}**
- Bilddateien: **{len(images)}**
- Prüfungssets: **{exams['exam_set_count']}** ({exams['real_exam_count']} real, {exams['mock_exam_count']} Probe; ein reales Set nur plausibel datiert)
- vertretene Prüfungsjahre: **2020, 2021, 2022, 2023, 2024**; 2025 enthält Übungen, aber keine gefundene Klausur
- Fragen-/Seiteninventar: **{questions['question_count']}**
- exakte Duplikatgruppen: **{len(duplicates['exact_groups'])}**; dokumentierte Nahe-Beziehungen: **{len(duplicates['near_duplicate_relationships'])}**
- technisch unlesbare Dateien: **0**
- textarme PDFs: **{len(text_poor)}**; diese bleiben teilweise visuell zuzuordnen

## Verifizierte Struktur

Neun Aufgaben mit 50 Punkten und dem Muster Tracing (A1-A4), Invariante (A5), Rekurrenz (A6), Entwurf (A7), DP (A8), Transfer/Datenstruktur (A9) sind für das Präsenzregime stark gestützt. 2021 widerspricht einer universellen Regel: sechs Aufgaben, 60 Punkte, 120 Minuten.

## Höchste Lernprioritäten

1. Schleifeninvarianten und vollständige Induktion.
2. Rekurrenzen, asymptotische Schranken und Induktionsbeweise.
3. Dynamische Programmierung mit Zustand/Basis/Rekurrenz/Beweis/Bottom-up/Laufzeit.
4. Deterministisches Tracing von Graphalgorithmen, Rot-Schwarz-Bäumen und Union-Find.
5. Algorithmusentwurf mit Laufzeit- und Korrektheitsbeweis (Greedy, Divide and Conquer, Graphtransfer).

## Größte Inhaltsrisiken

1. Bildbasierte bzw. handschriftliche Lösungsscans ohne OCR und sichere Aufgabenzuordnung.
2. Fehlendes Deckblatt der Klausur 2024: Prüfer, Dauer und Hilfsmittel unbekannt.
3. Erzeugte Leitfäden überverallgemeinern das Neun-Aufgaben-Modell; 2021 ist Gegenbeleg.
4. Viele byteidentische Kopien in verschiedenen Jahresordnern verfälschen naive Häufigkeitszählungen.
5. Für 2023 und 2025 fehlt eine eindeutig reale Klausur; Probeklausuren dürfen die Lücke nicht kaschieren.

## Validierung

{validation_text}. Der genaue letzte Lauf steht in `data/validation-results.json`.

## Erzeugte Dateien

`README.md`, `AGENTS.md`, `.gitignore`; alle 16 Markdown-Dateien unter `docs/`; die sieben geforderten JSON-Dateien sowie `validation-results.json` unter `data/`; `scan_sources.py`, `extract_pdf_metadata.py`, `validate_phase0_data.py`, `phase0_common.py` und `build_phase0.py` unter `scripts/`.

Empfohlene nächste Phase ist **Phase 0a: visuelle/OCR-Nachprüfung der verbleibenden textarmen Lösungen**, anschließend Phase 1 mit Schema-/PWA-Fundament. Es wurde keine Produktionsoberfläche implementiert und keine Quelldatei verändert.
""")


def main() -> None:
    manifest = read_json(DATA_DIR / "source-manifest.json")
    if not manifest:
        raise SystemExit("source-manifest.json fehlt. Zuerst Scan und Extraktion ausführen.")
    documents = manifest["documents"]
    for document in documents:
        classify_document(document)
    write_json(DATA_DIR / "source-manifest.json", manifest)
    duplicates, source_to_dup = build_duplicates(documents)
    questions = build_questions(documents, source_to_dup)
    exams = build_exams(documents, questions)
    blueprint = build_blueprint(exams)
    topics = build_topics(documents, questions)
    conflicts = build_conflicts(documents)
    build_docs(manifest, duplicates, questions, exams, blueprint, topics, conflicts)
    print(f"Phase-0-Artefakte erzeugt: {len(documents)} Quellen, {questions['question_count']} Fragen, {topics['topic_count']} Themen")


if __name__ == "__main__":
    main()
