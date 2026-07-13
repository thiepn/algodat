import { describe, expect, it } from 'vitest';
import corpusData from '../../data/canonical-questions.json';
import evidenceData from '../../data/question-evidence-links.json';
import identityData from '../../data/question-identity-decisions.json';
import mappingData from '../../data/question-resource-mapping-report.json';
import conflictsData from '../../data/source-conflicts.json';
import type { CanonicalQuestionBlock } from '../../src/content/schemas';
import { validateCanonicalQuestionReviewData } from '../../src/domain/canonical-questions/reconciliation';
import { validateCanonicalQuestionCorpus } from '../../src/domain/canonical-questions/validation';
import { isPubliclyVisibleQuestion } from '../../src/features/canonical-questions/CanonicalQuestionPages';

const corpus = validateCanonicalQuestionCorpus(corpusData);
const questions = corpus.questions.filter((question) => question.collectionId === 'exam-2024-1');

function flattenedBlocks(blocks: CanonicalQuestionBlock[]): CanonicalQuestionBlock[] {
  return blocks.flatMap((block) =>
    block.type === 'subtask' ? [block, ...flattenedBlocks(block.blocks)] : [block],
  );
}

describe('kanonische Klausur exam-2024-1', () => {
  it('bildet genau neun Aufgaben mit 50 Punkten und ehrlichen Ereignismetadaten ab', () => {
    expect(questions.map((question) => question.questionId)).toEqual(
      Array.from({ length: 9 }, (_, index) => `exam-2024-1-task-${index + 1}`),
    );
    expect(questions.map((question) => question.points)).toEqual([4, 4, 4, 4, 5, 5, 8, 8, 8]);
    expect(questions.reduce((sum, question) => sum + (question.points ?? 0), 0)).toBe(50);

    const collection = corpus.collections.find(
      (candidate) => candidate.collectionId === 'exam-2024-1',
    );
    expect(collection?.state).toBe('complete');
    expect(collection?.eventMetadata).toEqual({
      semester: null,
      date: null,
      durationMinutes: null,
      allowedAids: 'unbekannt',
      examiner: null,
      officialDesignation: null,
    });
    expect(questions.every((question) => question.semester === null)).toBe(true);
  });

  it('versöhnt jede Aufgabe mit genau einer byteidentischen Dublettenevidenz', () => {
    const decisions = identityData.decisions.filter(
      (decision) => decision.collectionId === 'exam-2024-1',
    );
    expect(decisions).toHaveLength(9);
    expect(decisions.every((decision) => decision.evidenceIds.length === 2)).toBe(true);
    expect(decisions.every((decision) => decision.identityConfidence === 'hoch')).toBe(true);
    expect(decisions.every((decision) => decision.reviewerStatus === 'final_reviewed')).toBe(true);
    expect(identityData.openCandidateCount).toBe(33);

    const review = validateCanonicalQuestionReviewData({
      questions: corpus.questions,
      identityDecisions: identityData,
      evidenceLinks: evidenceData,
      resourceMappings: mappingData,
      originalCandidateCount: 84,
    });
    expect(review.identityDecisions.decisions).toHaveLength(51);
  });

  it('hält private Fotos, lokale Pfade und handschriftliche Versuche aus öffentlichen Daten heraus', () => {
    const publicText = JSON.stringify(questions);
    expect(publicText).not.toMatch(/WhatsApp|\.jpe?g\b|2024[\\/]kl1|[A-Z]:\\|file:\/\//iu);
    expect(
      questions.every((question) => question.publicationMode === 'public_safe_reconstruction'),
    ).toBe(true);
    expect(questions.every((question) => question.hostedMaterialApproval === null)).toBe(true);
    expect(
      questions
        .flatMap((question) => [...question.sourceRefs, ...question.solutionSourceRefs])
        .every(
          (reference) =>
            !['src-20a1f0837025', 'src-22375a7589e7', 'src-28ccd3fc19df'].includes(
              reference.sourceId,
            ),
        ),
    ).toBe(true);
    expect(
      questions
        .filter((question) => question.solution.provenance === 'official_solution')
        .map((question) => question.questionId),
    ).toEqual(['exam-2024-1-task-6', 'exam-2024-1-task-8']);
  });

  it('rekonstruiert für Aufgabe 3 den crop-vollständigen Ausgangsbaum strukturiert', () => {
    const task = questions[2]!;
    const start = task.bodyBlocks.find((block) => block.type === 'tree');
    expect(start).toMatchObject({
      type: 'tree',
      nilConvention: expect.stringContaining('NIL'),
      nodes: [
        { id: '24', color: 'schwarz', left: '14', right: '66' },
        { id: '14', color: 'rot', left: null, right: null },
        { id: '66', color: 'rot', left: null, right: null },
      ],
    });
    expect(task.reviewNotes).toContain('nicht veröffentlichte Vergleichsaufnahme');
    expect(task.reviewNotes).not.toMatch(/[A-Z]:\\|\.jpe?g\b|WhatsApp/iu);
  });

  it('liefert vollständige Körper, Quellen, Ressourcen und barrierefreie visuelle Blöcke', () => {
    const mappings = mappingData.mappings.filter((mapping) =>
      mapping.questionId.startsWith('exam-2024-1-'),
    );
    expect(mappings).toHaveLength(9);
    expect(mappings.map((mapping) => mapping.trainerCoverage)).toEqual([
      'missing',
      'full',
      'missing',
      'missing',
      'full',
      'partial',
      'partial',
      'partial',
      'missing',
    ]);
    expect(questions.every(isPubliclyVisibleQuestion)).toBe(true);
    expect(
      questions.every(
        (question) =>
          question.bodyBlocks.length > 1 &&
          question.solution.blocks.length > 0 &&
          question.sourceRefs.length > 0 &&
          question.solutionSourceRefs.length > 0,
      ),
    ).toBe(true);
    for (const question of questions) {
      const visualBlocks = flattenedBlocks([
        ...question.bodyBlocks,
        ...question.solution.blocks,
      ]).filter((block) =>
        [
          'math',
          'pseudocode',
          'array',
          'matrix',
          'graph',
          'tree',
          'dp_table',
          'operation_sequence',
        ].includes(block.type),
      );
      expect(visualBlocks.length).toBeGreaterThan(0);
      expect(visualBlocks.every((block) => 'textAlternative' in block)).toBe(true);
    }
  });

  it('dokumentiert 18 unpassende Lösungsdubletten und den Indexkonflikt der Messreihenlösung', () => {
    const mismatches = identityData.excludedEvidence.filter((evidence) =>
      ['src-02c9bed0177d', 'src-5a4d89dac601'].includes(evidence.sourceId),
    );
    expect(mismatches).toHaveLength(18);
    expect(
      mismatches.every((evidence) => evidence.decision === 'mismatched_solution_evidence'),
    ).toBe(true);
    expect(
      conflictsData.conflicts.some((conflict) => conflict.id === 'conflict-exam-2024-task-8-index'),
    ).toBe(true);
  });
});

describe('deterministische Lösungsverifikation exam-2024-1', () => {
  it('berechnet für Aufgabe 1 exakt die DFS-Zeitstempel', () => {
    const graph = questions[0]!.bodyBlocks.find((block) => block.type === 'graph');
    if (!graph || graph.type !== 'graph') throw new Error('DFS-Graph fehlt');
    const adjacency = new Map(
      graph.nodes.map((node) => [
        node.id,
        graph.edges
          .filter((edge) => edge.from === node.id)
          .map((edge) => edge.to)
          .sort(),
      ]),
    );
    let time = 0;
    const discovered = new Map<string, number>();
    const finished = new Map<string, number>();
    const visit = (vertex: string) => {
      discovered.set(vertex, ++time);
      for (const next of adjacency.get(vertex) ?? []) if (!discovered.has(next)) visit(next);
      finished.set(vertex, ++time);
    };
    for (const vertex of [...adjacency.keys()].sort()) if (!discovered.has(vertex)) visit(vertex);
    expect([...discovered.entries()]).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
      ['e', 4],
      ['f', 6],
      ['g', 7],
      ['d', 8],
      ['h', 12],
    ]);
    expect(Object.fromEntries(finished)).toEqual({
      e: 5,
      d: 9,
      g: 10,
      f: 11,
      h: 13,
      c: 14,
      b: 15,
      a: 16,
    });
  });

  it('berechnet für Aufgabe 2 jede Rucksackzelle und das Optimum 33', () => {
    const sizes = [4, 2, 5, 4, 3];
    const values = [3, 3, 13, 11, 19];
    const table = Array.from({ length: 6 }, () => Array<number>(10).fill(0));
    for (let i = 1; i <= sizes.length; i += 1)
      for (let weight = 0; weight <= 9; weight += 1)
        table[i]![weight] =
          sizes[i - 1]! > weight
            ? table[i - 1]![weight]!
            : Math.max(
                table[i - 1]![weight]!,
                values[i - 1]! + table[i - 1]![weight - sizes[i - 1]!]!,
              );
    expect(table).toEqual([
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 3, 3, 3, 3, 3, 3],
      [0, 0, 3, 3, 3, 3, 6, 6, 6, 6],
      [0, 0, 3, 3, 3, 13, 13, 16, 16, 16],
      [0, 0, 3, 3, 11, 13, 14, 16, 16, 24],
      [0, 0, 3, 19, 19, 22, 22, 30, 32, 33],
    ]);
    const subsetValues = Array.from({ length: 1 << sizes.length }, (_, mask) =>
      sizes.reduce(
        (state, size, index) => ({
          size: state.size + ((mask & (1 << index)) === 0 ? 0 : size),
          value: state.value + ((mask & (1 << index)) === 0 ? 0 : values[index]!),
        }),
        { size: 0, value: 0 },
      ),
    );
    expect(
      Math.max(...subsetValues.filter((entry) => entry.size <= 9).map((entry) => entry.value)),
    ).toBe(33);
  });

  it('erhält in allen vier Ergebnisbäumen von Aufgabe 3 die Rot-Schwarz-Invarianten', () => {
    const trees = questions[2]!.solution.blocks.filter((block) => block.type === 'tree');
    expect(trees).toHaveLength(4);
    const expectedRoots = ['24', '24', '24', '68'];
    trees.forEach((tree, treeIndex) => {
      if (tree.type !== 'tree' || !tree.nodes) throw new Error('Baumstruktur fehlt');
      const nodes = new Map(tree.nodes.map((node) => [node.id, node]));
      const childIds = new Set(
        tree.nodes.flatMap((node) => [node.left, node.right]).filter(Boolean),
      );
      const root = tree.nodes.find((node) => !childIds.has(node.id))!;
      expect(root.id).toBe(expectedRoots[treeIndex]);
      expect(root.color).toBe('schwarz');
      const check = (id: string | null, minimum: number, maximum: number): number => {
        if (id === null) return 1;
        const node = nodes.get(id)!;
        const key = Number(node.id);
        expect(key).toBeGreaterThan(minimum);
        expect(key).toBeLessThan(maximum);
        if (node.color === 'rot') {
          expect(node.left === null || nodes.get(node.left)?.color === 'schwarz').toBe(true);
          expect(node.right === null || nodes.get(node.right)?.color === 'schwarz').toBe(true);
        }
        const leftHeight = check(node.left, minimum, key);
        const rightHeight = check(node.right, key, maximum);
        expect(leftHeight).toBe(rightHeight);
        return leftHeight + (node.color === 'schwarz' ? 1 : 0);
      };
      check(root.id, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY);
    });
  });

  it('bestätigt die MergeSort-Ebenen aus Aufgabe 4', () => {
    const trace: string[] = [];
    const mergeSort = (values: number[], left: number): number[] => {
      if (values.length <= 1) return values;
      const middle = Math.ceil(values.length / 2);
      const leftValues = mergeSort(values.slice(0, middle), left);
      const rightValues = mergeSort(values.slice(middle), left + middle);
      const merged: number[] = [];
      let i = 0;
      let j = 0;
      while (i < leftValues.length || j < rightValues.length)
        if (j >= rightValues.length || (i < leftValues.length && leftValues[i]! <= rightValues[j]!))
          merged.push(leftValues[i++]!);
        else merged.push(rightValues[j++]!);
      trace.push(`[${left}..${left + values.length - 1}]: ${merged.join(', ')}`);
      return merged;
    };
    expect(mergeSort([74, 19, 12, 34, 30, 65, 56], 1)).toEqual([12, 19, 30, 34, 56, 65, 74]);
    expect(trace).toContain('[1..4]: 12, 19, 34, 74');
    expect(trace).toContain('[5..7]: 30, 56, 65');
  });

  it('bestätigt Aufgabe 5 exhaustiv auf kleinen natürlichen Zahlenfeldern', () => {
    for (let length = 0; length <= 5; length += 1)
      for (let code = 0; code < 5 ** length; code += 1) {
        let rest = code;
        const values = Array.from({ length }, () => {
          const value = rest % 5;
          rest = Math.floor(rest / 5);
          return value;
        });
        let actual = 0;
        for (const value of values) {
          actual += value;
          if (value % 2 !== 0) actual -= value;
        }
        expect(actual).toBe(
          values.filter((value) => value % 2 === 0).reduce((sum, value) => sum + value, 0),
        );
      }
  });

  it('bestätigt für Aufgabe 6 die exakte Form auf Viererpotenzen', () => {
    const runtime = (n: number): number => (n === 1 ? 1 : 2 * runtime(n / 4) + n);
    for (const n of [1, 4, 16, 64, 256, 1024]) {
      expect(runtime(n)).toBe(2 * n - Math.sqrt(n));
      expect(runtime(n)).toBeLessThanOrEqual(2 * n);
      expect(runtime(n)).toBeGreaterThanOrEqual(n);
    }
  });

  it('vergleicht Aufgabe 7 exhaustiv mit allen Stations-Teilmengen', () => {
    for (let length = 1; length <= 5; length += 1)
      for (let code = 0; code < 4 ** length; code += 1) {
        let rest = code;
        const capacities = Array.from({ length }, () => {
          const value = rest % 4;
          rest = Math.floor(rest / 4);
          return value;
        });
        const total = capacities.reduce((sum, value) => sum + value, 0);
        for (let amount = 1; amount <= total + 1; amount += 1) {
          const sorted = [...capacities].sort((left, right) => right - left);
          let sum = 0;
          const greedyIndex = sorted.findIndex((value) => (sum += value) >= amount);
          const greedy = greedyIndex < 0 ? null : greedyIndex + 1;
          let optimum: number | null = null;
          for (let mask = 0; mask < 1 << length; mask += 1) {
            const selected = capacities.filter((_, index) => (mask & (1 << index)) !== 0);
            if (selected.reduce((partial, value) => partial + value, 0) >= amount)
              optimum = Math.min(optimum ?? Number.POSITIVE_INFINITY, selected.length);
          }
          expect(greedy).toBe(optimum);
        }
      }
  });

  it('vergleicht die Messreihen-DP aus Aufgabe 8 mit allen zulässigen Verbindungen kleiner Instanzen', () => {
    const paths = (n: number, m: number): number[][] => {
      const result: number[][] = [];
      const extend = (path: number[]) => {
        if (path.length === n) {
          if (path.at(-1) === m - 1) result.push(path);
          return;
        }
        const current = path.at(-1)!;
        extend([...path, current]);
        if (current + 1 < m) extend([...path, current + 1]);
      };
      extend([0]);
      return result;
    };
    const dp = (a: number[], b: number[]) => {
      const table = Array.from({ length: a.length }, () =>
        Array<number>(b.length + 1).fill(Infinity),
      );
      table[0]![1] = Math.abs(a[0]! - b[0]!);
      for (let i = 1; i < a.length; i += 1)
        for (let j = 1; j <= Math.min(i + 1, b.length); j += 1)
          table[i]![j] = Math.max(
            Math.abs(a[i]! - b[j - 1]!),
            Math.min(table[i - 1]![j]!, table[i - 1]![j - 1]!),
          );
      return table[a.length - 1]![b.length]!;
    };
    const arrays = (length: number) =>
      Array.from({ length: 3 ** length }, (_, code) => {
        let rest = code;
        return Array.from({ length }, () => {
          const value = rest % 3;
          rest = Math.floor(rest / 3);
          return value;
        });
      });
    for (let n = 1; n <= 4; n += 1)
      for (let m = 1; m <= n; m += 1)
        for (const a of arrays(n))
          for (const b of arrays(m)) {
            const bruteForce = Math.min(
              ...paths(n, m).map((path) =>
                Math.max(...path.map((target, index) => Math.abs(a[index]! - b[target]!))),
              ),
            );
            expect(dp(a, b)).toBe(bruteForce);
          }
    expect(dp([1, 3, 4, 8, 4, 1], [2, 9, 4])).toBe(3);
  });

  it('erkennt und rekonstruiert negative Kreise auf allen kleinen gerichteten Testgraphen', () => {
    type Edge = { from: number; to: number; weight: number };
    const findCycle = (n: number, edges: Edge[]): Edge[] | null => {
      const distance = Array<number>(n).fill(0);
      const predecessor = Array<number | null>(n).fill(null);
      let changed: number | null = null;
      for (let round = 0; round < n; round += 1) {
        changed = null;
        for (const edge of edges)
          if (distance[edge.from]! + edge.weight < distance[edge.to]!) {
            distance[edge.to] = distance[edge.from]! + edge.weight;
            predecessor[edge.to] = edge.from;
            changed = edge.to;
          }
        if (changed === null) return null;
      }
      let vertex = changed!;
      for (let step = 0; step < n; step += 1) vertex = predecessor[vertex]!;
      const start = vertex;
      const cycle: Edge[] = [];
      do {
        const from = predecessor[vertex]!;
        cycle.push(edges.find((edge) => edge.from === from && edge.to === vertex)!);
        vertex = from;
      } while (vertex !== start);
      return cycle.reverse();
    };
    const hasNegativeCycle = (n: number, edges: Edge[]) => {
      const distance = Array.from({ length: n }, (_, from) =>
        Array.from({ length: n }, (_, to) => (from === to ? 0 : Infinity)),
      );
      for (const edge of edges)
        distance[edge.from]![edge.to] = Math.min(distance[edge.from]![edge.to]!, edge.weight);
      for (let via = 0; via < n; via += 1)
        for (let from = 0; from < n; from += 1)
          for (let to = 0; to < n; to += 1)
            distance[from]![to] = Math.min(
              distance[from]![to]!,
              distance[from]![via]! + distance[via]![to]!,
            );
      return distance.some((row, vertex) => row[vertex]! < 0);
    };
    const n = 3;
    const pairs = Array.from({ length: n }, (_, from) =>
      Array.from({ length: n }, (_, to) => ({ from, to })).filter((edge) => edge.from !== edge.to),
    ).flat();
    for (let code = 0; code < 3 ** pairs.length; code += 1) {
      let rest = code;
      const edges: Edge[] = [];
      for (const pair of pairs) {
        const state = rest % 3;
        rest = Math.floor(rest / 3);
        if (state !== 0) edges.push({ ...pair, weight: state === 1 ? -1 : 1 });
      }
      const cycle = findCycle(n, edges);
      expect(cycle !== null).toBe(hasNegativeCycle(n, edges));
      if (cycle) {
        expect(
          cycle.every((edge, index) => edge.to === cycle[(index + 1) % cycle.length]!.from),
        ).toBe(true);
        expect(cycle.reduce((sum, edge) => sum + edge.weight, 0)).toBeLessThan(0);
      }
    }
  });
});
