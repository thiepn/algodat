import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import {
  computeKnapsackTrace,
  computeUnionFindTrace,
  parseUnionFindStateText,
  type UnionFindState,
} from '../../domain/tracing';
import { practiceAttemptRepository } from '../../persistence/repositories';
import {
  CanonicalSolutionViewer,
  ErrorAnalysis,
  StepInputPanel,
  StepNavigator,
  TraceTable,
  UnionFindCanonicalSolutionViewer,
  UnionFindInputPanel,
  UnionFindStateVisualization,
} from './components/TrainerComponents';
import {
  answerFromAttempt,
  completeAttempt,
  getTrainerById,
  saveDraft,
  scoreAttempt,
  type KnapsackStoredAnswer,
  type StoredAnswer,
  type UnionFindStoredAnswer,
} from './trainer-service';

function parsedUserState(operationIndex: number, text: string): UnionFindState | null {
  const sets = parseUnionFindStateText(text);
  if (!sets.length) return null;
  const representativeByElement: Record<string, string> = {};
  const elements: UnionFindState['elements'] = [];
  for (const set of sets) {
    for (const [index, key] of set.orderedElements.entries()) {
      representativeByElement[key] = set.representative;
      elements.push({
        key,
        representative: set.representative,
        next: set.orderedElements[index + 1] ?? null,
      });
    }
  }
  return {
    operationIndex,
    operationLabel: `Eigener Zustand ${operationIndex}`,
    sets,
    elements,
    representativeByElement,
    attachedList: null,
  };
}

