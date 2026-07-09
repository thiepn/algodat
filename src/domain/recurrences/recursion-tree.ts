import type { RecursionTreeAnalysis } from './types';

export function buildRecursionTreeAnalysis(): RecursionTreeAnalysis {
  return {
    height: 'log_2(n)',
    nodesAtLevel: '8^i',
    subproblemSizeAtLevel: 'n/2^i',
    costPerNodeAtLevel: '(n/2^i)^3',
    levelCost: '8^i*(n/2^i)^3=n^3',
    leafCount: '8^(log_2(n))=n^3',
    totalCost: '(log_2(n)+1)*n^3',
    textAlternative:
      'Der Baum hat log_2(n)+1 Ebenen. Auf jeder inneren Ebene entstehen Kosten n^3; die Blätter tragen zusammen n^3. Insgesamt entstehen (log_2(n)+1)*n^3.',
  };
}
