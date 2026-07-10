import { Link, useParams } from 'react-router-dom';
import { coreContent as content } from '../../content/loaders/core';
import { examLibrary } from '../../content/loaders/exam-library';
import { getTaskLearningEntry, studyModules } from '../../content/loaders/study-content';
import { NextLearningActions } from '../study-content/NextLearningActions';
import { trainerPath } from '../study-content/resource-links';
import { trainerRegistry } from '../trainer/trainer-service';

export function TasksPage() {
  const profile =
    content.profiles.find((candidate) => candidate.id === 'standard-praesenz') ??
    content.profiles[0];
  const supportedTasks = new Set(content.blueprint.tasks.map((task) => task.taskNumber));

  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Standard-Präsenzprofil</p>
        <h1>Aufgaben 1–9</h1>
        <p>
          Jede Aufgabe ist jetzt ein Lernhub: Profil, Themen, Trainer, Diagnose und historische
          Metadaten bleiben getrennt und quellengebunden.
        </p>
      </header>
      <div className="task-grid">
        {profile?.tasks.map((task) => (
          <Link className="task-card" key={task.taskNumber} to={`/aufgaben/${task.taskNumber}`}>
            <span className="task-card__number">{task.taskNumber}</span>
            <div>
              <h2>{task.format}</h2>
              <p>{task.answerComponents}</p>
              <p className="quiet">
                {getTaskLearningEntry(task.taskNumber)?.actionableLearningResourceIds.length ?? 0}{' '}
                aktive Lernressourcen ·{' '}
                {supportedTasks.has(task.taskNumber) ? 'Standardprofil' : 'historische Ausnahme'}
              </p>
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

  const learningEntry = getTaskLearningEntry(task.taskNumber);
  const modules = studyModules.modules.filter((module) =>
    learningEntry?.studyModuleIds.includes(module.moduleId),
  );
  const trainers = trainerRegistry.filter((trainer) =>
    learningEntry?.trainerIds.includes(trainer.trainerId),
  );
  const questions = examLibrary.questions.filter(
    (question) => question.taskNumber === task.taskNumber,
  );
  const realQuestionCount = questions.filter(
    (question) => question.historicalFrequencyEligible,
  ).length;
  const mockOrGeneratedCount = questions.length - realQuestionCount;
  const actions =
    learningEntry?.recommendedOrder.map((resourceId) => ({
      resourceId,
      reason: resourceId.startsWith('trainer:')
        ? 'Direktes aktives Üben mit deterministischem Feedback.'
        : resourceId.startsWith('module:')
          ? 'Kurze quellengebundene Vorbereitung vor der Eingabe.'
          : resourceId.startsWith('klausuren:')
            ? 'Historische Varianten als Metadaten vergleichen.'
            : 'Lücken vor der nächsten Übung diagnostizieren.',
    })) ?? [];

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

      <NextLearningActions actions={actions} />

      <div className="two-column">
        <section className="panel">
          <h2>Was du hier können musst</h2>
          <ul>
            {(learningEntry?.topicIds.length ? learningEntry.topicIds : task.historicalTopics).map(
              (topic) => (
                <li key={topic}>{topic}</li>
              ),
            )}
          </ul>
        </section>
        <section className="panel">
          <h2>Historische Einordnung</h2>
          <dl className="metadata-list">
            <div>
              <dt>Priorität</dt>
              <dd>{task.priority}</dd>
            </div>
            <div>
              <dt>Sicherheit</dt>
              <dd>{task.confidence}</dd>
            </div>
            <div>
              <dt>Reale Ereignisse</dt>
              <dd>{realQuestionCount}</dd>
            </div>
            <div>
              <dt>Probe/Übung/generiert</dt>
              <dd>{mockOrGeneratedCount}</dd>
            </div>
            <div>
              <dt>Abdeckung</dt>
              <dd>{learningEntry?.coverageLevel ?? 'nicht kartiert'}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="panel">
        <h2>Passende produktive Trainer</h2>
        {trainers.length ? (
          <div className="card-grid">
            {trainers.map((trainer) => (
              <article className="card" key={trainer.trainerId}>
                <p className="eyebrow">{trainer.algorithmFamily}</p>
                <h3>{trainer.title}</h3>
                <p>{trainer.description}</p>
                <Link className="button-link" to={trainerPath(trainer.trainerId)}>
                  Trainer öffnen
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <p className="quiet">Für diese Aufgabe ist nur Diagnose/Review produktiv freigegeben.</p>
        )}
      </section>

      <section className="panel">
        <h2>Lernmodule</h2>
        <div className="card-grid">
          {modules.map((module) => (
            <article className="card" key={module.moduleId}>
              <h3>{module.title}</h3>
              <p>{module.summary}</p>
              <ul>
                {module.learningObjectives.slice(0, 3).map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
              <p className="quiet">
                Quellen:{' '}
                {module.sourceRefs.map((ref) => `${ref.sourceId} S. ${ref.page}`).join(', ')}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Alte Klausurfragen</h2>
        <p>
          Es werden nur Metadaten und paraphrasierte Titel angezeigt; Original-PDFs und vollständige
          Aufgabentexte bleiben privat.
        </p>
        <Link className="button-link" to={`/klausuren/fragen?aufgabe=${task.taskNumber}`}>
          Fragen zu Aufgabe {task.taskNumber} öffnen
        </Link>
      </section>
    </div>
  );
}
