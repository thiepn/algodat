import type { RbInvariantReport, RbNode, RbTree } from './types';

function colorOf(node: RbNode | null): 'R' | 'B' {
  return node?.color ?? 'B';
}

export function blackHeight(tree: RbTree): number {
  const report = validateRbInvariants(tree);
  if (!report.valid || report.blackHeight === null)
    throw new Error('Schwarzhöhe ist inkonsistent.');
  return report.blackHeight;
}

export function validateRbInvariants(tree: RbTree, expectedKeys?: number[]): RbInvariantReport {
  const errors: string[] = [];
  const seen = new Set<RbNode>();
  const keys: number[] = [];

  if (tree.root?.color === 'R') errors.push('Die Wurzel ist nicht schwarz.');

  function visit(node: RbNode | null, min: number, max: number, parent: RbNode | null): number {
    if (!node) return 1;
    if (seen.has(node)) {
      errors.push(`Zyklus bei Schlüssel ${node.key}.`);
      return 0;
    }
    seen.add(node);
    keys.push(node.key);
    if (node.color !== 'R' && node.color !== 'B') errors.push(`Ungültige Farbe bei ${node.key}.`);
    if (node.parent !== parent) errors.push(`Elternreferenz bei ${node.key} ist inkonsistent.`);
    if (node.key <= min || node.key >= max) errors.push(`BST-Ordnung bei ${node.key} verletzt.`);
    if (node.color === 'R' && (colorOf(node.left) === 'R' || colorOf(node.right) === 'R'))
      errors.push(`Roter Knoten ${node.key} besitzt ein rotes Kind.`);
    const leftHeight = visit(node.left, min, node.key, node);
    const rightHeight = visit(node.right, node.key, max, node);
    if (leftHeight !== rightHeight)
      errors.push(`Schwarzhöhe bei ${node.key} ist links/rechts verschieden.`);
    return leftHeight + (node.color === 'B' ? 1 : 0);
  }

  const height = visit(tree.root, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, null);
  if (expectedKeys) {
    const actual = [...keys].sort((a, b) => a - b).join(',');
    const expected = [...expectedKeys].sort((a, b) => a - b).join(',');
    if (actual !== expected)
      errors.push(`Schlüsselmenge erwartet ${expected}, erhalten ${actual}.`);
  }
  if (new Set(keys).size !== keys.length) errors.push('Doppelte Schlüssel sind nicht erlaubt.');

  return { valid: errors.length === 0, errors, blackHeight: errors.length ? null : height };
}
