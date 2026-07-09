import { describe, expect, it } from 'vitest';
import {
  bruteForceMaxDifference,
  canonicalMaxDifferenceAnswer,
  canonicalMaxDifferenceText,
  deriveDivideConquerDesignMastery,
  emptyMaxDifferenceAnswer,
  evaluateMaxDifferenceDesign,
  findMissingCrossCaseCounterexample,
  solveMaxDifferenceDivideConquer,
  validateMaxDifferenceOracle,
} from '../../src/domain/divide-conquer-design';

describe('Divide-and-Conquer maximale Wertdifferenz', () => {
  it('berechnet das belegte Rückgabetripel deterministisch', () => {
    expect(solveMaxDifferenceDivideConquer([7, 2, 9, 1, 5])).toEqual({
      maxDifference: 8,
      minimum: 1,
      maximum: 9,
    });
  });

  it('validiert kleine Instanzen gegen ein unabhängiges Brute-Force-Oracle', () => {
    expect(validateMaxDifferenceOracle([6, 3, 8, 2])).toBe(true);
    expect(bruteForceMaxDifference([5, 13, 7, 2, 9, 1])).toMatchObject({
      value: 12,
      leftIndex: 1,
      rightIndex: 5,
    });
  });

  it('weist ungültige Oracle-Eingaben explizit zurück', () => {
    expect(() => solveMaxDifferenceDivideConquer([])).toThrow('Mindestens ein Wert');
    expect(() => bruteForceMaxDifference([])).toThrow('Mindestens ein Wert');
    expect(() =>
      validateMaxDifferenceOracle(Array.from({ length: 11 }, (_, index) => index + 1)),
    ).toThrow('bis n=10');
  });

  it('findet ein Gegenbeispiel für einen fehlenden Cross-Fall', () => {
    const counterexample = findMissingCrossCaseCounterexample(4);
    expect(counterexample).not.toBeNull();
    expect(
      counterexample && solveMaxDifferenceDivideConquer(counterexample).maxDifference,
    ).toBeGreaterThan(0);
    expect(findMissingCrossCaseCounterexample(0)).toBeNull();
  });

  it('bewertet die kanonische strukturierte Antwort vollständig', () => {
    const result = evaluateMaxDifferenceDesign(canonicalMaxDifferenceAnswer(), {
      mode: 'exam',
      hintsUsed: [],
      solutionRevealed: false,
    });
    expect(result.points).toBe(48);
    expect(result.examPoints).toBe(8);
    expect(result.errors).toEqual([]);
  });

  it('diagnostiziert leere Antworten mit D&C-Fehlercodes', () => {
    const result = evaluateMaxDifferenceDesign(emptyMaxDifferenceAnswer(), {
      mode: 'practice',
      hintsUsed: [],
      solutionRevealed: false,
    });
    expect(result.points).toBeLessThan(result.maxPoints);
    expect(result.errors.map((error) => error.errorCode)).toContain('dc_missing_cross_case');
    expect(result.recommendation.code).toBe('repeat_dp_design_full');
  });

  it('setzt Caps für Hinweise und eingeblendete Lösung deterministisch um', () => {
    const hinted = evaluateMaxDifferenceDesign(canonicalMaxDifferenceAnswer(), {
      mode: 'practice',
      hintsUsed: ['combine'],
      solutionRevealed: false,
    });
    const revealed = evaluateMaxDifferenceDesign(canonicalMaxDifferenceAnswer(), {
      mode: 'learn',
      hintsUsed: [],
      solutionRevealed: true,
    });

    expect(hinted.points).toBe(31);
    expect(revealed.points).toBe(14);
  });

  it('ordnet Rekurrenz- und Beweisfehler spezifischen Wiederholungen zu', () => {
    const recurrenceAnswer = canonicalMaxDifferenceAnswer();
    recurrenceAnswer.recurrence.equation = 'T(n)=T(n/2)+O(1)';
    const recurrenceResult = evaluateMaxDifferenceDesign(recurrenceAnswer, {
      mode: 'exam',
      hintsUsed: [],
      solutionRevealed: false,
    });

    const proofAnswer = canonicalMaxDifferenceAnswer();
    proofAnswer.proof.claim = 'nicht belegt';
    const proofResult = evaluateMaxDifferenceDesign(proofAnswer, {
      mode: 'exam',
      hintsUsed: [],
      solutionRevealed: false,
    });

    expect(recurrenceResult.recommendation.code).toBe('repeat_recurrence');
    expect(proofResult.recommendation.code).toBe('repeat_proof_structure');
  });

  it('ordnet Cross-Fall- und Rückgabetripel-Fehler der Combine-Wiederholung zu', () => {
    const crossAnswer = canonicalMaxDifferenceAnswer();
    crossAnswer.combine.crossCase = 'ignoriere den Kreuzfall';
    const crossResult = evaluateMaxDifferenceDesign(crossAnswer, {
      mode: 'exam',
      hintsUsed: [],
      solutionRevealed: false,
    });

    const summaryAnswer = canonicalMaxDifferenceAnswer();
    summaryAnswer.combine.summary = 'return max(L[1], R[1])';
    const summaryResult = evaluateMaxDifferenceDesign(summaryAnswer, {
      mode: 'exam',
      hintsUsed: [],
      solutionRevealed: false,
    });

    expect(crossResult.recommendation.code).toBe('repeat_dp_recurrence');
    expect(summaryResult.recommendation.code).toBe('repeat_dp_recurrence');
  });

  it('wertet Übungs- und Lernmodi in Mastery V12 nachvollziehbar anders als Exam', () => {
    const mastery = deriveDivideConquerDesignMastery([
      {
        id: 'learn',
        mode: 'learn',
        score: 48,
        maxScore: 48,
        errorCodes: [],
        hintsUsed: [],
        solutionRevealed: false,
      },
      {
        id: 'practice',
        mode: 'practice',
        score: 48,
        maxScore: 48,
        errorCodes: [],
        hintsUsed: ['combine'],
        solutionRevealed: true,
      },
    ]);

    expect(mastery.evidenceAttemptIds).toEqual(['learn', 'practice']);
    expect(mastery.dimensions.problem_interpretation ?? 0).toBeGreaterThan(0);
    expect(mastery.dimensions.problem_interpretation ?? 0).toBeLessThan(1);
  });

  it('leitet Mastery V12 aus Fehlerprofilen ab', () => {
    const mastery = deriveDivideConquerDesignMastery([
      {
        id: 'a1',
        mode: 'exam',
        score: 40,
        maxScore: 48,
        errorCodes: ['dc_missing_cross_case'],
        hintsUsed: [],
        solutionRevealed: false,
      },
    ]);
    expect(mastery.evidenceAttemptIds).toEqual(['a1']);
    expect(mastery.dimensions.combine_cases ?? 0).toBeLessThan(
      mastery.dimensions.decomposition ?? 0,
    );
  });

  it('liefert kanonische Textbausteine für Ergebnis- und Hilfsansichten', () => {
    const text = canonicalMaxDifferenceText();
    expect(text).toHaveLength(4);
    expect(text.join(' ')).toContain('Rekurrenz');
  });
});
