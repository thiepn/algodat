import { validateRbInvariants } from './invariants';
import { bstInsert, rotateLeft, rotateRight, serializeTree, setColor, uncle } from './operations';
import type { RbInsertionResult, RbNode, RbTraceStep, RbTree } from './types';

function parentOf(node: RbNode): RbNode | null {
  return node.parent;
}

function addStep(
  trace: RbTraceStep[],
  insertedKey: number,
  action: string,
  caseLabel: RbTraceStep['caseLabel'],
  reason: string,
  tree: RbTree,
): void {
  trace.push({ insertedKey, action, caseLabel, reason, tree: serializeTree(tree) });
}

export function insertKey(tree: RbTree, key: number, trace: RbTraceStep[]): void {
  let z = bstInsert(tree, key);
  addStep(
    trace,
    key,
    `BST-Einfügung von ${key} als roter Knoten`,
    'root-black',
    'Neue Knoten werden nach Vorlesung rot eingefügt.',
    tree,
  );

  while (parentOf(z)?.color === 'R') {
    const parent = parentOf(z);
    const grandparent = parent?.parent;
    if (!parent || !grandparent) break;
    if (parent === grandparent.left) {
      const y = uncle(z);
      if (y?.color === 'R') {
        setColor(parent, 'B');
        setColor(y, 'B');
        setColor(grandparent, 'R');
        addStep(
          trace,
          key,
          'Fall 1: Eltern- und Onkelknoten umfärben',
          'case-1-recolor',
          'Der Onkel von z ist rot.',
          tree,
        );
        z = grandparent;
      } else {
        if (z === parent.right) {
          z = parent;
          rotateLeft(tree, z);
          addStep(
            trace,
            key,
            'Fall 2: Linksrotation zur Vorbereitung',
            'case-2-rotate',
            'z ist rechtes Kind eines linken Elternknotens.',
            tree,
          );
        }
        const p = parentOf(z);
        const g = p?.parent;
        setColor(p, 'B');
        setColor(g ?? null, 'R');
        if (g) rotateRight(tree, g);
        addStep(
          trace,
          key,
          'Fall 3: Rechtsrotation und Umfärbung',
          'case-3-rotate',
          'Der Onkel ist schwarz und z liegt außen.',
          tree,
        );
      }
    } else {
      const y = uncle(z);
      if (y?.color === 'R') {
        setColor(parent, 'B');
        setColor(y, 'B');
        setColor(grandparent, 'R');
        addStep(
          trace,
          key,
          'Fall 1 gespiegelt: Eltern- und Onkelknoten umfärben',
          'case-1-recolor',
          'Der Onkel von z ist rot.',
          tree,
        );
        z = grandparent;
      } else {
        if (z === parent.left) {
          z = parent;
          rotateRight(tree, z);
          addStep(
            trace,
            key,
            'Fall 2 gespiegelt: Rechtsrotation zur Vorbereitung',
            'case-2-rotate',
            'z ist linkes Kind eines rechten Elternknotens.',
            tree,
          );
        }
        const p = parentOf(z);
        const g = p?.parent;
        setColor(p, 'B');
        setColor(g ?? null, 'R');
        if (g) rotateLeft(tree, g);
        addStep(
          trace,
          key,
          'Fall 3 gespiegelt: Linksrotation und Umfärbung',
          'case-3-rotate',
          'Der Onkel ist schwarz und z liegt außen.',
          tree,
        );
      }
    }
  }
  if (tree.root) tree.root.color = 'B';
  addStep(
    trace,
    key,
    'Wurzel schwarz setzen',
    'root-black',
    'Nach der Reparatur wird die Wurzel schwarz gefärbt.',
    tree,
  );
}

export function solveRbInsertion(keys: number[]): RbInsertionResult {
  if (!keys.length) throw new Error('Mindestens ein Schlüssel ist erforderlich.');
  if (new Set(keys).size !== keys.length) throw new Error('Doppelte Schlüssel sind nicht erlaubt.');
  const tree: RbTree = { root: null };
  const trace: RbTraceStep[] = [];
  for (const key of keys) insertKey(tree, key, trace);
  const report = validateRbInvariants(tree, keys);
  if (!report.valid || report.blackHeight === null)
    throw new Error(
      `Referenzsolver erzeugte keinen gültigen Rot-Schwarz-Baum: ${report.errors.join('; ')}`,
    );
  return {
    keys,
    finalTree: tree,
    finalTreeCompact: serializeTree(tree),
    trace,
    blackHeight: report.blackHeight,
  };
}
