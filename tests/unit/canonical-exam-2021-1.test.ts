import { describe, expect, it } from 'vitest';
import corpusData from '../../data/canonical-questions.json';
import evidenceData from '../../data/question-evidence-links.json';
import identityData from '../../data/question-identity-decisions.json';
import mappingData from '../../data/question-resource-mapping-report.json';
import conflictsData from '../../data/source-conflicts.json';
import { validateCanonicalQuestionReviewData } from '../../src/domain/canonical-questions/reconciliation';
import { validateCanonicalQuestionCorpus } from '../../src/domain/canonical-questions/validation';

const corpus = validateCanonicalQuestionCorpus(corpusData);
const questions = corpus.questions.filter((question) => question.collectionId === 'exam-2021-1');

describe('kanonische Erstklausur 2021', () => {
  it('bildet genau sechs Aufgaben mit 60 Punkten und redaktionellen Lösungen ab', () => {
    expect(questions.map((question) => question.questionId)).toEqual(
      Array.from({ length: 6 }, (_, index) => `exam-2021-1-task-${index + 1}`),
    );
    expect(questions.map((question) => question.points)).toEqual([6, 6, 6, 10, 16, 16]);
    expect(questions.reduce((sum, question) => sum + (question.points ?? 0), 0)).toBe(60);
    expect(
      questions.every(
        (question) =>
          question.solutionStatus === 'authored_solution' &&
          question.publicationMode === 'public_safe_reconstruction' &&
          question.finalReviewStatus === 'final_reviewed' &&
          question.bodyBlocks.length > 1 &&
          question.solution.blocks.length > 0,
      ),
    ).toBe(true);
  });

  it('trennt die nachgewiesen falsche Lösungsdatei vollständig von den Aufgaben', () => {
    const forbiddenSourceId = 'src-39eb3d94f40a';
    expect(
      questions.every((question) =>
        [...question.sourceRefs, ...question.solutionSourceRefs].every(
          (reference) => reference.sourceId !== forbiddenSourceId,
        ),
      ),
    ).toBe(true);

    const links = evidenceData.links.filter((link) => link.questionId.startsWith('exam-2021-1-'));
    expect(links).toHaveLength(6);
    expect(links.every((link) => link.solutionEvidenceIds.length === 0)).toBe(true);
    expect(
      links.every((link) =>
        [...link.sourceRefs, ...link.solutionSourceRefs].every(
          (reference) => reference.sourceId !== forbiddenSourceId,
        ),
      ),
    ).toBe(true);

    const excludedMismatch = identityData.excludedEvidence.filter(
      (evidence) =>
        evidence.sourceId === forbiddenSourceId || evidence.sourceId === 'src-720584558efd',
    );
    expect(excludedMismatch).toHaveLength(24);
    expect(
      excludedMismatch.every((evidence) => evidence.decision === 'mismatched_solution_evidence'),
    ).toBe(true);
  });

  it('versöhnt jede Aufgabe mit ihrer exakten Quelldublette', () => {
    const decisions = identityData.decisions.filter(
      (decision) => decision.collectionId === 'exam-2021-1',
    );
    expect(decisions).toHaveLength(6);
    expect(decisions.every((decision) => decision.evidenceIds.length === 2)).toBe(true);
    expect(decisions.every((decision) => decision.reviewerStatus === 'final_reviewed')).toBe(true);
  });

  it('validiert Evidenz, Identität und Ressourcenabbildung referenziell', () => {
    const review = validateCanonicalQuestionReviewData({
      questions: corpus.questions,
      identityDecisions: identityData,
      evidenceLinks: evidenceData,
      resourceMappings: mappingData,
      originalCandidateCount: 84,
    });
    expect(review.identityDecisions.openCandidateCount).toBe(33);
    const mappings = review.resourceMappings.mappings.filter((mapping) =>
      mapping.questionId.startsWith('exam-2021-1-'),
    );
    expect(mappings.map((mapping) => mapping.taskSlotNumbers)).toEqual([
      [6],
      [1],
      [3],
      [5],
      [8],
      [9],
    ]);
    expect(mappings.map((mapping) => mapping.trainerCoverage)).toEqual([
      'partial',
      'missing',
      'missing',
      'partial',
      'full',
      'missing',
    ]);
  });

  it('bestätigt für Aufgabe 1 den quadratischen Master-Fall auf Dreierpotenzen', () => {
    const runtime = (n: number): number => (n === 1 ? 1 : 3 * runtime(n / 3) + n * n);
    for (const n of [3, 9, 27, 81]) {
      expect(runtime(n) / (n * n)).toBeLessThan(1.5);
      expect(runtime(n)).toBeGreaterThanOrEqual(n * n);
    }
    expect(
      questions[0]?.solution.blocks.some((block) => JSON.stringify(block).includes('n²')),
    ).toBe(true);
  });

  it('bestätigt für Aufgabe 2 Deadline-Reihenfolge und maximale Verspätung', () => {
    const jobs = [
      [1, 3, 15],
      [2, 2, 25],
      [3, 2, 4],
      [4, 2, 30],
      [5, 4, 16],
      [6, 1, 1],
      [7, 3, 26],
      [8, 6, 12],
      [9, 7, 21],
    ] as const;
    const ordered = [...jobs].sort((left, right) => left[2] - right[2]);
    let completion = 0;
    const lateness = ordered.map(([id, duration, deadline]) => {
      completion += duration;
      return [id, Math.max(0, completion - deadline)] as const;
    });
    expect(ordered.map(([id]) => id)).toEqual([6, 3, 8, 1, 5, 9, 2, 7, 4]);
    expect(lateness.filter(([, value]) => value > 0)).toEqual([
      [9, 2],
      [7, 2],
    ]);
    expect(Math.max(...lateness.map(([, value]) => value))).toBe(2);
  });

  it('bestätigt für Aufgabe 3 die synchronen Bellman-Ford-Runden', () => {
    const edges = [
      [1, 5, 2],
      [1, 3, 8],
      [2, 3, 2],
      [3, 2, 3],
      [4, 3, 1],
      [5, 4, 2],
      [6, 3, 6],
      [6, 5, 4],
    ] as const;
    let distances = [
      0,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      Number.POSITIVE_INFINITY,
    ];
    const rounds = [distances];
    for (let round = 0; round < 5; round += 1) {
      const next = [...distances];
      for (const [from, to, weight] of edges) {
        next[to - 1] = Math.min(next[to - 1]!, distances[from - 1]! + weight);
      }
      rounds.push(next);
      if (next.every((value, index) => value === distances[index])) break;
      distances = next;
    }
    expect(rounds).toEqual([
      [0, Infinity, Infinity, Infinity, Infinity, Infinity],
      [0, Infinity, 8, Infinity, 2, Infinity],
      [0, 11, 8, 4, 2, Infinity],
      [0, 11, 5, 4, 2, Infinity],
      [0, 8, 5, 4, 2, Infinity],
      [0, 8, 5, 4, 2, Infinity],
    ]);
  });

  it('bewahrt in Aufgabe 4 den Indexkonflikt und beweist nur die korrigierte Variante', () => {
    const originalReadIndices = (n: number) => Array.from({ length: n }, (_, index) => index + 2);
    expect(originalReadIndices(4)).toContain(5);
    const correctedMinimum = (values: number[]) => {
      let minimum = values[0]!;
      for (let index = 1; index < values.length; index += 1)
        minimum = Math.min(minimum, values[index]!);
      return minimum;
    };
    expect(correctedMinimum([7, -2, 5, 1])).toBe(-2);
    expect(
      conflictsData.conflicts.some((conflict) => conflict.id === 'conflict-exam-2021-task-4'),
    ).toBe(true);
  });

  it('bestätigt für Aufgabe 5 das DP-Optimum zusätzlich durch vollständige Pfadsuche', () => {
    const mine = [
      [5, 6, 12, 9, 43],
      [44, 16, 55, 8, 1],
      [101, 12, 106, 18, 2],
      [17, 19, 22, 41, 6],
    ];
    const best = (row: number, column: number): number => {
      if (row === mine.length - 1) return mine[row]![column]!;
      return (
        mine[row]![column]! +
        Math.max(
          ...[column - 1, column, column + 1]
            .filter((next) => next >= 0 && next < mine[0]!.length)
            .map((next) => best(row + 1, next)),
        )
      );
    };
    expect(Math.max(...mine[0]!.map((_, column) => best(0, column)))).toBe(214);
  });

  it('vergleicht Aufgabe 6 exhaustiv auf allen verbundenen Graphen bis fünf Knoten', () => {
    const reachableCount = (adjacency: boolean[][], removed: number | null) => {
      const start = adjacency.findIndex((_, vertex) => vertex !== removed);
      if (start < 0) return 0;
      const seen = new Set([start]);
      const stack = [start];
      while (stack.length > 0) {
        const vertex = stack.pop()!;
        adjacency[vertex]!.forEach((connected, neighbor) => {
          if (connected && neighbor !== removed && !seen.has(neighbor)) {
            seen.add(neighbor);
            stack.push(neighbor);
          }
        });
      }
      return seen.size;
    };
    const algorithm = (adjacency: boolean[][]) =>
      adjacency.length > 2 &&
      adjacency.some((_, vertex) => reachableCount(adjacency, vertex) < adjacency.length - 1);

    for (let n = 2; n <= 5; n += 1) {
      const pairs = Array.from({ length: n }, (_, left) =>
        Array.from({ length: n - left - 1 }, (_, offset) => [left, left + offset + 1] as const),
      ).flat();
      for (let mask = 0; mask < 2 ** pairs.length; mask += 1) {
        const adjacency = Array.from({ length: n }, () => Array<boolean>(n).fill(false));
        pairs.forEach(([left, right], bit) => {
          if ((mask & (1 << bit)) !== 0) adjacency[left]![right] = adjacency[right]![left] = true;
        });
        if (reachableCount(adjacency, null) !== n) continue;
        const definition = Array.from(
          { length: n },
          (_, removed) => reachableCount(adjacency, removed) !== n - 1,
        ).some(Boolean);
        expect(algorithm(adjacency)).toBe(definition);
      }
    }
  });
});
