import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type {
  DijkstraAnswer,
  FloydWarshallAnswer,
  GraphTracingAnswer,
  PrimAnswer,
} from '../../domain/graph-tracing';
import { practiceAttemptRepository } from '../../persistence/repositories';
import {
  ErrorAnalysis,
  RubricBreakdown,
  SourceCitationPanel,
} from './components/TrainerComponents';
import {
  canonicalGraphTracingAnswerForTrainer,
  completeGraphTracingAttempt,
  defaultGraphTracingAnswer,
  graphTracingAnswerFromAttempt,
  saveGraphTracingDraft,
  scoreStoredGraphTracingAttempt,
  type GraphTracingMode,
} from './graph-tracing-service';
import { getGraphTracingTrainerById } from './trainer-service';

const floydWarshallFields: Array<{
  key: keyof FloydWarshallAnswer;
  label: string;
  rows?: number;
}> = [
  { key: 'vertexOrder', label: 'Knotenreihenfolge' },
  { key: 'd0', label: 'D(0) nach Initialisierung', rows: 4 },
  { key: 'd1', label: 'D(1) nach Zwischenknoten A', rows: 4 },
  { key: 'd2', label: 'D(2) nach Zwischenknoten B', rows: 4 },
  { key: 'd3', label: 'D(3) nach Zwischenknoten C', rows: 4 },
  { key: 'd4', label: 'D(4) nach Zwischenknoten D', rows: 4 },
  { key: 'recurrence', label: 'Rekurrenz' },
  { key: 'runtime', label: 'Laufzeit' },
  { key: 'explanation', label: 'Begründung der Iterationssemantik', rows: 3 },
];

const dijkstraFields: Array<{ key: keyof DijkstraAnswer; label: string; rows?: number }> = [
  { key: 'startVertex', label: 'Startknoten' },
  { key: 'markedOrder', label: 'Neu schwarz gefärbte Knoten in Reihenfolge', rows: 2 },
  { key: 'distanceTable', label: 'Distanztabelle nach jedem Durchlauf', rows: 7 },
  { key: 'predecessorTable', label: 'Vorgängertabelle p[v] nach jedem Durchlauf', rows: 7 },
  { key: 'relaxationLog', label: 'Verbessernde Relaxationen', rows: 5 },
  { key: 'runtime', label: 'Laufzeit' },
  { key: 'explanation', label: 'Begründung der ExtractMin-Semantik', rows: 3 },
];

const primFields: Array<{ key: keyof PrimAnswer; label: string; rows?: number }> = [
  { key: 'startVertex', label: 'Startknoten' },
  { key: 'selectedVertices', label: 'Aufgenommene Knoten in Reihenfolge', rows: 2 },
  { key: 'selectedEdges', label: 'Ausgewählte Baumkanten in Reihenfolge', rows: 2 },
  { key: 'keyTable', label: 'key-Tabelle nach jedem Schritt', rows: 7 },
  { key: 'parentTable', label: 'parent-Tabelle nach jedem Schritt', rows: 7 },
  { key: 'totalWeight', label: 'Gesamtgewicht' },
  { key: 'safeEdgeExplanation', label: 'Begründung der sicheren Kante', rows: 3 },
  { key: 'runtime', label: 'Laufzeit' },
];

function graphRouteSegment(algorithm: string): string {
  if (algorithm === 'dijkstra') return 'dijkstra';
  if (algorithm === 'prim') return 'prim';
  return 'floyd-warshall';
}

export function GraphTracingAttemptPage() {
  const { trainerId, attemptId } = useParams();
  const navigate = useNavigate();
  const trainer = getGraphTracingTrainerById(trainerId);
  const [attempt, setAttempt] =
    useState<Awaited<ReturnType<typeof practiceAttemptRepository.get>>>();
  const [answer, setAnswer] = useState<GraphTracingAnswer>(defaultGraphTracingAnswer(trainerId));
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  const [solutionRevealed, setSolutionRevealed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!attemptId) return;
    void practiceAttemptRepository.get(attemptId).then((stored) => {
      setAttempt(stored);
      if (stored) {
        setAnswer(graphTracingAnswerFromAttempt(stored));
        setHintsUsed(stored.hintsUsed);
        setSolutionRevealed(stored.solutionRevealed);
      }
    });
  }, [attemptId]);

  if (!trainer || !attempt)
    return (
      <section>
        <h1>Graph-Versuch nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );

  const mode = attempt.mode as GraphTracingMode;
  const fields =
    trainer.problem.algorithm === 'dijkstra'
      ? dijkstraFields
      : trainer.problem.algorithm === 'prim'
        ? primFields
        : floydWarshallFields;
  const preview =
    mode === 'exam'
      ? null
      : scoreStoredGraphTracingAttempt(
          { ...attempt, answers: [answer], hintsUsed, solutionRevealed },
          answer,
        );
  const save = async () => {
    setSaving(true);
    await saveGraphTracingDraft(attempt, answer, hintsUsed, solutionRevealed);
    setAttempt({ ...attempt, answers: [answer], hintsUsed, solutionRevealed });
    setSaving(false);
  };
  const submit = async () => {
    const { completed } = await completeGraphTracingAttempt(
      { ...attempt, answers: [answer], hintsUsed, solutionRevealed },
      answer,
    );
    await navigate(
      `/trainer/graphen/${graphRouteSegment(trainer.problem.algorithm)}/${trainer.id}/auswertung/${completed.id}`,
    );
  };
  const revealHint = (hintId: string) => {
    if (!hintsUsed.includes(hintId)) setHintsUsed([...hintsUsed, hintId]);
  };

  return (
    <div className="page-flow trainer-attempt">
      <Link
        className="back-link"
        to={`/trainer/graphen/${graphRouteSegment(trainer.problem.algorithm)}/${trainer.id}`}
      >
        ← Zum Graph-Trainer
      </Link>
      <header className="page-header">
        <p className="eyebrow">Modus: {mode}</p>
        <h1>{trainer.shortTitle}</h1>
        <p>
          Bearbeite die geforderte Spur aktiv. Nutze ∞ oder NIL, wo die Aufgabe fehlende Werte
          verlangt. Im Prüfungsmodus erscheint die Auswertung erst nach Abgabe.
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
              setAnswer(canonicalGraphTracingAnswerForTrainer(trainer.id));
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
              value={String(answer[field.key as keyof GraphTracingAnswer] ?? '')}
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
