import { describe, expect, it } from 'vitest';
import corpusData from '../../data/canonical-questions.json';
import evidenceData from '../../data/question-evidence-links.json';
import identityData from '../../data/question-identity-decisions.json';
import { validateCanonicalQuestionCorpus } from '../../src/domain/canonical-questions/validation';

const questions = validateCanonicalQuestionCorpus(corpusData).questions.filter(
  ({ collectionId }) => collectionId === 'exam-2022-2',
);

describe('kanonische reale Klausur exam-2022-2', () => {
  it('enthält neun belegte Aufgaben mit 50 Punkten und transparenter Provenienz', () => {
    expect(questions.map(({ questionId }) => questionId)).toEqual(
      Array.from({ length: 9 }, (_, index) => `exam-2022-2-task-${index + 1}`),
    );
    expect(questions.reduce((sum, { points }) => sum + (points ?? 0), 0)).toBe(50);
    expect(
      questions.every(({ sourceRefs }) =>
        sourceRefs.every(({ sourceId }) => sourceId === 'src-011d1ee23245'),
      ),
    ).toBe(true);
    expect(
      questions
        .slice(0, 8)
        .every(({ solution }) => solution.provenance === 'authored_from_verified_method'),
    ).toBe(true);
    expect(questions[8]!.solution.provenance).toBe('official_solution');
    const decisions = identityData.decisions.filter(
      ({ collectionId }) => collectionId === 'exam-2022-2',
    );
    expect(decisions).toHaveLength(9);
    expect(decisions.flatMap(({ evidenceIds }) => evidenceIds)).toHaveLength(37);
    const links = evidenceData.links.filter(({ questionId }) =>
      questionId.startsWith('exam-2022-2'),
    );
    expect(links).toHaveLength(9);
    expect(links[8]!.solutionEvidenceIds).toEqual(['q-e5608c7c1d2d']);
  });

  it('reproduziert Lateness und Dijkstra unabhängig', () => {
    const tasks = [
      [10, 24],
      [1, 30],
      [4, 12],
      [5, 14],
      [1, 3],
      [3, 5],
      [4, 20],
      [1, 25],
      [1, 26],
    ]
      .map(([duration, deadline], index) => ({
        id: index + 1,
        duration: duration!,
        deadline: deadline!,
      }))
      .sort((a, b) => a.deadline - b.deadline || a.id - b.id);
    let time = 0;
    const late = tasks
      .map((task) => ({
        id: task.id,
        start: time,
        lateness: Math.max(0, (time += task.duration) - task.deadline),
      }))
      .filter(({ lateness }) => lateness > 0);
    expect(tasks.map(({ id }) => id)).toEqual([5, 6, 3, 4, 7, 1, 8, 9, 2]);
    expect(late).toEqual([
      { id: 1, start: 17, lateness: 3 },
      { id: 8, start: 27, lateness: 3 },
      { id: 9, start: 28, lateness: 3 },
    ]);

    const edges = [
      ['a', 'b', 3],
      ['a', 'c', 5],
      ['b', 'c', 1],
      ['a', 'd', 2],
      ['d', 'a', 1],
      ['e', 'b', 3],
      ['c', 'g', 1],
      ['b', 'g', 3],
      ['d', 'g', 5],
      ['d', 'f', 5],
      ['e', 'h', 1],
      ['h', 'g', 1],
      ['g', 'f', 1],
      ['f', 'g', 1],
    ] as const;
    const vertices = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const distance = new Map(vertices.map((v) => [v, v === 'a' ? 0 : Infinity]));
    const settled: string[] = [];
    while (settled.length < vertices.length) {
      const u = vertices
        .filter((v) => !settled.includes(v))
        .sort((x, y) => distance.get(x)! - distance.get(y)! || x.localeCompare(y))[0]!;
      settled.push(u);
      for (const [from, to, w] of edges)
        if (from === u) distance.set(to, Math.min(distance.get(to)!, distance.get(u)! + w));
    }
    expect(settled).toEqual(['a', 'd', 'b', 'c', 'g', 'f', 'e', 'h']);
    expect(vertices.map((v) => distance.get(v))).toEqual([0, 3, 4, 2, Infinity, 6, 5, Infinity]);
  });

  it('berechnet Rucksack, Invariante und Rekurrenz', () => {
    const sizes = [1, 4, 6, 2, 3],
      values = [5, 11, 15, 5, 6];
    const dp = Array.from({ length: 6 }, () => Array(8).fill(0) as number[]);
    for (let i = 1; i <= 5; i += 1)
      for (let g = 0; g <= 7; g += 1)
        dp[i]![g] = Math.max(
          dp[i - 1]![g]!,
          sizes[i - 1]! <= g ? dp[i - 1]![g - sizes[i - 1]!]! + values[i - 1]! : -Infinity,
        );
    let brute = 0;
    for (let mask = 0; mask < 32; mask += 1) {
      let s = 0,
        v = 0;
      for (let i = 0; i < 5; i += 1)
        if (mask & (1 << i)) {
          s += sizes[i]!;
          v += values[i]!;
        }
      if (s <= 7) brute = Math.max(brute, v);
    }
    expect(dp[5]![7]).toBe(21);
    expect(dp[5]![7]).toBe(brute);

    const input = [7, -2, 11, 4, 6];
    let min = input[0]!,
      max = input[0]!;
    for (let i = 1; i < input.length; i += 1) {
      expect(min).toBe(Math.min(...input.slice(0, i)));
      expect(max).toBe(Math.max(...input.slice(0, i)));
      min = Math.min(min, input[i]!);
      max = Math.max(max, input[i]!);
    }
    expect(max - min).toBe(13);
    const recurrence = (n: number): number => (n === 1 ? 1 : recurrence(n / 2) + n / 2);
    for (const n of [1, 2, 4, 8, 16, 32]) expect(recurrence(n)).toBe(n);
  });

  it('findet jedes unbeschädigte Ziel im einmal erhöhten sortierten Feld', () => {
    const search = (a: number[], x: number): number => {
      const binary = (lo: number, hi: number): number => {
        while (lo <= hi) {
          const m = (lo + hi) >> 1;
          if (a[m] === x) return m;
          if (a[m]! < x) lo = m + 1;
          else hi = m - 1;
        }
        return -1;
      };
      const rec = (lo: number, hi: number): number => {
        if (lo > hi) return -1;
        const m = (lo + hi) >> 1;
        if (a[m]! <= x) {
          const r = rec(m + 1, hi);
          return r >= 0 ? r : a[m] === x ? m : -1;
        }
        if (m < a.length - 1 && a[m]! > a[m + 1]!) {
          const r = binary(m + 1, hi);
          return r >= 0 ? r : binary(lo, m - 1);
        }
        return rec(lo, m - 1);
      };
      return rec(0, a.length - 1);
    };
    const generate = (prefix: number[], n: number): number[][] =>
      prefix.length === n
        ? [prefix]
        : [0, 1, 2, 3]
            .filter((v) => !prefix.length || v >= prefix.at(-1)!)
            .flatMap((v) => generate([...prefix, v], n));
    for (let n = 1; n <= 6; n += 1)
      for (const sorted of generate([], n))
        for (let bad = 0; bad < n; bad += 1)
          for (let delta = 1; delta <= 3; delta += 1) {
            const a = [...sorted];
            a[bad]! += delta;
            for (let i = 0; i < n; i += 1)
              if (i !== bad) expect(a[search(a, sorted[i]!)]).toBe(sorted[i]);
          }
  });

  it('prüft Windpark-DP und Modernisierungsregel', () => {
    const wind = (a: number[]) => {
      let before = 0,
        last = 0;
      for (const value of a) [before, last] = [last, Math.max(last, before + value)];
      return last;
    };
    for (const a of [
      [4, 1, 7, 3, 8],
      [2, 9, 2, 9],
      [0, 0, 1],
    ]) {
      let brute = 0;
      for (let mask = 0; mask < 1 << a.length; mask += 1) {
        if (mask & (mask << 1)) continue;
        let sum = 0;
        for (let i = 0; i < a.length; i += 1) if (mask & (1 << i)) sum += a[i]!;
        brute = Math.max(brute, sum);
      }
      expect(wind(a)).toBe(brute);
    }
    const modernizations = (weights: number[], k: number) => {
      let total = weights.reduce((a, b) => a + b, 0),
        count = 0;
      for (const w of [...weights].sort((a, b) => b - a))
        if (total > k) {
          total -= w - 1;
          count += 1;
        }
      return total <= k ? count : null;
    };
    expect(modernizations([9, 7, 3, 2], 13)).toBe(1);
    expect(modernizations([5, 4, 2], 2)).toBeNull();
  });
});
