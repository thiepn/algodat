import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import type { ProofMode } from '../../domain/proofs';
import { practiceAttemptRepository } from '../../persistence/repositories';
import {
  MathFormula,
  SourceCitationPanel,
  TrainingModeSelector,
} from './components/TrainerComponents';
import { createProofAttempt } from './proof-service';
import { getProofTrainerById, getRegistryEntry } from './trainer-service';

export function ProofTrainerPage() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const trainer = getProofTrainerById(trainerId);
  const registry = getRegistryEntry(trainerId);
  const [mode, setMode] = useState<ProofMode>('practice');
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [starting, setStarting] = useState(false);
  useEffect(() => void practiceAttemptRepository.list().then(setAttempts), []);
  if (!trainer || !registry)
    return (
      <section>
        <h1>Beweistrainer nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );
  const trainerAttempts = attempts.filter((attempt) => attempt.trainerId === trainer.id);
  const reviewAvailable = trainerAttempts.some((attempt) => attempt.status === 'completed');
  const latestCompletedAttempt = trainerAttempts
    .filter((attempt) => attempt.status === 'completed')
    .sort((left, right) => right.attemptedAt.localeCompare(left.attemptedAt))[0];
  const start = async () => {
    setStarting(true);
    const attempt = await createProofAttempt(mode, trainer.id);
    await navigate(`/trainer/beweise/${trainer.id}/versuch/${attempt.id}`);
  };
  return (
    <div className="page-flow trainer-detail">
      <Link className="back-link" to="/trainer">
        ← Trainerübersicht
      </Link>
      <header className="page-header">
        <p className="eyebrow">{registry.algorithmFamily} · aktiv beweisen</p>
        <h1>{trainer.title}</h1>
        <p>{trainer.historicalRelevance}</p>
      </header>
      <section className="trainer-briefing" aria-labelledby="proof-briefing-title">
        <div>
          <p className="eyebrow">Quellenausgerichtete Trainingsinstanz</p>
          <h2 id="proof-briefing-title">{trainer.problemClass}</h2>
          <p>{trainer.typicalExamTask}</p>
        </div>
        <dl className="metadata-list">
          <div>
            <dt>Eingabe</dt>
            <dd>{trainer.inputDescription}</dd>
          </div>
          <div>
            <dt>Ausgabe</dt>
            <dd>{trainer.outputDescription}</dd>
          </div>
          <div>
            <dt>Beweisfamilie</dt>
            <dd>{trainer.proofFamily}</dd>
          </div>
          <div>
            <dt>Invariante</dt>
            <dd>{trainer.centralInvariant}</dd>
          </div>
        </dl>
      </section>
      <div className="two-column">
        <section className="panel">
          <h2>Programm</h2>
          <pre className="code-block">{trainer.problem.program.pseudocode.join('\n')}</pre>
          <p>
            <strong>Aktive Idee:</strong> {trainer.intuition}
          </p>
          <p>
            <strong>Korrektheitsidee:</strong> {trainer.correctnessIdea}
          </p>
        </section>
        <section className="panel">
          <h2>Formelsprache</h2>
          <MathFormula
            formula={'\\sum_{j=1}^{n} j\\cdot A[j]'}
            label="Summe von j gleich 1 bis n über j mal A j"
          />
          <p className="quiet">
            Eingabeformat der Engine: <code>sum(j,1,n,j*A[j])</code>. Unterstützt werden +, -, *, ^,
            Klammern, Summen und Arrayzugriffe.
          </p>
        </section>
      </div>
      <SourceCitationPanel trainer={trainer} />
      <TrainingModeSelector mode={mode} setMode={setMode} reviewAvailable={reviewAvailable} />
      {mode === 'review' && latestCompletedAttempt && (
        <section className="panel" aria-labelledby="proof-review-title">
          <h2 id="proof-review-title">Fokus dieser Wiederholung</h2>
          {latestCompletedAttempt.errorCodes.length > 0 ? (
            <ul>
              {[...new Set(latestCompletedAttempt.errorCodes)].map((errorCode) => (
                <li key={errorCode}>{errorCode}</li>
              ))}
            </ul>
          ) : (
            <p>Der letzte Versuch war fehlerfrei. Wiederhole den Beweis ohne Hinweise.</p>
          )}
        </section>
      )}
      <button
        className="primary-button"
        type="button"
        disabled={starting || (mode === 'review' && !reviewAvailable)}
        onClick={() => void start()}
      >
        {starting ? 'Beweisversuch wird angelegt …' : 'Beweisversuch beginnen'}
      </button>
    </div>
  );
}
