import { Link, useParams } from 'react-router-dom';
import { coreContent as content } from '../../content/loaders/core';

export function TasksPage() {
  const profile =
    content.profiles.find((candidate) => candidate.id === 'standard-praesenz') ??
    content.profiles[0];
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Standard-Präsenzprofil</p>
        <h1>Aufgaben 1–9</h1>
        <p>Jede Karte zeigt das historisch gestützte Format; konkrete Themen können wechseln.</p>
      </header>
      <div className="task-grid">
        {profile?.tasks.map((task) => (
          <Link className="task-card" key={task.taskNumber} to={`/aufgaben/${task.taskNumber}`}>
            <span className="task-card__number">{task.taskNumber}</span>
            <div>
              <h2>{task.format}</h2>
              <p>{task.answerComponents}</p>
              <small>
                {task.typicalPoints} Punkte · {task.confidence}
              </small>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function TaskDetailPage() {
  const { taskNumber } = useParams();
  const profile = content.profiles.find((candidate) => candidate.id === 'standard-praesenz');
  const task = profile?.tasks.find((candidate) => String(candidate.taskNumber) === taskNumber);
  if (!task)
    return (
      <section>
        <h1>Aufgabe nicht gefunden</h1>
        <Link to="/aufgaben">Zur Übersicht</Link>
      </section>
    );
  return (
    <div className="page-flow">
      <Link className="back-link" to="/aufgaben">
        ← Alle Aufgaben
      </Link>
      <header className="page-header">
        <p className="eyebrow">
          Aufgabe {task.taskNumber} · typischerweise {task.typicalPoints} Punkte
        </p>
        <h1>{task.format}</h1>
        <p>{task.answerComponents}</p>
      </header>
      <div className="two-column">
        <section className="panel">
          <h2>Historische Themenbeispiele</h2>
          <ul>
            {task.historicalTopics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2>Einordnung</h2>
          <dl className="metadata-list">
            <div>
              <dt>Priorität</dt>
              <dd>{task.priority}</dd>
            </div>
            <div>
              <dt>Sicherheit</dt>
              <dd>{task.confidence}</dd>
            </div>
          </dl>
          {task.taskNumber <= 4 && (
            <Link className="button-link" to="/trainer/tracing">
              Verfügbaren Tracing-Lernpfad ansehen
            </Link>
          )}
        </section>
      </div>
    </div>
  );
}
