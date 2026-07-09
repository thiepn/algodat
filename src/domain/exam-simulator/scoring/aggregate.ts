import { addExact, divideExact, exact } from './exact-points';
import type { ExamScoreAggregate, ExamTaskScore } from '../types';

export function aggregateExamScores(taskScores: ExamTaskScore[]): ExamScoreAggregate {
  const totalScore = taskScores.reduce(
    (sum, score) => addExact(sum, score.mappedExamScore),
    exact(0),
  );
  const maximumScore = taskScores.reduce(
    (sum, score) => addExact(sum, score.examMaximum),
    exact(0),
  );
  return {
    totalScore,
    maximumScore,
    percentage: maximumScore.numerator === 0n ? exact(0) : divideExact(totalScore, maximumScore),
    taskScores,
  };
}
