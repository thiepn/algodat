import { describe, expect, it } from 'vitest';
import {
  canonicalFitnesspunkteAnswer,
  emptyFitnesspunkteAnswer,
  evaluateFitnesspunkteDesign,
  solveFitnesspunkteGreedy,
  validateGreedyOracle,
} from '../../src/domain/greedy-design';

describe('Greedy-Entwurf Fitnesspunkte', () => {
  it('sortiert absteigend und berechnet den belegten Zielfunktionswert', () => {
    expect(solveFitnesspunkteGreedy([4, 9, 2, 7])).toEqual({
      sortedOrder: [9, 7, 4, 2],
      optimalValue: 67,
    });
  });

  it('validiert kleine Instanzen gegen vollständige Permutationssuche', () => {
    expect(validateGreedyOracle([3, 1, 8])).toBe(true);
    expect(validateGreedyOracle([5, 11, 1, 8, 3])).toBe(true);
  });

  it('bewertet die kanonische strukturierte Antwort vollständig', () => {
    const result = evaluateFitnesspunkteDesign(canonicalFitnesspunkteAnswer(), {
      mode: 'exam',
      hintsUsed: [],
      solutionRevealed: false,
    });
    expect(result.points).toBe(40);
    expect(result.examPoints).toBe(8);
    expect(result.errors).toEqual([]);
  });

  it('diagnostiziert eine leere Antwort deterministisch', () => {
    const result = evaluateFitnesspunkteDesign(emptyFitnesspunkteAnswer(), {
      mode: 'practice',
      hintsUsed: [],
      solutionRevealed: false,
    });
    expect(result.points).toBeLessThan(result.maxPoints);
    expect(result.errors.map((error) => error.errorCode)).toContain('greedy_rule_error');
    expect(result.recommendation.code).toBe('repeat_greedy_rule');
  });
});
