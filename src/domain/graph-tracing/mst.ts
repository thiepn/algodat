import type { PrimProblem } from './types';

const INF = Number.POSITIVE_INFINITY;

interface WeightedGraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface PrimTraceStep {
  iteration: number;
  selectedVertex: string | null;
  selectedEdge: string | null;
  keys: Record<string, number | null>;
  parents: Record<string, string | null>;
  treeVertices: string[];
  selectedEdges: string[];
  totalWeight: number;
}

export interface MstOracleResult {
  status: 'ok' | 'no_spanning_tree' | 'not_checked_too_large';
  minimumWeight: number | null;
  trees: string[][];
}

export interface TreeValidation {
  isTree: boolean;
  isConnected: boolean;
  isAcyclic: boolean;
  coversAllVertices: boolean;
  edgeCountOk: boolean;
  totalWeight: number;
  normalizedEdges: string[];
}

function cloneRecord<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record));
}

function valueOf(distance: number | null): number {
  return distance === null ? INF : distance;
}

export function normalizeUndirectedEdge(edge: string): string {
  const parts = edge
    .replace(/[{}()[\]]/gu, '')
    .split(/[-–—,;\s]+/u)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length < 2) return edge.trim();
  return canonicalEdgeId(parts[0]!, parts[1]!);
}

export function canonicalEdgeId(left: string, right: string): string {
  return [left, right].sort((a, b) => a.localeCompare(b, 'de')).join('-');
}

function edgeId(edge: WeightedGraphEdge): string {
  return canonicalEdgeId(edge.from, edge.to);
}

function edgeWeightById(edges: WeightedGraphEdge[]): Map<string, number> {
  return new Map(edges.map((edge) => [edgeId(edge), edge.weight]));
}

function adjacentEdges(problem: PrimProblem, vertex: string): WeightedGraphEdge[] {
  return problem.edges.filter((edge) => edge.from === vertex || edge.to === vertex);
}

function otherVertex(edge: WeightedGraphEdge, vertex: string): string {
  return edge.from === vertex ? edge.to : edge.from;
}

export function edgeListToInput(edges: string[]): string {
  return edges.join(', ');
}

export function keyRowToInput(vertices: string[], keys: Record<string, number | null>): string {
  return vertices
    .map((vertex) => `${vertex}=${keys[vertex] === null ? '∞' : keys[vertex]}`)
    .join(' ');
}

export function parentRowToInput(
  vertices: string[],
  parents: Record<string, string | null>,
): string {
  return vertices.map((vertex) => `${vertex}=${parents[vertex] ?? 'NIL'}`).join(' ');
}

export function solvePrim(problem: PrimProblem): PrimTraceStep[] {
  const keys: Record<string, number | null> = Object.fromEntries(
    problem.vertices.map((vertex) => [vertex, null]),
  );
  const parents: Record<string, string | null> = Object.fromEntries(
    problem.vertices.map((vertex) => [vertex, null]),
  );
  keys[problem.startVertex] = 0;
  const queue = new Set(problem.vertices);
  const treeVertices: string[] = [];
  const selectedEdges: string[] = [];
  let totalWeight = 0;
  const steps: PrimTraceStep[] = [
    {
      iteration: 0,
      selectedVertex: null,
      selectedEdge: null,
      keys: cloneRecord(keys),
      parents: cloneRecord(parents),
      treeVertices: [],
      selectedEdges: [],
      totalWeight,
    },
  ];

  while (queue.size > 0) {
    const candidates = problem.vertexOrder.filter((vertex) => queue.has(vertex));
    const minKey = Math.min(...candidates.map((vertex) => valueOf(keys[vertex] ?? null)));
    if (!Number.isFinite(minKey)) break;
    const selectedVertex = candidates.find((vertex) => valueOf(keys[vertex] ?? null) === minKey);
    if (!selectedVertex) break;
    queue.delete(selectedVertex);
    treeVertices.push(selectedVertex);
    const parent = parents[selectedVertex];
    const selectedEdge = parent ? canonicalEdgeId(parent, selectedVertex) : null;
    if (selectedEdge) {
      selectedEdges.push(selectedEdge);
      totalWeight += minKey;
    }

    for (const edge of adjacentEdges(problem, selectedVertex)) {
      const neighbor = otherVertex(edge, selectedVertex);
      if (!queue.has(neighbor)) continue;
      if (edge.weight < valueOf(keys[neighbor] ?? null)) {
        keys[neighbor] = edge.weight;
        parents[neighbor] = selectedVertex;
      }
    }

    steps.push({
      iteration: steps.length,
      selectedVertex,
      selectedEdge,
      keys: cloneRecord(keys),
      parents: cloneRecord(parents),
      treeVertices: [...treeVertices],
      selectedEdges: [...selectedEdges],
      totalWeight,
    });
  }
  return steps;
}

export function primSelectedVertices(problem: PrimProblem): string {
  return solvePrim(problem)
    .map((step) => step.selectedVertex)
    .filter(Boolean)
    .join(', ');
}

export function primSelectedEdges(problem: PrimProblem): string {
  const finalStep = solvePrim(problem).at(-1);
  return edgeListToInput(finalStep?.selectedEdges ?? []);
}

