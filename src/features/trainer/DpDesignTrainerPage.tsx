import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import type { DpDesignMode } from '../../domain/dp-design';
import { practiceAttemptRepository } from '../../persistence/repositories';
import { SourceCitationPanel } from './components/TrainerComponents';
import { createDpDesignAttempt } from './dp-design-service';
import { getDpDesignTrainerById, getRegistryEntry } from './trainer-service';

const modes: Array<{ id: DpDesignMode; title: string; description: string }> = [
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
    description: 'Keine Musterbausteine vor der Abgabe; geeignet für Aufgabe 8.',
  },
  {
    id: 'review',
    title: 'Wiederholungsmodus',
    description: 'Fokus auf Fehler aus früheren DP-Entwurfsversuchen.',
  },
];

export function DpDesignTrainerPage() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const trainer = getDpDesignTrainerById(trainerId);
  const registry = getRegistryEntry(trainerId);
  const [mode, setMode] = useState<DpDesignMode>('learn');
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [starting, setStarting] = useState(false);
  useEffect(() => void practiceAttemptRepository.list().then(setAttempts), []);
  if (!trainer || !registry)
    return (
      <section>
        <h1>DP-Entwurfstrainer nicht gefunden</h1>
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
    const attempt = await createDpDesignAttempt(mode, trainer.id);
    await navigate(`/trainer/entwurf/dp/${trainer.id}/versuch/${attempt.id}`);
  };
  return (
    <div className="page-flow trainer-detail">
      <Link className="back-link" to="/trainer">
        ← Trainerübersicht
      </Link>
      <header className="page-header">
        <p className="eyebrow">{registry.algorithmFamily} · Aufgabe 8</p>
        <h1>{trainer.title}</h1>
        <p>{trainer.description}</p>
      </header>
      <section className="trainer-briefing" aria-labelledby="dp-briefing-title">
        <div>
          <p className="eyebrow">Belegte Trainingsinstanz</p>
          <h2 id="dp-briefing-title">{trainer.shortTitle}</h2>
          <p>{trainer.problem.objective.quantity}</p>
        </div>
        <dl className="metadata-list">
          <div>
            <dt>Eingabe</dt>
            <dd>{trainer.problem.input.domain}</dd>
          </div>
          <div>
            <dt>Ziel</dt>
            <dd>
              {trainer.problem.objective.direction}: {trainer.problem.objective.quantity}
            </dd>
          </div>
          <div>
            <dt>Zustand</dt>
            <dd>{trainer.problem.stateDefinition.entryMeaning}</dd>
          </div>
          <div>
            <dt>Ausgabe</dt>
            <dd>{trainer.problem.evaluationOrder.outputCell}</dd>
          </div>
        </dl>
      </section>
      <section className="panel" aria-labelledby="mine-matrix-title">
        <h2 id="mine-matrix-title">Matrix der Mine</h2>
        <div className="task-table-wrapper">
          <table>
            <caption>Erzwerte aus der neu formulierten Trainingsinstanz</caption>
            <tbody>
              {trainer.problem.variants[0]?.matrix.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((value, columnIndex) => (
                    <td key={columnIndex}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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
        {starting ? 'DP-Entwurfsversuch wird angelegt …' : 'DP-Entwurfsversuch beginnen'}
      </button>
    </div>
  );
}
