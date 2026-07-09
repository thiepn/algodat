import { describe, expect, it } from 'vitest';
import { selectedTrainer } from '../../src/features/trainer/trainer-service';
import {
  canonicalRowsAsInput,
  computeKnapsackTrace,
  serializeTrace,
  validateKnapsackProblem,
  type PreflightAnswers,
  type TraceSubmission,
  type TracingProblem,
} from '../../src/domain/tracing';

if (!selectedTrainer) throw new Error('Trainer-Fixture fehlt.');
const problem = selectedTrainer.problem;
const preflight: PreflightAnswers = {
  algorithm: 'knapsack_01',
  negativeWeights: false,
  indexingStartsAtZero: true,
  usesPreviousRow: true,
  eachItemAtMostOnce: true,
  output: 'complete_table_and_optimum',
  runtime: 'O(n · W)',
};

describe('deterministische Rucksack-Trace-Engine', () => {
  it('initialisiert die Nullzeile vollständig', () => {
    expect(computeKnapsackTrace(problem)[0]?.values).toEqual(Array(9).fill(0));
  });

  it('berechnet Aufnahme, Weglassen, Vorgängerzeile und kanonische Endlösung', () => {
    const trace = computeKnapsackTrace(problem);
    expect(trace.map((step) => step.values)).toEqual([
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 3, 3, 3, 3, 3, 3],
      [0, 0, 3, 4, 4, 7, 7, 7, 7],
      [0, 0, 3, 4, 7, 7, 10, 11, 11],
      [0, 0, 3, 4, 7, 8, 10, 11, 12],
    ]);
    expect(trace[3]?.ties).toContain(5);
    expect(trace[4]?.ties).toContain(7);
    expect(trace.at(-1)?.values.at(-1)).toBe(12);
  });

  it('wendet bei Gleichstand explizit exclude_on_equal an', () => {
    const decision = computeKnapsackTrace(problem)[3]?.decisions.find(
      (entry) => entry.capacity === 5,
    );
    expect(decision).toMatchObject({ excludeValue: 7, includeValue: 7, decision: 'exclude' });
  });

  it('unterstützt Kapazität 0 und unerreichbare Gewichte', () => {
    const small = { ...problem, capacity: 0, items: [{ id: 'X', weight: 4, value: 9 }] };
    expect(computeKnapsackTrace(small).map((step) => step.values)).toEqual([[0], [0]]);
  });

  it('lehnt leere Instanzen, negative Kapazität und nichtpositive Gewichte ab', () => {
    expect(() => validateKnapsackProblem({ ...problem, items: [] })).toThrow();
    expect(() => validateKnapsackProblem({ ...problem, capacity: -1 })).toThrow();
    expect(() =>
      validateKnapsackProblem({ ...problem, items: [{ id: 'X', weight: -1, value: 2 }] }),
    ).toThrow();
  });

  it('serialisiert denselben Input reproduzierbar', () => {
    expect(serializeTrace(computeKnapsackTrace(problem))).toBe(
      serializeTrace(computeKnapsackTrace(structuredClone(problem))),
    );
  });

  it('erzeugt für gerichtete Graphfragen keine stillschweigende Fremdsemantik', () => {
    expect(() => validateKnapsackProblem({ ...problem, taskType: 'graph_tracing' })).toThrow();
  });

  it('liefert eine vollständige kanonische Nutzereingabe', () => {
    const rows = canonicalRowsAsInput(problem);
    const submission: TraceSubmission = {
      rows,
      preflight,
      finalValue: 12,
      mode: 'practice',
      hintsUsed: [],
      solutionRevealed: false,
    };
    expect(submission.rows).toHaveLength(5);
    expect(submission.rows[3]?.tieChoices['3:5']).toBe('exclude');
  });
});

describe('abgegrenzte Eigenschaftstests', () => {
  const variants: TracingProblem[] = Array.from({ length: 8 }, (_, offset) => ({
    ...problem,
    id: `property-${offset}`,
    capacity: offset + 1,
    items: [
      { id: 'A', weight: 1, value: offset + 1 },
      { id: 'B', weight: 2, value: offset + 2 },
      { id: 'C', weight: 3, value: offset + 4 },
    ],
  }));

  it.each(variants)(
    'Werte sinken weder durch größere Kapazität noch durch weitere Objekte: $id',
    (variant) => {
      const trace = computeKnapsackTrace(variant);
      for (const row of trace) {
        for (let capacity = 1; capacity < row.values.length; capacity += 1)
          expect(row.values[capacity]).toBeGreaterThanOrEqual(row.values[capacity - 1] ?? 0);
      }
      for (let index = 1; index < trace.length; index += 1) {
        const current = trace[index];
        const previous = trace[index - 1];
        current?.values.forEach((value, capacity) =>
          expect(value).toBeGreaterThanOrEqual(previous?.values[capacity] ?? 0),
        );
      }
    },
  );

  it.each(variants)('derselbe gültige Input bleibt deterministisch: $id', (variant) => {
    expect(computeKnapsackTrace(variant)).toEqual(computeKnapsackTrace(variant));
  });
});
