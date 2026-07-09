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
  canonicalDpDesignTextForTrainer,
  dpDesignAnswerFromAttempt,
  scoreStoredDpDesignAttempt,
} from './dp-design-service';
import { getDpDesignTrainerById } from './trainer-service';

export function DpDesignResultPage() {
  const { trainerId, attemptId } = useParams();
  const trainer = getDpDesignTrainerById(trainerId);
  const [attempt, setAttempt] = useState<PracticeAttempt | undefined>();
  useEffect(() => {
    if (attemptId) void practiceAttemptRepository.get(attemptId).then(setAttempt);
  }, [attemptId]);
  if (!trainer || !attempt)
    return (
      <section>
        <h1>Auswertung nicht gefunden</h1>
        <Link to="/trainer/entwurf/dp">Zur DP-Übersicht</Link>
      </section>
    );
  const result = scoreStoredDpDesignAttempt(attempt, dpDesignAnswerFromAttempt(attempt));
  return (
    <div className="page-flow trainer-result">
      <Link className="back-link" to={`/trainer/entwurf/dp/${trainer.id}`}>
        ← Nächsten DP-Entwurf starten
      </Link>
      <header className="page-header">
        <p className="eyebrow">Auswertung · {attempt.mode}</p>
        <h1>
          {result.points}/{result.maxPoints} Punkte
        </h1>
        <p>
          Umgerechnet auf Aufgabe 8: {result.examPoints}/8 Punkte. Empfehlung:{' '}
          {result.recommendation.label}.
        </p>
      </header>
      <SourceCitationPanel trainer={trainer} />
      <RubricBreakdown results={result.rubricResults} />
      <ErrorAnalysis errors={result.errors} />
      <section className="canonical-solution">
        <h2>Belegte Musterlösung</h2>
        <ul>
          {canonicalDpDesignTextForTrainer().map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <div className="task-table-wrapper">
          <table>
            <caption>
              Kanonische DP-Tabelle; Optimum {result.canonicalSolution.optimalValue}
            </caption>
            <tbody>
              {result.canonicalSolution.dpTable.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <th scope="row">i={rowIndex + 1}</th>
                  {row.map((value, columnIndex) => (
                    <td key={columnIndex}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <MasteryImpact
        dimensions={{
          state_definition: result.errors.some((error) => error.errorCode.includes('state'))
            ? 0.45
            : 1,
          recurrence_design: result.errors.some((error) => error.errorCode.includes('transition'))
            ? 0.45
            : 1,
          correctness_proof: result.errors.some((error) => error.errorCode === 'dp_proof_error')
            ? 0.45
            : 1,
        }}
      />
    </div>
  );
}
