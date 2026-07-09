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
  rbInsertionAnswerFromAttempt,
  scoreStoredRbInsertionAttempt,
} from './rb-insertion-service';
import { getRbInsertionTrainerById } from './trainer-service';

export function RbInsertionResultPage() {
  const { trainerId, attemptId } = useParams();
  const trainer = getRbInsertionTrainerById(trainerId);
  const [attempt, setAttempt] = useState<PracticeAttempt | undefined>();
  useEffect(() => {
    if (attemptId) void practiceAttemptRepository.get(attemptId).then(setAttempt);
  }, [attemptId]);
  if (!trainer || !attempt)
    return (
      <section>
        <h1>Rot-Schwarz-Auswertung nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );
  const result = scoreStoredRbInsertionAttempt(attempt, rbInsertionAnswerFromAttempt(attempt));
  return (
    <div className="page-flow trainer-result">
      <Link className="back-link" to={`/trainer/baeume/rot-schwarz/${trainer.id}`}>
        ← Nächsten Rot-Schwarz-Versuch starten
      </Link>
      <header className="page-header">
        <p className="eyebrow">Auswertung · {attempt.mode}</p>
        <h1>
          {result.points}/{result.maxPoints} Punkte
        </h1>
        <p>{result.recommendation}</p>
      </header>
      <SourceCitationPanel trainer={trainer} />
      <RubricBreakdown results={result.rubricResults} />
      <ErrorAnalysis errors={result.errors} />
      <section className="canonical-solution">
        <h2>Belegte Musterlösung</h2>
        <dl className="metadata-list">
          <div>
            <dt>NIL</dt>
            <dd>{result.canonicalSolution.nilConvention}</dd>
          </div>
          <div>
            <dt>Reparaturfälle</dt>
            <dd>{result.canonicalSolution.fixupCases}</dd>
          </div>
          <div>
            <dt>Endbaum</dt>
            <dd>
              <code>{result.canonicalSolution.finalTree}</code>
            </dd>
          </div>
          <div>
            <dt>Schwarzhöhe</dt>
            <dd>{result.canonicalSolution.blackHeight}</dd>
          </div>
          <div>
            <dt>Laufzeit</dt>
            <dd>{result.canonicalSolution.runtime}</dd>
          </div>
        </dl>
      </section>
      <MasteryImpact
        dimensions={{
          rb_reparaturfaelle: result.errors.some((error) => error.errorCode === 'rb_case_missing')
            ? 0.45
            : 1,
          rb_endbaum: result.errors.some((error) => error.errorCode === 'rb_final_tree_wrong')
            ? 0.45
            : 1,
          rb_invarianten: result.errors.some((error) => error.errorCode === 'rb_nil_missing')
            ? 0.6
            : 1,
        }}
      />
    </div>
  );
}
