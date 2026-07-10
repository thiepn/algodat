import { Link, useParams } from 'react-router-dom';
import { OriginalTaskView } from '../documents/OriginalTaskView';
import {
  getIndexedExam,
  getIndexedExamTask,
  getSourceTaskRegion,
  indexedExams,
  sourceTitle,
  topicNames,
} from '../documents/source-task-index';
import { useEffect, useState } from 'react';
import type { LocalDocumentBinding } from '../../persistence/database/schema';
import { listLocalDocuments } from '../documents/local-document-service';
import { trainerPath } from '../study-content/resource-links';

function useBindings() {
  const [bindings, setBindings] = useState<LocalDocumentBinding[]>([]);
  useEffect(() => void listLocalDocuments().then(setBindings), []);
  return bindings;
}

function isConnected(bindings: LocalDocumentBinding[], sourceId: string | null) {
  return Boolean(sourceId && bindings.some((binding) => binding.sourceId === sourceId));
}

export function ExamOriginalPage() {
  const { examId } = useParams();
  const bindings = useBindings();
  const exam = examId ? getIndexedExam(examId) : undefined;
  if (!exam) {
    return (
      <div className="page-flow">
        <h1>Altklausur nicht gefunden</h1>
        <Link to="/klausuren">Zur Klausurenbibliothek</Link>
      </div>
    );
  }
  return (
    <div className="page-flow">
      <Link className="back-link" to={`/klausuren/${exam.id}`}>
        ← Klausur
      </Link>
      <header className="page-header">
        <p className="eyebrow">Lokale Originalklausur</p>
        <h1>{exam.title}</h1>
        <p>
          {exam.year ?? 'Jahr unbekannt'} · {exam.durationMinutes ?? 'Dauer unbekannt'} Minuten ·{' '}
          {exam.totalPoints ?? 'Punkte unbekannt'} Punkte
        </p>
      </header>

      <section className="panel">
        <h2>Dokumentstatus</h2>
        <p>
          Original: {exam.sourceId ? sourceTitle(exam.sourceId) : 'nicht zugeordnet'} ·{' '}
          {isConnected(bindings, exam.sourceId) ? 'lokal verbunden' : 'nicht verbunden'}
        </p>
        <p>
          Lösung: {exam.solutionSourceId ? sourceTitle(exam.solutionSourceId) : 'nicht zugeordnet'}{' '}
          · {isConnected(bindings, exam.solutionSourceId) ? 'lokal verbunden' : 'nicht verbunden'}
        </p>
        <div className="button-row">
          {exam.sourceId && (
            <Link className="button-link" to={`/dokumente/verbinden?source=${exam.sourceId}`}>
              Originaldatei verbinden
            </Link>
          )}
          {exam.solutionSourceId && (
            <Link
              className="button-link"
              to={`/dokumente/verbinden?source=${exam.solutionSourceId}`}
            >
              Lösungsdatei verbinden
            </Link>
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Aufgabenliste</h2>
        <div className="source-list">
          {exam.tasks.map((task) => (
            <article className="source-row source-row--article" key={task.id}>
              <div>
                <h3>Aufgabe {task.taskNumber}</h3>
                <p>
                  Seiten {task.pageStart}
                  {task.pageEnd !== task.pageStart ? `–${task.pageEnd}` : ''} ·{' '}
                  {topicNames(task.topicIds).join(', ') || task.topicLabels.join(', ')}
                </p>
              </div>
              <div className="button-row">
                <Link
                  className="button-link"
                  to={`/klausuren/${exam.id}/aufgabe/${task.id}/original`}
                >
                  Originalaufgabe anzeigen
                </Link>
                <Link className="button-link" to={`/klausuren/fragen?aufgabe=${task.taskNumber}`}>
                  Ähnliche Aufgaben
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

export function ExamTaskOriginalPage() {
  const { examId, taskId } = useParams();
  const task = examId && taskId ? getIndexedExamTask(examId, taskId) : null;
  const region = getSourceTaskRegion(task?.regionId);
  if (!examId || !task) {
    return (
      <div className="page-flow">
        <h1>Klausuraufgabe nicht gefunden</h1>
        <Link to="/klausuren">Zur Klausurenbibliothek</Link>
      </div>
    );
  }
  return (
    <OriginalTaskView
      fallbackBackLink={`/klausuren/${examId}/original`}
      moduleIds={task.moduleIds}
      region={region}
      taskNumber={task.taskNumber}
      title={`${indexedExams.find((exam) => exam.id === examId)?.title ?? 'Klausur'} · Aufgabe ${
        task.taskNumber
      }`}
      topicIds={task.topicIds}
      trainerIds={task.trainerIds}
    />
  );
}
