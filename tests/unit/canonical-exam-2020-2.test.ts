import { describe, expect, it } from 'vitest';
import corpusData from '../../data/canonical-questions.json';
import evidenceData from '../../data/question-evidence-links.json';
import identityData from '../../data/question-identity-decisions.json';
import mappingData from '../../data/question-resource-mapping-report.json';
import { validateCanonicalQuestionCorpus } from '../../src/domain/canonical-questions/validation';

const questions = validateCanonicalQuestionCorpus(corpusData).questions.filter(
  (question) => question.collectionId === 'exam-2020-2',
);

describe('kanonische reale Klausur exam-2020-2', () => {
  it('enthält neun belegte Aufgaben mit insgesamt 50 Punkten', () => {
    expect(questions.map(({ questionId }) => questionId)).toEqual(
      Array.from({ length: 9 }, (_, index) => `exam-2020-2-task-${index + 1}`),
    );
    expect(questions.reduce((sum, question) => sum + (question.points ?? 0), 0)).toBe(50);
    expect(
      questions.every(
        (question) =>
          question.sourceRefs.some(({ sourceId }) => sourceId === 'src-97414623dd81') &&
          question.solutionSourceRefs.some(({ sourceId }) => sourceId === 'src-8a588d5ddc35'),
      ),
    ).toBe(true);
  });

  it('entscheidet alle zwanzig Evidenzdatensätze und schließt beide Titelseiten aus', () => {
    const decisions = identityData.decisions.filter(
      ({ collectionId }) => collectionId === 'exam-2020-2',
    );
    const excluded = identityData.excludedEvidence.filter(({ sourceId }) =>
      ['src-97414623dd81', 'src-8a588d5ddc35'].includes(sourceId),
    );
    const links = evidenceData.links.filter(({ questionId }) =>
      questionId.startsWith('exam-2020-2'),
    );
    expect(decisions).toHaveLength(9);
    expect(decisions.flatMap(({ evidenceIds }) => evidenceIds)).toHaveLength(18);
    expect(excluded.map(({ evidenceId }) => evidenceId)).toEqual([
      'q-c2391c1b18d8',
      'q-32867772a3cd',
    ]);
    expect(links).toHaveLength(9);
  });

  it('reproduziert IntervalScheduling und DFS unabhängig', () => {
    const intervals = [
      [1, 5],
      [3, 7],
      [7, 11],
      [10, 12],
      [12, 13],
      [6, 13],
      [13, 15],
      [13, 16],
      [12, 16],
      [17, 21],
      [15, 22],
      [20, 24],
    ] as const;
    let end = Number.NEGATIVE_INFINITY;
    const selected = [...intervals]
      .sort((a, b) => a[1] - b[1])
      .filter(([start, finish]) => {
        if (start < end) return false;
        end = finish;
        return true;
      });
    expect(selected).toEqual([
      [1, 5],
      [7, 11],
      [12, 13],
      [13, 15],
      [17, 21],
    ]);

    const graph: Record<string, string[]> = {
      a: ['b', 'd', 'e'],
      b: ['e', 'f', 'h'],
      c: ['a', 'b', 'g'],
      d: ['e'],
      e: [],
      f: [],
      g: ['b', 'f'],
      h: ['f'],
    };
    let time = 0;
    const d: Record<string, number> = {};
    const f: Record<string, number> = {};
    const dfs = (node: string) => {
      d[node] = ++time;
      for (const target of graph[node]!) if (!(target in d)) dfs(target);
      f[node] = ++time;
    };
    for (const node of Object.keys(graph).sort()) if (!(node in d)) dfs(node);
    expect(d).toEqual({ a: 1, b: 2, e: 3, f: 5, h: 7, d: 10, c: 13, g: 14 });
    expect(f).toEqual({ e: 4, f: 6, h: 8, b: 9, d: 11, a: 12, g: 15, c: 16 });
  });

  it('prüft alle fünf Rot-Schwarz-Zustände strukturell', () => {
    const trees = questions
      .find(({ taskNumber }) => taskNumber === 3)!
      .solution.blocks.filter((block) => block.type === 'tree');
    expect(trees).toHaveLength(5);
    for (const tree of trees) {
      const nodes = new Map(tree.nodes!.map((node) => [node.id, node]));
      const children = new Set(
        tree.nodes!.flatMap(({ left, right }) => [left, right]).filter(Boolean),
      );
      const root = tree.nodes!.find(({ id }) => !children.has(id))!;
      expect(root.color).toBe('schwarz');
      const blackHeight = (id: string | null): number => {
        if (id === null) return 1;
        const node = nodes.get(id)!;
        if (node.color === 'rot') {
          expect(node.left === null || nodes.get(node.left)?.color === 'schwarz').toBe(true);
          expect(node.right === null || nodes.get(node.right)?.color === 'schwarz').toBe(true);
        }
        const left = blackHeight(node.left);
        const right = blackHeight(node.right);
        expect(left).toBe(right);
        return left + (node.color === 'schwarz' ? 1 : 0);
      };
      expect(blackHeight(root.id)).toBeGreaterThan(1);
    }
  });

  it('reproduziert Prim, Invariante und Rekurrenzschranke', () => {
    const edges = [
      ['a', 'c', 12],
      ['c', 'g', 14],
      ['g', 'f', 1],
      ['a', 'h', 10],
      ['c', 'b', 11],
      ['f', 'd', 5],
      ['b', 'd', 7],
      ['h', 'b', 15],
      ['a', 'b', 17],
      ['b', 'f', 8],
      ['g', 'd', 6],
      ['h', 'd', 5],
    ] as const;
    const reached = new Set(['a']);
    const tree = [] as Array<(typeof edges)[number]>;
    while (reached.size < 7) {
      const edge = edges
        .filter(([u, v]) => reached.has(u) !== reached.has(v))
        .sort((a, b) => a[2] - b[2])[0]!;
      tree.push(edge);
      reached.add(edge[0]);
      reached.add(edge[1]);
    }
    expect(tree).toEqual([
      ['a', 'h', 10],
      ['h', 'd', 5],
      ['f', 'd', 5],
      ['g', 'f', 1],
      ['b', 'd', 7],
      ['c', 'b', 11],
    ]);
    expect(tree.reduce((sum, edge) => sum + edge[2], 0)).toBe(39);
    for (const n of [1, 2, 5, 10]) {
      let m = n;
      for (let i = 1; i <= n; i += 1) {
        expect(m).toBe(n + 2 * (i - 1));
        m += 2;
      }
      expect(m).toBe(3 * n);
    }
    const recurrence = (n: number): number => (n === 1 ? 1 : 8 * recurrence(n / 2) + n ** 2);
    for (const n of [1, 2, 4, 8, 16])
      expect(recurrence(n)).toBeLessThanOrEqual(2 * n ** 3 - n ** 2);
  });

  it('vergleicht Greedy und Budget-DP mit vollständiger Suche', () => {
    const permutations = (values: number[]): number[][] =>
      values.length <= 1
        ? [values]
        : values.flatMap((value, index) =>
            permutations(values.filter((_, i) => i !== index)).map((rest) => [value, ...rest]),
          );
    const score = (values: number[]) =>
      values.reduce((sum, value, index) => sum + value * (values.length - index), 0);
    for (const values of [
      [4, 1, 3],
      [2, 5, 2, 1],
    ])
      expect(score([...values].sort((a, b) => b - a))).toBe(
        Math.max(...permutations(values).map(score)),
      );

    const prices = [3, 5];
    const flops = [7, 12];
    const dp = (budget: number) => {
      const values = Array<number>(budget + 1).fill(0);
      for (let j = 1; j <= budget; j += 1)
        for (let i = 0; i < prices.length; i += 1)
          if (prices[i]! <= j)
            values[j] = Math.max(values[j]!, values[j - prices[i]!]! + flops[i]!);
      return values[budget]!;
    };
    const brute = (budget: number) => {
      let best = 0;
      for (let a = 0; a * 3 <= budget; a += 1)
        for (let b = 0; a * 3 + b * 5 <= budget; b += 1) best = Math.max(best, a * 7 + b * 12);
      return best;
    };
    for (let budget = 0; budget <= 15; budget += 1) expect(dp(budget)).toBe(brute(budget));
    expect(dp(5)).toBe(12);
  });

  it('weist fehlende Trainer aus und prüft die Multimengenoperationen', () => {
    const mappings = mappingData.mappings.filter(({ questionId }) =>
      questionId.startsWith('exam-2020-2'),
    );
    expect(
      mappings
        .filter(({ trainerCoverage }) => trainerCoverage === 'missing')
        .map(({ questionId }) => questionId),
    ).toEqual([
      'exam-2020-2-task-1',
      'exam-2020-2-task-2',
      'exam-2020-2-task-3',
      'exam-2020-2-task-6',
      'exam-2020-2-task-9',
    ]);
    const left = [0, 2, 1, 0];
    const right = [1, 0, 3, 2];
    left[1]! += 1;
    left[2] = 0;
    expect(left.map((count, index) => count + right[index]!)).toEqual([1, 3, 3, 2]);
  });
});
