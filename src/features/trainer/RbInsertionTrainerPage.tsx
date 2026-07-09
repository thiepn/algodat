import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import { practiceAttemptRepository } from '../../persistence/repositories';
import { SourceCitationPanel } from './components/TrainerComponents';
import { createRbInsertionAttempt, type RbInsertionMode } from './rb-insertion-service';
import { getRbInsertionTrainerById, getRegistryEntry } from './trainer-service';

const modes: Array<{ id: RbInsertionMode; title: string; description: string }> = [
  {
    id: 'learn',
    title: 'Lernmodus',
    description: 'Mit Quellenkontext, Hinweisen und Musterlösung nach Wunsch.',
  },
  {
    id: 'practice',
    title: 'Übungsmodus',
    description: 'Aktive Eingabe mit Zwischenauswertung.',
  },
  {
    id: 'exam',
    title: 'Prüfungsmodus',
    description: 'Keine Lösung vor der Abgabe.',
  },
  {
    id: 'review',
    title: 'Wiederholungsmodus',
    description: 'Gezielte Wiederholung nach einem abgeschlossenen Versuch.',
  },
];

export function RbInsertionTrainerPage() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const trainer = getRbInsertionTrainerById(trainerId);
  const registry = getRegistryEntry(trainerId);
  const [mode, setMode] = useState<RbInsertionMode>('learn');
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [starting, setStarting] = useState(false);
  useEffect(() => void practiceAttemptRepository.list().then(setAttempts), []);
  if (!trainer || !registry)
    return (
      <section>
        <h1>Rot-Schwarz-Trainer nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );
  const completedAttempts = attempts.filter(
    (attempt) => attempt.trainerId === trainer.id && attempt.status === 'completed',
  );
  const reviewAvailable = completedAttempts.length > 0;
  const start = async () => {
    setStarting(true);
    const attempt = await createRbInsertionAttempt(mode, trainer.id);
    await navigate(`/trainer/baeume/rot-schwarz/${trainer.id}/versuch/${attempt.id}`);
  };
  return (
    <div className="page-flow trainer-detail">
      <Link className="back-link" to="/trainer">
        ← Trainerübersicht
      </Link>
      <header className="page-header">
        <p className="eyebrow">{registry.algorithmFamily} · Aufgabe 2/3</p>
        <h1>{trainer.title}</h1>
        <p>{trainer.description}</p>
      </header>
      <section className="trainer-briefing" aria-labelledby="rb-briefing-title">
        <div>
          <p className="eyebrow">Public-safe Trainingsinstanz</p>
          <h2 id="rb-briefing-title">{trainer.shortTitle}</h2>
          <p>{trainer.problem.inputDescription}</p>
        </div>
        <dl className="metadata-list">
          <div>
            <dt>Einfügefolge</dt>
            <dd>{trainer.problem.insertedKeys.join(', ')}</dd>
          </div>
          <div>
            <dt>NIL-Konvention</dt>
            <dd>{trainer.problem.nilConvention}</dd>
          </div>
          <div>
            <dt>Rotation</dt>
            <dd>{trainer.problem.rotationNotation}</dd>
          </div>
          <div>
            <dt>Laufzeit</dt>
            <dd>{trainer.problem.runtime}</dd>
          </div>
        </dl>
      </section>
      <section className="panel">
        <h2>Invarianten-Checkliste</h2>
        <ul>
          {trainer.problem.invariantChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
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
      <button
        className="primary-button"
        type="button"
        disabled={starting || (mode === 'review' && !reviewAvailable)}
        onClick={() => void start()}
      >
        {starting ? 'Rot-Schwarz-Versuch wird angelegt …' : 'Rot-Schwarz-Versuch beginnen'}
      </button>
    </div>
  );
}
