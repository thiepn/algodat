import { describe, expect, it } from 'vitest';
import trainers from '../../src/content/generated/graph-tracing-trainers.json';
import {
  canonicalFloydWarshallAnswer,
  deriveGraphTracingMastery,
  emptyFloydWarshallAnswer,
  evaluateFloydWarshallAnswer,
  matrixToInput,
  parseMatrixInput,
  solveFloydWarshall,
} from '../../src/domain/graph-tracing';
import { GraphTracingTrainerSchema } from '../../src/content/schemas';

const trainer = GraphTracingTrainerSchema.parse(
  trainers.find((candidate) => candidate.id === 'trainer-graph-floyd-warshall-v1'),
);
const problem = trainer.problem;
if (problem.algorithm !== 'floyd_warshall') throw new Error('Floyd-Warshall-Fixture fehlt.');

describe('Floyd-Warshall Graph-Tracing', () => {
  it('reproduziert die kanonische Matrixfolge deterministisch', () => {
    const steps = solveFloydWarshall(problem);
    expect(steps.map((step) => step.label)).toEqual(['D(0)', 'D(1)', 'D(2)', 'D(3)', 'D(4)']);
    expect(matrixToInput(steps[4]!.matrix)).toBe('0 5 8 9; 2 0 3 4; -1 4 0 1; -2 3 6 0');
    expect(steps[4]!.matrix).toEqual(problem.canonicalSolution.matrices[4]!.matrix);
  });

  it('normalisiert Unendlich-Schreibweisen ohne stillschweigende Zahlenannahme', () => {
    expect(parseMatrixInput('0 inf; unendlich 0', 2)).toEqual([
      [0, null],
      [null, 0],
    ]);
    expect(() => parseMatrixInput('0 x; ∞ 0', 2)).toThrow();
  });

  it('bewertet die kanonische Antwort voll und falsche Iterationen partiell', () => {
    const full = evaluateFloydWarshallAnswer(problem, canonicalFloydWarshallAnswer(problem));
    expect(full.points).toBe(40);
    expect(full.errors).toHaveLength(0);

    const broken = evaluateFloydWarshallAnswer(problem, {
      ...canonicalFloydWarshallAnswer(problem),
      d4: emptyFloydWarshallAnswer().d4,
      runtime: 'O(n^2)',
    });
    expect(broken.points).toBeLessThan(40);
    expect(broken.errors.map((error) => error.errorCode)).toContain('fw_matrix_parse_error');
    expect(broken.errors.map((error) => error.errorCode)).toContain('fw_runtime_wrong');
  });

  it('leitet Mastery V9 aus Rubrikergebnissen ab', () => {
    const result = evaluateFloydWarshallAnswer(problem, canonicalFloydWarshallAnswer(problem));
    const mastery = deriveGraphTracingMastery(result);
    expect(mastery.modelVersion).toBe('mastery-v9');
    expect(mastery.dimensions.fw_iterationen).toBe(1);
  });
});
