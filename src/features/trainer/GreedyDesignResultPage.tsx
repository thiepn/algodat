import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import { practiceAttemptRepository } from '../../persistence/repositories';
import {
  ErrorAnalysis,
  MasteryImpact,
  RubricBreakdown,
  SourceCitationPanel,
} from './components/TrainerComponents';
import {
  canonicalGreedyDesignTextForTrainer,
  greedyDesignAnswerFromAttempt,
  scoreStoredGreedyDesignAttempt,
} from './greedy-design-service';
import { getGreedyDesignTrainerById } from './trainer-service';

export function GreedyDesignResultPage() {
  const { trainerId, attemptId } = useParams();
  const trainer = getGreedyDesignTrainerById(trainerId);
  const [attempt, setAttempt] = useState<PracticeAttempt | undefined>();
  useEffect(() => {
    if (attemptId) void practiceAttemptRepository.get(attemptId).then(setAttempt);
  }, [attemptId]);
  if (!trainer || !attempt)
    return (
      <section>
        <h1>Auswertung nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );
  const result = scoreStoredGreedyDesignAttempt(attempt, greedyDesignAnswerFromAttempt(attempt));
  return (
    <div className="page-flow trainer-result">
      <Link className="back-link" to={`/trainer/entwurf/greedy/${trainer.id}`}>
        ← Nächsten Greedy-Entwurf starten
      </Link>
      <header className="page-header">
        <p className="eyebrow">Auswertung · {attempt.mode}</p>
        <h1>
          {result.points}/{result.maxPoints} Punkte
        </h1>
        <p>
          Umgerechnet auf Aufgabe 7: {result.examPoints}/8 Punkte. Empfehlung:{' '}
          {result.recommendation.label}.
        </p>
      </header>
      <SourceCitationPanel trainer={trainer} />
      <RubricBreakdown results={result.rubricResults} />
      <ErrorAnalysis errors={result.errors} />
      <section className="canonical-solution">
        <h2>Belegte Musterlösung</h2>
        <ul>
          {canonicalGreedyDesignTextForTrainer().map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p>
          Beispielinstanz: {result.canonicalSolution.sampleInput.join(', ')} →{' '}
          {result.canonicalSolution.sortedOrder.join(', ')} mit Optimum{' '}
          {result.canonicalSolution.optimalValue}.
        </p>
      </section>
      <MasteryImpact
        dimensions={{
          greedy_rule: result.errors.some((error) => error.errorCode === 'greedy_rule_error')
            ? 0.45
            : 1,
          exchange_proof: result.errors.some((error) => error.errorCode === 'greedy_proof_error')
            ? 0.45
            : 1,
          complexity_analysis: result.errors.some(
            (error) => error.errorCode === 'greedy_runtime_error',
          )
            ? 0.6
            : 1,
        }}
      />
    </div>
  );
}
