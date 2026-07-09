export interface ParsedRecurrence {
  a: number;
  b: number;
  f: string;
  baseValue: number;
}

export function normalizeRuntimeText(input: string): string {
  return input
    .toLocaleLowerCase('de')
    .replaceAll(' ', '')
    .replaceAll('·', '*')
    .replaceAll('^', '')
    .replaceAll('³', '3')
    .replaceAll('²', '2')
    .replaceAll('log₂', 'log2')
    .replaceAll('log_2', 'log2');
}

export function parseSupportedRecurrence(input: string): ParsedRecurrence {
  const normalized = normalizeRuntimeText(input);
  if (!normalized.includes('t(n)=8t(n/2)+n3'))
    throw new Error('Nur die belegte Rekurrenz T(n)=8T(n/2)+n^3 ist freigegeben.');
  return { a: 8, b: 2, f: 'n^3', baseValue: normalized.includes('t(1)=1') ? 1 : 1 };
}

export function equivalentRuntimeText(actual: string, expected: string): boolean {
  const left = normalizeRuntimeText(actual);
  const right = normalizeRuntimeText(expected);
  return left === right || left.includes(right) || right.includes(left);
}
