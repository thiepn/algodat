import { describe, expect, it } from 'vitest';
import {
  canonicalProofAttempt,
  createSumProofProblem,
  deriveProofMastery,
  evaluateStructuredProof,
} from '../../src/domain/proofs';

describe('Schleifeninvarianten-Beweisengine', () => {
  it('bewertet den kanonischen Beweis deterministisch mit voller Punktzahl', () => {
    const result = evaluateStructuredProof(createSumProofProblem(), canonicalProofAttempt(), {
      mode: 'exam',
      hintsUsed: [],
      solutionRevealed: false,
    });
    expect(result.points).toBe(16);
    expect(result.errors).toHaveLength(0);
    expect(result.recommendation.code).toBe('learning_path_complete');
  });

  it('erkennt den typischen i-statt-i-1-Fehler in der Invariante', () => {
    const proof = canonicalProofAttempt();
    proof.invariant.expression = 'sum(j,1,i,j*A[j])';
    const result = evaluateStructuredProof(createSumProofProblem(), proof, {
      mode: 'practice',
      hintsUsed: [],
      solutionRevealed: false,
    });
    expect(result.points).toBeLessThan(16);
    expect(result.errors.map((error) => error.errorCode)).toContain('off_by_one_error');
  });

  it('senkt Mastery V3 bei Timing- und Notationsfehlern gezielt', () => {
    const mastery = deriveProofMastery([
      {
        id: 'a-1',
        mode: 'practice',
        score: 8,
        maxScore: 16,
        errorCodes: ['invariant_timing_error', 'expression_parse_error'],
        hintsUsed: ['proof-hint-timing'],
        solutionRevealed: false,
      },
    ]);
    expect(mastery.evidenceAttemptIds).toEqual(['a-1']);
    expect(mastery.dimensions.loop_timing ?? 0).toBeLessThan(
      mastery.dimensions.program_comprehension ?? 0,
    );
    expect(mastery.dimensions.notation_accuracy ?? 0).toBeLessThan(
      mastery.dimensions.program_comprehension ?? 0,
    );
  });
});
