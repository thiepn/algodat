import type { ExactPoint } from '../types';

function gcd(a: bigint, b: bigint): bigint {
  let left = a < 0n ? -a : a;
  let right = b < 0n ? -b : b;
  while (right !== 0n) {
    const next = left % right;
    left = right;
    right = next;
  }
  return left || 1n;
}

export function exact(numerator: bigint | number, denominator: bigint | number = 1n): ExactPoint {
  const rawNumerator = BigInt(numerator);
  const rawDenominator = BigInt(denominator);
  if (rawDenominator <= 0n) throw new Error('Nenner muss positiv sein.');
  const divisor = gcd(rawNumerator, rawDenominator);
  return { numerator: rawNumerator / divisor, denominator: rawDenominator / divisor };
}

export function addExact(left: ExactPoint, right: ExactPoint): ExactPoint {
  return exact(
    left.numerator * right.denominator + right.numerator * left.denominator,
    left.denominator * right.denominator,
  );
}

export function multiplyExact(left: ExactPoint, right: ExactPoint): ExactPoint {
  return exact(left.numerator * right.numerator, left.denominator * right.denominator);
}

export function divideExact(left: ExactPoint, right: ExactPoint): ExactPoint {
  if (right.numerator === 0n) throw new Error('Division durch null.');
  return exact(left.numerator * right.denominator, left.denominator * right.numerator);
}

export function exactFromContent(value: { numerator: number; denominator: number }): ExactPoint {
  return exact(value.numerator, value.denominator);
}

export function exactToNumber(value: ExactPoint): number {
  return Number(value.numerator) / Number(value.denominator);
}

export function exactToLabel(value: ExactPoint): string {
  if (value.denominator === 1n) return value.numerator.toString();
  const decimal = exactToNumber(value);
  return Number.isInteger(decimal) ? String(decimal) : decimal.toFixed(2).replace(/0+$/u, '');
}
