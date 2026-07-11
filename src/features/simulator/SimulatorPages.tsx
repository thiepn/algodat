import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { computeRemainingTime, exactFromContent, exactToLabel } from '../../domain/exam-simulator';
import type { ExamSession } from '../../domain/exam-simulator';
import {
  createSimulatorSession,
  getCoreExamPackage,
  getExamPackageById,
  getSimulatorResult,
  getSimulatorSession,
  listSimulatorSessions,
  navigateSimulatorTask,
  saveTaskAnswer,
  setSimulatorReviewFlag,
  startSimulatorSession,
  submitSimulatorSession,
} from './exam-simulator-service';
import { trainerRegistry } from '../trainer/trainer-service';
import { completionForExamAnswer, ExamTaskRenderer } from './ExamTaskRenderer';

const sessionStatusLabels: Record<ExamSession['status'], string> = {
  created: 'angelegt',
  briefing: 'Briefing',
  ready: 'bereit',
  running: 'laufend',
  time_expired: 'Zeit abgelaufen',
  submitted: 'abgegeben',
  graded: 'bewertet',
  recovery_required: 'Wiederherstellung nötig',
  archived: 'archiviert',
  invalid: 'ungültig',
};

const completionStatusLabels: Record<
  ExamSession['taskStates'][string]['completionStatus'],
  string
> = {
  unanswered: 'unbeantwortet',
  started: 'begonnen',
  incomplete: 'unvollständig',
  complete: 'vollständig',
  partial: 'unvollständig (ältere Sitzung)',
  answered: 'vollständig (ältere Sitzung)',
};

const rendererLabels: Record<string, string> = {
  knapsack: 'Rucksack-DP-Tabelle',
  union_find: 'Union-Find-Tracing',
  red_black_tree_insertion: 'Rot-Schwarz-Einfügen',
  proof_loop_invariant: 'Schleifeninvariante',
  recurrence_runtime_proof: 'Rekurrenz- und Laufzeitbeweis',
  divide_conquer_max_difference: 'Divide-and-Conquer-Entwurf',
  dp_design_mine: 'DP-Entwurf',
  floyd_warshall_matrix: 'Floyd-Warshall-Matrix',
  dijkstra_trace: 'Dijkstra-Tracing',
  prim_mst_trace: 'Prim-Tracing',
};

function subscribeClock(callback: () => void) {
  const id = window.setInterval(callback, 1000);
  return () => window.clearInterval(id);
}

function getClockSnapshot() {
  return Date.now();
}

