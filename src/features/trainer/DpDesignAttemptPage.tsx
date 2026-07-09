import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { DpDesignAnswer, DpDesignMode } from '../../domain/dp-design';
import { practiceAttemptRepository } from '../../persistence/repositories';
import {
  ErrorAnalysis,
  RubricBreakdown,
  SourceCitationPanel,
} from './components/TrainerComponents';
import {
  canonicalDpDesignAnswerForTrainer,
  completeDpDesignAttempt,
  defaultDpDesignAnswer,
  dpDesignAnswerFromAttempt,
  saveDpDesignDraft,
  scoreStoredDpDesignAttempt,
} from './dp-design-service';
import { getDpDesignTrainerById } from './trainer-service';

type Section = Exclude<keyof DpDesignAnswer, 'kind' | 'trainerKind' | 'problemId'>;

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
      { key: 'objective', label: 'Optimierungsziel' },
      { key: 'constraints', label: 'Nebenbedingungen', rows: 3 },
      { key: 'output', label: 'Ausgabe' },
    ],
  },
  {
    id: 'state',
    title: '2. Zustand definieren',
    fields: [
      { key: 'tableName', label: 'Tabellenname' },
      { key: 'dimensions', label: 'Dimensionen' },
      { key: 'rowRange', label: 'Zeilenbereich' },
      { key: 'columnRange', label: 'Spaltenbereich' },
      { key: 'entryMeaning', label: 'Bedeutung von G(i,j)', rows: 3 },
      { key: 'optimizationDirection', label: 'Optimierungsrichtung' },
    ],
  },
  {
    id: 'recurrence',
    title: '3. Rekurrenz und Randfälle',
    fields: [
      { key: 'baseCase', label: 'Basisfall', rows: 2 },
      { key: 'leftBoundary', label: 'Linker Rand', rows: 2 },
      { key: 'rightBoundary', label: 'Rechter Rand', rows: 2 },
      { key: 'innerCase', label: 'Innerer Fall', rows: 2 },
      { key: 'invalidStates', label: 'Unzulässige Zustände' },
    ],
  },
  {
    id: 'evaluation',
    title: '4. Auswertungsordnung',
    fields: [
      { key: 'dependencyDirection', label: 'Abhängigkeitsrichtung' },
      { key: 'order', label: 'Bottom-up-Reihenfolge' },
      { key: 'outputCell', label: 'Ausgabezelle' },
    ],
  },
  {
    id: 'algorithm',
    title: '5. Algorithmus',
    fields: [
      { key: 'allocation', label: 'Speicher anlegen' },
      { key: 'initialization', label: 'Initialisierung' },
      { key: 'loops', label: 'Schleifen und Übergänge', rows: 3 },
      { key: 'returnStatement', label: 'Rückgabe' },
    ],
  },
  {
    id: 'proof',
    title: '6. Korrektheit beweisen',
    fields: [
      { key: 'claim', label: 'Behauptung', rows: 2 },
      { key: 'baseCase', label: 'Induktionsanfang', rows: 2 },
      { key: 'inductionHypothesis', label: 'Induktionsannahme', rows: 2 },
      { key: 'inductionStep', label: 'Induktionsschritt', rows: 4 },
      { key: 'conclusion', label: 'Schluss' },
    ],
  },
  {
    id: 'complexity',
    title: '7. Aufwand analysieren',
    fields: [
      { key: 'states', label: 'Anzahl Zustände' },
      { key: 'transitionCost', label: 'Kosten pro Übergang' },
      { key: 'runtime', label: 'Laufzeit' },
      { key: 'memory', label: 'Speicherbedarf' },
    ],
  },
];

export function DpDesignAttemptPage() {
  const { trainerId, attemptId } = useParams();
  const navigate = useNavigate();
  const trainer = getDpDesignTrainerById(trainerId);
  const [attempt, setAttempt] =
    useState<Awaited<ReturnType<typeof practiceAttemptRepository.get>>>();
  const [answer, setAnswer] = useState<DpDesignAnswer>(defaultDpDesignAnswer());
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!attemptId) return;
    void practiceAttemptRepository.get(attemptId).then((stored) => {
      setAttempt(stored);
      if (stored) {
        setAnswer(dpDesignAnswerFromAttempt(stored));
        setHintsUsed(stored.hintsUsed);
        setSolutionRevealed(stored.solutionRevealed);
      }
    });
  }, [attemptId]);
  if (!trainer || !attempt)
    return (
      <section>
        <h1>DP-Entwurfsversuch nicht gefunden</h1>
        <Link to="/trainer/entwurf/dp">Zur DP-Übersicht</Link>
      </section>
    );
  const mode = attempt.mode as DpDesignMode;
  const preview =
    mode === 'exam'
      ? null
      : scoreStoredDpDesignAttempt({ ...attempt, answers: [answer], hintsUsed, solutionRevealed });
  const updateField = (section: Section, field: string, value: string) => {
    setAnswer((current) => ({
      ...current,
      [section]: { ...(current[section] as Record<string, string>), [field]: value },
    }));
  };
  const save = async () => {
    setSaving(true);
    await saveDpDesignDraft(attempt, answer, hintsUsed, solutionRevealed);
    setAttempt({ ...attempt, answers: [answer], hintsUsed, solutionRevealed });
    setSaving(false);
  };
  const submit = async () => {
    const { completed } = await completeDpDesignAttempt(
      { ...attempt, answers: [answer], hintsUsed, solutionRevealed },
      answer,
    );
    await navigate(`/trainer/entwurf/dp/${trainer.id}/auswertung/${completed.id}`);
  };
  const revealHint = (hintId: string) => {
    if (!hintsUsed.includes(hintId)) setHintsUsed([...hintsUsed, hintId]);
  };
  return (
    <div className="page-flow trainer-attempt">
      <Link className="back-link" to={`/trainer/entwurf/dp/${trainer.id}`}>
        ← Zum DP-Entwurfstrainer
      </Link>
      <header className="page-header">
        <p className="eyebrow">Modus: {mode}</p>
        <h1>DP-Entwurf aktiv ausarbeiten</h1>
        <p>
          Jede fachliche Eingabe ist strukturiert. Die Bewertung vergleicht deterministisch mit der
          belegten Musterlösung aus Aufgabe und Beispiellösung.
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
              setAnswer(canonicalDpDesignAnswerForTrainer());
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
