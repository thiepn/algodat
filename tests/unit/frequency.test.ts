import { describe, expect, it } from 'vitest';
import { selectDuplicateSafeFrequency } from '../../src/content/selectors/frequency';
import type { Topic } from '../../src/content/schemas';

const topic = {
  realExamOccurrences: ['exam-2022-1/A3', 'exam-2022-1/A3', 'exam-2024-1/A1'],
  mockExamOccurrences: ['mock-2023/A3'],
  exerciseOccurrences: ['src-a/A1', 'src-a/A1'],
} as Topic;

describe('duplikatsichere Häufigkeiten', () => {
  it('zählt Ereignis-IDs je Evidenzmenge nur einmal', () => {
    expect(selectDuplicateSafeFrequency(topic)).toEqual({ realExam: 2, mockExam: 1, exercise: 1 });
  });
});
