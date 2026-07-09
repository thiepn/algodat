import type { RbColor, RbNode, RbTree } from './types';

export function createNode(key: number, color: RbColor = 'R'): RbNode {
  return { key, color, left: null, right: null, parent: null };
}

export function cloneTree(tree: RbTree): RbTree {
  function clone(node: RbNode | null, parent: RbNode | null): RbNode | null {
    if (!node) return null;
    const copied = createNode(node.key, node.color);
    copied.parent = parent;
    copied.left = clone(node.left, copied);
    copied.right = clone(node.right, copied);
    return copied;
  }
  return { root: clone(tree.root, null) };
}

export function serializeTree(tree: RbTree): string {
  function serialize(node: RbNode | null): string {
    if (!node) return 'N';
    return `${node.key}${node.color}(${serialize(node.left)},${serialize(node.right)})`;
  }
  return serialize(tree.root);
}

export function search(tree: RbTree, key: number): RbNode | null {
  let current = tree.root;
  while (current) {
    if (key === current.key) return current;
    current = key < current.key ? current.left : current.right;
  }
  return null;
}

export function bstInsert(tree: RbTree, key: number): RbNode {
  let parent: RbNode | null = null;
  let current = tree.root;
  while (current) {
    parent = current;
    if (key === current.key) throw new Error(`Doppelter Schlüssel ${key} ist nicht erlaubt.`);
    current = key < current.key ? current.left : current.right;
  }
  const node = createNode(key, 'R');
  node.parent = parent;
  if (!parent) tree.root = node;
  else if (key < parent.key) parent.left = node;
  else parent.right = node;
  return node;
}

export function rotateLeft(tree: RbTree, x: RbNode): void {
  const y = x.right;
  if (!y) throw new Error('Linksrotation ohne rechtes Kind.');
  x.right = y.left;
  if (y.left) y.left.parent = x;
  y.parent = x.parent;
  if (!x.parent) tree.root = y;
  else if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;
  y.left = x;
  x.parent = y;
}

export function rotateRight(tree: RbTree, y: RbNode): void {
  const x = y.left;
  if (!x) throw new Error('Rechtsrotation ohne linkes Kind.');
  y.left = x.right;
  if (x.right) x.right.parent = y;
  x.parent = y.parent;
  if (!y.parent) tree.root = x;
  else if (y === y.parent.right) y.parent.right = x;
  else y.parent.left = x;
  x.right = y;
  y.parent = x;
}

export function setColor(node: RbNode | null, color: RbColor): void {
  if (node) node.color = color;
}

export function grandparent(node: RbNode): RbNode | null {
  return node.parent?.parent ?? null;
}

export function uncle(node: RbNode): RbNode | null {
  const gp = grandparent(node);
  if (!gp || !node.parent) return null;
  return node.parent === gp.left ? gp.right : gp.left;
}
