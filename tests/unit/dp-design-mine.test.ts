import { describe, expect, it } from 'vitest';
import {
  bruteForceMine,
  canonicalMineDesignAnswer,
  createMineProblemInstance,
  emptyMineDesignAnswer,
  evaluateMineDesign,
  solveMineDp,
} from '../../src/domain/dp-design';

describe('DP-Entwurfstrainer Mine', () => {
  it('berechnet die belegte DP-Tabelle und das Optimum deterministisch', () => {
    const problem = createMineProblemInstance();
    const solved = solveMineDp(problem.matrix);
    expect(solved.table).toEqual([
      [5, 6, 12, 9, 43],
      [50, 28, 67, 51, 44],
      [151, 79, 173, 85, 53],
      [168, 192, 195, 214, 91],
    ]);
    expect(solved.optimalValue).toBe(214);
  });

  it('stimmt mit dem vollständigen Brute-Force-Orakel überein', () => {
    const problem = createMineProblemInstance();
    expect(solveMineDp(problem.matrix).optimalValue).toBe(bruteForceMine(problem.matrix));
  });

  it('bewertet die kanonische strukturierte Lösung mit voller Punktzahl', () => {
    const result = evaluateMineDesign(canonicalMineDesignAnswer(), {
      mode: 'exam',
      hintsUsed: [],
      solutionRevealed: false,
    });
    expect(result.points).toBe(54);
    expect(result.examPoints).toBe(8);
    expect(result.errors).toHaveLength(0);
  });

  it('erkennt einen falschen Zustand und empfiehlt Wiederholung der Zustandsdefinition', () => {
    const answer = canonicalMineDesignAnswer();
    answer.state.entryMeaning = 'G(i,j) ist nur der Wert von a_ij.';
    const result = evaluateMineDesign(answer, {
      mode: 'practice',
      hintsUsed: [],
      solutionRevealed: false,
    });
    expect(result.errors.map((error) => error.errorCode)).toContain('dp_state_meaning_error');
    expect(result.recommendation.code).toBe('repeat_dp_state_definition');
  });

  it('kappt offengelegte Musterbausteine deterministisch', () => {
    const result = evaluateMineDesign(emptyMineDesignAnswer(), {
      mode: 'learn',
      hintsUsed: [],
      solutionRevealed: true,
    });
    expect(result.points).toBeLessThanOrEqual(16);
  });
});
