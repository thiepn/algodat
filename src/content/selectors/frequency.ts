import type { Topic } from '../schemas';

export interface EvidenceFrequency {
  realExam: number;
  mockExam: number;
  exercise: number;
}

export function selectDuplicateSafeFrequency(topic: Topic): EvidenceFrequency {
  return {
    realExam: new Set(topic.realExamOccurrences).size,
    mockExam: new Set(topic.mockExamOccurrences).size,
    exercise: new Set(topic.exerciseOccurrences).size,
  };
}
