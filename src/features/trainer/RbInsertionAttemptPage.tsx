import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { RbInsertionAnswer } from '../../domain/red-black-tree';
import { practiceAttemptRepository } from '../../persistence/repositories';
import {
  ErrorAnalysis,
  RubricBreakdown,
  SourceCitationPanel,
} from './components/TrainerComponents';
import {
  canonicalRbInsertionAnswerForTrainer,
  completeRbInsertionAttempt,
  defaultRbInsertionAnswer,
  rbInsertionAnswerFromAttempt,
  saveRbInsertionDraft,
  scoreStoredRbInsertionAttempt,
  type RbInsertionMode,
} from './rb-insertion-service';
import { getRbInsertionTrainerById } from './trainer-service';

const fields: Array<{ key: keyof RbInsertionAnswer; label: string; rows?: number }> = [
  { key: 'nilConvention', label: 'NIL-Konvention' },
  { key: 'insertedKeys', label: 'Einfügefolge' },
  { key: 'fixupCases', label: 'Reparaturfälle', rows: 3 },
  { key: 'finalTree', label: 'Finaler Baum als kompakte Darstellung', rows: 2 },
  { key: 'blackHeight', label: 'Schwarzhöhe der Wurzel' },
  { key: 'runtime', label: 'Laufzeit' },
  { key: 'explanation', label: 'Invariantenbegründung', rows: 4 },
];

export function RbInsertionAttemptPage() {
  const { trainerId, attemptId } = useParams();
  const navigate = useNavigate();
  const trainer = getRbInsertionTrainerById(trainerId);
  const [attempt, setAttempt] =
    useState<Awaited<ReturnType<typeof practiceAttemptRepository.get>>>();
  const [answer, setAnswer] = useState<RbInsertionAnswer>(defaultRbInsertionAnswer());
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!attemptId) return;
    void practiceAttemptRepository.get(attemptId).then((stored) => {
      setAttempt(stored);
      if (stored) {
        setAnswer(rbInsertionAnswerFromAttempt(stored));
        setHintsUsed(stored.hintsUsed);
        setSolutionRevealed(stored.solutionRevealed);
      }
    });
  }, [attemptId]);
  if (!trainer || !attempt)
    return (
      <section>
        <h1>Rot-Schwarz-Versuch nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );
  const mode = attempt.mode as RbInsertionMode;
  const preview =
    mode === 'exam'
      ? null
      : scoreStoredRbInsertionAttempt(
          { ...attempt, answers: [answer], hintsUsed, solutionRevealed },
          answer,
        );
  const save = async () => {
    setSaving(true);
    await saveRbInsertionDraft(attempt, answer, hintsUsed, solutionRevealed);
    setAttempt({ ...attempt, answers: [answer], hintsUsed, solutionRevealed });
    setSaving(false);
  };
  const submit = async () => {
    const { completed } = await completeRbInsertionAttempt(
      { ...attempt, answers: [answer], hintsUsed, solutionRevealed },
      answer,
    );
    await navigate(`/trainer/baeume/rot-schwarz/${trainer.id}/auswertung/${completed.id}`);
  };
  const revealHint = (hintId: string) => {
    if (!hintsUsed.includes(hintId)) setHintsUsed([...hintsUsed, hintId]);
  };
  return (
    <div className="page-flow trainer-attempt">
      <Link className="back-link" to={`/trainer/baeume/rot-schwarz/${trainer.id}`}>
        ← Zum Rot-Schwarz-Trainer
      </Link>
      <header className="page-header">
        <p className="eyebrow">Modus: {mode}</p>
        <h1>Rot-Schwarz-Einfügung aktiv bearbeiten</h1>
        <p>
          Gib Reparaturfälle, Endbaum, Schwarzhöhe, Laufzeit und Begründung selbst ein. Im
          Prüfungsmodus erscheint die Auswertung erst nach Abgabe.
        </p>
      </header>
      <SourceCitationPanel trainer={trainer} />
      {mode !== 'exam' && (
        <section className="panel">
          <h2>Hilfen</h2>
          <ul>
            {trainer.hints.map((hint) => (
              <li key={hint.id}>
                <button type="button" onClick={() => revealHint(hint.id)}>
                  Hilfe {hint.level} anzeigen
                </button>{' '}
                {hintsUsed.includes(hint.id) && <span>{hint.text}</span>}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setAnswer(canonicalRbInsertionAnswerForTrainer());
              setSolutionRevealed(true);
            }}
          >
            Kanonische Lösung übernehmen
          </button>
        </section>
      )}
      <section className="step-input">
        <h2>Strukturierte Antwort</h2>
        {fields.map((field) => (
          <label className="wide-input" key={field.key}>
            {field.label}
            <textarea
              rows={field.rows ?? 2}
              value={answer[field.key]}
              onChange={(event) =>
                setAnswer((current) => ({ ...current, [field.key]: event.target.value }))
              }
            />
          </label>
        ))}
      </section>
      {preview && (
        <section className="panel">
          <h2>Zwischenauswertung</h2>
          <p>
            {preview.points}/{preview.maxPoints} Punkte · {preview.recommendation}
          </p>
          <RubricBreakdown results={preview.rubricResults} />
          <ErrorAnalysis errors={preview.errors} />
        </section>
      )}
      <div className="button-row">
        <button type="button" onClick={() => void save()} disabled={saving}>
          {saving ? 'Speichert …' : 'Entwurf speichern'}
        </button>
        <button className="primary-button" type="button" onClick={() => void submit()}>
          Versuch abgeben
        </button>
      </div>
    </div>
  );
}
