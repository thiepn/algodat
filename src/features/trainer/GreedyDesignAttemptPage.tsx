import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { GreedyDesignAnswer, GreedyDesignMode } from '../../domain/greedy-design';
import { practiceAttemptRepository } from '../../persistence/repositories';
import {
  ErrorAnalysis,
  RubricBreakdown,
  SourceCitationPanel,
} from './components/TrainerComponents';
import {
  canonicalGreedyDesignAnswerForTrainer,
  completeGreedyDesignAttempt,
  defaultGreedyDesignAnswer,
  greedyDesignAnswerFromAttempt,
  saveGreedyDesignDraft,
  scoreStoredGreedyDesignAttempt,
} from './greedy-design-service';
import { getGreedyDesignTrainerById } from './trainer-service';

type Section = Exclude<keyof GreedyDesignAnswer, 'kind' | 'trainerKind' | 'problemId'>;

const sections: Array<{
  id: Section;
  title: string;
  fields: Array<{ key: string; label: string; rows?: number }>;
}> = [
  {
    id: 'interpretation',
    title: '1. Problem deuten',
    fields: [
      { key: 'inputObjects', label: 'Eingabeobjekte' },
      { key: 'objective', label: 'Optimierungsziel', rows: 2 },
      { key: 'constraints', label: 'Nebenbedingungen', rows: 2 },
      { key: 'output', label: 'Ausgabe' },
    ],
  },
  {
    id: 'greedyRule',
    title: '2. Greedy-Regel formulieren',
    fields: [
      { key: 'sortingOrder', label: 'Sortierreihenfolge' },
      { key: 'tieBreaker', label: 'Gleichstände' },
      { key: 'decision', label: 'Lokale Entscheidung' },
      { key: 'objectiveReason', label: 'Warum diese Priorität?', rows: 2 },
    ],
  },
  {
    id: 'algorithm',
    title: '3. Algorithmus angeben',
    fields: [
      { key: 'preprocessing', label: 'Vorverarbeitung' },
      { key: 'accumulator', label: 'Akkumulator' },
      { key: 'loop', label: 'Schleife', rows: 3 },
      { key: 'returnStatement', label: 'Rückgabe' },
    ],
  },
  {
    id: 'proof',
    title: '4. Korrektheit beweisen',
    fields: [
      { key: 'claim', label: 'Behauptung', rows: 2 },
      { key: 'contradictionAssumption', label: 'Widerspruchsannahme', rows: 2 },
      { key: 'exchangeStep', label: 'Tauschschritt', rows: 3 },
      { key: 'difference', label: 'Wertdifferenz' },
      { key: 'conclusion', label: 'Schluss' },
    ],
  },
  {
    id: 'complexity',
    title: '5. Aufwand analysieren',
    fields: [
      { key: 'sorting', label: 'Sortieren' },
      { key: 'loop', label: 'Schleife' },
      { key: 'total', label: 'Gesamtlaufzeit' },
      { key: 'memory', label: 'Speicherhinweis' },
    ],
  },
];

export function GreedyDesignAttemptPage() {
  const { trainerId, attemptId } = useParams();
  const navigate = useNavigate();
  const trainer = getGreedyDesignTrainerById(trainerId);
  const [attempt, setAttempt] =
    useState<Awaited<ReturnType<typeof practiceAttemptRepository.get>>>();
  const [answer, setAnswer] = useState<GreedyDesignAnswer>(defaultGreedyDesignAnswer());
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!attemptId) return;
    void practiceAttemptRepository.get(attemptId).then((stored) => {
      setAttempt(stored);
      if (stored) {
        setAnswer(greedyDesignAnswerFromAttempt(stored));
        setHintsUsed(stored.hintsUsed);
        setSolutionRevealed(stored.solutionRevealed);
      }
    });
  }, [attemptId]);
  if (!trainer || !attempt)
    return (
      <section>
        <h1>Greedy-Entwurfsversuch nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );
  const mode = attempt.mode as GreedyDesignMode;
  const preview =
    mode === 'exam'
      ? null
      : scoreStoredGreedyDesignAttempt({
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
    await saveGreedyDesignDraft(attempt, answer, hintsUsed, solutionRevealed);
    setAttempt({ ...attempt, answers: [answer], hintsUsed, solutionRevealed });
    setSaving(false);
  };
  const submit = async () => {
    const { completed } = await completeGreedyDesignAttempt(
      { ...attempt, answers: [answer], hintsUsed, solutionRevealed },
      answer,
    );
    await navigate(`/trainer/entwurf/greedy/${trainer.id}/auswertung/${completed.id}`);
  };
  const revealHint = (hintId: string) => {
    if (!hintsUsed.includes(hintId)) setHintsUsed([...hintsUsed, hintId]);
  };
  return (
    <div className="page-flow trainer-attempt">
      <Link className="back-link" to={`/trainer/entwurf/greedy/${trainer.id}`}>
        ← Zum Greedy-Entwurfstrainer
      </Link>
      <header className="page-header">
        <p className="eyebrow">Modus: {mode}</p>
        <h1>Greedy-Entwurf aktiv ausarbeiten</h1>
        <p>
          Jede Eingabe bleibt strukturiert. Bewertet wird deterministisch gegen die belegte
          Lösungsskizze zur Fitnesspunkte-Aufgabe.
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
              setAnswer(canonicalGreedyDesignAnswerForTrainer());
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
