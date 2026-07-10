import { Link, useParams } from 'react-router-dom';
import { coreContent as content } from '../../content/loaders/core';
import { examLibrary } from '../../content/loaders/exam-library';
import { getTaskLearningEntry } from '../../content/loaders/study-content';
import { topics } from '../../content/loaders/topics';
import { getRichModulesForTask } from '../learning/study-module-details';
import { NextLearningActions } from '../study-content/NextLearningActions';
import { trainerPath } from '../study-content/resource-links';
import { trainerRegistry } from '../trainer/trainer-service';
import { getTaskGuide } from './task-guides';

function topicName(topicId: string) {
  return topics.find((topic) => topic.id === topicId)?.name ?? 'zugeordnetes Thema';
}

export function TasksPage() {
  const profile =
    content.profiles.find((candidate) => candidate.id === 'standard-praesenz') ??
    content.profiles[0];
  const supportedTasks = new Set(content.blueprint.tasks.map((task) => task.taskNumber));

  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Aktuelle Prüfungsstruktur</p>
        <h1>Aufgaben 1–9</h1>
        <p>
          Jede Aufgabe ist ein vollständiger Prüfungsguide mit Workflow, Beispiel, Checkliste,
          Lernmodulen, Trainern und sicheren alten Fragenmetadaten.
        </p>
      </header>
      <div className="task-grid">
        {profile?.tasks.map((task) => {
          const guide = getTaskGuide(task.taskNumber);
          return (
            <Link className="task-card" key={task.taskNumber} to={`/aufgaben/${task.taskNumber}`}>
              <span className="task-card__number">{task.taskNumber}</span>
              <div>
                <h2>{task.format}</h2>
                <p>{guide.tests}</p>
                <p className="quiet">
                  {getRichModulesForTask(task.taskNumber).length} Lernmodule ·{' '}
                  {supportedTasks.has(task.taskNumber)
                    ? 'aktuelles Modell'
                    : 'historische Ausnahme'}
                </p>
                <small>
                  {task.typicalPoints} Punkte · {task.confidence}
                </small>
              </div>
            </Link>
          );
        })}
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

  const guide = getTaskGuide(task.taskNumber);
  const learningEntry = getTaskLearningEntry(task.taskNumber);
  const modules = getRichModulesForTask(task.taskNumber);
  const trainers = trainerRegistry.filter((trainer) =>
    learningEntry?.trainerIds.includes(trainer.trainerId),
  );
  const questions = examLibrary.questions.filter(
    (question) => question.taskNumber === task.taskNumber,
  );
  const actions = [
    ...modules.slice(0, 3).map((module) => ({
      resourceId: `module:${module.moduleId}`,
      reason: `Modul „${module.title}“ zuerst wiederholen.`,
    })),
    ...trainers.slice(0, 2).map((trainer) => ({
      resourceId: `trainer:${trainer.trainerId}`,
      reason: 'Danach aktiv mit Eingabe üben.',
    })),
    {
      resourceId: `klausuren:fragen?aufgabe=${task.taskNumber}`,
      reason: 'Sichere alte Fragenmetadaten ansehen.',
    },
  ];

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
        <p>{guide.tests}</p>
      </header>

      <NextLearningActions actions={actions} />

      <div className="two-column">
        <section className="panel">
          <h2>Was diese Aufgabe prüft</h2>
          <p>{guide.tests}</p>
          <h3>Typische Struktur</h3>
          <ul>
            {guide.typicalStructure.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h3>Erwartete Antwortbestandteile</h3>
          <ul>
            {guide.expectedAnswerComponents.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <h2>Lösungsworkflow</h2>
          <ol>
            {guide.solvingWorkflow.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>
            <strong>Zeitmanagement:</strong> {guide.timeManagement}
          </p>
          <p>
            <strong>Bewertung:</strong> {guide.markingLogic}
          </p>
        </section>
      </div>

      <section className="panel">
        <h2>Konkretes Beispiel</h2>
        <article className="card">
          <h3>{guide.workedExample.title}</h3>
          <ol>
            {guide.workedExample.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <h4>Modellantwort-Struktur</h4>
          <ul>
            {guide.workedExample.modelAnswer.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </article>
      </section>

      <div className="two-column">
        <section className="panel">
          <h2>Häufige Fehler</h2>
          <ul>
            {guide.commonMistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2>Checkliste vor Abgabe</h2>
          <ul>
            {guide.submissionChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="panel">
        <h2>Lesbare Themen</h2>
        <div className="evidence-chips">
          {(learningEntry?.topicIds.length ? learningEntry.topicIds : task.historicalTopics).map(
            (topic) => (
              <span key={topic}>{topic.startsWith('topic-') ? topicName(topic) : topic}</span>
            ),
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Lernmodule</h2>
        <div className="card-grid">
          {modules.map((module) => (
            <article className="card" key={module.moduleId}>
              <h3>{module.title}</h3>
              <p>{module.shortDescription}</p>
              <Link className="button-link" to={`/lernen/${module.slug}`}>
                Modul öffnen
              </Link>
            </article>
          ))}
        </div>
      </section>

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
          <p>Für diese Aufgabe ist aktuell Diagnose und Review produktiv freigegeben.</p>
        )}
      </section>

      <section className="panel">
        <h2>Übungsset</h2>
        <ul>
          {guide.practiceSet.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <Link className="button-link" to={`/klausuren/fragen?aufgabe=${task.taskNumber}`}>
          {questions.length} sichere Fragenmetadaten zu Aufgabe {task.taskNumber} öffnen
        </Link>
      </section>
    </div>
  );
}
