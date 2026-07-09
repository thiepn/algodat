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
  canonicalDivideConquerDesignTextForTrainer,
  divideConquerDesignAnswerFromAttempt,
  scoreStoredDivideConquerDesignAttempt,
} from './divide-conquer-design-service';
import { getDivideConquerDesignTrainerById } from './trainer-service';

export function DivideConquerDesignResultPage() {
  const { trainerId, attemptId } = useParams();
  const trainer = getDivideConquerDesignTrainerById(trainerId);
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
  const result = scoreStoredDivideConquerDesignAttempt(
    attempt,
    divideConquerDesignAnswerFromAttempt(attempt),
  );
  return (
    <div className="page-flow trainer-result">
      <Link className="back-link" to={`/trainer/entwurf/divide-and-conquer/${trainer.id}`}>
        ← Nächsten D&C-Entwurf starten
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
          {canonicalDivideConquerDesignTextForTrainer().map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p>
          Beispielinstanz: {result.canonicalSolution.sampleInput.join(', ')} → maximale Differenz{' '}
          {result.canonicalSolution.result.maxDifference}, Minimum{' '}
          {result.canonicalSolution.result.minimum}, Maximum{' '}
          {result.canonicalSolution.result.maximum}.
        </p>
      </section>
      <MasteryImpact
        dimensions={{
          decomposition: result.errors.some((error) => error.errorCode === 'dc_subproblem_error')
            ? 0.55
            : 1,
          combine_cases: result.errors.some((error) => error.errorCode === 'dc_missing_cross_case')
            ? 0.35
            : 1,
          induction_proof: result.errors.some((error) => error.errorCode === 'dc_proof_error')
            ? 0.45
            : 1,
        }}
      />
    </div>
  );
}
