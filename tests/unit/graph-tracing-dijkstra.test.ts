import { describe, expect, it } from 'vitest';
import trainers from '../../src/content/generated/graph-tracing-trainers.json';
import { GraphTracingTrainerSchema } from '../../src/content/schemas';
import {
  canonicalDijkstraAnswer,
  deriveGraphTracingMastery,
  evaluateDijkstraAnswer,
  solveDijkstra,
} from '../../src/domain/graph-tracing';

const trainer = GraphTracingTrainerSchema.parse(
  trainers.find((candidate) => candidate.id === 'trainer-graph-dijkstra-v1'),
);
const problem = trainer.problem;
if (problem.algorithm !== 'dijkstra') throw new Error('Dijkstra-Fixture fehlt.');

describe('Dijkstra Graph-Tracing', () => {
  it('berechnet die kanonische Markierungs- und Distanzspur deterministisch', () => {
    const steps = solveDijkstra(problem);
    expect(steps.map((step) => step.markedVertex)).toEqual([null, 'A', 'C', 'B', 'D', 'E']);
    expect(steps.at(-1)?.distances).toEqual({ A: 0, B: 3, C: 2, D: 5, E: 6 });
    expect(steps.at(-1)?.predecessors).toEqual({
      A: null,
      B: 'C',
      C: 'A',
      D: 'B',
      E: 'D',
    });
  });

  it('bewertet die kanonische Antwort voll und erkennt falsche Vorgänger', () => {
    const full = evaluateDijkstraAnswer(problem, canonicalDijkstraAnswer(problem));
    expect(full.points).toBe(40);
    expect(full.errors).toHaveLength(0);

    const broken = evaluateDijkstraAnswer(problem, {
      ...canonicalDijkstraAnswer(problem),
      predecessorTable: '0: NIL NIL NIL NIL NIL',
      markedOrder: 'A, B, C, D, E',
    });
    expect(broken.points).toBeLessThan(40);
    expect(broken.errors.map((error) => error.errorCode)).toContain(
      'dijkstra_predecessor_table_wrong',
    );
    expect(broken.errors.map((error) => error.errorCode)).toContain('dijkstra_marked_order_wrong');
  });

  it('leitet Mastery V10 aus Dijkstra-Rubrikergebnissen ab', () => {
    const result = evaluateDijkstraAnswer(problem, canonicalDijkstraAnswer(problem));
    const mastery = deriveGraphTracingMastery(result);
    expect(mastery.modelVersion).toBe('mastery-v10');
    expect(mastery.dimensions.dijkstra_extract_min).toBe(1);
  });
});
