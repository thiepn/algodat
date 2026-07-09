import type { DijkstraProblem } from './types';

export interface DijkstraTraceStep {
  iteration: number;
  markedVertex: string | null;
  distances: Record<string, number | null>;
  predecessors: Record<string, string | null>;
  settled: string[];
  relaxations: string[];
}

const INF = Number.POSITIVE_INFINITY;

function valueOf(distance: number | null): number {
  return distance === null ? INF : distance;
}

function fromNumber(distance: number): number | null {
  return Number.isFinite(distance) ? distance : null;
}

function cloneRecord<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record));
}

export function distanceRowToInput(
  vertices: string[],
  distances: Record<string, number | null>,
): string {
  return vertices
    .map((vertex) => (distances[vertex] === null ? '∞' : String(distances[vertex])))
    .join(' ');
}

export function predecessorRowToInput(
  vertices: string[],
  predecessors: Record<string, string | null>,
): string {
  return vertices.map((vertex) => predecessors[vertex] ?? 'NIL').join(' ');
}

export function solveDijkstra(problem: DijkstraProblem): DijkstraTraceStep[] {
  const distances: Record<string, number | null> = Object.fromEntries(
    problem.vertices.map((vertex) => [vertex, null]),
  );
  const predecessors: Record<string, string | null> = Object.fromEntries(
    problem.vertices.map((vertex) => [vertex, null]),
  );
  distances[problem.startVertex] = 0;
  const settled: string[] = [];
  const steps: DijkstraTraceStep[] = [
    {
      iteration: 0,
      markedVertex: null,
      distances: cloneRecord(distances),
      predecessors: cloneRecord(predecessors),
      settled: [],
      relaxations: [],
    },
  ];

  while (settled.length < problem.vertices.length) {
    const unsettled = problem.vertexOrder.filter((vertex) => !settled.includes(vertex));
    const minDistance = Math.min(...unsettled.map((vertex) => valueOf(distances[vertex] ?? null)));
    const markedVertex = unsettled.find(
      (vertex) => valueOf(distances[vertex] ?? null) === minDistance,
    );
    if (!markedVertex) break;
    const relaxations: string[] = [];
    for (const edge of problem.edges.filter((candidate) => candidate.from === markedVertex)) {
      if (settled.includes(edge.to)) continue;
      const current = valueOf(distances[edge.to] ?? null);
      const candidate = valueOf(distances[markedVertex] ?? null) + edge.weight;
      if (candidate < current) {
        distances[edge.to] = fromNumber(candidate);
        predecessors[edge.to] = markedVertex;
        relaxations.push(`${edge.from}->${edge.to}: ${candidate}`);
      } else {
        relaxations.push(`${edge.from}->${edge.to}: keine Änderung`);
      }
    }
    settled.push(markedVertex);
    steps.push({
      iteration: steps.length,
      markedVertex,
      distances: cloneRecord(distances),
      predecessors: cloneRecord(predecessors),
      settled: [...settled],
      relaxations,
    });
  }
  return steps;
}

export function dijkstraDistanceTableToInput(problem: DijkstraProblem): string {
  return solveDijkstra(problem)
    .map((step) => `${step.iteration}: ${distanceRowToInput(problem.vertices, step.distances)}`)
    .join('\n');
}

export function dijkstraPredecessorTableToInput(problem: DijkstraProblem): string {
  return solveDijkstra(problem)
    .map(
      (step) => `${step.iteration}: ${predecessorRowToInput(problem.vertices, step.predecessors)}`,
    )
    .join('\n');
}

export function dijkstraMarkedOrder(problem: DijkstraProblem): string {
  return solveDijkstra(problem)
    .map((step) => step.markedVertex)
    .filter(Boolean)
    .join(', ');
}

export function dijkstraRelaxationLog(problem: DijkstraProblem): string {
  return solveDijkstra(problem)
    .filter((step) => step.iteration > 0)
    .map((step) => `${step.markedVertex}: ${step.relaxations.join('; ')}`)
    .join('\n');
}
