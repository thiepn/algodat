import type { ExpressionComparison, MathExpression } from './types';

type Token =
  | { type: 'number'; value: string }
  | { type: 'identifier'; value: string }
  | { type: 'symbol'; value: string };

export class MathExpressionParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MathExpressionParseError';
  }
}

const aliases = new Map([
  ['·', '*'],
  ['∗', '*'],
  ['^', '^'],
  ['{', '('],
  ['}', ')'],
]);

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  const normalized = input.replaceAll('\\cdot', '*').replaceAll('\\sum', 'sum');
  while (index < normalized.length) {
    const char = normalized[index] ?? '';
    if (/\s/u.test(char)) {
      index += 1;
      continue;
    }
    if (/\d/u.test(char)) {
      let value = char;
      index += 1;
      while (/\d/u.test(normalized[index] ?? '')) {
        value += normalized[index];
        index += 1;
      }
      tokens.push({ type: 'number', value });
      continue;
    }
    if (/[A-Za-z_]/u.test(char)) {
      let value = char;
      index += 1;
      while (/[A-Za-z0-9_]/u.test(normalized[index] ?? '')) {
        value += normalized[index];
        index += 1;
      }
      tokens.push({ type: 'identifier', value });
      continue;
    }
    const mapped = aliases.get(char) ?? char;
    if ('+-*^()[]=,'.includes(mapped)) {
      tokens.push({ type: 'symbol', value: mapped });
      index += 1;
      continue;
    }
    throw new MathExpressionParseError(`Unbekanntes Symbol „${char}“.`);
  }
  return tokens;
}

class Parser {
  private position = 0;

  constructor(
    private readonly tokens: Token[],
    private readonly allowedSymbols: string[],
  ) {}

  parse(): MathExpression {
    if (!this.tokens.length) throw new MathExpressionParseError('Leerer Ausdruck.');
    const expression = this.parseSum();
    if (this.peek()) throw new MathExpressionParseError('Unerwartetes Symbol am Ende.');
    return expression;
  }

  private parseSum(): MathExpression {
    let left = this.parseProduct();
    while (this.match('+') || this.match('-')) {
      const operator = this.previous().value as '+' | '-';
      const right = this.parseProduct();
      left = { type: 'binary', operator, left, right };
    }
    return left;
  }

  private parseProduct(): MathExpression {
    let left = this.parsePower();
    while (this.match('*')) {
      const right = this.parsePower();
      left = { type: 'binary', operator: '*', left, right };
    }
    return left;
  }

  private parsePower(): MathExpression {
    const base = this.parsePrimary();
    if (!this.match('^')) return base;
    const exponent = this.parsePrimary();
    return { type: 'power', base, exponent };
  }

  private parsePrimary(): MathExpression {
    const token = this.advance();
    if (!token) throw new MathExpressionParseError('Ausdruck endet zu früh.');
    if (token.type === 'number') return { type: 'number', value: Number(token.value) };
    if (token.type === 'identifier') {
      if (token.value === 'sum') return this.parseSummation();
      if (this.match('[')) {
        const index = this.parseSum();
        this.consume(']', 'Arrayzugriff muss mit ] schließen.');
        return { type: 'array', array: token.value, index };
      }
      if (!this.allowedSymbols.includes(token.value))
        throw new MathExpressionParseError(`Nicht erlaubtes Symbol „${token.value}“.`);
      return { type: 'variable', name: token.value };
    }
    if (token.value === '(') {
      const expression = this.parseSum();
      this.consume(')', 'Klammer fehlt.');
      return expression;
    }
    throw new MathExpressionParseError(`Unerwartetes Symbol „${token.value}“.`);
  }

  private parseSummation(): MathExpression {
    this.consume('(', 'sum erwartet Klammern: sum(j,1,n,j*A[j]).');
    const index = this.advance();
    if (index?.type !== 'identifier')
      throw new MathExpressionParseError('Summenindex muss ein Bezeichner sein.');
    this.consume(',', 'Nach dem Summenindex muss ein Komma stehen.');
    const lower = this.parseSum();
    this.consume(',', 'Nach der unteren Grenze muss ein Komma stehen.');
    const upper = this.parseSum();
    this.consume(',', 'Nach der oberen Grenze muss ein Komma stehen.');
    const body = this.parseSum();
    this.consume(')', 'Summenausdruck muss mit ) schließen.');
    return { type: 'sum', index: index.value, lower, upper, body };
  }

  private match(value: string): boolean {
    const token = this.peek();
    if (token?.type !== 'symbol' || token.value !== value) return false;
    this.position += 1;
    return true;
  }

  private consume(value: string, message: string): void {
    if (!this.match(value)) throw new MathExpressionParseError(message);
  }

  private advance(): Token | undefined {
    const token = this.tokens[this.position];
    if (token) this.position += 1;
    return token;
  }

  private previous(): Token {
    return this.tokens[this.position - 1] as Token;
  }

  private peek(): Token | undefined {
    return this.tokens[this.position];
  }
}

export function parseMathExpression(input: string, allowedSymbols = ['s', 'i', 'n', 'j', 'A']) {
  return new Parser(tokenize(input), allowedSymbols).parse();
}

function canonical(expression: MathExpression): string {
  if (expression.type === 'number') return String(expression.value);
  if (expression.type === 'variable') return expression.name;
  if (expression.type === 'array') return `${expression.array}[${canonical(expression.index)}]`;
  if (expression.type === 'power')
    return `${canonical(expression.base)}^(${canonical(expression.exponent)})`;
  if (expression.type === 'sum')
    return `sum(${expression.index},${canonical(expression.lower)},${canonical(expression.upper)},${canonical(expression.body)})`;
  const terms = flatten(expression.operator, expression).map(canonical);
  if (expression.operator === '+' || expression.operator === '*') terms.sort();
  return terms.join(expression.operator);
}

function flatten(operator: '+' | '-' | '*', expression: MathExpression): MathExpression[] {
  if (expression.type !== 'binary' || expression.operator !== operator) return [expression];
  return [...flatten(operator, expression.left), ...flatten(operator, expression.right)];
}

export function normalizeMathExpression(input: string, allowedSymbols = ['s', 'i', 'n', 'j', 'A']) {
  return canonical(parseMathExpression(input, allowedSymbols));
}

export function compareExpressions(
  actual: string,
  expected: string,
  allowedSymbols = ['s', 'i', 'n', 'j', 'A'],
): ExpressionComparison {
  try {
    const normalizedActual = normalizeMathExpression(actual, allowedSymbols);
    const normalizedExpected = normalizeMathExpression(expected, allowedSymbols);
    return {
      equivalent: normalizedActual === normalizedExpected,
      normalizedActual,
      normalizedExpected,
      unsupported: false,
      reason:
        normalizedActual === normalizedExpected
          ? 'Die Ausdrücke sind in der unterstützten Grammatik äquivalent.'
          : 'Die unterstützte Normalisierung erkennt diese Ausdrücke nicht als gleich.',
    };
  } catch (error) {
    return {
      equivalent: false,
      normalizedActual: '',
      normalizedExpected: '',
      unsupported: error instanceof MathExpressionParseError,
      reason: error instanceof Error ? error.message : 'Ausdruck konnte nicht geparst werden.',
    };
  }
}

export function serializeExpressionAst(expression: MathExpression): string {
  return JSON.stringify(expression);
}
