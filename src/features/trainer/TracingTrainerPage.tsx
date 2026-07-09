import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import type {
  PreflightAnswers,
  TrainingMode,
  UnionFindPreflightAnswers,
} from '../../domain/tracing';
import { practiceAttemptRepository } from '../../persistence/repositories';
import {
  MathFormula,
  ProblemBriefing,
  ProblemVisualization,
  SourceCitationPanel,
  TrainingModeSelector,
  UnionFindOperationList,
} from './components/TrainerComponents';
import { createTrainingAttempt, getRegistryEntry, getTrainerById } from './trainer-service';

const knapsackPreflight: PreflightAnswers = {
  algorithm: 'knapsack_01',
  negativeWeights: false,
  indexingStartsAtZero: true,
  usesPreviousRow: true,
  eachItemAtMostOnce: true,
  output: 'complete_table_and_optimum',
  runtime: 'O(n · W)',
};

const unionFindPreflight: UnionFindPreflightAnswers = {
  algorithm: 'union_find_linked_lists',
  representation: 'linked_lists_with_representative_pointer',
  startsEmpty: true,
  weightedUnion: true,
  tieBreaker: 'lexicographically_smaller_representative_is_smaller_set',
  output: 'checkpoint_sets_representatives_next_size',
  nextDirection: 'head_to_tail',
  runtime: 'O(m + n log n)',
};

