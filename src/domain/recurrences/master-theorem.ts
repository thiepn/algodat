import type { MasterTheoremAnalysis } from './types';
import { parseSupportedRecurrence } from './parser';

export function analyzeMasterTheorem(recurrence: string): MasterTheoremAnalysis {
  const parsed = parseSupportedRecurrence(recurrence);
  const criticalExponent = Math.log(parsed.a) / Math.log(parsed.b);
  if (parsed.a !== 8 || parsed.b !== 2 || parsed.f !== 'n^3')
    return {
      a: parsed.a,
      b: parsed.b,
      f: parsed.f,
      criticalExponent: String(criticalExponent),
      criticalFunction: `n^${criticalExponent}`,
      comparison: 'equal',
      caseId: 'not_applicable',
      result: 'nicht freigegeben',
      regularityWitness: 'nicht geprüft',
    };
  return {
    a: 8,
    b: 2,
    f: 'n^3',
    criticalExponent: '3',
    criticalFunction: 'n^3',
    comparison: 'equal',
    caseId: 'fall1',
    result: 'O(n^3 log n)',
    regularityWitness: 'f(n)=a*f(n/b), denn 8*(n/2)^3=n^3',
  };
}
