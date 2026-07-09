import { describe, expect, it } from 'vitest';
import { content } from '../../src/content/loaders/content';

describe('Trennung der Prüfungsevidenz', () => {
  it('enthält keine Übungen oder Probeklausuren in realen Treffern', () => {
    const real = content.topics.flatMap((topic) => topic.realExamOccurrences);
    expect(real.every((entry) => entry.startsWith('exam-'))).toBe(true);
    expect(real.some((entry) => entry.includes('2026') || entry.startsWith('mock-'))).toBe(false);
  });

  it('kennzeichnet nur reale Klausurquellen als historisch frequenzfähig', () => {
    expect(
      content.sources
        .filter((source) => source.historicalFrequencyEligible)
        .every((source) => source.evidenceType === 'real_exam'),
    ).toBe(true);
  });
});
