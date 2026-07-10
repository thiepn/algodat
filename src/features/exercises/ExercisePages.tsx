import { Link, useParams } from 'react-router-dom';
import { hrefForResource, labelForResource, trainerPath } from '../study-content/resource-links';
import {
  exerciseSheets,
  getExerciseSheet,
  getExerciseTask,
  sourceTitle,
  topicNames,
} from '../documents/source-task-index';

function hostedMaterialNotice() {
  return 'Originaldokument nicht öffentlich eingebunden.';
}

export function ExerciseIndexPage() {
  const taskCount = exerciseSheets.reduce((sum, sheet) => sum + sheet.taskCount, 0);
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Üben</p>
        <h1>Übungen und Übungsblätter</h1>
        <p>
          Sichere, öffentlich geeignete Metadaten zu Übungsblättern. Private PDFs werden nicht lokal
          verbunden, nicht gerendert und nicht als Originalseiten angezeigt.
        </p>
      </header>

      <section className="metric-grid">
        <article>
          <strong>{exerciseSheets.length}</strong>
          <span>Übungsblätter</span>
        </article>
        <article>
          <strong>{taskCount}</strong>
          <span>aufbereitete Aufgaben</span>
        </article>
        <article>
          <strong>0</strong>
          <span>öffentlich eingebundene Originale</span>
        </article>
      </section>

      <div className="source-list">
        {exerciseSheets.map((sheet) => {
          const names = topicNames(sheet.topicIds);
          return (
            <article className="source-row source-row--article" key={sheet.id}>
              <div>
                <p className="eyebrow">
                  {sheet.course} · {sheet.semester}
                </p>
                <h2>{sheet.title}</h2>
                <p>
                  {sheet.taskCount} Aufgaben · {names.slice(0, 4).join(', ') || 'Themen offen'}
                </p>
                <p className="quiet">
                  Quelle: {sourceTitle(sheet.sourceId)} · {hostedMaterialNotice()}
                </p>
              </div>
              <div className="button-row">
                <Link className="button-link" to={`/uebungen/${sheet.id}`}>
                  Blatt öffnen
                </Link>
                <Link className="button-link" to="/quellen">
                  Quellen prüfen
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function ExerciseSheetPage() {
  const { sheetId } = useParams();
  const sheet = sheetId ? getExerciseSheet(sheetId) : undefined;
  if (!sheet) {
    return (
      <div className="page-flow">
        <h1>Übungsblatt nicht gefunden</h1>
        <Link to="/uebungen">Zur Übungsübersicht</Link>
      </div>
    );
  }
  return (
    <div className="page-flow">
      <Link className="back-link" to="/uebungen">
        ← Übungen
      </Link>
      <header className="page-header">
        <p className="eyebrow">{sheet.semester}</p>
        <h1>{sheet.title}</h1>
        <p>
          {sheet.taskCount} Aufgaben · Quelle: {sourceTitle(sheet.sourceId)} ·{' '}
          {hostedMaterialNotice()}
        </p>
      </header>

      <section className="panel">
        <h2>Verknüpfte Lernressourcen</h2>
        <div className="button-row">
          {sheet.moduleIds.slice(0, 4).map((moduleId) => (
            <Link className="button-link" key={moduleId} to={hrefForResource(`module:${moduleId}`)}>
              {labelForResource(`module:${moduleId}`)}
            </Link>
          ))}
          {sheet.trainerIds.slice(0, 4).map((trainerId) => (
            <Link className="button-link" key={trainerId} to={trainerPath(trainerId)}>
              Trainer starten
            </Link>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Aufgaben</h2>
        <div className="source-list">
          {sheet.tasks.map((task) => (
            <article className="source-row source-row--article" key={task.id}>
              <div>
                <h3>Aufgabe {task.taskNumber}</h3>
                <p>
                  Seite {task.pageStart} · {topicNames(task.topicIds).join(', ') || 'Themen offen'}{' '}
                  · {task.expectedMethod}
                </p>
                <p className="quiet">{task.authoredSummary}</p>
              </div>
              <div className="button-row">
                <Link className="button-link" to={`/uebungen/${sheet.id}/aufgabe/${task.id}`}>
                  Aufgabe öffnen
                </Link>
                {task.trainerIds[0] && (
                  <Link className="button-link" to={trainerPath(task.trainerIds[0])}>
                    Trainer starten
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ExerciseTaskPage() {
  const { sheetId, taskId } = useParams();
  const task = sheetId && taskId ? getExerciseTask(sheetId, taskId) : null;
  if (!task || !sheetId) {
    return (
      <div className="page-flow">
        <h1>Übungsaufgabe nicht gefunden</h1>
        <Link to="/uebungen">Zur Übungsübersicht</Link>
      </div>
    );
  }
  const names = topicNames(task.topicIds);
  return (
    <div className="page-flow">
      <Link className="back-link" to={`/uebungen/${sheetId}`}>
        ← Übungsblatt
      </Link>
      <header className="page-header">
        <p className="eyebrow">Übungsaufgabe</p>
        <h1>Aufgabe {task.taskNumber}</h1>
        <p>
          {names.join(', ') || 'Themen offen'} · Quelle: {sourceTitle(task.sourceId)} · Seite{' '}
          {task.pageStart}
        </p>
      </header>

      <section className="panel">
        <h2>Aufgabenzusammenfassung</h2>
        <p>{task.authoredSummary}</p>
        <p className="notice">{hostedMaterialNotice()}</p>
      </section>

      <section className="panel">
        <h2>Bearbeitungsart</h2>
        <dl className="metadata-list">
          <div>
            <dt>Methode</dt>
            <dd>{task.expectedMethod}</dd>
          </div>
          <div>
            <dt>Teilaufgaben</dt>
            <dd>{task.subtasks.join(', ')}</dd>
          </div>
          <div>
            <dt>Lösungsquelle</dt>
            <dd>
              {task.solutionSourceId ? sourceTitle(task.solutionSourceId) : 'nicht öffentlich'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h2>Autorisierte Übungsvariante</h2>
        <p>{task.authoredPracticeVariant}</p>
      </section>

      <section className="panel">
        <h2>Lösungsskizze</h2>
        <p>{task.authoredSolutionOutline}</p>
      </section>

      <section className="panel">
        <h2>Lernressourcen</h2>
        <div className="button-row">
          {task.moduleIds.slice(0, 4).map((moduleId) => (
            <Link className="button-link" key={moduleId} to={hrefForResource(`module:${moduleId}`)}>
              {labelForResource(`module:${moduleId}`)}
            </Link>
          ))}
          {task.trainerIds.slice(0, 4).map((trainerId) => (
            <Link className="button-link" key={trainerId} to={trainerPath(trainerId)}>
              Trainer starten
            </Link>
          ))}
          <Link className="button-link" to="/lernplan/heute">
            Zum Lernplan hinzufügen
          </Link>
        </div>
      </section>
    </div>
  );
}
