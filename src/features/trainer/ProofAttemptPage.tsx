import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import { compareExpressions } from '../../domain/proofs';
import { practiceAttemptRepository } from '../../persistence/repositories';
import { ErrorAnalysis } from './components/TrainerComponents';
import {
  canonicalProofTextForTrainer,
  completeProofAttempt,
  proofAnswerFromAttempt,
  saveProofDraft,
  scoreStoredProofAttempt,
  type ProofStoredAnswer,
} from './proof-service';
import { getProofTrainerById } from './trainer-service';

type ProofSection = Exclude<keyof ProofStoredAnswer, 'kind' | 'trainerKind' | 'problemId'>;

const formulaFields: Array<{ section: ProofSection; field: string; expected: string }> = [
  { section: 'claim', field: 'expression', expected: 'sum(j,1,n,j*A[j])' },
  { section: 'invariant', field: 'expression', expected: 'sum(j,1,i-1,j*A[j])' },
  { section: 'termination', field: 'returnValue', expected: 'sum(j,1,n,j*A[j])' },
];

export function ProofAttemptPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<PracticeAttempt | null>(null);
  const [answer, setAnswer] = useState<ProofStoredAnswer | null>(null);
  const [message, setMessage] = useState('Beweisversuch wird geladen.');
  const [showSubmit, setShowSubmit] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!attemptId) return;
    void practiceAttemptRepository.get(attemptId).then((stored) => {
      if (!stored) {
        setMessage('Beweisversuch nicht gefunden.');
        return;
      }
      setAttempt(stored);
      setAnswer(proofAnswerFromAttempt(stored));
      setMessage(
        stored.status === 'draft'
          ? 'Gespeicherter Beweisversuch fortgesetzt.'
          : 'Beweisversuch ist bereits abgeschlossen.',
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
  const trainer = getProofTrainerById(attempt?.trainerId);
  if (!trainer || !attempt || !answer) return <p role="status">{message}</p>;
  const disabled = attempt.status === 'completed';
  const feedback =
    attempt.mode === 'exam'
      ? []
      : scoreStoredProofAttempt({ ...attempt, answers: [answer] }, answer).errors;
  const update = (section: ProofSection, field: string, value: string) => {
    setAnswer({
      ...answer,
      [section]: { ...(answer[section] as Record<string, string>), [field]: value },
    } as ProofStoredAnswer);
  };
  const save = async () => {
    await saveProofDraft(attempt, answer);
    setMessage('Beweis lokal gespeichert.');
  };
  const showHint = async (hintId: string) => {
    if (attempt.mode === 'exam') return;
    const hints = [...new Set([...attempt.hintsUsed, hintId])];
    const updated = { ...attempt, hintsUsed: hints };
    setAttempt(updated);
    await saveProofDraft(updated, answer, hints);
  };
  const reveal = async () => {
    if (attempt.mode === 'exam') return;
    const updated = { ...attempt, solutionRevealed: true };
    setAttempt(updated);
    setShowSolution(true);
    await saveProofDraft(updated, answer, updated.hintsUsed, true);
  };
  const submit = async () => {
    const { completed } = await completeProofAttempt(attempt, answer);
    await navigate(`/trainer/beweise/${attempt.trainerId}/auswertung/${completed.id}`);
  };

  return (
    <div className="page-flow attempt-page">
      <header className="attempt-header">
        <div>
          <p className="eyebrow">
            {attempt.mode === 'exam'
              ? 'Prüfungsmodus'
              : attempt.mode === 'review'
                ? 'Wiederholungsmodus'
                : 'Übungsmodus'}
          </p>
          <h1 ref={headingRef} tabIndex={-1}>
            Schleifeninvariantenbeweis aktiv eingeben
          </h1>
        </div>
        <span className="status-badge status-badge--info">automatisch lokal speicherbar</span>
      </header>
      <p className="sr-status" aria-live="polite">
        {message}
      </p>
      <section className="panel">
        <h2>Programm</h2>
        <pre className="code-block">{trainer.problem.program.pseudocode.join('\n')}</pre>
      </section>
      <section className="proof-editor" aria-label="Strukturierter Beweis">
        <ProofGroup title="1. Programmanalyse">
          <ProofField
            label="Akkumulatorvariable"
            value={answer.preflight.accumulator}
            disabled={disabled}
            onChange={(value) => update('preflight', 'accumulator', value)}
          />
          <ProofField
            label="Wirkung einer Iteration"
            value={answer.preflight.iterationEffect}
            disabled={disabled}
            onChange={(value) => update('preflight', 'iterationEffect', value)}
          />
          <ProofField
            label="Anzahl Iterationen"
            value={answer.preflight.iterationCount}
            disabled={disabled}
            onChange={(value) => update('preflight', 'iterationCount', value)}
          />
          <ProofField
            label="Wert nach 0 Iterationen"
            value={answer.preflight.valueAfterZero}
            disabled={disabled}
            onChange={(value) => update('preflight', 'valueAfterZero', value)}
          />
          <ProofField
            label="Wert nach 1 Iteration"
            value={answer.preflight.valueAfterOne}
            disabled={disabled}
            onChange={(value) => update('preflight', 'valueAfterOne', value)}
          />
          <ProofField
            label="Wert nach 2 Iterationen"
            value={answer.preflight.valueAfterTwo}
            disabled={disabled}
            onChange={(value) => update('preflight', 'valueAfterTwo', value)}
          />
          <ProofField
            label="Erwarteter Rückgabewert"
            value={answer.preflight.expectedReturn}
            disabled={disabled}
            onChange={(value) => update('preflight', 'expectedReturn', value)}
          />
        </ProofGroup>
        <ProofGroup title="2. Behauptung">
          <ProofField
            label="Eingabebereich"
            value={answer.claim.inputRange}
            disabled={disabled}
            onChange={(value) => update('claim', 'inputRange', value)}
          />
          <ProofField
            label="Rückgabevariable"
            value={answer.claim.returnVariable}
            disabled={disabled}
            onChange={(value) => update('claim', 'returnVariable', value)}
          />
          <ProofField
            label="Rückgabeformel"
            value={answer.claim.expression}
            disabled={disabled}
            onChange={(value) => update('claim', 'expression', value)}
          />
          <ProofField
            label="Quantor"
            value={answer.claim.quantifier}
            disabled={disabled}
            onChange={(value) => update('claim', 'quantifier', value)}
          />
          <ProofField
            label="Randfälle"
            value={answer.claim.edgeCases}
            disabled={disabled}
            onChange={(value) => update('claim', 'edgeCases', value)}
          />
        </ProofGroup>
        <ProofGroup title="3. Schleifeninvariante">
          <ProofField
            label="Variable"
            value={answer.invariant.variable}
            disabled={disabled}
            onChange={(value) => update('invariant', 'variable', value)}
          />
          <ProofField
            label="Index"
            value={answer.invariant.index}
            disabled={disabled}
            onChange={(value) => update('invariant', 'index', value)}
          />
          <ProofField
            label="Bereich"
            value={answer.invariant.range}
            disabled={disabled}
            onChange={(value) => update('invariant', 'range', value)}
          />
          <label>
            Zeitpunkt
            <select
              value={answer.invariant.timing}
              disabled={disabled}
              onChange={(event) => update('invariant', 'timing', event.target.value)}
            >
              <option value="">Bitte wählen</option>
              <option value="before_iteration_i">vor Iteration i</option>
              <option value="after_iteration_i">nach Iteration i</option>
              <option value="after_loop">nach der Schleife</option>
            </select>
          </label>
          <ProofField
            label="Invariantenformel"
            value={answer.invariant.expression}
            disabled={disabled}
            onChange={(value) => update('invariant', 'expression', value)}
          />
        </ProofGroup>
        <ProofGroup title="4. Induktionsanfang">
          <ProofField
            label="Startindex"
            value={answer.initialization.startIndex}
            disabled={disabled}
            onChange={(value) => update('initialization', 'startIndex', value)}
          />
          <ProofField
            label="Zustand vor erster Iteration"
            value={answer.initialization.stateBeforeFirstIteration}
            disabled={disabled}
            onChange={(value) => update('initialization', 'stateBeforeFirstIteration', value)}
          />
          <ProofField
            label="Initialisierter Wert"
            value={answer.initialization.initializedValue}
            disabled={disabled}
            onChange={(value) => update('initialization', 'initializedValue', value)}
          />
          <ProofField
            label="Eingesetzte Formel"
            value={answer.initialization.substitutedExpression}
            disabled={disabled}
            onChange={(value) => update('initialization', 'substitutedExpression', value)}
          />
          <ProofField
            label="Schlussfolgerung"
            value={answer.initialization.conclusion}
            disabled={disabled}
            onChange={(value) => update('initialization', 'conclusion', value)}
            multiline
          />
        </ProofGroup>
        <ProofGroup title="5. Induktionsvoraussetzung">
          <ProofField
            label="Index"
            value={answer.hypothesis.index}
            disabled={disabled}
            onChange={(value) => update('hypothesis', 'index', value)}
          />
          <ProofField
            label="Bereich"
            value={answer.hypothesis.range}
            disabled={disabled}
            onChange={(value) => update('hypothesis', 'range', value)}
          />
          <ProofField
            label="Gleichung"
            value={answer.hypothesis.equation}
            disabled={disabled}
            onChange={(value) => update('hypothesis', 'equation', value)}
          />
          <ProofField
            label="Zeitpunkt"
            value={answer.hypothesis.timing}
            disabled={disabled}
            onChange={(value) => update('hypothesis', 'timing', value)}
          />
        </ProofGroup>
        <ProofGroup title="6. Induktionsschritt">
          <ProofField
            label="Vorher"
            value={answer.preservation.before}
            disabled={disabled}
            onChange={(value) => update('preservation', 'before', value)}
          />
          <ProofField
            label="Schleifenrumpf eingesetzt"
            value={answer.preservation.bodySubstitution}
            disabled={disabled}
            onChange={(value) => update('preservation', 'bodySubstitution', value)}
          />
          <ProofField
            label="Algebraischer Schritt"
            value={answer.preservation.algebra}
            disabled={disabled}
            onChange={(value) => update('preservation', 'algebra', value)}
            multiline
          />
          <ProofField
            label="Ziel nach Iteration"
            value={answer.preservation.target}
            disabled={disabled}
            onChange={(value) => update('preservation', 'target', value)}
          />
        </ProofGroup>
        <ProofGroup title="7. Terminierung und Schluss">
          <ProofField
            label="Schleife endet wann?"
            value={answer.termination.loopEndsWhen}
            disabled={disabled}
            onChange={(value) => update('termination', 'loopEndsWhen', value)}
          />
          <ProofField
            label="Nächster hypothetischer Index"
            value={answer.termination.nextIndex}
            disabled={disabled}
            onChange={(value) => update('termination', 'nextIndex', value)}
          />
          <ProofField
            label="Invariante eingesetzt"
            value={answer.termination.invariantInstance}
            disabled={disabled}
            onChange={(value) => update('termination', 'invariantInstance', value)}
          />
          <ProofField
            label="Rückgabewert"
            value={answer.termination.returnValue}
            disabled={disabled}
            onChange={(value) => update('termination', 'returnValue', value)}
          />
          <ProofField
            label="Invariante zu Rückgabe"
            value={answer.conclusion.invariantToReturn}
            disabled={disabled}
            onChange={(value) => update('conclusion', 'invariantToReturn', value)}
            multiline
          />
          <ProofField
            label="Rückgabezeile"
            value={answer.conclusion.returnLine}
            disabled={disabled}
            onChange={(value) => update('conclusion', 'returnLine', value)}
          />
          <ProofField
            label="Behauptung wieder erreicht"
            value={answer.conclusion.claimRestated}
            disabled={disabled}
            onChange={(value) => update('conclusion', 'claimRestated', value)}
            multiline
          />
        </ProofGroup>
      </section>
      {attempt.mode !== 'exam' && (
        <section className="hint-panel">
          <h2>Hinweise und Formellinter</h2>
          {trainer.hints.map((hint) => (
            <button type="button" key={hint.id} onClick={() => void showHint(hint.id)}>
              {attempt.hintsUsed.includes(hint.id) ? hint.text : `Hinweis ${hint.level} anzeigen`}
            </button>
          ))}
          <FormulaChecks answer={answer} />
        </section>
      )}
      {attempt.mode !== 'exam' && feedback.length > 0 && <ErrorAnalysis errors={feedback} />}
      <div className="attempt-actions">
        <button type="button" onClick={() => void save()}>
          Beweis speichern
        </button>
        {attempt.mode !== 'exam' && (
          <button type="button" onClick={() => void reveal()}>
            Musterbeweis aufdecken
          </button>
        )}
        <button className="primary-button" type="button" onClick={() => setShowSubmit(true)}>
          Beweis abgeben
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
      {showSolution && <CanonicalProofText />}
      {showSubmit && (
        <div
          className="submission-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-proof-title"
        >
          <h2 id="submit-proof-title">Beweis wirklich abgeben?</h2>
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

function ProofGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="proof-section">
      <legend>{title}</legend>
      <div className="proof-section__fields">{children}</div>
    </fieldset>
  );
}

function ProofField({
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

function FormulaChecks({ answer }: { answer: ProofStoredAnswer }) {
  return (
    <ul className="formula-checks">
      {formulaFields.map(({ section, field, expected }) => {
        const sectionValue = answer[section] as Record<string, string>;
        const actual = sectionValue[field] ?? '';
        const comparison = compareExpressions(actual, expected);
        return (
          <li key={`${section}-${field}`}>
            {section}.{field}:{' '}
            {actual.trim()
              ? comparison.equivalent
                ? 'parsebar und kanonisch passend'
                : comparison.reason
              : 'noch leer'}
          </li>
        );
      })}
    </ul>
  );
}

function CanonicalProofText() {
  return (
    <details className="canonical-solution" open>
      <summary>Stufe 3: vollständigen Musterbeweis lesen</summary>
      <ol>
        {canonicalProofTextForTrainer().map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
    </details>
  );
}