export function TracingTrainerPage() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const trainer = getTrainerById(trainerId);
  const registry = getRegistryEntry(trainerId);
  const [mode, setMode] = useState<TrainingMode>('practice');
  const [knapsack, setKnapsack] = useState(knapsackPreflight);
  const [unionFind, setUnionFind] = useState(unionFindPreflight);
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [starting, setStarting] = useState(false);
  useEffect(() => void practiceAttemptRepository.list().then(setAttempts), []);
  if (!trainer || !registry)
    return (
      <section>
        <h1>Trainer nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );
  const trainerAttempts = attempts.filter((attempt) => attempt.trainerId === trainer.id);
  const reviewAvailable = trainerAttempts.some((attempt) => attempt.status === 'completed');
  const latestCompletedAttempt = trainerAttempts
    .filter((attempt) => attempt.status === 'completed')
    .sort((left, right) => right.attemptedAt.localeCompare(left.attemptedAt))[0];
  const start = async () => {
    setStarting(true);
    const preflight =
      trainer.problem.algorithm === 'union_find_linked_lists' ? unionFind : knapsack;
    const attempt = await createTrainingAttempt(mode, preflight, trainer.id);
    await navigate(`/trainer/tracing/${trainer.id}/versuch/${attempt.id}`);
  };
  return (
    <div className="page-flow trainer-detail">
      <Link className="back-link" to="/trainer">
        ← Trainerübersicht
      </Link>
      <header className="page-header">
        <p className="eyebrow">{registry.algorithmFamily} · aktiv bearbeiten</p>
        <h1>{trainer.title}</h1>
        <p>{trainer.historicalRelevance}</p>
      </header>
      <ProblemBriefing trainer={trainer} />
      <div className="two-column">
        <section className="panel">
          <h2>Intuition</h2>
          <p>{trainer.intuition}</p>
          <p>
            <strong>Warum korrekt?</strong> {trainer.correctnessIdea}
          </p>
          <p className="notice">
            <strong>Grenze:</strong> {trainer.failureConditions}
          </p>
        </section>
        <ProblemVisualization trainer={trainer} />
      </div>
      {trainer.problem.algorithm === 'knapsack_01' ? (
        <section className="panel">
          <h2>Formale Rekurrenz</h2>
          <MathFormula
            formula={'Opt[i,w]=\\max\\{Opt[i-1,w],Opt[i-1,w-g[i]]+v[i]\\}'}
            label="Opt i w ist das Maximum aus Weglassen und Aufnehmen"
          />
          <ol>
            {trainer.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      ) : (
        <UnionFindOperationList trainer={trainer} />
      )}
      <SourceCitationPanel trainer={trainer} />
      <section className="preflight" aria-labelledby="preflight-title">
        <h2 id="preflight-title">Aufgabenanalyse vor Beginn</h2>
        <p>Bestätige die gelesenen Bedingungen. Deine Auswahl fließt in die Bewertung ein.</p>
        {trainer.problem.algorithm === 'union_find_linked_lists' ? (
          <UnionFindPreflightForm value={unionFind} onChange={setUnionFind} />
        ) : (
          <KnapsackPreflightForm value={knapsack} onChange={setKnapsack} />
        )}
      </section>
      <TrainingModeSelector mode={mode} setMode={setMode} reviewAvailable={reviewAvailable} />
      {mode === 'review' && latestCompletedAttempt && (
        <section className="panel" aria-labelledby="review-focus-title">
          <h2 id="review-focus-title">Fokus dieser Wiederholung</h2>
          {latestCompletedAttempt.errorCodes.length > 0 ? (
            <>
              <p>Der letzte Versuch hat folgende konkrete Fehlerkategorien gezeigt:</p>
              <ul>
                {[...new Set(latestCompletedAttempt.errorCodes)].map((errorCode) => (
                  <li key={errorCode}>{errorCode}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>
              Der letzte Versuch war fehlerfrei. Wiederhole die vollständige Aufgabe ohne Hinweise,
              um die Evidenz zu festigen.
            </p>
          )}
        </section>
      )}
      <button
        className="primary-button"
        type="button"
        disabled={starting || (mode === 'review' && !reviewAvailable)}
        onClick={() => void start()}
      >
        {starting ? 'Versuch wird angelegt …' : 'Versuch beginnen'}
      </button>
    </div>
  );
}

function KnapsackPreflightForm({
  value,
  onChange,
}: {
  value: PreflightAnswers;
  onChange: (value: PreflightAnswers) => void;
}) {
  return (
    <div className="preflight-grid">
      <label>
        Problemtyp
        <select
          value={value.algorithm}
          onChange={(event) =>
            onChange({ ...value, algorithm: event.target.value as PreflightAnswers['algorithm'] })
          }
        >
          <option value="knapsack_01">0/1-Rucksack-DP</option>
          <option value="other">Greedy oder unklar</option>
        </select>
      </label>
      <label>
        Negative Gewichte?
        <select
          value={String(value.negativeWeights)}
          onChange={(event) =>
            onChange({ ...value, negativeWeights: event.target.value === 'true' })
          }
        >
          <option value="false">Nein</option>
          <option value="true">Ja</option>
        </select>
      </label>
      <label>
        Tabellenindexierung
        <select
          value={String(value.indexingStartsAtZero)}
          onChange={(event) =>
            onChange({ ...value, indexingStartsAtZero: event.target.value === 'true' })
          }
        >
          <option value="true">Zeile und Spalte 0</option>
          <option value="false">Erst ab 1</option>
        </select>
      </label>
      <label>
        Rekurrenz verwendet
        <select
          value={String(value.usesPreviousRow)}
          onChange={(event) =>
            onChange({ ...value, usesPreviousRow: event.target.value === 'true' })
          }
        >
          <option value="true">Vorherige Zeile</option>
          <option value="false">Aktuelle Zeile</option>
        </select>
      </label>
      <label>
        Verlangte Ausgabe
        <select
          value={value.output}
          onChange={(event) =>
            onChange({ ...value, output: event.target.value as PreflightAnswers['output'] })
          }
        >
          <option value="complete_table_and_optimum">Tabelle und Endwert</option>
          <option value="other">Nur Objektauswahl</option>
        </select>
      </label>
      <label>
        Laufzeit
        <select
          value={value.runtime}
          onChange={(event) =>
            onChange({ ...value, runtime: event.target.value as PreflightAnswers['runtime'] })
          }
        >
          <option value="O(n · W)">O(n · W)</option>
          <option value="other">O(n log n)</option>
        </select>
      </label>
    </div>
  );
}

function UnionFindPreflightForm({
  value,
  onChange,
}: {
  value: UnionFindPreflightAnswers;
  onChange: (value: UnionFindPreflightAnswers) => void;
}) {
  return (
    <div className="preflight-grid">
      <label>
        Algorithmus
        <select
          value={value.algorithm}
          onChange={(event) =>
            onChange({
              ...value,
              algorithm: event.target.value as UnionFindPreflightAnswers['algorithm'],
            })
          }
        >
          <option value="union_find_linked_lists">Union-Find mit Listen</option>
          <option value="other">Baum/Rank/Pfadkompression</option>
        </select>
      </label>
      <label>
        Repräsentation
        <select
          value={value.representation}
          onChange={(event) =>
            onChange({
              ...value,
              representation: event.target.value as UnionFindPreflightAnswers['representation'],
            })
          }
        >
          <option value="linked_lists_with_representative_pointer">
            Liste mit Repräsentantenzeiger
          </option>
          <option value="other">Andere Darstellung</option>
        </select>
      </label>
      <label>
        Weighted Union
        <select
          value={String(value.weightedUnion)}
          onChange={(event) => onChange({ ...value, weightedUnion: event.target.value === 'true' })}
        >
          <option value="true">kleinere an größere Liste</option>
          <option value="false">Argumentreihenfolge</option>
        </select>
      </label>
      <label>
        Gleichstand
        <select
          value={value.tieBreaker}
          onChange={(event) =>
            onChange({
              ...value,
              tieBreaker: event.target.value as UnionFindPreflightAnswers['tieBreaker'],
            })
          }
        >
          <option value="lexicographically_smaller_representative_is_smaller_set">
            lexikographisch kleinere Menge ist kleiner
          </option>
          <option value="other">keine Regel</option>
        </select>
      </label>
      <label>
        next-Richtung
        <select
          value={value.nextDirection}
          onChange={(event) =>
            onChange({
              ...value,
              nextDirection: event.target.value as UnionFindPreflightAnswers['nextDirection'],
            })
          }
        >
          <option value="head_to_tail">head nach tail</option>
          <option value="other">tail nach head</option>
        </select>
      </label>
      <label>
        Laufzeit
        <select
          value={value.runtime}
          onChange={(event) =>
            onChange({
              ...value,
              runtime: event.target.value as UnionFindPreflightAnswers['runtime'],
            })
          }
        >
          <option value="O(m + n log n)">O(m + n log n)</option>
          <option value="other">O(mn)</option>
        </select>
      </label>
    </div>
  );
}
