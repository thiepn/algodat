import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { DijkstraAnswer, FloydWarshallAnswer, PrimAnswer } from '../../domain/graph-tracing';
import type { PracticeAttempt } from '../../content/schemas';
import { practiceAttemptRepository } from '../../persistence/repositories';
import {
  ErrorAnalysis,
  MasteryImpact,
  RubricBreakdown,
  SourceCitationPanel,
} from './components/TrainerComponents';
import {
  graphTracingAnswerFromAttempt,
  scoreStoredGraphTracingAttempt,
} from './graph-tracing-service';
import { getGraphTracingTrainerById } from './trainer-service';

function graphRouteSegment(algorithm: string): string {
  if (algorithm === 'dijkstra') return 'dijkstra';
  if (algorithm === 'prim') return 'prim';
  return 'floyd-warshall';
}

export function GraphTracingResultPage() {
  const { trainerId, attemptId } = useParams();
  const trainer = getGraphTracingTrainerById(trainerId);
  const [attempt, setAttempt] = useState<PracticeAttempt | undefined>();
  useEffect(() => {
    if (attemptId) void practiceAttemptRepository.get(attemptId).then(setAttempt);
  }, [attemptId]);
  if (!trainer || !attempt)
    return (
      <section>
        <h1>Graph-Auswertung nicht gefunden</h1>
        <Link to="/trainer">Zur Trainerübersicht</Link>
      </section>
    );
  const result = scoreStoredGraphTracingAttempt(attempt, graphTracingAnswerFromAttempt(attempt));
  const canonical = result.canonicalSolution;
  const isDijkstra = trainer.problem.algorithm === 'dijkstra';
  const isPrim = trainer.problem.algorithm === 'prim';
  return (
    <div className="page-flow trainer-result">
      <Link
        className="back-link"
        to={`/trainer/graphen/${graphRouteSegment(trainer.problem.algorithm)}/${trainer.id}`}
      >
        ← Nächsten Graph-Versuch starten
      </Link>
      <header className="page-header">
        <p className="eyebrow">Auswertung · {attempt.mode}</p>
        <h1>
          {result.points}/{result.maxPoints} Punkte
        </h1>
        <p>{result.recommendation}</p>
      </header>
      <SourceCitationPanel trainer={trainer} />
      <RubricBreakdown results={result.rubricResults} />
      <ErrorAnalysis errors={result.errors} />
      <section className="canonical-solution">
        <h2>Belegte Musterlösung</h2>
        {isDijkstra ? (
          <DijkstraSolution answer={canonical as DijkstraAnswer} />
        ) : isPrim ? (
          <PrimSolution answer={canonical as PrimAnswer} />
        ) : (
          <FloydWarshallSolution answer={canonical as FloydWarshallAnswer} />
        )}
      </section>
      <MasteryImpact
        dimensions={
          isDijkstra
            ? {
                dijkstra_extract_min: result.errors.some(
                  (error) => error.errorCode === 'dijkstra_marked_order_wrong',
                )
                  ? 0.45
                  : 1,
                dijkstra_distanzen: result.errors.some(
                  (error) => error.errorCode === 'dijkstra_distance_table_wrong',
                )
                  ? 0.45
                  : 1,
                dijkstra_vorgaenger: result.errors.some(
                  (error) => error.errorCode === 'dijkstra_predecessor_table_wrong',
                )
                  ? 0.45
                  : 1,
              }
            : isPrim
              ? {
                  prim_sichere_kante: result.errors.some(
                    (error) =>
                      error.errorCode === 'prim_edge_order_wrong' ||
                      error.errorCode === 'prim_not_minimum_weight',
                  )
                    ? 0.45
                    : 1,
                  prim_key_updates: result.errors.some(
                    (error) => error.errorCode === 'prim_key_table_wrong',
                  )
                    ? 0.45
                    : 1,
                  prim_gesamtgewicht: result.errors.some(
                    (error) => error.errorCode === 'prim_total_weight_wrong',
                  )
                    ? 0.45
                    : 1,
                }
              : {
                  fw_knotenreihenfolge: result.errors.some(
                    (error) => error.errorCode === 'fw_vertex_order_wrong',
                  )
                    ? 0.45
                    : 1,
                  fw_iterationen: result.errors.some(
                    (error) => error.errorCode === 'fw_iteration_matrix_wrong',
                  )
                    ? 0.45
                    : 1,
                  fw_laufzeit: result.errors.some((error) => error.errorCode === 'fw_runtime_wrong')
                    ? 0.55
                    : 1,
                }
        }
      />
    </div>
  );
}

function PrimSolution({ answer }: { answer: PrimAnswer }) {
  return (
    <dl className="metadata-list">
      <div>
        <dt>Startknoten</dt>
        <dd>{answer.startVertex}</dd>
      </div>
      <div>
        <dt>Aufgenommene Knoten</dt>
        <dd>{answer.selectedVertices}</dd>
      </div>
      <div>
        <dt>Baumkanten</dt>
        <dd>{answer.selectedEdges}</dd>
      </div>
      <div>
        <dt>Gesamtgewicht</dt>
        <dd>{answer.totalWeight}</dd>
      </div>
      <div>
        <dt>key-Tabelle</dt>
        <dd>
          <code>{answer.keyTable}</code>
        </dd>
      </div>
      <div>
        <dt>parent-Tabelle</dt>
        <dd>
          <code>{answer.parentTable}</code>
        </dd>
      </div>
      <div>
        <dt>Laufzeit</dt>
        <dd>{answer.runtime}</dd>
      </div>
    </dl>
  );
}

function FloydWarshallSolution({ answer }: { answer: FloydWarshallAnswer }) {
  return (
    <dl className="metadata-list">
      <div>
        <dt>Knotenreihenfolge</dt>
        <dd>{answer.vertexOrder}</dd>
      </div>
      <div>
        <dt>D(0)</dt>
        <dd>
          <code>{answer.d0}</code>
        </dd>
      </div>
      <div>
        <dt>D(4)</dt>
        <dd>
          <code>{answer.d4}</code>
        </dd>
      </div>
      <div>
        <dt>Rekurrenz</dt>
        <dd>{answer.recurrence}</dd>
      </div>
      <div>
        <dt>Laufzeit</dt>
        <dd>{answer.runtime}</dd>
      </div>
    </dl>
  );
}

function DijkstraSolution({ answer }: { answer: DijkstraAnswer }) {
  return (
    <dl className="metadata-list">
      <div>
        <dt>Startknoten</dt>
        <dd>{answer.startVertex}</dd>
      </div>
      <div>
        <dt>Markierungsreihenfolge</dt>
        <dd>{answer.markedOrder}</dd>
      </div>
      <div>
        <dt>Distanztabelle</dt>
        <dd>
          <code>{answer.distanceTable}</code>
        </dd>
      </div>
      <div>
        <dt>Vorgängertabelle</dt>
        <dd>
          <code>{answer.predecessorTable}</code>
        </dd>
      </div>
      <div>
        <dt>Laufzeit</dt>
        <dd>{answer.runtime}</dd>
      </div>
    </dl>
  );
}
