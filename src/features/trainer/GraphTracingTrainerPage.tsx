import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import {
  matrixToInput,
  solveDijkstra,
  solveFloydWarshall,
  solvePrim,
} from '../../domain/graph-tracing';
import { practiceAttemptRepository } from '../../persistence/repositories';
import { SourceCitationPanel } from './components/TrainerComponents';
import { createGraphTracingAttempt, type GraphTracingMode } from './graph-tracing-service';
import { getGraphTracingTrainerById, getRegistryEntry } from './trainer-service';

const modes: Array<{ id: GraphTracingMode; title: string; description: string }> = [
  {
    id: 'learn',
    title: 'Lernmodus',
    description: 'Mit Hinweisen und kanonischer Lösung nach Wunsch.',
  },
  { id: 'practice', title: 'Übungsmodus', description: 'Aktive Eingabe mit Zwischenauswertung.' },
  { id: 'exam', title: 'Prüfungsmodus', description: 'Auswertung erst nach Abgabe.' },
  {
    id: 'review',
    title: 'Wiederholungsmodus',
    description: 'Gezielte Wiederholung nach einem abgeschlossenen Versuch.',
  },
];

function graphRouteSegment(algorithm: string): string {
  if (algorithm === 'dijkstra') return 'dijkstra';
  if (algorithm === 'prim') return 'prim';
  return 'floyd-warshall';
}

export function GraphTracingTrainerPage() {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const trainer = getGraphTracingTrainerById(trainerId);
  const registry = getRegistryEntry(trainerId);
  const [mode, setMode] = useState<GraphTracingMode>('learn');
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [starting, setStarting] = useState(false);
  useEffect(() => void practiceAttemptRepository.list().then(setAttempts), []);
  if (!trainer || !registry)
    return (
      <section>
        <h1>Graph-Trainer nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );
  const reviewAvailable = attempts.some(
    (attempt) => attempt.trainerId === trainer.id && attempt.status === 'completed',
  );
  const start = async () => {
    setStarting(true);
    const attempt = await createGraphTracingAttempt(mode, trainer.id);
    await navigate(
      `/trainer/graphen/${graphRouteSegment(trainer.problem.algorithm)}/${trainer.id}/versuch/${attempt.id}`,
    );
  };
  return (
    <div className="page-flow trainer-detail">
      <Link className="back-link" to="/trainer">
        ← Trainerübersicht
      </Link>
      <header className="page-header">
        <p className="eyebrow">{registry.algorithmFamily} · Aufgabe 3</p>
        <h1>{trainer.title}</h1>
        <p>{trainer.description}</p>
      </header>
      {trainer.problem.algorithm === 'dijkstra' ? (
        <DijkstraBriefing trainer={trainer} />
      ) : trainer.problem.algorithm === 'prim' ? (
        <PrimBriefing trainer={trainer} />
      ) : (
        <FloydWarshallBriefing trainer={trainer} />
      )}
      <SourceCitationPanel trainer={trainer} />
      <fieldset className="mode-selector">
        <legend>Trainingsmodus</legend>
        {modes.map((entry) => (
          <label key={entry.id}>
            <input
              type="radio"
              name="mode"
              value={entry.id}
              checked={mode === entry.id}
              disabled={entry.id === 'review' && !reviewAvailable}
              onChange={() => setMode(entry.id)}
            />
            <span>
              <strong>{entry.title}</strong>
              <small>
                {entry.id === 'review' && !reviewAvailable
                  ? 'Erst nach einem abgeschlossenen Versuch verfügbar.'
                  : entry.description}
              </small>
            </span>
          </label>
        ))}
      </fieldset>
      <button
        className="primary-button"
        type="button"
        disabled={starting || (mode === 'review' && !reviewAvailable)}
        onClick={() => void start()}
      >
        {starting
          ? 'Graph-Versuch wird angelegt …'
          : trainer.problem.algorithm === 'floyd_warshall'
            ? 'Floyd-Warshall-Versuch beginnen'
            : `${trainer.shortTitle} beginnen`}
      </button>
    </div>
  );
}

