import { describe, expect, it } from 'vitest';
import { diagnosticContent } from '../../src/content/loaders/diagnostics';
import {
  aggregateCompetencyResults,
  calculateDiagnosticConfidence,
  createDiagnosticSession,
  deriveDiagnosticMasteryV13,
  finalizeDiagnosticSession,
  generateDeterministicDiagnosticVariant,
  gradeDiagnosticItem,
  selectDiagnosticItems,
  validateItemBank,
} from '../../src/domain/foundations-diagnostic';

describe('Grundlagen-Diagnose-Domain', () => {
  it('validiert die produktive Itembank mit acht Gruppen und acht Itemtypen', () => {
    const items = validateItemBank(diagnosticContent.diagnosticItems);
    expect(items).toHaveLength(64);
    expect(
      new Set(diagnosticContent.foundationCompetencies.map((competency) => competency.group)).size,
    ).toBe(8);
    expect(new Set(items.map((item) => item.itemType)).size).toBe(8);
    expect(items.every((item) => item.sourceRefs.length > 0)).toBe(true);
  });

  it('wählt mit gleichem Seed dieselben Items ohne Duplikate aus', () => {
    const config = {
      mode: 'diagnosis' as const,
      itemCount: 16,
      seed: 'regression-seed',
      competencyTargets: diagnosticContent.foundationCompetencies.map(
        (competency) => competency.competencyId,
      ),
      timeLimitMinutes: 20,
    };
    const first = selectDiagnosticItems(diagnosticContent.diagnosticItems, config).map(
      (item) => item.id,
    );
    const second = selectDiagnosticItems(diagnosticContent.diagnosticItems, config).map(
      (item) => item.id,
    );
    expect(first).toEqual(second);
    expect(new Set(first).size).toBe(first.length);
  });

  it('bewertet SingleChoice, MultipleChoice, Matching, Ordering und Numeric deterministisch', () => {
    const single = diagnosticContent.diagnosticItems.find(
      (item) => item.itemType === 'single_choice',
    );
    const multiple = diagnosticContent.diagnosticItems.find(
      (item) => item.itemType === 'multiple_choice',
    );
    const matching = diagnosticContent.diagnosticItems.find((item) => item.itemType === 'matching');
    const ordering = diagnosticContent.diagnosticItems.find((item) => item.itemType === 'ordering');
    const numeric = diagnosticContent.diagnosticItems.find(
      (item) => item.itemType === 'numeric_short_answer',
    );
    if (!single || !multiple || !matching || !ordering || !numeric) throw new Error('Items fehlen');

    expect(
      gradeDiagnosticItem(single, {
        itemId: single.id,
        selectedOptionIds: single.answerDefinition.correctOptionIds,
        confidence: 5,
        answeredAt: '2026-07-09T00:00:00.000Z',
      }).points,
    ).toBe(single.rubric.maxPoints);

    const partial = gradeDiagnosticItem(multiple, {
      itemId: multiple.id,
      selectedOptionIds: [multiple.answerDefinition.correctOptionIds?.[0] ?? ''],
      confidence: 4,
      answeredAt: '2026-07-09T00:00:00.000Z',
    });
    expect(partial.points).toBeGreaterThan(0);
    expect(partial.points).toBeLessThan(multiple.rubric.maxPoints);

    expect(
      gradeDiagnosticItem(matching, {
        itemId: matching.id,
        selectedPairs: matching.answerDefinition.correctPairs,
        confidence: 5,
        answeredAt: '2026-07-09T00:00:00.000Z',
      }).correct,
    ).toBe(true);

    expect(
      gradeDiagnosticItem(ordering, {
        itemId: ordering.id,
        orderedIds: ordering.answerDefinition.correctOrderIds,
        confidence: 5,
        answeredAt: '2026-07-09T00:00:00.000Z',
      }).points,
    ).toBe(ordering.rubric.maxPoints);

    expect(
      gradeDiagnosticItem(numeric, {
        itemId: numeric.id,
        numericValue: numeric.answerDefinition.numericAnswer,
        confidence: 5,
        answeredAt: '2026-07-09T00:00:00.000Z',
      }).correct,
    ).toBe(true);
  });

  it('klassifiziert falsche Antworten mit Fehler, Evidenz und Empfehlung', () => {
    const item = diagnosticContent.diagnosticItems.find(
      (candidate) => candidate.itemType === 'single_choice',
    );
    if (!item) throw new Error('SingleChoice fehlt');
    const wrong = item.options.find((option) => !option.correct);
    if (!wrong) throw new Error('Distraktor fehlt');
    const result = gradeDiagnosticItem(item, {
      itemId: item.id,
      selectedOptionIds: [wrong.id],
      confidence: 5,
      answeredAt: '2026-07-09T00:00:00.000Z',
    });
    expect(result.points).toBe(0);
    expect(result.errors[0]?.evidence).toContain(wrong.text);
    expect(result.errors[0]?.relatedTrainerIds.length).toBeGreaterThan(0);
  });

  it('finalisiert Sessions, aggregiert Kompetenzen und berechnet Mastery V13', () => {
    const session = createDiagnosticSession(diagnosticContent.diagnosticItems, {
      mode: 'diagnosis',
      itemCount: 8,
      seed: 'finalize',
      competencyTargets: diagnosticContent.foundationCompetencies.map(
        (competency) => competency.competencyId,
      ),
      timeLimitMinutes: 20,
    });
    const responses = Object.fromEntries(
      session.itemIds.map((itemId) => {
        const item = diagnosticContent.diagnosticItems.find((candidate) => candidate.id === itemId);
        if (!item) throw new Error('Item fehlt');
        return [
          itemId,
          {
            itemId,
            selectedOptionIds: item.answerDefinition.correctOptionIds ?? [],
            selectedPairs: item.answerDefinition.correctPairs,
            orderedIds: item.answerDefinition.correctOrderIds,
            numericValue: item.answerDefinition.numericAnswer,
            algorithmId: item.answerDefinition.correctAlgorithmId,
            confidence: 5 as const,
            answeredAt: '2026-07-09T00:00:00.000Z',
          },
        ];
      }),
    );
    const completed = finalizeDiagnosticSession(
      { ...session, responses },
      diagnosticContent.diagnosticItems,
      diagnosticContent.foundationCompetencies,
      '2026-07-09T00:10:00.000Z',
    );
    expect(completed.completedAt).toBe('2026-07-09T00:10:00.000Z');
    expect(completed.finalScore.points).toBe(completed.finalScore.maxPoints);
    expect(completed.recommendations).toHaveLength(0);
    expect(deriveDiagnosticMasteryV13([completed]).evidenceSessionIds).toEqual([completed.id]);
  });

  it('berechnet Konfidenz und Varianten reproduzierbar', () => {
    const item = diagnosticContent.diagnosticItems[0];
    if (!item) throw new Error('Item fehlt');
    const variantA = generateDeterministicDiagnosticVariant(item, 'a');
    const variantB = generateDeterministicDiagnosticVariant(item, 'a');
    expect(variantA.options.map((option) => option.id)).toEqual(
      variantB.options.map((option) => option.id),
    );
    expect(
      calculateDiagnosticConfidence([
        {
          itemId: 'i',
          competencyIds: ['c'],
          itemType: 'single_choice',
          points: 1,
          maxPoints: 1,
          correct: true,
          completeness: 1,
          reasoningSelection: 1,
          confidence: 5,
          timeEfficiency: 1,
          errors: [],
        },
      ]),
    ).toBe(1);
    expect(aggregateCompetencyResults(diagnosticContent.foundationCompetencies, [])).toEqual([]);
  });
});
