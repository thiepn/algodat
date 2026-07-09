import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import { practiceAttemptRepository } from '../../persistence/repositories';
import { ErrorAnalysis } from './components/TrainerComponents';
import {
  canonicalRecurrenceAnswerForTrainer,
  canonicalRecurrenceTextForTrainer,
  completeRecurrenceAttempt,
  recurrenceAnswerFromAttempt,
  saveRecurrenceDraft,
  scoreStoredRecurrenceAttempt,
  type RecurrenceStoredAnswer,
} from './recurrence-service';
import { getRecurrenceTrainerById } from './trainer-service';

type RecurrenceSection = Exclude<
  keyof RecurrenceStoredAnswer,
  'kind' | 'trainerKind' | 'problemId'
>;

export function RecurrenceAttemptPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<PracticeAttempt | null>(null);
  const [answer, setAnswer] = useState<RecurrenceStoredAnswer | null>(null);
  const [message, setMessage] = useState('Rekurrenzversuch wird geladen.');
  const [showSubmit, setShowSubmit] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!attemptId) return;
    void practiceAttemptRepository.get(attemptId).then((stored) => {
      if (!stored) {
        setMessage('Rekurrenzversuch nicht gefunden.');
        return;
      }
      setAttempt(stored);
      setAnswer(recurrenceAnswerFromAttempt(stored));
      setMessage(
        stored.status === 'draft'
          ? 'Gespeicherter Rekurrenzversuch fortgesetzt.'
          : 'Rekurrenzversuch ist bereits abgeschlossen.',
      );
    });
  }, [attemptId]);
  useLayoutEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    const frame = window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [attempt?.id]);
  const trainer = getRecurrenceTrainerById(attempt?.trainerId);
  if (!trainer || !attempt || !answer) return <p role="status">{message}</p>;
  const disabled = attempt.status === 'completed';
  const feedback =
    attempt.mode === 'exam'
      ? []
      : scoreStoredRecurrenceAttempt({ ...attempt, answers: [answer] }, answer).errors;
  const update = (section: RecurrenceSection, field: string, value: string) => {
    setAnswer({
      ...answer,
      [section]: { ...(answer[section] as Record<string, string>), [field]: value },
    } as RecurrenceStoredAnswer);
  };
  const save = async () => {
    await saveRecurrenceDraft(attempt, answer);
    setMessage('Rekurrenzversuch lokal gespeichert.');
  };
  const showHint = async (hintId: string) => {
    if (attempt.mode === 'exam') return;
    const hints = [...new Set([...attempt.hintsUsed, hintId])];
    const updated = { ...attempt, hintsUsed: hints };
    setAttempt(updated);
    await saveRecurrenceDraft(updated, answer, hints);
  };
  const reveal = async () => {
    if (attempt.mode === 'exam') return;
    const updated = { ...attempt, solutionRevealed: true };
    setAttempt(updated);
    setShowSolution(true);
    await saveRecurrenceDraft(updated, answer, updated.hintsUsed, true);
  };
  const fillCanonicalBlocks = async () => {
    if (attempt.mode === 'exam') return;
    const canonical = canonicalRecurrenceAnswerForTrainer();
    const updated = { ...attempt, solutionRevealed: true };
    setAttempt(updated);
    setAnswer(canonical);
    setShowSolution(true);
    await saveRecurrenceDraft(updated, canonical, updated.hintsUsed, true);
  };
  const submit = async () => {
    const { completed } = await completeRecurrenceAttempt(attempt, answer);
    await navigate(`/trainer/rekurrenzen/${attempt.trainerId}/auswertung/${completed.id}`);
  };

  return (
    <div className="page-flow attempt-page">
      <header className="attempt-header">
        <div>
          <p className="eyebrow">{modeLabel(attempt.mode)}</p>
          <h1 ref={headingRef} tabIndex={-1}>
            Rekurrenzanalyse aktiv eingeben
          </h1>
        </div>
        <span className="status-badge status-badge--info">deterministisch bewertet</span>
      </header>
      <p className="sr-status" aria-live="polite">
        {message}
      </p>
      <section className="panel">
        <h2>Aufgabe</h2>
        <p>
          Analysiere <strong>{trainer.problem.recurrence}</strong> mit {trainer.problem.baseCase};{' '}
          {trainer.problem.domain}. Ziel: {trainer.problem.requestedDeliverable}.
        </p>
      </section>
      {attempt.mode === 'learn' && (
        <section className="panel">
          <h2>Lernmodus: Vorgehensspur</h2>
          <ol>
            {trainer.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      )}
      <section className="proof-editor" aria-label="Strukturierte Rekurrenzanalyse">
        <RecurrenceGroup title="1. Aufgabenverständnis">
          <RecurrenceField
            label="Rekurrenz"
            value={answer.preflight.recurrence}
            disabled={disabled}
            onChange={(value) => update('preflight', 'recurrence', value)}
          />
          <RecurrenceField
            label="Basisfall"
            value={answer.preflight.baseCase}
            disabled={disabled}
            onChange={(value) => update('preflight', 'baseCase', value)}
          />
          <RecurrenceField
            label="Domäne"
            value={answer.preflight.domain}
            disabled={disabled}
            onChange={(value) => update('preflight', 'domain', value)}
          />
          <RecurrenceField
            label="Gesuchte Schranke"
            value={answer.preflight.requestedAsymptotic}
            disabled={disabled}
            onChange={(value) => update('preflight', 'requestedAsymptotic', value)}
          />
          <RecurrenceField
            label="Beweisziel"
            value={answer.preflight.requestedProof}
            disabled={disabled}
            onChange={(value) => update('preflight', 'requestedProof', value)}
          />
        </RecurrenceGroup>
        <RecurrenceGroup title="2. Master-Theorem-Parameter">
          {Object.entries(answer.parameters).map(([field, value]) => (
            <RecurrenceField
              key={field}
              label={parameterLabel(field)}
              value={value}
              disabled={disabled}
              onChange={(next) => update('parameters', field, next)}
            />
          ))}
        </RecurrenceGroup>
        <RecurrenceGroup title="3. Rekursionsbaum">
          {Object.entries(answer.recursionTree).map(([field, value]) => (
            <RecurrenceField
              key={field}
              label={treeLabel(field)}
              value={value}
              disabled={disabled}
              multiline={field === 'textAlternative'}
              onChange={(next) => update('recursionTree', field, next)}
            />
          ))}
        </RecurrenceGroup>
        <RecurrenceGroup title="4. Induktiver Laufzeitbeweis">
          {Object.entries(answer.proof).map(([field, value]) => (
            <RecurrenceField
              key={field}
              label={proofLabel(field)}
              value={value}
              disabled={disabled}
              multiline
              onChange={(next) => update('proof', field, next)}
            />
          ))}
        </RecurrenceGroup>
      </section>
      {attempt.mode !== 'exam' && (
        <section className="hint-panel">
          <h2>Hinweise</h2>
          {trainer.hints.map((hint) => (
            <button type="button" key={hint.id} onClick={() => void showHint(hint.id)}>
              {attempt.hintsUsed.includes(hint.id) ? hint.text : `Hinweis ${hint.level} anzeigen`}
            </button>
          ))}
          <button type="button" onClick={() => void fillCanonicalBlocks()}>
            Kanonische Bausteine übernehmen
          </button>
        </section>
      )}
      {attempt.mode !== 'exam' && feedback.length > 0 && <ErrorAnalysis errors={feedback} />}
      <div className="attempt-actions">
        <button type="button" onClick={() => void save()}>
          Rekurrenzversuch speichern
        </button>
        {attempt.mode !== 'exam' && (
          <button type="button" onClick={() => void reveal()}>
            Musterbeweis aufdecken
          </button>
        )}
        <button className="primary-button" type="button" onClick={() => setShowSubmit(true)}>
          Rekurrenzversuch abgeben
        </button>
        <button
          className="danger-button"
          type="button"
          onClick={() =>
            void practiceAttemptRepository.delete(attempt.id).then(() => navigate('/trainer'))
          }
        >
          Versuch ausdrücklich zurücksetzen
        </button>
      </div>
      {showSolution && <CanonicalRecurrenceText />}
      {showSubmit && (
        <div
          className="submission-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-recurrence-title"
        >
          <h2 id="submit-recurrence-title">Rekurrenzversuch wirklich abgeben?</h2>
          <p>Danach wird die vollständige Rubrik deterministisch berechnet.</p>
          <button type="button" onClick={() => setShowSubmit(false)}>
            Weiter bearbeiten
          </button>
          <button className="primary-button" type="button" onClick={() => void submit()}>
            Jetzt bewerten
          </button>
        </div>
      )}
    </div>
  );
}

