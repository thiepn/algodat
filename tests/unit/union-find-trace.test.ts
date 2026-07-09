import { describe, expect, it } from 'vitest';
import trainers from '../../src/content/generated/tracing-trainers.json';
import {
  applyMakeSet,
  applyUnion,
  canonicalUnionFindInput,
  computeUnionFindTrace,
  createInitialState,
  scoreUnionFindTrace,
  serializeUnionFindState,
  serializeUnionFindTrace,
  validateUnionFindInvariants,
  type UnionFindPreflightAnswers,
  type UnionFindTracingProblem,
} from '../../src/domain/tracing';

const trainer = trainers.find((candidate) => candidate.id === 'trainer-union-find-listen-v1');
if (!trainer || trainer.problem.algorithm !== 'union_find_linked_lists')
  throw new Error('Union-Find-Trainer fehlt.');
const problem = trainer.problem as UnionFindTracingProblem;

const preflight: UnionFindPreflightAnswers = {
  algorithm: 'union_find_linked_lists',
  representation: 'linked_lists_with_representative_pointer',
  startsEmpty: true,
  weightedUnion: true,
  tieBreaker: 'lexicographically_smaller_representative_is_smaller_set',
  output: 'checkpoint_sets_representatives_next_size',
  nextDirection: 'head_to_tail',
  runtime: 'O(m + n log n)',
};

describe('Union-Find-Listen-Engine', () => {
  it('berechnet den kanonischen Trace mit Weighted Union und Tie-Breaker', () => {
    const trace = computeUnionFindTrace(problem);
    expect(trace.map((state) => [state.operationIndex, serializeUnionFindState(state)])).toEqual([
      [6, 'F: F; G: G; H: H; I: I; J: J; K: K'],
      [7, 'F: F; G: G; I: I; J: J>H; K: K'],
      [8, 'G: G>F; I: I; J: J>H; K: K'],
      [9, 'G: G>F; I: I; J: J>H>K'],
      [10, 'I: I; J: J>H>K>G>F'],
      [11, 'J: J>H>K>G>F>I'],
    ]);
    expect(trace.map((state) => state.attachedList?.from ?? 'keine')).toEqual([
      'keine',
      'H',
      'F',
      'K',
      'G',
      'I',
    ]);
  });

  it('erhält die fachlichen Invarianten an jedem Kontrollpunkt', () => {
    for (const state of computeUnionFindTrace(problem)) {
      expect(validateUnionFindInvariants(state)).toEqual([]);
      for (const set of state.sets) {
        expect(set.size).toBe(set.orderedElements.length);
        expect(set.head).toBe(set.orderedElements[0]);
        expect(set.tail).toBe(set.orderedElements.at(-1));
      }
    }
  });

  it('lehnt doppelte Make-Set- und unbekannte Union-Operationen ab', () => {
    const state = applyMakeSet(createInitialState(), 'A', 1);
    expect(() => applyMakeSet(state, 'A', 2)).toThrow(/doppelt/u);
    expect(() => applyUnion(state, 'A', 'B', 3)).toThrow(/unbekannt/u);
  });

  it('serialisiert deterministisch', () => {
    expect(serializeUnionFindTrace(computeUnionFindTrace(problem))).toBe(
      serializeUnionFindTrace(computeUnionFindTrace(problem)),
    );
  });

  it('bewertet eine vollständige korrekte Abgabe mit 12 Punkten', () => {
    const result = scoreUnionFindTrace(problem, {
      checkpoints: canonicalUnionFindInput(problem),
      preflight,
      mode: 'exam',
      hintsUsed: [],
      solutionRevealed: false,
    });
    expect(result.points).toBe(12);
    expect(result.errors).toHaveLength(0);
  });

  it('klassifiziert Tie-Breaker-, Pointer- und Repräsentantenfehler evidenzbasiert', () => {
    const checkpoints = canonicalUnionFindInput(problem);
    checkpoints[1] = { ...checkpoints[1]!, attachedList: 'J->H' };
    checkpoints[3] = { ...checkpoints[3]!, stateText: 'I: I; G: G>F>J>H>K' };
    const result = scoreUnionFindTrace(problem, {
      checkpoints,
      preflight,
      mode: 'practice',
      hintsUsed: ['hint-tie-breaker'],
      solutionRevealed: false,
    });
    expect(result.points).toBeLessThan(12);
    expect(result.errors.map((error) => error.errorCode)).toContain('tie_breaker_error');
    expect(result.errors.map((error) => error.errorCode)).toContain('stale_representative_pointer');
    expect(result.errors.every((error) => error.evidence.length > 0)).toBe(true);
  });

  it('kappt Lösungsoffenlegung und unvollständige Zustände', () => {
    const result = scoreUnionFindTrace(problem, {
      checkpoints: [{ operationIndex: 6, stateText: '', attachedList: '' }],
      preflight,
      mode: 'practice',
      hintsUsed: [],
      solutionRevealed: true,
    });
    expect(result.points).toBeLessThanOrEqual(8.4);
    expect(result.errors.map((error) => error.errorCode)).toContain('incomplete_state_error');
  });
});