export function SimulatorDashboard() {
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  useEffect(() => void listSimulatorSessions().then(setSessions), []);
  const examPackage = getCoreExamPackage();
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Aktuelle Probeklausur</p>
        <h1>Aktuelle Probeklausur</h1>
        <p>
          Ein aktuelles, nicht historisches Prüfungsprodukt mit sichtbaren Aufgaben, Timer,
          Autosave, Review-Markierung und Ergebnisbericht.
        </p>
      </header>
      <section className="trainer-grid">
        <article className="trainer-card">
          <span className="status-badge status-badge--success">startbar</span>
          <h2>Startbereite Klausur</h2>
          <p>{examPackage.description}</p>
          <p className="notice">
            Diese Probeklausur wurde aus verifizierten Aufgabenfamilien zusammengestellt. Sie ist
            keine historische Originalklausur.
          </p>
          <Link className="button-link" to={`/simulator/pruefungen/${examPackage.id}`}>
            Aktuelle Probeklausur öffnen
          </Link>
        </article>
      </section>
      {sessions.length > 0 && (
        <section>
          <h2>Lokale Simulator-Sitzungen</h2>
          <ul>
            {sessions.map((session) => (
              <li key={session.id}>
                <Link to={`/simulator/sitzung/${session.id}`}>
                  {sessionStatusLabels[session.status]} ·{' '}
                  {new Date(session.createdAt).toLocaleString('de-DE')}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export function ExamProfileBrowser() {
  return (
    <Missing
      title="Klausurprofile wurden durch die aktuelle Prüfungsstruktur ersetzt"
      to="/pruefungsstruktur"
    />
  );
}

export function ExamProfileDetail() {
  return (
    <Missing
      title="Historische Profile sind keine primäre Produktfläche mehr"
      to="/pruefungsstruktur"
    />
  );
}

export function ExamPackageList() {
  const examPackage = getCoreExamPackage();
  return (
    <div className="page-flow">
      <header className="page-header">
        <h1>Aktuelle Probeklausur</h1>
        <p>Es gibt genau ein primäres startbares Prüfungsprodukt.</p>
      </header>
      <article className="trainer-card">
        <h2>{examPackage.title}</h2>
        <p>{examPackage.description}</p>
        <Link className="button-link" to={`/simulator/pruefungen/${examPackage.id}`}>
          Öffnen
        </Link>
      </article>
    </div>
  );
}

export function ExamPackageDetail() {
  const { examPackageId } = useParams();
  const examPackage = examPackageId ? getExamPackageById(examPackageId) : getCoreExamPackage();
  if (!examPackage)
    return <Missing title="Prüfungsset nicht gefunden" to="/simulator/pruefungen" />;
  return (
    <div className="page-flow">
      <Link className="back-link" to="/simulator">
        ← Simulator
      </Link>
      <header className="page-header">
        <p className="eyebrow">Aktuelle Probeklausur</p>
        <h1>{examPackage.title}</h1>
        <p>{examPackage.description}</p>
      </header>
      <p className="notice">
        Diese Probeklausur wurde aus verifizierten Aufgabenfamilien zusammengestellt. Sie ist keine
        historische Originalklausur.
      </p>
      <ExamPackageFacts examPackage={examPackage} />
      <TaskSlotPreview examPackage={examPackage} />
      <Link className="button-link" to={`/simulator/pruefungen/${examPackage.id}/briefing`}>
        Briefing öffnen
      </Link>
    </div>
  );
}

export function ExamBriefing() {
  const { examPackageId } = useParams();
  const navigate = useNavigate();
  const examPackage = examPackageId ? getExamPackageById(examPackageId) : getCoreExamPackage();
  if (!examPackage)
    return <Missing title="Prüfungsset nicht gefunden" to="/simulator/pruefungen" />;
  const start = async () => {
    const session = await createSimulatorSession('strict_exam', examPackage.id);
    const running = await startSimulatorSession({ ...session, status: 'ready' });
    await navigate(`/simulator/sitzung/${running.id}/aufgabe/${running.currentTaskSlotId}`);
  };
  return (
    <div className="page-flow">
      <Link className="back-link" to={`/simulator/pruefungen/${examPackage.id}`}>
        ← Probeklausur
      </Link>
      <header className="page-header">
        <p className="eyebrow">Briefing</p>
        <h1>{examPackage.title}</h1>
        <p>
          {examPackage.taskSlots.length} Aufgaben ·{' '}
          {exactToLabel(exactFromContent(examPackage.totalPoints))} Punkte ·{' '}
          {examPackage.durationMinutes} Minuten.
        </p>
      </header>
      <section className="panel">
        <h2>Vor dem Start</h2>
        <ul>
          <li>Autosave speichert Antworten lokal.</li>
          <li>Der Timer läuft während Reloads weiter.</li>
          <li>Du kannst Aufgaben zur Kontrolle markieren.</li>
          <li>Modellantworten und Bewertung erscheinen erst nach endgültiger Abgabe.</li>
        </ul>
      </section>
      <button className="primary-button" type="button" onClick={() => void start()}>
        Prüfung starten
      </button>
    </div>
  );
}

export function ExamSessionPage() {
  const { sessionId, taskSlotId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<ExamSession | undefined>();
  const [answer, setAnswer] = useState<unknown>(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const pendingReviewSave = useRef<Promise<ExamSession> | null>(null);
  const pendingAutosave = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answerRef = useRef<unknown>(null);
  const answerRevision = useRef(0);
  const pendingAnswerSave = useRef<Promise<ExamSession> | null>(null);
  const now = useSyncExternalStore(subscribeClock, getClockSnapshot, () => 0);
  useEffect(
    () => () => {
      if (pendingAutosave.current) clearTimeout(pendingAutosave.current);
    },
    [],
  );
  useEffect(() => {
    if (!sessionId) return;
    void getSimulatorSession(sessionId).then((loaded) => {
      setSession(loaded);
      const currentSlot = taskSlotId ?? loaded?.currentTaskSlotId;
      const restoredAnswer = currentSlot ? (loaded?.taskStates[currentSlot]?.answer ?? null) : null;
      answerRef.current = restoredAnswer;
      answerRevision.current = currentSlot
        ? (loaded?.taskStates[currentSlot]?.answerRevision ?? 0)
        : 0;
      setAnswer(restoredAnswer);
      setSaveStatus('Gespeichert');
    });
  }, [sessionId, taskSlotId]);
  if (!session) return <Missing title="Sitzung nicht gefunden" to="/simulator" />;
  const examPackage = getExamPackageById(session.examPackageId) ?? getCoreExamPackage();
  const activeTaskSlotId = taskSlotId ?? session.currentTaskSlotId;
  const task = examPackage.taskSlots.find((slot) => slot.taskSlotId === activeTaskSlotId);
  if (!task)
    return <Missing title="Aufgabe nicht gefunden" to={`/simulator/sitzung/${session.id}`} />;
  const remainingMs = computeRemainingTime(session.deadlineAt, now);
  const save = async (
    answerToSave = answerRef.current,
    revisionToSave = answerRevision.current,
  ) => {
    setSaving(true);
    setSaveStatus('Wird gespeichert …');
    try {
      if (pendingReviewSave.current) await pendingReviewSave.current;
      const persistence = saveTaskAnswer({
        sessionId: session.id,
        taskSlotId: task.taskSlotId,
        answerRevision: revisionToSave,
        answer: answerToSave,
      });
      pendingAnswerSave.current = persistence;
      const saved = await persistence;
      setSession(saved);
      if (revisionToSave === answerRevision.current) setSaveStatus('Gespeichert');
      return saved;
    } catch {
      setSaveStatus('Speicherfehler');
      throw new Error('Die strukturierte Antwort konnte nicht gespeichert werden.');
    } finally {
      pendingAnswerSave.current = null;
      setSaving(false);
    }
  };
  const go = async (nextSlotId: string) => {
    if (pendingAutosave.current) clearTimeout(pendingAutosave.current);
    if (pendingAnswerSave.current) await pendingAnswerSave.current;
    const saved = await save();
    const next = await navigateSimulatorTask(saved, nextSlotId);
    await navigate(`/simulator/sitzung/${next.id}/aufgabe/${nextSlotId}`);
  };
  const submit = async () => {
    if (
      !window.confirm(
        'Die Prüfung wird endgültig abgegeben. Danach werden Lösungen und Bewertung angezeigt.',
      )
    )
      return;
    if (pendingAutosave.current) clearTimeout(pendingAutosave.current);
    if (pendingAnswerSave.current) await pendingAnswerSave.current;
    const saved = await save();
    const { session: graded } = await submitSimulatorSession(saved);
    await navigate(`/simulator/sitzung/${graded.id}/ergebnis`);
  };
  const changeAnswer = (nextAnswer: unknown) => {
    answerRef.current = nextAnswer;
    answerRevision.current += 1;
    setAnswer(nextAnswer);
    setSaveStatus('Ungespeicherte Änderungen');
    if (pendingAutosave.current) clearTimeout(pendingAutosave.current);
    const revision = answerRevision.current;
    pendingAutosave.current = setTimeout(() => void save(nextAnswer, revision), 500);
  };
  const completion = completionForExamAnswer(task, answer);
  return (
    <div className="page-flow trainer-attempt">
      <header className="page-header">
        <p className="eyebrow">Laufende Prüfung · {formatTime(remainingMs)}</p>
        <h1>{task.title}</h1>
        <p>
          {task.examPoints.numerator / task.examPoints.denominator} Punkte · Bewertung erst nach
          endgültiger Abgabe.
        </p>
      </header>
      <ExamTaskNavigation
        session={session}
        activeTaskSlotId={task.taskSlotId}
        onSelect={(slotId) => void go(slotId)}
      />
      <section className="step-input">
        <ExamTaskRenderer task={task} answer={answer} onChange={changeAnswer} />
        <p>
          Bearbeitungsstand: <strong>{completionStatusLabels[completion.status]}</strong>
          {completion.missing.length
            ? ` · noch offen: ${completion.missing.slice(0, 3).join(', ')}`
            : ''}
        </p>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={session.reviewFlags[task.taskSlotId] ?? false}
            onChange={(event) => {
              const marked = event.currentTarget.checked;
              const optimisticSession = {
                ...session,
                reviewFlags: { ...session.reviewFlags, [task.taskSlotId]: marked },
              };
              setSession(optimisticSession);
              const persistence = setSimulatorReviewFlag(session, task.taskSlotId, marked);
              pendingReviewSave.current = persistence;
              void persistence.finally(() => {
                if (pendingReviewSave.current === persistence) pendingReviewSave.current = null;
              });
            }}
          />
          Zur Kontrolle markieren
        </label>
      </section>
      <p className="sr-status" aria-live="polite">
        {saveStatus || 'Gespeichert'}
      </p>
      <div className="button-row">
        <button type="button" disabled={saving} onClick={() => void save()}>
          {saving ? 'Wird gespeichert …' : 'Jetzt speichern'}
        </button>
        <Link className="button-link" to={`/simulator/sitzung/${session.id}/uebersicht`}>
          Übersicht
        </Link>
        <button className="primary-button" type="button" onClick={() => void submit()}>
          Endgültig abgeben
        </button>
      </div>
    </div>
  );
}

export function ExamOverview() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<ExamSession | undefined>();
  useEffect(() => {
    if (sessionId) void getSimulatorSession(sessionId).then(setSession);
  }, [sessionId]);
  if (!session) return <Missing title="Übersicht nicht gefunden" to="/simulator" />;
  const examPackage = getExamPackageById(session.examPackageId) ?? getCoreExamPackage();
  return (
    <div className="page-flow">
      <header className="page-header">
        <h1>Review vor Abgabe</h1>
        <p>
          Prüfe beantwortete, unbeantwortete und markierte Aufgaben. Es gibt noch keine
          Modellantworten.
        </p>
      </header>
      <ExamTaskNavigation session={session} activeTaskSlotId={session.currentTaskSlotId} />
      <section className="task-table-wrapper">
        <table>
          <caption>Abgabestatus</caption>
          <thead>
            <tr>
              <th>Aufgabe</th>
              <th>Status</th>
              <th>Kontrolle</th>
              <th>Punkte</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {examPackage.taskSlots.map((slot, index) => {
              const state = session.taskStates[slot.taskSlotId];
              return (
                <tr key={slot.taskSlotId}>
                  <td>Aufgabe {index + 1}</td>
                  <td>{completionStatusLabels[state?.completionStatus ?? 'unanswered']}</td>
                  <td>{session.reviewFlags[slot.taskSlotId] ? 'markiert' : 'nicht markiert'}</td>
                  <td>{slot.examPoints.numerator / slot.examPoints.denominator}</td>
                  <td>
                    <Link to={`/simulator/sitzung/${session.id}/aufgabe/${slot.taskSlotId}`}>
                      öffnen
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <Link
        className="button-link"
        to={`/simulator/sitzung/${session.id}/aufgabe/${session.currentTaskSlotId}`}
      >
        Zurück zur Aufgabe
      </Link>
    </div>
  );
}

export function ExamResultPage() {
  const { sessionId } = useParams();
  const [result, setResult] = useState<Awaited<ReturnType<typeof getSimulatorResult>>>();
  useEffect(() => {
    if (sessionId) void getSimulatorResult(sessionId).then(setResult);
  }, [sessionId]);
  if (!result) return <Missing title="Ergebnis nicht gefunden" to="/simulator" />;
  const total = result.totalScore.numerator / result.totalScore.denominator;
  const max = result.maximumScore.numerator / result.maximumScore.denominator;
  const taskScores = result.taskScores as Array<{
    trainerId: string;
    mappedExamScore: { numerator: number; denominator: number };
    examMaximum: { numerator: number; denominator: number };
    errors: Array<{ errorCode: string; explanation: string; recommendedReview: string }>;
    rubricResults?: Array<{
      criterionId: string;
      label: string;
      points: number;
      maxPoints: number;
    }>;
    submittedAnswerSummary?: string;
    modelAnswer?: unknown;
    explanation?: string;
  }>;
  return (
    <div className="page-flow trainer-result">
      <header className="page-header">
        <p className="eyebrow">Ergebnisbericht · keine offizielle Note</p>
        <h1>
          {total}/{max} Punkte
        </h1>
        <p>Nicht-offizielle Übungsauswertung der aktuellen Probeklausur mit Lernhinweisen.</p>
      </header>
      <section className="task-table-wrapper">
        <table>
          <caption>Aufgabenpunkte und nächste Lernaktion</caption>
          <thead>
            <tr>
              <th>Aufgabe</th>
              <th>Punkte</th>
              <th>Rubrikfehler</th>
              <th>Lernhinweis</th>
            </tr>
          </thead>
          <tbody>
            {taskScores.map((score, index) => {
              const trainer = trainerRegistry.find((entry) => entry.trainerId === score.trainerId);
              return (
                <tr key={score.trainerId}>
                  <td>{trainer?.title ?? `Aufgabe ${index + 1}`}</td>
                  <td>
                    {score.mappedExamScore.numerator / score.mappedExamScore.denominator}/
                    {score.examMaximum.numerator / score.examMaximum.denominator}
                  </td>
                  <td>{score.errors.length}</td>
                  <td>
                    <Link to="/lernplan/heute">Schwäche in den Lernplan übernehmen</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <section className="card-grid" aria-label="Auswertung je Aufgabe">
        {taskScores.map((score, index) => {
          const trainer = trainerRegistry.find((entry) => entry.trainerId === score.trainerId);
          return (
            <article className="card" key={`${score.trainerId}-details`}>
              <h2>
                Aufgabe {index + 1}: {trainer?.title ?? 'Klausuraufgabe'}
              </h2>
              <p>
                <strong>Abgabe:</strong>{' '}
                {score.submittedAnswerSummary ?? 'Strukturierte Antwort gespeichert.'}
              </p>
              <h3>Rubrik</h3>
              <ul>
                {(score.rubricResults ?? []).map((criterion) => (
                  <li key={criterion.criterionId}>
                    {criterion.label}: {criterion.points}/{criterion.maxPoints}
                  </li>
                ))}
              </ul>
              <h3>Modelllösung</h3>
              <ReadableAnswer value={score.modelAnswer} />
              {score.explanation ? (
                <p>
                  <strong>Einordnung:</strong> {score.explanation}
                </p>
              ) : null}
              {score.errors.length ? (
                <ul>
                  {score.errors.map((error) => (
                    <li key={error.errorCode}>{error.explanation}</li>
                  ))}
                </ul>
              ) : (
                <p>Keine automatisch erkannte Abweichung.</p>
              )}
              <div className="button-row">
                <Link className="button-link" to={trainerRoute(score.trainerId)}>
                  Trainer öffnen
                </Link>
                <Link className="button-link" to="/lernen">
                  Lernmodul öffnen
                </Link>
                <Link className="button-link" to={trainerRoute(score.trainerId)}>
                  Ähnliche Variante üben
                </Link>
                <Link className="button-link" to="/lernplan/heute">
                  Zum Lernplan hinzufügen
                </Link>
              </div>
            </article>
          );
        })}
      </section>
      <section className="panel">
        <h2>Erklärung</h2>
        <p>
          Der Bericht zeigt Punkte und Rubrikfehler erst nach Abgabe. Öffne die passenden Trainer
          oder Lernmodule, um falsche Zwischenschritte aktiv zu wiederholen.
        </p>
      </section>
      <Link className="button-link" to="/simulator">
        Zum Simulator
      </Link>
    </div>
  );
}

function ExamPackageFacts({
  examPackage = getCoreExamPackage(),
}: {
  examPackage?: ReturnType<typeof getCoreExamPackage>;
}) {
  return (
    <section className="panel">
      <h2>Prüfungsdaten</h2>
      <dl className="metadata-list">
        <div>
          <dt>Typ</dt>
          <dd>Neu zusammengestellte Probeklausur, keine historische Originalklausur</dd>
        </div>
        <div>
          <dt>Dauer</dt>
          <dd>
            {examPackage.durationMinutes} Minuten · {examPackage.timerPolicy.derivation}
          </dd>
        </div>
        <div>
          <dt>Punkte</dt>
          <dd>{exactToLabel(exactFromContent(examPackage.totalPoints))}</dd>
        </div>
        <div>
          <dt>Offline</dt>
          <dd>Offline bereit nach vorherigem Laden der App-Shell und Chunks.</dd>
        </div>
      </dl>
    </section>
  );
}

function TaskSlotPreview({
  examPackage = getCoreExamPackage(),
}: {
  examPackage?: ReturnType<typeof getCoreExamPackage>;
}) {
  return (
    <section className="panel">
      <h2>Aufgaben</h2>
      <div className="task-grid">
        {examPackage.taskSlots.map((slot, index) => (
          <article className="task-card" key={slot.taskSlotId}>
            <span className="task-card__number">{index + 1}</span>
            <div>
              <h3>{slot.title}</h3>
              <p>{rendererLabels[slot.rendererType] ?? slot.family}</p>
              <small>{slot.examPoints.numerator / slot.examPoints.denominator} Punkte</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ExamTaskNavigation({
  session,
  activeTaskSlotId,
  onSelect,
}: {
  session: ExamSession;
  activeTaskSlotId: string;
  onSelect?: (slotId: string) => void;
}) {
  const examPackage = getExamPackageById(session.examPackageId) ?? getCoreExamPackage();
  return (
    <nav className="exam-task-nav" aria-label="Prüfungsaufgaben">
      {examPackage.taskSlots.map((slot, index) => {
        const state = session.taskStates[slot.taskSlotId];
        const statusLabel = state
          ? completionStatusLabels[state.completionStatus]
          : 'unbeantwortet';
        const label = `Aufgabe ${index + 1}`;
        const detail = `${statusLabel}${session.reviewFlags[slot.taskSlotId] ? ' · zur Kontrolle' : ''} · ${slot.examPoints.numerator / slot.examPoints.denominator} Punkte`;
        return onSelect ? (
          <button
            key={slot.taskSlotId}
            type="button"
            aria-current={slot.taskSlotId === activeTaskSlotId ? 'step' : undefined}
            onClick={() => onSelect(slot.taskSlotId)}
          >
            <strong>{label}</strong>
            <span>{detail}</span>
          </button>
        ) : (
          <Link
            key={slot.taskSlotId}
            aria-current={slot.taskSlotId === activeTaskSlotId ? 'step' : undefined}
            to={`/simulator/sitzung/${session.id}/aufgabe/${slot.taskSlotId}`}
          >
            <strong>{label}</strong>
            <span>{detail}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Missing({ title, to }: { title: string; to: string }) {
  return (
    <section className="page-flow">
      <h1>{title}</h1>
      <Link to={to}>Zurück</Link>
    </section>
  );
}

function trainerRoute(trainerId: string) {
  if (trainerId === 'trainer-rucksack-dp-v1' || trainerId === 'trainer-union-find-listen-v1')
    return `/trainer/tracing/${trainerId}`;
  if (trainerId === 'trainer-schleifeninvariante-summe-v1') return `/trainer/beweise/${trainerId}`;
  if (trainerId === 'trainer-rekurrenz-master-fall1-v1') return `/trainer/rekurrenzen/${trainerId}`;
  if (trainerId === 'trainer-dp-entwurf-mine-v1') return `/trainer/entwurf/dp/${trainerId}`;
  if (trainerId === 'trainer-dc-entwurf-maxwertdifferenz-v1')
    return `/trainer/entwurf/divide-and-conquer/${trainerId}`;
  if (trainerId === 'trainer-rot-schwarz-einfuegen-v1')
    return `/trainer/baeume/rot-schwarz/${trainerId}`;
  if (trainerId.includes('dijkstra')) return `/trainer/graphen/dijkstra/${trainerId}`;
  if (trainerId.includes('prim')) return `/trainer/graphen/prim/${trainerId}`;
  return '/trainer';
}

function ReadableAnswer({ value }: { value: unknown }) {
  if (value === null || value === undefined)
    return <p>Modelllösung wird aus der kanonischen Trainerantwort aufgebaut.</p>;
  if (typeof value !== 'object') return <p>{String(value)}</p>;
  return (
    <dl className="metadata-list">
      {Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !['kind', 'trainerKind', 'problemId', 'preflight'].includes(key))
        .map(([key, entry]) => (
          <div key={key}>
            <dt>{key.replace(/([A-Z])/gu, ' $1')}</dt>
            <dd>
              {typeof entry === 'object' && entry !== null ? (
                <ReadableAnswer value={entry} />
              ) : (
                String(entry)
              )}
            </dd>
          </div>
        ))}
    </dl>
  );
}

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
