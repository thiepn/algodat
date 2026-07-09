import { describe, expect, it } from 'vitest';
import {
  canonicalRecurrenceAttempt,
  createRecurrenceProblem,
  deriveRecurrenceMastery,
  evaluateRecurrenceProof,
  parseSupportedRecurrence,
} from '../../src/domain/recurrences';

describe('Rekurrenz-Laufzeitbeweis-Engine', () => {
  it('parst nur die belegte Phase-5-Rekurrenz produktiv', () => {
    expect(parseSupportedRecurrence('T(n)=8T(n/2)+n^3; T(1)=1')).toEqual({
      a: 8,
      b: 2,
      f: 'n^3',
      baseValue: 1,
    });
    expect(() => parseSupportedRecurrence('T(n)=16T(n/4)+n^3; T(1)=1')).toThrow();
  });

  it('bewertet den kanonischen Rekurrenzbeweis mit voller Punktzahl', () => {
    const result = evaluateRecurrenceProof(
      createRecurrenceProblem(),
      canonicalRecurrenceAttempt(),
      {
        mode: 'exam',
        hintsUsed: [],
        solutionRevealed: false,
      },
    );
    expect(result.points).toBe(23);
    expect(result.maxPoints).toBe(23);
    expect(result.errors).toHaveLength(0);
    expect(result.canonicalProof.master.result).toBe('O(n^3 log n)');
  });

  it('findet Master-Fall-Fehler deterministisch und leitet Mastery V4 ab', () => {
    const answer = canonicalRecurrenceAttempt();
    answer.parameters.masterCase = 'fall2';
    const result = evaluateRecurrenceProof(createRecurrenceProblem(), answer, {
      mode: 'practice',
      hintsUsed: [],
      solutionRevealed: false,
    });
    expect(result.points).toBeLessThan(23);
    expect(result.errors.map((error) => error.errorCode)).toContain('master_case_error');
    expect(result.recommendation.code).toBe('repeat_recurrence_master_case');
    const mastery = deriveRecurrenceMastery([
      {
        id: 'attempt-1',
        mode: 'practice',
        score: result.points,
        maxScore: result.maxPoints,
        errorCodes: result.errors.map((error) => error.errorCode),
        hintsUsed: [],
        solutionRevealed: false,
      },
    ]);
    expect(mastery.dimensions.master_theorem_application ?? 0).toBeLessThan(
      mastery.dimensions.parameter_identification ?? 0,
    );
  });
});
