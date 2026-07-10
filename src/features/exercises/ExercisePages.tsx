import { Link, useParams } from 'react-router-dom';
import { hrefForResource, trainerPath } from '../study-content/resource-links';
import { OriginalTaskView } from '../documents/OriginalTaskView';
import {
  exerciseSheets,
  getExerciseSheet,
  getExerciseTask,
  getSourceTaskRegion,
  sourceTitle,
  topicNames,
} from '../documents/source-task-index';
import { useEffect, useState } from 'react';
import type { LocalDocumentBinding } from '../../persistence/database/schema';
import { listLocalDocuments } from '../documents/local-document-service';

function useBindings() {
  const [bindings, setBindings] = useState<LocalDocumentBinding[]>([]);
  useEffect(() => void listLocalDocuments().then(setBindings), []);
  return bindings;
}

function connectionLabel(bindings: LocalDocumentBinding[], sourceId: string | null) {
  if (!sourceId) return 'Keine Quelle zugeordnet';
  return bindings.some((binding) => binding.sourceId === sourceId)
    ? 'Lokale PDF verbunden'
    : 'Lokale PDF nicht verbunden';
}

export function ExerciseIndexPage() {
  const bindings = useBindings();
  const taskCount = exerciseSheets.reduce((sum, sheet) => sum + sheet.taskCount, 0);
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Üben</p>
        <h1>Übungen und Übungsblätter</h1>
        <p>
          Sichere Metadaten zu Übungsblättern. Originalseiten erscheinen erst, wenn du die
          entsprechende PDF lokal verbindest.
        </p>
      </header>

      <section className="metric-grid">
        <article>
          <strong>{exerciseSheets.length}</strong>
          <span>Übungsblätter</span>
        </article>
        <article>
          <strong>{taskCount}</strong>
          <span>indizierte Aufgaben</span>
        </article>
        <article>
          <strong>{bindings.length}</strong>
          <span>lokal verbundene PDFs</span>
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
                  {sheet.taskCount} Aufgaben · {names.slice(0, 4).join(', ') || 'Themen offen'} ·{' '}
                  {connectionLabel(bindings, sheet.sourceId)}
                </p>
                <p>
                  Lösung:{' '}
                  {sheet.solutionSourceId
                    ? `${sourceTitle(sheet.solutionSourceId)} · ${connectionLabel(
                        bindings,
                        sheet.solutionSourceId,
                      )}`
                    : 'keine sichere Lösungsquelle zugeordnet'}
                </p>
              </div>
              <div className="button-row">
                <Link className="button-link" to={`/uebungen/${sheet.id}`}>
                  Blatt öffnen
                </Link>
                <Link className="button-link" to={`/dokumente/verbinden?source=${sheet.sourceId}`}>
                  Dokument verbinden
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
  const bindings = useBindings();
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
          {sheet.taskCount} Aufgaben · Original: {connectionLabel(bindings, sheet.sourceId)} ·
          Lösung:{' '}
          {sheet.solutionSourceId
            ? connectionLabel(bindings, sheet.solutionSourceId)
            : 'nicht zugeordnet'}
        </p>
      </header>

      <section className="panel">
        <h2>Verknüpfte Lernressourcen</h2>
        <div className="button-row">
          {sheet.moduleIds.slice(0, 4).map((moduleId) => (
            <Link className="button-link" key={moduleId} to={hrefForResource(`module:${moduleId}`)}>
              Lernmodul
            </Link>
          ))}
          {sheet.trainerIds.slice(0, 4).map((trainerId) => (
            <Link className="button-link" key={trainerId} to={trainerPath(trainerId)}>
              Trainer
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
              </div>
              <div className="button-row">
                <Link className="button-link" to={`/uebungen/${sheet.id}/aufgabe/${task.id}`}>
                  Originalaufgabe anzeigen
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
  const region = getSourceTaskRegion(task?.regionId);
  if (!task || !sheetId) {
    return (
      <div className="page-flow">
        <h1>Übungsaufgabe nicht gefunden</h1>
        <Link to="/uebungen">Zur Übungsübersicht</Link>
      </div>
    );
  }
  return (
    <OriginalTaskView
      fallbackBackLink={`/uebungen/${sheetId}`}
      moduleIds={task.moduleIds}
      region={region}
      taskNumber={task.taskNumber}
      title={`Übungsaufgabe ${task.taskNumber}`}
      topicIds={task.topicIds}
      trainerIds={task.trainerIds}
    />
  );
}