export function primKeyTableToInput(problem: PrimProblem): string {
  return solvePrim(problem)
    .map((step) => `${step.iteration}: ${keyRowToInput(problem.vertices, step.keys)}`)
    .join('\n');
}

export function primParentTableToInput(problem: PrimProblem): string {
  return solvePrim(problem)
    .map((step) => `${step.iteration}: ${parentRowToInput(problem.vertices, step.parents)}`)
    .join('\n');
}

export function primTotalWeight(problem: PrimProblem): number {
  return solvePrim(problem).at(-1)?.totalWeight ?? 0;
}

export function parseUndirectedEdgeList(input: string): string[] {
  const normalizedPairs = input
    .replace(/\{\s*([^,{}]+)\s*,\s*([^{}]+)\s*\}/gu, '$1-$2')
    .replace(/\(\s*([^,()]+)\s*,\s*([^()]+)\s*\)/gu, '$1-$2')
    .replace(/\[\s*([^,[\]]+)\s*,\s*([^[\]]+)\s*\]/gu, '$1-$2');
  return normalizedPairs
    .split(/\n|;/u)
    .flatMap((line) => line.split(/,\s*(?=[A-Za-z0-9])/u))
    .map(normalizeUndirectedEdge)
    .filter(Boolean);
}

class DisjointSet {
  private readonly parent = new Map<string, string>();

  constructor(vertices: string[]) {
    for (const vertex of vertices) this.parent.set(vertex, vertex);
  }

  find(vertex: string): string {
    const parent = this.parent.get(vertex);
    if (!parent) return vertex;
    if (parent === vertex) return vertex;
    const root = this.find(parent);
    this.parent.set(vertex, root);
    return root;
  }

  union(left: string, right: string): boolean {
    const leftRoot = this.find(left);
    const rightRoot = this.find(right);
    if (leftRoot === rightRoot) return false;
    this.parent.set(rightRoot, leftRoot);
    return true;
  }
}

export function validateSpanningTree(
  vertices: string[],
  edges: WeightedGraphEdge[],
  selectedInputEdges: string[],
): TreeValidation {
  const weights = edgeWeightById(edges);
  const normalizedEdges = selectedInputEdges.map(normalizeUndirectedEdge);
  const uniqueEdges = [...new Set(normalizedEdges)];
  const edgeCountOk = uniqueEdges.length === Math.max(0, vertices.length - 1);
  const covers = new Set<string>();
  const set = new DisjointSet(vertices);
  let isAcyclic = true;
  let totalWeight = 0;
  for (const id of uniqueEdges) {
    const weight = weights.get(id);
    if (weight === undefined) {
      isAcyclic = false;
      continue;
    }
    const [left, right] = id.split('-');
    if (!left || !right) {
      isAcyclic = false;
      continue;
    }
    covers.add(left);
    covers.add(right);
    if (!set.union(left, right)) isAcyclic = false;
    totalWeight += weight;
  }
  const root = vertices[0] ? set.find(vertices[0]) : null;
  const isConnected = Boolean(root) && vertices.every((vertex) => set.find(vertex) === root);
  const coversAllVertices = vertices.length <= 1 || vertices.every((vertex) => covers.has(vertex));
  const isTree = edgeCountOk && isAcyclic && isConnected && coversAllVertices;
  return {
    isTree,
    isConnected,
    isAcyclic,
    coversAllVertices,
    edgeCountOk,
    totalWeight,
    normalizedEdges: uniqueEdges,
  };
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];
  const [head, ...tail] = items;
  return [
    ...combinations(tail, size - 1).map((combination) => [head!, ...combination]),
    ...combinations(tail, size),
  ];
}

export function enumerateMsts(
  vertices: string[],
  edges: WeightedGraphEdge[],
  limit = 4096,
): MstOracleResult {
  if (vertices.length === 0) return { status: 'no_spanning_tree', minimumWeight: null, trees: [] };
  if (vertices.length === 1) return { status: 'ok', minimumWeight: 0, trees: [[]] };
  const choose = vertices.length - 1;
  const candidateCount = combinations(edges, choose);
  if (candidateCount.length > limit)
    return { status: 'not_checked_too_large', minimumWeight: null, trees: [] };
  let minimumWeight = INF;
  const trees: string[][] = [];
  for (const candidate of candidateCount) {
    const validation = validateSpanningTree(vertices, edges, candidate.map(edgeId));
    if (!validation.isTree) continue;
    if (validation.totalWeight < minimumWeight) {
      minimumWeight = validation.totalWeight;
      trees.length = 0;
    }
    if (validation.totalWeight === minimumWeight) trees.push(validation.normalizedEdges.sort());
  }
  return Number.isFinite(minimumWeight)
    ? { status: 'ok', minimumWeight, trees }
    : { status: 'no_spanning_tree', minimumWeight: null, trees: [] };
}

export function isMinimumSpanningTree(
  vertices: string[],
  edges: WeightedGraphEdge[],
  selectedEdges: string[],
): boolean {
  const validation = validateSpanningTree(vertices, edges, selectedEdges);
  if (!validation.isTree) return false;
  const oracle = enumerateMsts(vertices, edges);
  return oracle.status === 'ok' && validation.totalWeight === oracle.minimumWeight;
}
