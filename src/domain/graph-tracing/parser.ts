import type { FloydWarshallMatrix } from './types';

function parseCell(raw: string): number | null {
  const normalized = raw.trim().toLocaleLowerCase('de');
  if (['∞', 'inf', 'infty', 'unendlich', 'oo'].includes(normalized)) return null;
  if (/^-?\d+$/u.test(normalized)) return Number.parseInt(normalized, 10);
  throw new Error(`Ungültiger Matrixeintrag: ${raw}`);
}

export function parseMatrixInput(input: string, size: number): FloydWarshallMatrix {
  const rows = input
    .trim()
    .split(/[;\n]+/u)
    .map((row) => row.trim())
    .filter(Boolean);
  if (rows.length !== size) throw new Error(`Erwartet werden ${size} Matrixzeilen.`);
  return rows.map((row) => {
    const cells = row
      .split(/[\s,|]+/u)
      .filter(Boolean)
      .map(parseCell);
    if (cells.length !== size) throw new Error(`Erwartet werden ${size} Einträge pro Zeile.`);
    return cells;
  });
}

export function normalizeVertexOrder(input: string): string[] {
  return input
    .split(/[,\s;>→-]+/u)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function textContainsAll(input: string, needles: string[]): boolean {
  const normalized = input.toLocaleLowerCase('de').replace(/\s+/gu, ' ');
  return needles.every((needle) => normalized.includes(needle.toLocaleLowerCase('de')));
}