function PrimBriefing({
  trainer,
}: {
  trainer: ReturnType<typeof getGraphTracingTrainerById> & {};
}) {
  if (!trainer || trainer.problem.algorithm !== 'prim') return null;
  const problem = trainer.problem;
  const oracle = solvePrim(problem);
  return (
    <>
      <section className="trainer-briefing" aria-labelledby="prim-briefing-title">
        <div>
          <p className="eyebrow">Public-safe Trainingsinstanz</p>
          <h2 id="prim-briefing-title">{trainer.shortTitle}</h2>
          <p>
            Führe Prim ab Startknoten {problem.startVertex} aus. Trage die aufgenommenen Knoten,
            ausgewählten Baumkanten, key-/parent-Tabellen und das Gesamtgewicht ein.
          </p>
        </div>
        <dl className="metadata-list">
          <div>
            <dt>Knoten</dt>
            <dd>{problem.vertices.join(', ')}</dd>
          </div>
          <div>
            <dt>Kanten</dt>
            <dd>
              {problem.edges.map((edge) => `{${edge.from},${edge.to}} (${edge.weight})`).join(', ')}
            </dd>
          </div>
          <div>
            <dt>Tie-Policy</dt>
            <dd>{problem.tiePolicy}</dd>
          </div>
          <div>
            <dt>Laufzeit</dt>
            <dd>{problem.runtime}</dd>
          </div>
        </dl>
      </section>
      <section className="panel">
        <h2>Eingabeformat</h2>
        <p>
          Schreibe Tabellen als Zeilen `0: ...`, `1: ...`. Die Spaltenreihenfolge ist{' '}
          {problem.vertices.join(', ')}. Kanten dürfen als `A-B` oder als ungeordnetes Paar notiert
          werden.
        </p>
        <code>{`0: ${problem.vertices.map((vertex) => `${vertex}=${vertex === problem.startVertex ? '0' : '∞'}`).join(' ')}`}</code>
        <p className="quiet">Oracle-Schritte: {oracle.length - 1} Extract-Min-Schritte.</p>
      </section>
    </>
  );
}

function FloydWarshallBriefing({
  trainer,
}: {
  trainer: ReturnType<typeof getGraphTracingTrainerById> & {};
}) {
  if (!trainer || trainer.problem.algorithm !== 'floyd_warshall') return null;
  const oracle = solveFloydWarshall(trainer.problem);
  const initial = oracle[0];
  return (
    <>
      <section className="trainer-briefing" aria-labelledby="fw-briefing-title">
        <div>
          <p className="eyebrow">Public-safe Trainingsinstanz</p>
          <h2 id="fw-briefing-title">{trainer.shortTitle}</h2>
          <p>
            Berechne die Matrizen D(0) bis D(4). Die Knotenreihenfolge ist{' '}
            {trainer.problem.vertexOrder.join(', ')}.
          </p>
        </div>
        <dl className="metadata-list">
          <div>
            <dt>Knoten</dt>
            <dd>{trainer.problem.vertices.join(', ')}</dd>
          </div>
          <div>
            <dt>Kanten</dt>
            <dd>
              {trainer.problem.edges
                .map((edge) => `${edge.from}→${edge.to} (${edge.weight})`)
                .join(', ')}
            </dd>
          </div>
          <div>
            <dt>Rekurrenz</dt>
            <dd>{trainer.problem.recurrence}</dd>
          </div>
          <div>
            <dt>Laufzeit</dt>
            <dd>{trainer.problem.runtime}</dd>
          </div>
        </dl>
      </section>
      <section className="panel">
        <h2>Eingabeformat</h2>
        <p>
          Schreibe jede Matrix zeilenweise. Zeilen trennst du mit Semikolon oder Zeilenumbruch,
          Einträge mit Leerzeichen. Beispiel für D(0):
        </p>
        <code>{initial ? matrixToInput(initial.matrix) : 'D(0) nicht verfügbar'}</code>
      </section>
    </>
  );
}

function DijkstraBriefing({
  trainer,
}: {
  trainer: ReturnType<typeof getGraphTracingTrainerById> & {};
}) {
  if (!trainer || trainer.problem.algorithm !== 'dijkstra') return null;
  const problem = trainer.problem;
  const oracle = solveDijkstra(problem);
  return (
    <>
      <section className="trainer-briefing" aria-labelledby="dijkstra-briefing-title">
        <div>
          <p className="eyebrow">Public-safe Trainingsinstanz</p>
          <h2 id="dijkstra-briefing-title">{trainer.shortTitle}</h2>
          <p>
            Führe Dijkstra ab Startknoten {problem.startVertex} aus. Trage nach jedem Durchlauf die
            Distanzen, Vorgänger und den neu schwarz gefärbten Knoten ein.
          </p>
        </div>
        <dl className="metadata-list">
          <div>
            <dt>Knoten</dt>
            <dd>{problem.vertices.join(', ')}</dd>
          </div>
          <div>
            <dt>Kanten</dt>
            <dd>
              {problem.edges.map((edge) => `${edge.from}→${edge.to} (${edge.weight})`).join(', ')}
            </dd>
          </div>
          <div>
            <dt>Tie-Policy</dt>
            <dd>{problem.tiePolicy}</dd>
          </div>
          <div>
            <dt>Laufzeit</dt>
            <dd>{problem.runtime}</dd>
          </div>
        </dl>
      </section>
      <section className="panel">
        <h2>Eingabeformat</h2>
        <p>
          Schreibe Tabellen als Zeilen `0: ...`, `1: ...`. Die Knotenreihenfolge der Spalten ist{' '}
          {problem.vertices.join(', ')}.
        </p>
        <code>{`0: ${problem.vertices.map((vertex) => (vertex === problem.startVertex ? '0' : '∞')).join(' ')}`}</code>
        <p className="quiet">Oracle-Schritte: {oracle.length - 1} Markierungen.</p>
      </section>
    </>
  );
}
