import { describe, expect, it } from 'vitest';
import {
  compareExpressions,
  normalizeMathExpression,
  parseMathExpression,
  serializeExpressionAst,
} from '../../src/domain/proofs';

describe('Mathematische Ausdrucksgrammatik für Beweistrainer', () => {
  it('normalisiert kommutative Summen und Produkte deterministisch', () => {
    expect(normalizeMathExpression('A[i]*i+1')).toBe(normalizeMathExpression('1+i*A[i]'));
  });

  it('parst Summen und Arrayzugriffe als expliziten AST', () => {
    const ast = parseMathExpression('sum(j,1,i-1,j*A[j])');
    expect(serializeExpressionAst(ast)).toContain('"type":"sum"');
    expect(serializeExpressionAst(ast)).toContain('"array":"A"');
  });

  it('markiert unbekannte Symbole als nicht unterstützte Gleichwertigkeit', () => {
    const comparison = compareExpressions('sum(k,1,n,k*B[k])', 'sum(j,1,n,j*A[j])');
    expect(comparison.equivalent).toBe(false);
    expect(comparison.unsupported).toBe(true);
  });
});
