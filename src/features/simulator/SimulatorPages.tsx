import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { content } from '../../content/loaders/content';
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
  partial: 'teilweise beantwortet',
  answered: 'beantwortet',
};

const coverageStatusLabels = {
  fully_supported: 'vollständig unterstützt',
  partially_supported: 'teilweise unterstützt',
  metadata_only: 'nur Metadaten',
  unsupported: 'nicht unterstützt',
} as const;

const examPackageTypeLabels = {
  generated_core_mock: 'neu zusammengestellte Kernkompetenz-Probeklausur',
} as const;

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
        <p className="eyebrow">Phase 7 · Klausursimulator</p>
        <h1>Klausursimulator</h1>
        <p>
          Historische Profile werden ehrlich als Coverage-Vorschau gezeigt. Die startbaren
          Kernkompetenz-Probeklausuren V1 bis V4 bleiben als nicht historische, automatisch
          bewertbare Prüfungssets erhalten.
        </p>
      </header>
      <section className="trainer-grid">
        <article className="trainer-card">
          <span className="status-badge status-badge--success">startbar</span>
          <h2>{examPackage.title}</h2>
          <p>{examPackage.description}</p>
          <p className="notice">
            Diese Probeklausur wurde aus verifizierten Aufgabenfamilien zusammengestellt. Sie ist
            keine historische Originalklausur.
          </p>
          <Link className="button-link" to={`/simulator/pruefungen/${examPackage.id}`}>
            Probeklausur öffnen
          </Link>
        </article>
        <article className="trainer-card">
          <span className="status-badge status-badge--info">Vorschau</span>
          <h2>Historische Profile</h2>
          <p>Zeigt, welche Slots bereits unterstützt sind und welche Trainerfamilien fehlen.</p>
          <Link className="button-link" to="/simulator/profile">
            Profilabdeckung ansehen
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
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Historische Profile · keine Vollsimulation</p>
        <h1>Profilabdeckung</h1>
        <p>
          Nur `fully_supported` dürfte vollständig gestartet werden. Aktuell ist kein historisches
          Profil vollständig startbar.
        </p>
      </header>
      <section className="trainer-grid">
        {content.examProfileCoverage.profiles.map((profile) => (
          <article className="trainer-card" key={profile.profileId}>
            <span className="status-badge status-badge--info">
              {coverageStatusLabels[profile.coverageStatus]}
            </span>
            <h2>{profile.title}</h2>
            <p>
              Unterstützt: {profile.supportedSlots.join(', ') || 'keine'} · Nicht unterstützt:{' '}
              {profile.unsupportedSlots.join(', ') || 'keine'}
            </p>
            <p>{profile.startable ? 'Startbar' : 'Nicht startbar'}</p>
            <Link className="button-link" to={`/simulator/profile/${profile.profileId}`}>
              Details ansehen
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}

export function ExamProfileDetail() {
  const { profileId } = useParams();
  const profile = content.examProfileCoverage.profiles.find(
    (candidate) => candidate.profileId === profileId,
  );
  if (!profile) return <Missing title="Profil nicht gefunden" to="/simulator/profile" />;
  return (
    <div className="page-flow">
      <Link className="back-link" to="/simulator/profile">
        ← Profilübersicht
      </Link>
      <header className="page-header">
        <p className="eyebrow">{coverageStatusLabels[profile.coverageStatus]}</p>
        <h1>{profile.title}</h1>
        <p>
          {profile.startable
            ? 'Vollständig startbar.'
            : 'Nicht als vollständige Simulation startbar.'}
        </p>
      </header>
      <CoverageTable profile={profile} />
    </div>
  );
}

export function ExamPackageList() {
  return (
    <div className="page-flow">
      <header className="page-header">
        <h1>Startbare Prüfungssets</h1>
        <p>V1 bis V4 bleiben als startbare, nicht historische Kernkompetenz-Pakete erhalten.</p>
      </header>
      {content.examPackages.map((examPackage) => (
        <article className="trainer-card" key={examPackage.id}>
          <h2>{examPackage.title}</h2>
          <p>{examPackage.description}</p>
          <Link className="button-link" to={`/simulator/pruefungen/${examPackage.id}`}>
            Öffnen
          </Link>
        </article>
      ))}
    </div>
  );
}

export function ExamPackageDetail() {
  const { examPackageId } = useParams();
  const examPackage = content.examPackages.find((candidate) => candidate.id === examPackageId);
  if (!examPackage)
    return <Missing title="Prüfungsset nicht gefunden" to="/simulator/pruefungen" />;
  return (
    <div className="page-flow">
      <Link className="back-link" to="/simulator">
        ← Simulator
      </Link>
      <header className="page-header">
        <p className="eyebrow">{examPackageTypeLabels[examPackage.packageType]}</p>
        <h1>{examPackage.title}</h1>
        <p>{examPackage.description}</p>
      </header>
      <p className="notice">
        Diese Probeklausur wurde aus verifizierten Aufgabenfamilien zusammengestellt. Sie ist keine
        historische Originalklausur.
      </p>
      <ExamPackageFacts examPackage={examPackage} />
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
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  if (!examPackage)
    return <Missing title="Prüfungsset nicht gefunden" to="/simulator/pruefungen" />;
  const checks = [
    'Timer verstanden',
    'Keine Hinweise während der Prüfung',
    'Antworten werden automatisch gespeichert',
    'Zeit läuft bei Reload weiter',
    'Endgültige Abgabe ist nicht rückgängig zu machen',
    'Diese Probeklausur ist keine historische Originalklausur',
  ];
  const ready = checks.every((check) => confirmed[check]);
  const start = async () => {
    const session = await createSimulatorSession('strict_exam', examPackage.id);
    const running = await startSimulatorSession({ ...session, status: 'ready' });
    await navigate(`/simulator/sitzung/${running.id}/aufgabe/${running.currentTaskSlotId}`);
  };
  return (
    <div className="page-flow">
      <Link className="back-link" to={`/simulator/pruefungen/${examPackage.id}`}>
        ← Prüfungsset
      </Link>
      <header className="page-header">
        <p className="eyebrow">Briefing · Strict Exam</p>
        <h1>{examPackage.title}</h1>
        <p>
          {examPackage.taskSlots.length} Aufgaben ·{' '}
          {exactToLabel(exactFromContent(examPackage.totalPoints))} Punkte ·{' '}
          {examPackage.durationMinutes} Minuten.
        </p>
      </header>
      <ExamPackageFacts examPackage={examPackage} />
      <section className="panel">
        <h2>Startbestätigung</h2>
        {checks.map((check) => (
          <label key={check} className="checkbox-row">
            <input
              type="checkbox"
              checked={confirmed[check] ?? false}
              onChange={(event) => setConfirmed({ ...confirmed, [check]: event.target.checked })}
            />
            {check}
          </label>
        ))}
      </section>
      <button
        className="primary-button"
        type="button"
        disabled={!ready}
        onClick={() => void start()}
      >
        Prüfung starten
      </button>
    </div>
  );
}

export function ExamSessionPage() {
  const { sessionId, taskSlotId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<ExamSession | undefined>();
  const [answerText, setAnswerText] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const pendingReviewSave = useRef<Promise<ExamSession> | null>(null);
  const now = useSyncExternalStore(subscribeClock, getClockSnapshot, () => 0);
  useEffect(() => {
    if (!sessionId) return;
    void getSimulatorSession(sessionId).then((loaded) => {
      setSession(loaded);
      const currentSlot = taskSlotId ?? loaded?.currentTaskSlotId;
      const answer = currentSlot ? loaded?.taskStates[currentSlot]?.answer : null;
      setAnswerText(answer ? JSON.stringify(answer, null, 2) : '');
      setSaveStatus('');
    });
  }, [sessionId, taskSlotId]);
  if (!session) return <Missing title="Sitzung nicht gefunden" to="/simulator" />;
  const examPackage = getExamPackageById(session.examPackageId) ?? getCoreExamPackage();
  const activeTaskSlotId = taskSlotId ?? session.currentTaskSlotId;
  const task = examPackage.taskSlots.find((slot) => slot.taskSlotId === activeTaskSlotId);
  if (!task)
    return <Missing title="Aufgabe nicht gefunden" to={`/simulator/sitzung/${session.id}`} />;
  const remainingMs = computeRemainingTime(session.deadlineAt, now);
  const sessionAfterPendingReviewSave = async () => {
    if (pendingReviewSave.current) await pendingReviewSave.current;
    return (await getSimulatorSession(session.id)) ?? session;
  };
  const save = async () => {
    setSaving(true);
    setSaveStatus('Autosave läuft.');
    try {
      const latestSession = await sessionAfterPendingReviewSave();
      setSession(
        await saveTaskAnswer({ session: latestSession, taskSlotId: task.taskSlotId, answerText }),
      );
      setSaveStatus('Antwort lokal gespeichert.');
    } finally {
      setSaving(false);
    }
  };
  const go = async (nextSlotId: string) => {
    const latestSession = await sessionAfterPendingReviewSave();
    const saved = await saveTaskAnswer({
      session: latestSession,
      taskSlotId: task.taskSlotId,
      answerText,
    });
    const next = await navigateSimulatorTask(saved, nextSlotId);
    await navigate(`/simulator/sitzung/${next.id}/aufgabe/${nextSlotId}`);
  };
  const submit = async () => {
    const latestSession = await sessionAfterPendingReviewSave();
    const saved = await saveTaskAnswer({
      session: latestSession,
      taskSlotId: task.taskSlotId,
      answerText,
    });
    const { session: graded } = await submitSimulatorSession(saved);
    await navigate(`/simulator/sitzung/${graded.id}/ergebnis`);
  };
  return (
    <div className="page-flow trainer-attempt">
      <header className="page-header">
        <p className="eyebrow">Laufende Prüfung · {formatTime(remainingMs)}</p>
        <h1>{task.title}</h1>
        <p>
          {task.examPoints.numerator / task.examPoints.denominator} Punkte · Status verrät keine
          fachliche Richtigkeit.
        </p>
      </header>
      <ExamTaskNavigation
        session={session}
        activeTaskSlotId={task.taskSlotId}
        onSelect={(slotId) => void go(slotId)}
      />
      <section className="step-input">
        <h2>Antwort-Payload aktiv eingeben</h2>
        <p>
          Gib die strukturierte Antwort als JSON ein. Die Bewertung erfolgt erst nach endgültiger
          Abgabe.
        </p>
        <label className="wide-input">
          Antwort für {task.title}
          <textarea
            rows={12}
            value={answerText}
            onChange={(event) => setAnswerText(event.target.value)}
          />
        </label>
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
              void persistence
                .then((stored) => {
                  setSession((current) =>
                    current?.id === stored.id
                      ? {
                          ...stored,
                          currentTaskSlotId: current.currentTaskSlotId,
                          taskStates: current.taskStates,
                        }
                      : stored,
                  );
                })
                .finally(() => {
                  if (pendingReviewSave.current === persistence) pendingReviewSave.current = null;
                });
            }}
          />
          Zur Kontrolle markieren
        </label>
      </section>
      <p className="sr-status" aria-live="polite">
        {saveStatus}
      </p>
      <div className="button-row">
        <button type="button" disabled={saving} onClick={() => void save()}>
          {saving ? 'Autosave läuft …' : 'Autosave jetzt ausführen'}
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
  return (
    <div className="page-flow">
      <header className="page-header">
        <h1>Aufgabenübersicht vor Abgabe</h1>
        <p>
          Keine fachliche Bewertung vor Abgabe. Unbeantwortete Aufgaben können trotzdem abgegeben
          werden.
        </p>
      </header>
      <ExamTaskNavigation session={session} activeTaskSlotId={session.currentTaskSlotId} />
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
  return (
    <div className="page-flow trainer-result">
      <header className="page-header">
        <p className="eyebrow">Ergebnisbericht · keine offizielle Note</p>
        <h1>
          {total}/{max} Punkte
        </h1>
        <p>Trainingsinterne Auswertung der Kernkompetenz-Probeklausur.</p>
      </header>
      <section className="task-table-wrapper">
        <table>
          <caption>Aufgabenpunkte</caption>
          <thead>
            <tr>
              <th>Aufgabe</th>
              <th>Punkte</th>
              <th>Fehler</th>
            </tr>
          </thead>
          <tbody>
            {(
              result.taskScores as Array<{
                trainerId: string;
                mappedExamScore: { numerator: number; denominator: number };
                examMaximum: { numerator: number; denominator: number };
                errors: unknown[];
              }>
            ).map((score) => (
              <tr key={score.trainerId}>
                <td>{score.trainerId}</td>
                <td>
                  {score.mappedExamScore.numerator / score.mappedExamScore.denominator}/
                  {score.examMaximum.numerator / score.examMaximum.denominator}
                </td>
                <td>{score.errors.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="panel">
        <h2>Mastery V6</h2>
        <ul>
          {Object.entries(result.masteryImpact).map(([key, value]) => (
            <li key={key}>
              {key}: {Math.round(value * 100)} %
            </li>
          ))}
        </ul>
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

function CoverageTable({
  profile,
}: {
  profile: (typeof content.examProfileCoverage.profiles)[number];
}) {
  return (
    <section className="task-table-wrapper">
      <table>
        <caption>Coverage für {profile.title}</caption>
        <tbody>
          <tr>
            <th>Slots</th>
            <td>{profile.slots}</td>
          </tr>
          <tr>
            <th>Punkte</th>
            <td>{profile.points ?? 'unbekannt'}</td>
          </tr>
          <tr>
            <th>Dauer</th>
            <td>{profile.durationMinutes ?? 'unbekannt'}</td>
          </tr>
          <tr>
            <th>Unterstützt</th>
            <td>{profile.supportedSlots.join(', ') || 'keine'}</td>
          </tr>
          <tr>
            <th>Teilweise</th>
            <td>{profile.partiallySupportedSlots.join(', ') || 'keine'}</td>
          </tr>
          <tr>
            <th>Nicht unterstützt</th>
            <td>{profile.unsupportedSlots.join(', ') || 'keine'}</td>
          </tr>
          <tr>
            <th>Fehlende Familien</th>
            <td>{profile.missingTrainerFamilies.join('; ')}</td>
          </tr>
        </tbody>
      </table>
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
    <nav className="step-navigator" aria-label="Prüfungsaufgaben">
      {examPackage.taskSlots.map((slot, index) => {
        const state = session.taskStates[slot.taskSlotId];
        const statusLabel = state
          ? completionStatusLabels[state.completionStatus]
          : 'unbeantwortet';
        const label = `${index + 1}. ${statusLabel}${session.reviewFlags[slot.taskSlotId] ? ' · Kontrolle' : ''}`;
        return onSelect ? (
          <button
            key={slot.taskSlotId}
            type="button"
            aria-current={slot.taskSlotId === activeTaskSlotId ? 'step' : undefined}
            onClick={() => onSelect(slot.taskSlotId)}
          >
            {label}
          </button>
        ) : (
          <Link
            key={slot.taskSlotId}
            to={`/simulator/sitzung/${session.id}/aufgabe/${slot.taskSlotId}`}
          >
            {label}
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

function formatTime(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