export function TrainingAttemptPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<PracticeAttempt | null>(null);
  const [answer, setAnswer] = useState<StoredAnswer | null>(null);
  const [current, setCurrent] = useState(0);
  const [message, setMessage] = useState('Versuch wird geladen.');
  const [showSubmit, setShowSubmit] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!attemptId) return;
    void practiceAttemptRepository.get(attemptId).then((stored) => {
      if (!stored) {
        setMessage('Versuch nicht gefunden.');
        return;
      }
      setAttempt(stored);
      setAnswer(answerFromAttempt(stored));
      setMessage(
        stored.status === 'draft'
          ? 'Gespeicherter Versuch fortgesetzt.'
          : 'Versuch ist bereits abgeschlossen.',
      );
    });
  }, [attemptId]);
  useLayoutEffect(() => {
    if (!attempt?.id) return;
    headingRef.current?.focus({ preventScroll: true });
    const frame = window.requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [attempt?.id]);
  const trainer = getTrainerById(attempt?.trainerId);
  const knapsackCanonical = useMemo(
    () =>
      trainer?.problem.algorithm === 'knapsack_01' ? computeKnapsackTrace(trainer.problem) : [],
    [trainer],
  );
  const unionFindCanonical = useMemo(
    () =>
      trainer?.problem.algorithm === 'union_find_linked_lists'
        ? computeUnionFindTrace(trainer.problem)
        : [],
    [trainer],
  );
  if (!trainer || !attempt || !answer) return <p role="status">{message}</p>;
  const disabled = attempt.status === 'completed';
  const showHint = async (hintId: string) => {
    if (attempt.mode === 'exam') return;
    const hints = [...new Set([...attempt.hintsUsed, hintId])];
    const updated = { ...attempt, hintsUsed: hints };
    setAttempt(updated);
    await saveDraft(updated, answer, hints);
  };
  const reveal = async () => {
    if (attempt.mode === 'exam') return;
    const updated = { ...attempt, solutionRevealed: true };
    setAttempt(updated);
    setShowSolution(true);
    await saveDraft(updated, answer, updated.hintsUsed, true);
  };
  const save = async () => {
    await saveDraft(attempt, answer);
    setMessage(`Schritt ${current} lokal gespeichert.`);
  };
  const submit = async () => {
    const { completed } = await completeAttempt(attempt, answer);
    await navigate(`/trainer/tracing/${attempt.trainerId}/auswertung/${completed.id}`);
  };
  const feedback = scoreAttempt(trainer, { ...attempt, answers: [answer] }).errors.filter(
    (error) => {
      if (answer.kind === 'union_find') {
        const checkpoint = answer.checkpoints[current];
        return error.step === checkpoint?.operationIndex;
      }
      return error.step === current;
    },
  );

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
            {answer.kind === 'union_find'
              ? `Union-Find-Kontrollpunkt ${current + 1}`
              : `Opt-Zeile ${current} bearbeiten`}
          </h1>
        </div>
        <span className="status-badge status-badge--info">automatisch lokal gespeichert</span>
      </header>
      <p className="sr-status" aria-live="polite">
        {message}
      </p>
      {answer.kind === 'union_find' ? (
        <UnionFindAttempt
          answer={answer}
          setAnswer={setAnswer}
          current={current}
          setCurrent={setCurrent}
          disabled={disabled}
          canonical={unionFindCanonical}
        />
      ) : (
        <KnapsackAttempt
          answer={answer}
          setAnswer={setAnswer}
          current={current}
          setCurrent={setCurrent}
          disabled={disabled}
          canonical={knapsackCanonical}
        />
      )}
      {attempt.mode !== 'exam' && (
        <section className="hint-panel">
          <h2>Hinweise</h2>
          {trainer.hints.map((hint) => (
            <button type="button" key={hint.id} onClick={() => void showHint(hint.id)}>
              {attempt.hintsUsed.includes(hint.id) ? hint.text : `Hinweis ${hint.level} anzeigen`}
            </button>
          ))}
        </section>
      )}
      {attempt.mode !== 'exam' && feedback.length > 0 && <ErrorAnalysis errors={feedback} />}
      <div className="attempt-actions">
        <button type="button" onClick={() => void save()}>
          Zwischenschritt speichern
        </button>
        <button type="button" disabled={current === 0} onClick={() => setCurrent(current - 1)}>
          Zurück
        </button>
        <button
          type="button"
          disabled={
            answer.kind === 'union_find'
              ? current === answer.checkpoints.length - 1
              : current === answer.rows.length - 1
          }
          onClick={() => setCurrent(current + 1)}
        >
          Weiter
        </button>
        {attempt.mode !== 'exam' && (
          <button type="button" onClick={() => void reveal()}>
            Lösung schrittweise aufdecken
          </button>
        )}
        <button className="primary-button" type="button" onClick={() => setShowSubmit(true)}>
          Versuch abgeben
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
      {showSolution &&
        (answer.kind === 'union_find' ? (
          <UnionFindCanonicalSolutionViewer trace={unionFindCanonical.slice(0, current + 1)} />
        ) : (
          <CanonicalSolutionViewer trace={knapsackCanonical.slice(0, current + 1)} />
        ))}
      {showSubmit && (
        <div
          className="submission-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-title"
        >
          <h2 id="submit-title">Versuch wirklich abgeben?</h2>
          <p>Danach wird die vollständige Bewertung berechnet.</p>
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

function KnapsackAttempt({
  answer,
  setAnswer,
  current,
  setCurrent,
  disabled,
  canonical,
}: {
  answer: KnapsackStoredAnswer;
  setAnswer: (answer: StoredAnswer) => void;
  current: number;
  setCurrent: (current: number) => void;
  disabled: boolean;
  canonical: ReturnType<typeof computeKnapsackTrace>;
}) {
  const row = answer.rows[current];
  if (!row) return <p>Bearbeitungszeile fehlt.</p>;
  const capacity = row.values.length - 1;
  const updateRow = (updated: typeof row) => {
    const rows = answer.rows.map((candidate) =>
      candidate.index === updated.index ? updated : candidate,
    );
    setAnswer({
      ...answer,
      rows,
      finalValue:
        updated.index === answer.rows.length - 1
          ? (updated.values[capacity] ?? null)
          : answer.finalValue,
    });
  };
  return (
    <>
      <StepNavigator current={current} total={answer.rows.length} onSelect={setCurrent} />
      <TraceTable rows={answer.rows} capacity={capacity} current={current} />
      <StepInputPanel
        row={row}
        capacity={capacity}
        ties={canonical[current]?.ties ?? []}
        disabled={disabled}
        onChange={updateRow}
      />
    </>
  );
}

function UnionFindAttempt({
  answer,
  setAnswer,
  current,
  setCurrent,
  disabled,
  canonical,
}: {
  answer: UnionFindStoredAnswer;
  setAnswer: (answer: StoredAnswer) => void;
  current: number;
  setCurrent: (current: number) => void;
  disabled: boolean;
  canonical: UnionFindState[];
}) {
  const checkpoint = answer.checkpoints[current];
  if (!checkpoint) return <p>Kontrollpunkt fehlt.</p>;
  const updateCheckpoint = (updated: typeof checkpoint) => {
    setAnswer({
      ...answer,
      checkpoints: answer.checkpoints.map((candidate) =>
        candidate.operationIndex === updated.operationIndex ? updated : candidate,
      ),
    });
  };
  return (
    <>
      <StepNavigator current={current} total={answer.checkpoints.length} onSelect={setCurrent} />
      <UnionFindStateVisualization
        state={parsedUserState(checkpoint.operationIndex, checkpoint.stateText)}
      />
      <UnionFindInputPanel
        checkpoint={checkpoint}
        disabled={disabled}
        onChange={updateCheckpoint}
      />
      <p className="quiet">
        Kanonischer Kontrollpunkt: Schritt{' '}
        {canonical[current]?.operationIndex ?? checkpoint.operationIndex}.
      </p>
    </>
  );
}
