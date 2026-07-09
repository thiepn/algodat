import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  DailyStudyPlan,
  ExamSlotReadiness,
  OverallExamReadiness,
  ReviewSchedule,
  StudyPlanSettings,
  WeeklyStudyPlan,
} from '../../domain/study-orchestrator';
import {
  completeStudyActivity,
  defaultStudyPlanSettings,
  generateAndStoreStudyPlan,
  loadDueReviews,
  loadOrCreateTodayPlan,
  loadReadiness,
  loadStudyPlanSettings,
  loadWeeklyPlan,
  saveStudyPlanSettings,
  skipStudyPlanActivity,
  snoozeStudyPlanActivity,
  startStudyActivity,
} from './study-plan-service';

const bandLabels: Record<string, string> = {
  insufficient_evidence: 'Zu wenig Evidenz',
  foundation_missing: 'Grundlage fehlt',
  developing: 'Im Aufbau',
  mostly_stable: 'Weitgehend stabil',
  exam_ready: 'Prüfungsnah stabil',
  stale_evidence: 'Evidenz veraltet',
};

function ActivityCard({
  plan,
  activity,
  onChange,
}: {
  plan: DailyStudyPlan;
  activity: DailyStudyPlan['activities'][number];
  onChange: (plan: DailyStudyPlan) => void;
}) {
  const reasonId = `${activity.activityId}-reasons`;
  return (
    <article className="card" aria-describedby={reasonId}>
      <p className="eyebrow">
        {activity.estimatedMinutes} Minuten · Status: {activity.status}
      </p>
      <h3>{activity.title}</h3>
      <p>
        Aufgabe {activity.examTaskNumbers.join(', ')} · Priorität {activity.priority.toFixed(1)}
      </p>
      <details id={reasonId}>
        <summary>Warum diese Aktivität?</summary>
        <ul>
          {activity.reasons.map((reason) => (
            <li key={reason.factor}>{reason.detail}</li>
          ))}
        </ul>
        {activity.blockedReasons.length ? (
          <p>Blocker: {activity.blockedReasons.join(' ')}</p>
        ) : null}
      </details>
      <div className="button-row">
        <Link className="button" to={activity.route}>
          Starten
        </Link>
        <button onClick={() => void startStudyActivity(plan, activity.activityId).then(onChange)}>
          Als gestartet markieren
        </button>
        <button
          onClick={() => void completeStudyActivity(plan, activity.activityId).then(onChange)}
        >
          Abschließen
        </button>
        <button
          onClick={() => void snoozeStudyPlanActivity(plan, activity.activityId).then(onChange)}
        >
          Auf morgen verschieben
        </button>
        <button
          onClick={() => void skipStudyPlanActivity(plan, activity.activityId).then(onChange)}
        >
          Überspringen
        </button>
      </div>
    </article>
  );
}

