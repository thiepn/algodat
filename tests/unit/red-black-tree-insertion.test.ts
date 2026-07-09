import { describe, expect, it } from 'vitest';
import {
  canonicalRbInsertionAnswer,
  evaluateRbInsertionAnswer,
  solveRbInsertion,
  validateRbInvariants,
} from '../../src/domain/red-black-tree';

describe('Rot-Schwarz-Einfügung', () => {
  it('erzeugt den kanonischen Endbaum und validiert alle Invarianten', () => {
    const solved = solveRbInsertion([10, 20, 30, 15]);
    expect(solved.finalTreeCompact).toBe('20B(10B(N,15R(N,N)),30B(N,N))');
    expect(solved.blackHeight).toBe(3);
    expect(solved.trace.some((step) => step.caseLabel === 'case-3-rotate')).toBe(true);
    expect(solved.trace.some((step) => step.caseLabel === 'case-1-recolor')).toBe(true);
    expect(validateRbInvariants(solved.finalTree, [10, 20, 30, 15]).valid).toBe(true);
  });

  it('bewertet die kanonische strukturierte Antwort voll', () => {
    const result = evaluateRbInsertionAnswer(canonicalRbInsertionAnswer());
    expect(result.points).toBe(40);
    expect(result.maxPoints).toBe(40);
    expect(result.errors).toHaveLength(0);
  });

  it('diagnostiziert falschen Endbaum und fehlende Reparaturfälle getrennt', () => {
    const answer = {
      ...canonicalRbInsertionAnswer(),
      fixupCases: 'nur einfügen',
      finalTree: '10B(N,N)',
    };
    const result = evaluateRbInsertionAnswer(answer);
    expect(result.errors.map((error) => error.errorCode)).toEqual([
      'rb_case_missing',
      'rb_final_tree_wrong',
    ]);
  });
});
