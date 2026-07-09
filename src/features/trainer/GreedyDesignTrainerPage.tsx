import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import type { GreedyDesignMode } from '../../domain/greedy-design';
import { practiceAttemptRepository } from '../../persistence/repositories';
import { SourceCitationPanel } from './components/TrainerComponents';
import { createGreedyDesignAttempt } from './greedy-design-service';
import { getGreedyDesignTrainerById, getRegistryEntry } from './trainer-service';

const modes: Array<{ id: GreedyDesignMode; title: string; description: string }> = [
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
    description: 'Fokus auf Fehler aus früheren Greedy-Entwurfsversuchen.',
  },
];

export function GreedyDesignTrainerPage() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const trainer = getGreedyDesignTrainerById(trainerId);
  const registry = getRegistryEntry(trainerId);
  const [mode, setMode] = useState<GreedyDesignMode>('learn');
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [starting, setStarting] = useState(false);
  useEffect(() => void practiceAttemptRepository.list().then(setAttempts), []);
  if (!trainer || !registry)
    return (
      <section>
        <h1>Greedy-Entwurfstrainer nicht gefunden</h1>
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
    const attempt = await createGreedyDesignAttempt(mode, trainer.id);
    await navigate(`/trainer/entwurf/greedy/${trainer.id}/versuch/${attempt.id}`);
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
      <section className="trainer-briefing" aria-labelledby="greedy-briefing-title">
        <div>
          <p className="eyebrow">Belegte Trainingsinstanz</p>
          <h2 id="greedy-briefing-title">{trainer.shortTitle}</h2>
          <p>{trainer.problem.objective}</p>
        </div>
        <dl className="metadata-list">
          <div>
            <dt>Eingabe</dt>
            <dd>{trainer.problem.inputDescription}</dd>
          </div>
          <div>
            <dt>Greedy-Regel</dt>
            <dd>{trainer.problem.greedyRule}</dd>
          </div>
          <div>
            <dt>Beweisform</dt>
            <dd>{trainer.problem.exchangeProof}</dd>
          </div>
          <div>
            <dt>Laufzeit</dt>
            <dd>{trainer.problem.runtime}</dd>
          </div>
        </dl>
      </section>
      {firstVariant && (
        <section className="panel" aria-labelledby="fitnesspunkte-input-title">
          <h2 id="fitnesspunkte-input-title">Einstiegsinstanz</h2>
          <p>Schwierigkeitsgrade: {firstVariant.difficulties.join(', ')}</p>
          <p>
            Kanonische Reihenfolge: {firstVariant.canonicalSolution.sortedOrder.join(', ')} ·
            Optimum {firstVariant.canonicalSolution.optimalValue}
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
        {starting ? 'Greedy-Entwurfsversuch wird angelegt …' : 'Greedy-Entwurfsversuch beginnen'}
      </button>
    </div>
  );
}
