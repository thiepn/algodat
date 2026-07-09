import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import type { RecurrenceMode } from '../../domain/recurrences';
import { practiceAttemptRepository } from '../../persistence/repositories';
import { MathFormula, SourceCitationPanel } from './components/TrainerComponents';
import { createRecurrenceAttempt } from './recurrence-service';
import { getRecurrenceTrainerById, getRegistryEntry } from './trainer-service';

const modes: Array<{ id: RecurrenceMode; title: string; description: string }> = [
  {
    id: 'learn',
    title: 'Lernmodus',
    description: 'Hinweise, Quellenkontext und Musterbausteine sind sichtbar.',
  },
  {
    id: 'practice',
    title: 'Übungsmodus',
    description: 'Hinweise sind verfügbar; Feedback erscheint vor der Abgabe.',
  },
  {
    id: 'exam',
    title: 'Prüfungsmodus',
    description: 'Keine Hinweise und keine Zwischenauswertung vor der Abgabe.',
  },
  {
    id: 'review',
    title: 'Wiederholungsmodus',
    description: 'Fokus auf Fehler aus früheren Rekurrenzversuchen.',
  },
];

export function RecurrenceTrainerPage() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const trainer = getRecurrenceTrainerById(trainerId);
  const registry = getRegistryEntry(trainerId);
  const [mode, setMode] = useState<RecurrenceMode>('learn');
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [starting, setStarting] = useState(false);
  useEffect(() => void practiceAttemptRepository.list().then(setAttempts), []);
  if (!trainer || !registry)
    return (
      <section>
        <h1>Rekurrenztrainer nicht gefunden</h1>
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
    const attempt = await createRecurrenceAttempt(mode, trainer.id);
    await navigate(`/trainer/rekurrenzen/${trainer.id}/versuch/${attempt.id}`);
  };
  return (
    <div className="page-flow trainer-detail">
      <Link className="back-link" to="/trainer">
        ← Trainerübersicht
      </Link>
      <header className="page-header">
        <p className="eyebrow">{registry.algorithmFamily} · Laufzeit aktiv beweisen</p>
        <h1>{trainer.title}</h1>
        <p>{trainer.historicalRelevance}</p>
      </header>
      <section className="trainer-briefing" aria-labelledby="recurrence-briefing-title">
        <div>
          <p className="eyebrow">Offiziell belegte Trainingsinstanz</p>
          <h2 id="recurrence-briefing-title">{trainer.problemClass}</h2>
          <p>{trainer.typicalExamTask}</p>
        </div>
        <dl className="metadata-list">
          <div>
            <dt>Rekurrenz</dt>
            <dd>{trainer.problem.recurrence}</dd>
          </div>
          <div>
            <dt>Basisfall</dt>
            <dd>{trainer.problem.baseCase}</dd>
          </div>
          <div>
            <dt>Domäne</dt>
            <dd>{trainer.problem.domain}</dd>
          </div>
          <div>
            <dt>Ziel</dt>
            <dd>{trainer.problem.requestedDeliverable}</dd>
          </div>
        </dl>
      </section>
      <div className="two-column">
        <section className="panel">
          <h2>Mathematischer Kern</h2>
          <p>
            <MathFormula
              formula="T(n)=8T(n/2)+n^3"
              label="T von n gleich acht T von n halbe plus n hoch drei"
            />
          </p>
          <p>
            Kritischer Term:{' '}
            <MathFormula
              formula="n^{\log_2 8}=n^3"
              label="n hoch log zwei von acht gleich n hoch drei"
            />
          </p>
          <p>
            <strong>Aktive Idee:</strong> {trainer.intuition}
          </p>
        </section>
        <section className="panel">
          <h2>Produktionsstatus der Varianten</h2>
          <ul>
            {trainer.variants.map((variant) => (
              <li key={variant.id}>
                <strong>{variant.title}</strong>: {variant.productionStatus} ·{' '}
                {variant.sourcePolicy}
              </li>
            ))}
          </ul>
        </section>
      </div>
      <SourceCitationPanel trainer={trainer} />
      <RecurrenceModeSelector mode={mode} setMode={setMode} reviewAvailable={reviewAvailable} />
      {mode === 'review' && latestCompletedAttempt && (
        <section className="panel" aria-labelledby="recurrence-review-title">
          <h2 id="recurrence-review-title">Fokus dieser Wiederholung</h2>
          {latestCompletedAttempt.errorCodes.length > 0 ? (
            <ul>
              {[...new Set(latestCompletedAttempt.errorCodes)].map((errorCode) => (
                <li key={errorCode}>{errorCode}</li>
              ))}
            </ul>
          ) : (
            <p>Der letzte Versuch war fehlerfrei. Wiederhole die Analyse ohne Hinweise.</p>
          )}
        </section>
      )}
      <button
        className="primary-button"
        type="button"
        disabled={starting || (mode === 'review' && !reviewAvailable)}
        onClick={() => void start()}
      >
        {starting ? 'Rekurrenzversuch wird angelegt …' : 'Rekurrenzversuch beginnen'}
      </button>
    </div>
  );
}

function RecurrenceModeSelector({
  mode,
  setMode,
  reviewAvailable,
}: {
  mode: RecurrenceMode;
  setMode: (mode: RecurrenceMode) => void;
  reviewAvailable: boolean;
}) {
  return (
    <fieldset className="mode-selector">
      <legend>Trainingsmodus</legend>
      {modes.map((entry) => (
        <label key={entry.id}>
          <input
            type="radio"
            name="mode"
            value={entry.id}
            checked={mode === entry.id}
            disabled={entry.id === 'review' && !reviewAvailable}
            onChange={() => setMode(entry.id)}
          />
          <span>
            <strong>{entry.title}</strong>
            <small>
              {entry.id === 'review' && !reviewAvailable
                ? 'Erst nach einem abgeschlossenen Versuch verfügbar.'
                : entry.description}
            </small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