function ReadinessCard({ slot }: { slot: ExamSlotReadiness }) {
  return (
    <article className="card">
      <p className="eyebrow">
        Aufgabe {slot.taskNumber} · {slot.coverageStatus}
      </p>
      <h3>{slot.title}</h3>
      <p>
        {bandLabels[slot.readinessBand]} · Evidenz: {slot.evidenceLevel} · interner Score{' '}
        {Math.round(slot.readinessScore * 100)} %
      </p>
      {slot.blockingGaps.length ? (
        <ul>
          {slot.blockingGaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
        </ul>
      ) : (
        <p>Keine blockierende Lücke im Modell erkannt.</p>
      )}
    </article>
  );
}

export function StudyPlannerLandingPage() {
  const [summary, setSummary] = useState<{
    dailyPlan: DailyStudyPlan;
    overallReadiness: OverallExamReadiness;
    dueReviews: ReviewSchedule[];
  } | null>(null);

  useEffect(() => {
    void loadOrCreateTodayPlan().then(setSummary);
  }, []);

  if (!summary) return <p>Lernplan wird lokal berechnet …</p>;

  return (
    <section className="stack">
      <p className="eyebrow">Adaptiver Lernorchestrator · Phase 15</p>
      <h1>Was heute sinnvoll ist</h1>
      <p>
        Der Plan wird lokal aus Trainer-, Diagnose-, Simulator-, Review- und Mastery-Evidenz
        berechnet. Er ist keine Notenprognose.
      </p>
      <article className="card">
        <h2>{summary.dailyPlan.mainGoal}</h2>
        <p>
          {summary.dailyPlan.totalEstimatedMinutes} Minuten geplant · {summary.dueReviews.length}{' '}
          Wiederholung(en) fällig · Gesamtband: {bandLabels[summary.overallReadiness.overallBand]}
        </p>
        <div className="button-row">
          <Link className="button" to="/lernplan/heute">
            Tagesplan öffnen
          </Link>
          <Link className="button" to="/lernplan/pruefungsreife">
            Prüfungsreife ansehen
          </Link>
        </div>
      </article>
    </section>
  );
}

export function TodayStudyPlanPage() {
  const [plan, setPlan] = useState<DailyStudyPlan | null>(null);
  const [liveMessage, setLiveMessage] = useState('');

  useEffect(() => {
    void loadOrCreateTodayPlan().then((result) => setPlan(result.dailyPlan));
  }, []);

  if (!plan) return <p>Tagesplan wird geladen …</p>;

  const prominent = plan.activities.slice(0, 3);
  const additional = plan.activities.slice(3);

  return (
    <section className="stack">
      <p className="eyebrow">Heute · {plan.planDate}</p>
      <h1>Tagesplan</h1>
      <p>
        Budget genutzt: {plan.totalEstimatedMinutes} Minuten · fällige Wiederholungen:{' '}
        {plan.dueReviewCount}
      </p>
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>
      <button
        onClick={() =>
          void generateAndStoreStudyPlan('manuelle Regeneration').then((result) => {
            setPlan(result.dailyPlan);
            setLiveMessage('Der Tagesplan wurde neu berechnet.');
          })
        }
      >
        Plan neu berechnen
      </button>
      <div className="card-grid">
        {prominent.map((activity) => (
          <ActivityCard
            key={activity.activityId}
            plan={plan}
            activity={activity}
            onChange={setPlan}
          />
        ))}
      </div>
      {additional.length ? (
        <details>
          <summary>Weitere Aktivitäten</summary>
          <div className="card-grid">
            {additional.map((activity) => (
              <ActivityCard
                key={activity.activityId}
                plan={plan}
                activity={activity}
                onChange={setPlan}
              />
            ))}
          </div>
        </details>
      ) : null}
    </section>
  );
}

export function WeeklyStudyPlanPage() {
  const [plan, setPlan] = useState<WeeklyStudyPlan | null>(null);
  useEffect(() => {
    void loadWeeklyPlan().then((value) => setPlan(value as WeeklyStudyPlan));
  }, []);
  if (!plan) return <p>Wochenplan wird geladen …</p>;
  return (
    <section className="stack">
      <p className="eyebrow">Woche ab {plan.weekStart}</p>
      <h1>Wochenplan</h1>
      <p>
        {plan.totalEstimatedMinutes} Minuten geplant. Vergangene abgeschlossene Tage bleiben stabil.
      </p>
      <div className="card-grid" role="list">
        {plan.days.map((day) => (
          <article className="card" key={day.planId} role="listitem">
            <h2>{day.planDate}</h2>
            <p>
              {day.totalEstimatedMinutes} Minuten · {day.activities.length} Aktivität(en)
            </p>
            <ul>
              {day.activities.map((activity) => (
                <li key={activity.activityId}>{activity.title}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ExamReadinessPage() {
  const [state, setState] = useState<{
    slotReadiness: ExamSlotReadiness[];
    overallReadiness: OverallExamReadiness;
  } | null>(null);
  useEffect(() => {
    void loadReadiness().then(setState);
  }, []);
  const weakest = useMemo(
    () => state?.slotReadiness.find((slot) => slot.slotId === state.overallReadiness.weakestSlot),
    [state],
  );
  if (!state) return <p>Prüfungsreife wird berechnet …</p>;
  return (
    <section className="stack">
      <p className="eyebrow">Prüfungsreife ohne Notenprognose</p>
      <h1>Readiness nach Klausurslot</h1>
      <article className="card">
        <h2>Gesamtbild: {bandLabels[state.overallReadiness.overallBand]}</h2>
        <p>
          Schwächster Slot: {weakest?.title ?? 'nicht bestimmt'} · Slots ohne ausreichende Evidenz:{' '}
          {state.overallReadiness.insufficientEvidenceSlotCount} · zeitbegrenzte Evidenz:{' '}
          {state.overallReadiness.timedExamEvidence ? 'vorhanden' : 'fehlt'}
        </p>
      </article>
      <div className="card-grid">
        {state.slotReadiness.map((slot) => (
          <ReadinessCard key={slot.slotId} slot={slot} />
        ))}
      </div>
    </section>
  );
}

export function ReviewQueuePage() {
  const [reviews, setReviews] = useState<ReviewSchedule[] | null>(null);
  useEffect(() => {
    void loadDueReviews().then(setReviews);
  }, []);
  if (!reviews) return <p>Wiederholungen werden geladen …</p>;
  return (
    <section className="stack">
      <p className="eyebrow">Spaced Review</p>
      <h1>Fällige Wiederholungen</h1>
      {reviews.length ? (
        <ul className="stack">
          {reviews.map((review) => (
            <li className="card" key={review.id}>
              <strong>{review.reviewUnitId}</strong>
              <br />
              fällig seit {review.nextDueAt.slice(0, 10)} · Fehler:{' '}
              {review.errorCodes.join(', ') || 'keine'}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          Heute ist keine Wiederholung fällig. Der Tagesplan kann trotzdem kurze Puffer enthalten.
        </p>
      )}
    </section>
  );
}

export function StudyPlanSettingsPage() {
  const [settings, setSettings] = useState<StudyPlanSettings | null>(null);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    void loadStudyPlanSettings().then(setSettings);
  }, []);
  if (!settings) return <p>Einstellungen werden geladen …</p>;
  return (
    <section className="stack">
      <p className="eyebrow">Lokal gespeichert</p>
      <h1>Lernplan-Einstellungen</h1>
      <label>
        Prüfungsdatum optional
        <input
          type="date"
          value={settings.examDate ?? ''}
          onChange={(event) => setSettings({ ...settings, examDate: event.target.value || null })}
        />
      </label>
      <label>
        Tagesbudget in Minuten
        <input
          type="number"
          min={15}
          max={240}
          value={settings.dailyMinuteBudget}
          onChange={(event) =>
            setSettings({ ...settings, dailyMinuteBudget: Number(event.target.value) || 60 })
          }
        />
      </label>
      <label>
        Fokus
        <select
          value={settings.focusMode}
          onChange={(event) =>
            setSettings({
              ...settings,
              focusMode: event.target.value as StudyPlanSettings['focusMode'],
            })
          }
        >
          <option value="balanced">Ausgewogen</option>
          <option value="exam_breadth">Klausurbreite</option>
          <option value="weaknesses">Schwächen</option>
        </select>
      </label>
      <button
        onClick={() =>
          void saveStudyPlanSettings(settings).then(() => {
            setSaved(true);
          })
        }
      >
        Einstellungen speichern
      </button>
      <button
        onClick={() => {
          setSettings(defaultStudyPlanSettings());
          setSaved(false);
        }}
      >
        Standardwerte laden
      </button>
      {saved ? (
        <p role="status">Einstellungen gespeichert. Zukünftige Pläne werden neu berechnet.</p>
      ) : null}
    </section>
  );
}

export function StudyPlanHistoryPage() {
  return (
    <section className="stack">
      <p className="eyebrow">Verlauf</p>
      <h1>Lernplan-Verlauf</h1>
      <p>
        Abgeschlossene Aktivitäten bleiben im lokalen Planstatus erhalten. Skip und Snooze verändern
        keine fachliche Mastery.
      </p>
      <Link to="/lernplan/heute">Zum Tagesplan</Link>
    </section>
  );
}
