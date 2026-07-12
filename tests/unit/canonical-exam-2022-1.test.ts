import { describe, expect, it } from 'vitest';
import corpusData from '../../data/canonical-questions.json';
import evidenceData from '../../data/question-evidence-links.json';
import identityData from '../../data/question-identity-decisions.json';
import { validateCanonicalQuestionCorpus } from '../../src/domain/canonical-questions/validation';

const questions = validateCanonicalQuestionCorpus(corpusData).questions.filter(
  ({ collectionId }) => collectionId === 'exam-2022-1',
);

describe('kanonische reale Klausur exam-2022-1', () => {
  it('enthält neun belegte Aufgaben mit 50 Punkten und transparent authored Lösungen', () => {
    expect(questions.map(({ questionId }) => questionId)).toEqual(
      Array.from({ length: 9 }, (_, index) => `exam-2022-1-task-${index + 1}`),
    );
    expect(questions.reduce((sum, { points }) => sum + (points ?? 0), 0)).toBe(50);
    expect(
      questions.every(
        ({ sourceRefs, solution, solutionStatus }) =>
          sourceRefs.every(({ sourceId }) => sourceId === 'src-c4dde22523d3') &&
          solution.provenance === 'authored_from_verified_method' &&
          solutionStatus === 'authored_solution',
      ),
    ).toBe(true);
    const decisions = identityData.decisions.filter(
      ({ collectionId }) => collectionId === 'exam-2022-1',
    );
    expect(decisions).toHaveLength(9);
    expect(decisions.flatMap(({ evidenceIds }) => evidenceIds)).toHaveLength(36);
    expect(
      identityData.excludedEvidence
        .filter(({ sourceId }) =>
          ['src-c4dde22523d3', 'src-00ae505a8756', 'src-fa63eaca933b', 'src-5bb7aaf4268b'].includes(
            sourceId,
          ),
        )
        .map(({ evidenceId }) => evidenceId),
    ).toEqual(['q-778107a70766', 'q-49fd7a5970cb', 'q-a9d059eee74c', 'q-ae7c49724101']);
    expect(
      evidenceData.links.filter(({ questionId }) => questionId.startsWith('exam-2022-1')),
    ).toHaveLength(9);
  });

  it('reproduziert GreedyLoadBalancing samt Gleichständen', () => {
    const jobs = [10, 3, 14, 8, 6, 3, 4, 7, 5, 2]
      .map((length, index) => ({ id: index + 1, length }))
      .sort((a, b) => b.length - a.length || a.id - b.id);
    const machines = Array.from({ length: 4 }, () => ({ load: 0, jobs: [] as number[] }));
    for (const job of jobs) {
      const index = machines.reduce(
        (best, machine, candidate) => (machine.load < machines[best]!.load ? candidate : best),
        0,
      );
      machines[index]!.load += job.length;
      machines[index]!.jobs.push(job.id);
    }
    expect(machines).toEqual([
      { load: 16, jobs: [3, 10] },
      { load: 14, jobs: [1, 7] },
      { load: 16, jobs: [4, 9, 2] },
      { load: 16, jobs: [8, 5, 6] },
    ]);
  });

  it('erhält in allen vier Rot-Schwarz-Ergebnisbäumen die Invarianten', () => {
    const trees = questions
      .find(({ taskNumber }) => taskNumber === 2)!
      .solution.blocks.filter((block) => block.type === 'tree');
    expect(trees).toHaveLength(4);
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
          expect(node.left === null || nodes.get(node.left)?.color).toBe(
            node.left === null ? true : 'schwarz',
          );
          expect(node.right === null || nodes.get(node.right)?.color).toBe(
            node.right === null ? true : 'schwarz',
          );
        }
        const left = blackHeight(node.left);
        const right = blackHeight(node.right);
        expect(left).toBe(right);
        return left + Number(node.color === 'schwarz');
      };
      blackHeight(root.id);
    }
  });

  it('berechnet Floyd-Warshall und Prim unabhängig', () => {
    let distances = [
      [0, 3, Infinity, 5],
      [-2, 0, -1, Infinity],
      [Infinity, 4, 0, Infinity],
      [-2, 5, 4, 0],
    ];
    const matrices: number[][][] = [];
    for (let k = 0; k < 4; k += 1) {
      distances = distances.map((row, i) =>
        row.map((value, j) => Math.min(value, distances[i]![k]! + distances[k]![j]!)),
      );
      matrices.push(distances);
    }
    expect(matrices[1]).toEqual([
      [0, 3, 2, 5],
      [-2, 0, -1, 3],
      [2, 4, 0, 7],
      [-2, 1, 0, 0],
    ]);
    expect(matrices[2]).toEqual(matrices[1]);
    expect(matrices[3]).toEqual(matrices[1]);

    const edges = [
      ['a', 'c', 3],
      ['a', 'b', 4],
      ['a', 'd', 6],
      ['b', 'd', 1],
      ['c', 'd', 2],
      ['c', 'e', 8],
      ['d', 'e', 9],
      ['d', 'f', 6],
      ['e', 'f', 5],
      ['e', 'g', 2],
      ['e', 'h', 7],
      ['f', 'h', 1],
      ['g', 'h', 4],
    ] as const;
    const reached = new Set(['a']);
    const selected: Array<(typeof edges)[number]> = [];
    while (reached.size < 8) {
      const edge = edges
        .filter(([u, v]) => reached.has(u) !== reached.has(v))
        .sort((a, b) => a[2] - b[2])[0]!;
      selected.push(edge);
      reached.add(edge[0]);
      reached.add(edge[1]);
    }
    expect(selected.reduce((sum, edge) => sum + edge[2], 0)).toBe(19);
    expect([...reached]).toEqual(['a', 'c', 'd', 'b', 'f', 'h', 'g', 'e']);
  });

  it('reproduziert Mittelwertinvariante und Rekurrenzformel', () => {
    const values = [7, 2, 11, 4, 6];
    let x = values[0]!;
    for (let i = 2; i <= values.length; i += 1) {
      expect(x).toBe(values.slice(0, i - 1).reduce((sum, value) => sum + value, 0) / (i - 1));
      x = (x * (i - 1) + values[i - 1]!) / i;
    }
    expect(x).toBe(6);

    const recurrence = (n: number): number => (n === 1 ? 1 : 25 * recurrence(n / 5) + n);
    for (const n of [1, 5, 25, 125]) expect(recurrence(n)).toBe((5 * n ** 2 - n) / 4);
  });

  it('prüft Frosch-DP gegen vollständige Rekursion und den Komponentenfall', () => {
    const frogDp = (p: number[], q: number[]) => {
      const table = Array.from({ length: p.length }, () => Array<number>(q.length).fill(Infinity));
      for (let i = 0; i < p.length; i += 1)
        for (let j = 0; j < q.length; j += 1) {
          const local = Math.abs(p[i]! - q[j]!);
          if (i === 0 && j === 0) table[i]![j] = local;
          else
            table[i]![j] =
              local +
              Math.min(
                table[i - 1]?.[j] ?? Infinity,
                table[i]?.[j - 1] ?? Infinity,
                table[i - 1]?.[j - 1] ?? Infinity,
              );
        }
      return table.at(-1)!.at(-1)!;
    };
    const frogBrute = (p: number[], q: number[], i = 0, j = 0): number => {
      const local = Math.abs(p[i]! - q[j]!);
      if (i === p.length - 1 && j === q.length - 1) return local;
      return (
        local +
        Math.min(
          i + 1 < p.length ? frogBrute(p, q, i + 1, j) : Infinity,
          j + 1 < q.length ? frogBrute(p, q, i, j + 1) : Infinity,
          i + 1 < p.length && j + 1 < q.length ? frogBrute(p, q, i + 1, j + 1) : Infinity,
        )
      );
    };
    const frogCases: Array<[number[], number[]]> = [
      [
        [1, 4],
        [2, 3],
      ],
      [
        [0, 5, 2],
        [1, 4],
      ],
    ];
    for (const [p, q] of frogCases) expect(frogDp(p, q)).toBe(frogBrute(p, q));

    const canConnectWithOneEdge = (componentCount: number, vertexCount: number) =>
      vertexCount >= 2 && componentCount <= 2;
    expect(canConnectWithOneEdge(1, 3)).toBe(true);
    expect(canConnectWithOneEdge(2, 5)).toBe(true);
    expect(canConnectWithOneEdge(3, 5)).toBe(false);
    expect(canConnectWithOneEdge(1, 1)).toBe(false);
  });
});
