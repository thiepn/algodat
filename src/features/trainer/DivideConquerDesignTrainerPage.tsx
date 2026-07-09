import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import type { DivideConquerDesignMode } from '../../domain/divide-conquer-design';
import { practiceAttemptRepository } from '../../persistence/repositories';
import { SourceCitationPanel } from './components/TrainerComponents';
import { createDivideConquerDesignAttempt } from './divide-conquer-design-service';
import { getDivideConquerDesignTrainerById, getRegistryEntry } from './trainer-service';

const modes: Array<{ id: DivideConquerDesignMode; title: string; description: string }> = [
  {
    id: 'learn',
    title: 'Lernmodus',
    description: 'Quellenkontext, Hinweise und Musterbausteine sind verfügbar.',
  },
  {
    id: 'practice',
    title: 'Übungsmodus',
    description: 'Du entwirfst selbst; Hinweise sind erlaubt und werden gewertet.',
  },
  {
    id: 'exam',
    title: 'Prüfungsmodus',
    description: 'Keine Musterbausteine vor der Abgabe; geeignet für Aufgabe 7.',
  },
  {
    id: 'review',
    title: 'Wiederholungsmodus',
    description: 'Fokus auf Fehler aus früheren D&C-Entwurfsversuchen.',
  },
];

export function DivideConquerDesignTrainerPage() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const trainer = getDivideConquerDesignTrainerById(trainerId);
  const registry = getRegistryEntry(trainerId);
  const [mode, setMode] = useState<DivideConquerDesignMode>('learn');
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [starting, setStarting] = useState(false);
  useEffect(() => void practiceAttemptRepository.list().then(setAttempts), []);
  if (!trainer || !registry)
    return (
      <section>
        <h1>Divide-and-Conquer-Entwurfstrainer nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );
  const completedAttempts = attempts.filter(
    (attempt) => attempt.trainerId === trainer.id && attempt.status === 'completed',
  );
  const reviewAvailable = completedAttempts.length > 0;
  const latest = completedAttempts.sort((left, right) =>
    right.attemptedAt.localeCompare(left.attemptedAt),
  )[0];
  const start = async () => {
    setStarting(true);
    const attempt = await createDivideConquerDesignAttempt(mode, trainer.id);
    await navigate(`/trainer/entwurf/divide-and-conquer/${trainer.id}/versuch/${attempt.id}`);
  };
  const firstVariant = trainer.problem.variants[0];
  return (
    <div className="page-flow trainer-detail">
      <Link className="back-link" to="/trainer">
        ← Trainerübersicht
      </Link>
      <header className="page-header">
        <p className="eyebrow">{registry.algorithmFamily} · Aufgabe 7</p>
        <h1>{trainer.title}</h1>
        <p>{trainer.description}</p>
      </header>
      <section className="trainer-briefing" aria-labelledby="dc-briefing-title">
        <div>
          <p className="eyebrow">Belegte Trainingsinstanz</p>
          <h2 id="dc-briefing-title">{trainer.shortTitle}</h2>
          <p>{trainer.problem.objective}</p>
        </div>
        <dl className="metadata-list">
          <div>
            <dt>Eingabe</dt>
            <dd>{trainer.problem.inputDescription}</dd>
          </div>
          <div>
            <dt>Teilproblem</dt>
            <dd>{trainer.problem.subproblem}</dd>
          </div>
          <div>
            <dt>Combine</dt>
            <dd>{trainer.problem.combine}</dd>
          </div>
          <div>
            <dt>Rekurrenz</dt>
            <dd>{trainer.problem.recurrence}</dd>
          </div>
        </dl>
      </section>
      {firstVariant && (
        <section className="panel" aria-labelledby="dc-input-title">
          <h2 id="dc-input-title">Einstiegsinstanz</h2>
          <p>Feldwerte: {firstVariant.values.join(', ')}</p>
          <p>
            Oracle-Ergebnis: maximale Differenz {firstVariant.canonicalResult.maxDifference},
            Minimum {firstVariant.canonicalResult.minimum}, Maximum{' '}
            {firstVariant.canonicalResult.maximum}.
          </p>
        </section>
      )}
      <SourceCitationPanel trainer={trainer} />
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
      {mode === 'review' && latest && (
        <section className="panel">
          <h2>Wiederholungsfokus</h2>
          <p>
            Letzter Versuch: {latest.score}/{latest.maxScore} Punkte. Wiederhole besonders:{' '}
            {latest.errorCodes.length ? [...new Set(latest.errorCodes)].join(', ') : 'ohne Fehler'}.
          </p>
        </section>
      )}
      <button
        className="primary-button"
        type="button"
        disabled={starting || (mode === 'review' && !reviewAvailable)}
        onClick={() => void start()}
      >
        {starting ? 'D&C-Entwurfsversuch wird angelegt …' : 'D&C-Entwurfsversuch beginnen'}
      </button>
    </div>
  );
}