function modeLabel(mode: PracticeAttempt['mode']): string {
  if (mode === 'learn') return 'Lernmodus';
  if (mode === 'exam') return 'Prüfungsmodus';
  if (mode === 'review') return 'Wiederholungsmodus';
  return 'Übungsmodus';
}

function RecurrenceGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="proof-section">
      <legend>{title}</legend>
      <div className="proof-section__fields">{children}</div>
    </fieldset>
  );
}

function RecurrenceField({
  label,
  value,
  disabled,
  multiline = false,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      {multiline ? (
        <textarea
          value={value}
          disabled={disabled}
          rows={3}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

function parameterLabel(field: string): string {
  const labels: Record<string, string> = {
    a: 'a',
    b: 'b',
    f: 'f(n)',
    criticalExponent: 'kritischer Exponent',
    criticalFunction: 'kritische Funktion',
    masterCase: 'Master-Fall',
    regularityWitness: 'Vergleichs-/Regularitätszeuge',
    asymptoticBound: 'asymptotische Schranke',
  };
  return labels[field] ?? field;
}

function treeLabel(field: string): string {
  const labels: Record<string, string> = {
    height: 'Höhe',
    nodesAtLevel: 'Knoten auf Ebene i',
    subproblemSizeAtLevel: 'Teilproblemgröße auf Ebene i',
    costPerNodeAtLevel: 'Kosten pro Knoten',
    levelCost: 'Ebenenkosten',
    leafCount: 'Blattanzahl',
    totalCost: 'Gesamtkosten',
    textAlternative: 'Textalternative',
  };
  return labels[field] ?? field;
}

function proofLabel(field: string): string {
  const labels: Record<string, string> = {
    claim: 'Behauptung',
    inductionMethod: 'Induktionsmethode',
    baseCase: 'Induktionsanfang',
    hypothesis: 'Induktionsvoraussetzung',
    substitution: 'Rekurrenzeinsatz',
    algebra: 'Algebra',
    constantCondition: 'O-Konstante',
    conclusion: 'Schluss',
  };
  return labels[field] ?? field;
}

function CanonicalRecurrenceText() {
  return (
    <details className="canonical-solution" open>
      <summary>Stufe 3: vollständigen kanonischen Rekurrenzbeweis lesen</summary>
      <ol>
        {canonicalRecurrenceTextForTrainer().map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
    </details>
  );
}
