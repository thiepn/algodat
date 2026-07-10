import { Link, useParams, useSearchParams } from 'react-router-dom';
import { examLibrary } from '../../content/loaders/exam-library';
import { sources } from '../../content/loaders/sources';
import type { SafeExamQuestion } from '../../domain/study-content/types';
import { getIndexedExamTask } from '../documents/source-task-index';
import { NextLearningActions } from '../study-content/NextLearningActions';

function sourceLabel(sourceId: string): string {
  const source = sources.find((candidate) => candidate.id === sourceId);
  if (!source) return sourceId;
  return source.displayName;
}

function evidenceLabel(question: SafeExamQuestion): string {
  if (question.historicalFrequencyEligible) return 'reales dedupliziertes Klausurereignis';
  if (question.evidenceType === 'mock_exam') return 'Probeklausur';
  if (question.evidenceType === 'official_solution') return 'offizielle Lösung';
  if (question.evidenceType === 'unofficial_solution') return 'inoffizielle Lösung';
  return question.evidenceType;
}

export function ExamLibraryIndexPage() {
  const real = examLibrary.exams.filter((exam) => exam.historicalFrequencyEligible).length;
  const mock = examLibrary.exams.filter((exam) => exam.kind === 'Probeklausur').length;
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Klausurenbibliothek</p>
        <h1>Klausuren, Fragen und Varianten</h1>
        <p>
          Diese Bibliothek veröffentlicht ausschließlich Metadaten, paraphrasierte Titel,
          Quellen-IDs und Seitenbezüge. Original-PDFs, lokale Pfade und vollständige historische
          Aufgabentexte bleiben privat.
        </p>
      </header>
      <div className="metric-grid">
        <article>
          <strong>{examLibrary.exams.length}</strong>
          <span>Korpusereignisse</span>
        </article>
        <article>
          <strong>{real}</strong>
          <span>häufigkeitsfähige reale Ereignisse</span>
        </article>
        <article>
          <strong>{mock}</strong>
          <span>Probeklausuren</span>
        </article>
        <article>
          <strong>{examLibrary.questions.length}</strong>
          <span>Fragenmetadaten</span>
        </article>
      </div>
      <NextLearningActions
        actions={[
          { resourceId: 'klausuren:fragen', reason: 'Alle Fragenmetadaten durchsuchen.' },
          {
            resourceId: 'diagnose:standard',
            reason: 'Vor alten Fragen die eigenen Lücken prüfen.',
          },
        ]}
      />
      <section className="panel">
        <h2>Klausuren</h2>
        <div className="card-grid">
          {examLibrary.exams.map((exam) => (
            <article className="card" key={exam.id}>
              <p className="eyebrow">{exam.kind ?? 'Korpusereignis'}</p>
              <h3>
                {exam.year ?? 'Jahr unbekannt'} · {exam.id}
              </h3>
              <p>
                {exam.taskCount} Aufgaben · {exam.totalPoints ?? 'Punkte unbekannt'} Punkte ·{' '}
                {exam.confidence}
              </p>
              <p className="quiet">
                Häufigkeit:{' '}
                {exam.historicalFrequencyEligible
                  ? 'reales dedupliziertes Ereignis'
                  : 'nicht gezählt'}
              </p>
              <Link className="button-link" to={`/klausuren/${exam.id}`}>
                Details öffnen
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ExamQuestionListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const taskFilter = searchParams.get('aufgabe') ?? 'alle';
  const evidenceFilter = searchParams.get('evidenz') ?? 'alle';
  const questions = examLibrary.questions.filter(
    (question) =>
      (taskFilter === 'alle' || String(question.taskNumber) === taskFilter) &&
      (evidenceFilter === 'alle' ||
        (evidenceFilter === 'real'
          ? question.historicalFrequencyEligible
          : evidenceFilter === question.evidenceType)),
  );
  return (
    <div className="page-flow">
      <Link className="back-link" to="/klausuren">
        ← Klausurenbibliothek
      </Link>
      <header className="page-header">
        <p className="eyebrow">Fragenbibliothek</p>
        <h1>Alte Fragen als sichere Metadaten</h1>
        <p>Die Liste zeigt keine Volltexte. Nutze sie als Wegweiser zu Themen und Lernaktionen.</p>
      </header>
      <section className="filters" aria-label="Fragen filtern">
        <label>
          Aufgabe
          <select
            value={taskFilter}
            onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              next.set('aufgabe', event.target.value);
              setSearchParams(next);
            }}
          >
            <option value="alle">Alle</option>
            {Array.from({ length: 9 }, (_, index) => index + 1).map((taskNumber) => (
              <option key={taskNumber} value={taskNumber}>
                Aufgabe {taskNumber}
              </option>
            ))}
          </select>
        </label>
        <label>
          Evidenz
          <select
            value={evidenceFilter}
            onChange={(event) => {
              const next = new URLSearchParams(searchParams);
              next.set('evidenz', event.target.value);
              setSearchParams(next);
            }}
          >
            <option value="alle">Alle</option>
            <option value="real">Nur reale deduplizierte Ereignisse</option>
            <option value="mock_exam">Probeklausuren</option>
          </select>
        </label>
      </section>
      <p className="result-count" aria-live="polite">
        {questions.length} Fragenmetadaten
      </p>
      <div className="source-list">
        {questions.slice(0, 120).map((question) => (
          <article className="source-row source-row--article" key={question.id}>
            <div>
              <p className="eyebrow">
                Aufgabe {question.taskNumber ?? 'unbekannt'} · {evidenceLabel(question)}
              </p>
              <h2>{question.paraphrasedTitle}</h2>
              <p className="quiet">
                Quelle:{' '}
                {question.sourceRefs
                  .map((ref) => `${sourceLabel(ref.sourceId)} S. ${ref.page}`)
                  .join(', ')}
              </p>
              <div className="evidence-chips">
                {question.topicTags.slice(0, 5).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <Link
              className="button-link"
              to={`/klausuren/${question.examId ?? 'korpus'}/aufgabe/${question.id}`}
            >
              Details öffnen
            </Link>
          </article>
        ))}
      </div>
      {questions.length > 120 && (
        <p className="quiet">
          Aus Performance-Gründen werden die ersten 120 Treffer angezeigt. Bitte enger filtern.
        </p>
      )}
    </div>
  );
}

export function ExamDetailPage() {
  const { examId } = useParams();
  const exam = examLibrary.exams.find((candidate) => candidate.id === examId);
  if (!exam)
    return (
      <section>
        <h1>Klausur nicht gefunden</h1>
        <Link to="/klausuren">Zur Bibliothek</Link>
      </section>
    );
  return (
    <div className="page-flow">
      <Link className="back-link" to="/klausuren">
        ← Klausurenbibliothek
      </Link>
      <header className="page-header">
        <p className="eyebrow">{exam.kind ?? 'Korpusereignis'}</p>
        <h1>
          {exam.year ?? 'Jahr unbekannt'} · {exam.id}
        </h1>
        <p>
          {exam.taskCount} Aufgaben · {exam.totalPoints ?? 'Punkte unbekannt'} Punkte · Sicherheit:{' '}
          {exam.confidence}
        </p>
      </header>
      <section className="panel">
        <h2>Aufgabenstruktur</h2>
        <div className="task-grid">
          {exam.tasks.map((task) => (
            <article className="task-card" key={task.questionId}>
              <span className="task-card__number">{task.number}</span>
              <div>
                <h3>{task.topic}</h3>
                <p>{task.format}</p>
                <small>{task.points ?? 'Punkte unbekannt'} Punkte</small>
                <div className="button-row">
                  <Link to={`/aufgaben/${task.number}`}>Lernhub</Link>
                  {task.questionId && (
                    <Link to={`/klausuren/${exam.id}/aufgabe/${task.questionId}`}>Details</Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>Quellenbezug</h2>
        <p>
          {exam.sourceRefs.length
            ? exam.sourceRefs.map((ref) => `${sourceLabel(ref.sourceId)} S. ${ref.page}`).join(', ')
            : 'Für dieses Korpusereignis ist kein veröffentlichbarer Quellenbezug hinterlegt.'}
        </p>
        <p className="notice">Originaldokument nicht öffentlich eingebunden.</p>
      </section>
    </div>
  );
}

export function ExamQuestionDetailPage() {
  const { examId, questionId } = useParams();
  const question = examLibrary.questions.find(
    (candidate) =>
      candidate.id === questionId ||
      (candidate.examId === examId && String(candidate.taskNumber) === questionId),
  );
  const indexedTask =
    question?.examId && question?.id ? getIndexedExamTask(question.examId, question.id) : null;
  if (!question)
    return (
      <section>
        <h1>Frage nicht gefunden</h1>
        <Link to="/klausuren/fragen">Zur Fragenliste</Link>
      </section>
    );
  return (
    <div className="page-flow">
      <Link className="back-link" to="/klausuren/fragen">
        ← Fragenliste
      </Link>
      <header className="page-header">
        <p className="eyebrow">
          Aufgabe {question.taskNumber ?? 'unbekannt'} · {evidenceLabel(question)}
        </p>
        <h1>{question.paraphrasedTitle}</h1>
        <p>
          Veröffentlichung: geprüfte Metadaten und Paraphrase. Vollständige historische
          Aufgabentexte werden nicht ausgeliefert.
        </p>
      </header>
      <NextLearningActions
        actions={[
          ...(question.taskNumber
            ? [
                {
                  resourceId: `klausuren:fragen?aufgabe=${question.taskNumber}`,
                  reason: `Weitere sichere Fragen zu Aufgabe ${question.taskNumber}.`,
                },
              ]
            : []),
          { resourceId: 'diagnose:standard', reason: 'Vor dem Üben die eigenen Lücken prüfen.' },
        ]}
      />
      <div className="button-row">
        <Link className="button-link" to={`/klausuren/fragen?aufgabe=${question.taskNumber}`}>
          Ähnliche Aufgaben
        </Link>
        <Link className="button-link" to="/lernplan/heute">
          Zum Lernplan hinzufügen
        </Link>
      </div>
      <div className="two-column">
        <section className="panel">
          <h2>Erwartete Bearbeitungsart</h2>
          <dl className="metadata-list">
            <div>
              <dt>Methode</dt>
              <dd>{question.expectedSolutionMethod ?? 'nicht belegt'}</dd>
            </div>
            <div>
              <dt>Laufzeit</dt>
              <dd>{question.expectedRuntime ?? 'nicht belegt'}</dd>
            </div>
            <div>
              <dt>Beweistyp</dt>
              <dd>{question.expectedProofType ?? 'nicht belegt'}</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <h2>Quelle</h2>
          <p>
            {question.sourceRefs
              .map((ref) => `${sourceLabel(ref.sourceId)} S. ${ref.page}`)
              .join(', ')}
          </p>
          <details>
            <summary>Technische Provenienz anzeigen</summary>
            <p>Status: {question.verificationStatus}</p>
            <ul>
              {question.sourceRefs.map((ref) => (
                <li key={`${ref.sourceId}-${ref.page}`}>
                  {ref.sourceId}, Seite {ref.page}
                </li>
              ))}
            </ul>
          </details>
          <p className="notice">Originaldokument nicht öffentlich eingebunden.</p>
        </section>
      </div>
      <section className="panel">
        <h2>Autorisierte Übungsvariante</h2>
        <p>
          {indexedTask?.authoredPracticeVariant ??
            'Übe denselben Aufgabenslot mit einer kleinen selbstgewählten Instanz und dokumentiere Methode, Zwischenschritte und Laufzeit.'}
        </p>
      </section>
      <section className="panel">
        <h2>Lösungsskizze</h2>
        <p>
          {indexedTask?.authoredSolutionOutline ??
            'Leite zuerst die geforderte Methode aus den Metadaten ab, notiere eine vollständige Begründung und vergleiche anschließend mit den passenden Lernmodulen.'}
        </p>
      </section>
      <section className="panel">
        <h2>Themen-Tags</h2>
        <div className="evidence-chips">
          {question.topicTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ExamComparisonPage() {
  const rows = Array.from({ length: 9 }, (_, index) => index + 1).map((taskNumber) => {
    const realCount = examLibrary.questions.filter(
      (question) => question.taskNumber === taskNumber && question.historicalFrequencyEligible,
    ).length;
    const otherCount = examLibrary.questions.filter(
      (question) => question.taskNumber === taskNumber && !question.historicalFrequencyEligible,
    ).length;
    return { taskNumber, realCount, otherCount };
  });
  return (
    <div className="page-flow">
      <Link className="back-link" to="/klausuren">
        ← Klausurenbibliothek
      </Link>
      <header className="page-header">
        <p className="eyebrow">Vergleich</p>
        <h1>Aufgaben-Slots über den Korpus</h1>
        <p>
          Häufigkeiten zählen nur deduplizierte reale Ereignisse; Probe-, Übungs- und generierte
          Vorkommen bleiben getrennt.
        </p>
      </header>
      <table>
        <thead>
          <tr>
            <th>Aufgabe</th>
            <th>Reale Ereignisse</th>
            <th>Probe/Übung/generiert</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.taskNumber}>
              <td>Aufgabe {row.taskNumber}</td>
              <td>{row.realCount}</td>
              <td>{row.otherCount}</td>
              <td>
                <Link to={`/aufgaben/${row.taskNumber}`}>Lernhub öffnen</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
