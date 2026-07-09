import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type {
  DivideConquerDesignAnswer,
  DivideConquerDesignMode,
} from '../../domain/divide-conquer-design';
import { practiceAttemptRepository } from '../../persistence/repositories';
import {
  ErrorAnalysis,
  RubricBreakdown,
  SourceCitationPanel,
} from './components/TrainerComponents';
import {
  canonicalDivideConquerDesignAnswerForTrainer,
  completeDivideConquerDesignAttempt,
  defaultDivideConquerDesignAnswer,
  divideConquerDesignAnswerFromAttempt,
  saveDivideConquerDesignDraft,
  scoreStoredDivideConquerDesignAttempt,
} from './divide-conquer-design-service';
import { getDivideConquerDesignTrainerById } from './trainer-service';

type Section = Exclude<keyof DivideConquerDesignAnswer, 'kind' | 'trainerKind' | 'problemId'>;

const sections: Array<{
  id: Section;
  title: string;
  fields: Array<{ key: string; label: string; rows?: number }>;
}> = [
  {
    id: 'interpretation',
    title: '1. Problem deuten',
    fields: [
      { key: 'input', label: 'Eingabe' },
      { key: 'objective', label: 'Ziel mit Indexbedingung', rows: 2 },
      { key: 'output', label: 'Ausgabe' },
    ],
  },
  {
    id: 'decomposition',
    title: '2. Teilproblem und Split',
    fields: [
      { key: 'subproblem', label: 'Teilproblemdefinition', rows: 3 },
      { key: 'baseCase', label: 'Basisfall' },
      { key: 'split', label: 'Split und rekursive Aufrufe', rows: 2 },
    ],
  },
  {
    id: 'combine',
    title: '3. Combine vollständig bauen',
    fields: [
      { key: 'leftCase', label: 'Fall links' },
      { key: 'rightCase', label: 'Fall rechts' },
      { key: 'crossCase', label: 'Cross-Fall', rows: 2 },
      { key: 'summary', label: 'Rückgabetripel', rows: 3 },
    ],
  },
  {
    id: 'algorithm',
    title: '4. Algorithmus formulieren',
    fields: [
      { key: 'signature', label: 'Signatur' },
      { key: 'recursiveCalls', label: 'Rekursive Aufrufe', rows: 2 },
      { key: 'returnValue', label: 'Rückgabe', rows: 3 },
    ],
  },
  {
    id: 'recurrence',
    title: '5. Rekurrenz und Laufzeit',
    fields: [
      { key: 'equation', label: 'Rekurrenz' },
      { key: 'combineCost', label: 'Combine-Kosten' },
      { key: 'runtime', label: 'Gesamtlaufzeit' },
    ],
  },
  {
    id: 'proof',
    title: '6. Korrektheit beweisen',
    fields: [
      { key: 'claim', label: 'Behauptung', rows: 2 },
      { key: 'inductionParameter', label: 'Induktionsparameter' },
      { key: 'baseCase', label: 'Induktionsanfang', rows: 2 },
      { key: 'inductionStep', label: 'Induktionsschritt', rows: 2 },
      { key: 'caseAnalysis', label: 'Fallanalyse', rows: 3 },
      { key: 'conclusion', label: 'Schluss', rows: 2 },
    ],
  },
];

export function DivideConquerDesignAttemptPage() {
  const { trainerId, attemptId } = useParams();
  const navigate = useNavigate();
  const trainer = getDivideConquerDesignTrainerById(trainerId);
  const [attempt, setAttempt] =
    useState<Awaited<ReturnType<typeof practiceAttemptRepository.get>>>();
  const [answer, setAnswer] = useState<DivideConquerDesignAnswer>(
    defaultDivideConquerDesignAnswer(),
  );
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!attemptId) return;
    void practiceAttemptRepository.get(attemptId).then((stored) => {
      setAttempt(stored);
      if (stored) {
        setAnswer(divideConquerDesignAnswerFromAttempt(stored));
        setHintsUsed(stored.hintsUsed);
        setSolutionRevealed(stored.solutionRevealed);
      }
    });
  }, [attemptId]);
  if (!trainer || !attempt)
    return (
      <section>
        <h1>D&C-Entwurfsversuch nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );
  const mode = attempt.mode as DivideConquerDesignMode;
  const preview =
    mode === 'exam'
      ? null
      : scoreStoredDivideConquerDesignAttempt({
          ...attempt,
          answers: [answer],
          hintsUsed,
          solutionRevealed,
        });
  const updateField = (section: Section, field: string, value: string) => {
    setAnswer((current) => ({
      ...current,
      [section]: { ...(current[section] as Record<string, string>), [field]: value },
    }));
  };
  const save = async () => {
    setSaving(true);
    await saveDivideConquerDesignDraft(attempt, answer, hintsUsed, solutionRevealed);
    setAttempt({ ...attempt, answers: [answer], hintsUsed, solutionRevealed });
    setSaving(false);
  };
  const submit = async () => {
    const { completed } = await completeDivideConquerDesignAttempt(
      { ...attempt, answers: [answer], hintsUsed, solutionRevealed },
      answer,
    );
    await navigate(`/trainer/entwurf/divide-and-conquer/${trainer.id}/auswertung/${completed.id}`);
  };
  const revealHint = (hintId: string) => {
    if (!hintsUsed.includes(hintId)) setHintsUsed([...hintsUsed, hintId]);
  };
  return (
    <div className="page-flow trainer-attempt">
      <Link className="back-link" to={`/trainer/entwurf/divide-and-conquer/${trainer.id}`}>
        ← Zum D&C-Entwurfstrainer
      </Link>
      <header className="page-header">
        <p className="eyebrow">Modus: {mode}</p>
        <h1>Divide-and-Conquer-Entwurf aktiv ausarbeiten</h1>
        <p>
          Gib jeden Baustein aktiv ein. Bewertet wird deterministisch gegen die belegte
          Lösungsskizze zur maximalen Wertdifferenz.
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
              setAnswer(canonicalDivideConquerDesignAnswerForTrainer());
              setSolutionRevealed(true);
            }}
          >
            Kanonische Bausteine übernehmen
          </button>
        </section>
      )}
      {sections.map((section) => (
        <section className="step-input" key={section.id}>
          <h2>{section.title}</h2>
          {section.fields.map((field) => (
            <label className="wide-input" key={`${section.id}-${field.key}`}>
              {field.label}
              <textarea
                rows={field.rows ?? 2}
                value={String((answer[section.id] as Record<string, string>)[field.key] ?? '')}
                onChange={(event) => updateField(section.id, field.key, event.target.value)}
              />
            </label>
          ))}
        </section>
      ))}
      {preview && (
        <section className="panel">
          <h2>Zwischenauswertung</h2>
          <p>
            {preview.points}/{preview.maxPoints} Punkte · Empfehlung: {preview.recommendation.label}
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
