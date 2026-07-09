import type { FloydWarshallMatrix, FloydWarshallProblem } from './types';

const INF = Number.POSITIVE_INFINITY;

export function cloneMatrix(matrix: FloydWarshallMatrix): FloydWarshallMatrix {
  return matrix.map((row) => [...row]);
}

export function distanceToText(value: number | null): string {
  return value === null ? '∞' : String(value);
}

export function matrixToInput(matrix: FloydWarshallMatrix): string {
  return matrix.map((row) => row.map(distanceToText).join(' ')).join('; ');
}

function valueOf(distance: number | null): number {
  return distance === null ? INF : distance;
}

function fromNumber(distance: number): number | null {
  return Number.isFinite(distance) ? distance : null;
}

export function initialMatrix(problem: FloydWarshallProblem): FloydWarshallMatrix {
  const index = new Map(problem.vertexOrder.map((vertex, position) => [vertex, position]));
  const matrix: FloydWarshallMatrix = problem.vertexOrder.map((_, row) =>
    problem.vertexOrder.map((__, column) => (row === column ? 0 : null)),
  );
  for (const edge of problem.edges) {
    const row = index.get(edge.from);
    const column = index.get(edge.to);
    if (row === undefined || column === undefined)
      throw new Error(`Kante ${edge.from}->${edge.to} verwendet unbekannten Knoten.`);
    matrix[row]![column] = edge.weight;
  }
  return matrix;
}

export function solveFloydWarshall(problem: FloydWarshallProblem) {
  let current = initialMatrix(problem);
  const steps: Array<{ label: string; viaVertex: string | null; matrix: FloydWarshallMatrix }> = [
    {
      label: 'D(0)',
      viaVertex: null,
      matrix: cloneMatrix(current),
    },
  ];
  for (const [k, viaVertex] of problem.vertexOrder.entries()) {
    const next = cloneMatrix(current);
    for (let row = 0; row < current.length; row += 1) {
      for (let column = 0; column < current.length; column += 1) {
        const direct = valueOf(current[row]![column]!);
        const via = valueOf(current[row]![k]!) + valueOf(current[k]![column]!);
        next[row]![column] = fromNumber(Math.min(direct, via));
      }
    }
    current = next;
    steps.push({ label: `D(${k + 1})`, viaVertex, matrix: cloneMatrix(current) });
  }
  return steps;
}

export function matricesEqual(left: FloydWarshallMatrix, right: FloydWarshallMatrix): boolean {
  return (
    left.length === right.length &&
    left.every(
      (row, rowIndex) =>
        row.length === right[rowIndex]?.length &&
        row.every((value, columnIndex) => value === right[rowIndex]?.[columnIndex]),
    )
  );
}

export function countMatchingCells(left: FloydWarshallMatrix, right: FloydWarshallMatrix): number {
  let matches = 0;
  for (const [rowIndex, row] of right.entries()) {
    for (const [columnIndex, expected] of row.entries()) {
      if (left[rowIndex]?.[columnIndex] === expected) matches += 1;
    }
  }
  return matches;
}

export function cellCount(matrix: FloydWarshallMatrix): number {
  return matrix.reduce((sum, row) => sum + row.length, 0);
}
