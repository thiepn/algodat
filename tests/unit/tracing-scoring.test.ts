import { describe, expect, it } from 'vitest';
import { selectedTrainer } from '../../src/features/trainer/trainer-service';
import {
  canonicalRowsAsInput,
  deriveMastery,
  scoreKnapsackTrace,
  type PreflightAnswers,
  type TraceSubmission,
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
const correct = (): TraceSubmission => ({
  rows: canonicalRowsAsInput(problem),
  preflight,
  finalValue: 12,
  mode: 'practice',
  hintsUsed: [],
  solutionRevealed: false,
});

describe('Teilpunkt-Rubrik', () => {
  it('vergibt für die vollständige Lösung exakt 12 Punkte', () => {
    const result = scoreKnapsackTrace(problem, correct());
    expect(result.points).toBe(12);
    expect(result.errors).toEqual([]);
    expect(result.recommendation.code).toBe('learning_path_complete');
  });

  it('bewertet eine vollständig leere Lösung ohne Rundungsartefakte', () => {
    const submission = correct();
    submission.rows = submission.rows.map((row) => ({
      ...row,
      values: row.values.map(() => null),
      tieChoices: {},
    }));
    submission.finalValue = null;
    const result = scoreKnapsackTrace(problem, submission);
    expect(result.points).toBe(1);
    expect(result.errors.some((error) => error.errorCode === 'incomplete_answer')).toBe(true);
  });

  it('erhält Verfahrenspunkte bei einem frühen konsistent fortgeführten Folgefehler', () => {
    const submission = correct();
    const row1 = submission.rows[1];
    const row2 = submission.rows[2];
    if (!row1 || !row2) throw new Error('Fixture unvollständig.');
    row1.values[2] = 2;
    row2.values = row2.values.map((_, capacity) => {
      const exclude = row1.values[capacity] ?? 0;
      return capacity < 3 ? exclude : Math.max(exclude, (row1.values[capacity - 3] ?? 0) + 4);
    });
    const result = scoreKnapsackTrace(problem, submission);
    expect(
      result.rubricResults.find((entry) => entry.criterionId === 'method_consistency')?.points,
    ).toBeGreaterThan(1.5);
    expect(
      result.rubricResults.find((entry) => entry.criterionId === 'canonical_rows')?.points,
    ).toBeLessThan(6);
  });

  it('erkennt Tie-Breaker-Fehler trotz korrekter Distanzwerte', () => {
    const submission = correct();
    const row3 = submission.rows[3];
    if (!row3) throw new Error('Fixture unvollständig.');
    row3.tieChoices['3:5'] = 'include';
    const result = scoreKnapsackTrace(problem, submission);
    expect(result.errors.some((error) => error.errorCode === 'tie_breaker_error')).toBe(true);
    expect(result.recommendation.code).toBe('repeat_tie_breaker');
  });

  it('begrenzt aufgedeckte Lösungen auf 70 Prozent', () => {
    const submission = correct();
    submission.solutionRevealed = true;
    expect(scoreKnapsackTrace(problem, submission).points).toBe(8.4);
  });

  it('Prüfungsmodus verändert die fachliche Punktzahl nicht', () => {
    const submission = correct();
    submission.mode = 'exam';
    expect(scoreKnapsackTrace(problem, submission).points).toBe(12);
  });
});

describe('Mastery-Modell v1', () => {
  const result = scoreKnapsackTrace(problem, correct());
  const evidence = {
    id: 'attempt-1',
    mode: 'practice' as const,
    score: result.points,
    maxScore: result.maxPoints,
    rubricResults: result.rubricResults,
    errorCodes: result.errors.map((error) => error.errorCode),
    hintsUsed: [] as string[],
    solutionRevealed: false,
    durationMs: 300_000,
    contentVersion: 'v1',
  };

  it('garantiert nach einem Versuch noch keine dauerhafte Beherrschung', () => {
    const mastery = deriveMastery([evidence]);
    expect(mastery.dimensions.tracing).toBe(0.55);
    expect(mastery.dimensions.timed_performance).toBe(0);
  });

  it('ist aus denselben Versuchen vollständig reproduzierbar', () => {
    expect(deriveMastery([evidence])).toEqual(deriveMastery([structuredClone(evidence)]));
  });

  it('gewichtet Prüfungsmodus stärker und aufgedeckte Lösungen schwächer', () => {
    const exam = { ...evidence, id: 'attempt-2', mode: 'exam' as const };
    const revealed = { ...evidence, id: 'attempt-3', solutionRevealed: true, score: 8.4 };
    expect(deriveMastery([evidence, exam]).dimensions.timed_performance).toBeGreaterThan(0);
    expect(deriveMastery([revealed]).dimensions.tracing).toBeLessThan(
      deriveMastery([evidence]).dimensions.tracing,
    );
  });
});
