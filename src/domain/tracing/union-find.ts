import { UnionFindTracingProblemSchema, type TrainingRecommendation } from '../../content/schemas';
import type {
  MasteryEvidenceAttempt,
  RubricResult,
  TraceError,
  TrainingErrorCode,
  UnionFindPreflightAnswers,
  UnionFindScore,
  UnionFindState,
  UnionFindSubmission,
  UnionFindTracingProblem,
  UnionFindUserCheckpoint,
} from './types';

const TOPIC_ID = 'topic-0ba342914656';
const MAX_POINTS = 12;

type MutableSet = {
  representative: string;
  head: string;
  tail: string;
  orderedElements: string[];
};

type MutableState = {
  operationIndex: number;
  operationLabel: string;
  sets: MutableSet[];
  representativeByElement: Map<string, string>;
  nextByElement: Map<string, string | null>;
  attachedList: UnionFindState['attachedList'];
};

export function validateUnionFindProblem(input: unknown): UnionFindTracingProblem {
  const problem = UnionFindTracingProblemSchema.parse(input);
  const elements = [...problem.elements].sort((left, right) => left.localeCompare(right, 'de'));
  if (new Set(elements).size !== elements.length)
    throw new Error('Elemente müssen eindeutig sein.');
  if (elements.join('\u0000') !== problem.elements.join('\u0000'))
    throw new Error('Elemente müssen in deterministischer Reihenfolge vorliegen.');
  for (const checkpoint of problem.checkpoints) {
    if (checkpoint > problem.operations.length)
      throw new Error(`Kontrollpunkt ${checkpoint} liegt hinter der Operationsfolge.`);
  }
  return problem;
}

export function createInitialState(): MutableState {
  return {
    operationIndex: 0,
    operationLabel: 'Anfangszustand',
    sets: [],
    representativeByElement: new Map(),
    nextByElement: new Map(),
    attachedList: null,
  };
}

function cloneState(state: MutableState): MutableState {
  return {
    operationIndex: state.operationIndex,
    operationLabel: state.operationLabel,
    sets: state.sets.map((set) => ({
      representative: set.representative,
      head: set.head,
      tail: set.tail,
      orderedElements: [...set.orderedElements],
    })),
    representativeByElement: new Map(state.representativeByElement),
    nextByElement: new Map(state.nextByElement),
    attachedList: state.attachedList ? { ...state.attachedList } : null,
  };
}

function toPublicState(state: MutableState): UnionFindState {
  const sets = [...state.sets]
    .sort((left, right) => left.representative.localeCompare(right.representative, 'de'))
    .map((set) => ({
      representative: set.representative,
      head: set.head,
      tail: set.tail,
      size: set.orderedElements.length,
      orderedElements: [...set.orderedElements],
    }));
  const elements = [...state.representativeByElement.keys()]
    .sort((left, right) => left.localeCompare(right, 'de'))
    .map((key) => ({
      key,
      representative: state.representativeByElement.get(key) ?? key,
      next: state.nextByElement.get(key) ?? null,
    }));
  return {
    operationIndex: state.operationIndex,
    operationLabel: state.operationLabel,
    sets,
    elements,
    representativeByElement: Object.fromEntries(
      elements.map((element) => [element.key, element.representative]),
    ),
    attachedList: state.attachedList ? { ...state.attachedList } : null,
  };
}

function findSet(state: MutableState, element: string): MutableSet {
  const representative = state.representativeByElement.get(element);
  if (!representative) throw new Error(`Find/Union auf unbekanntem Element ${element}.`);
  const set = state.sets.find((candidate) => candidate.representative === representative);
  if (!set) throw new Error(`Inkonsistenter Zustand für Element ${element}.`);
  return set;
}

export function applyMakeSet(
  state: MutableState,
  element: string,
  operationIndex = 0,
): MutableState {
  if (state.representativeByElement.has(element))
    throw new Error(`Make-Set(${element}) ist doppelt.`);
  const next = cloneState(state);
  next.operationIndex = operationIndex;
  next.operationLabel = `Make-Set(${element})`;
  next.sets.push({
    representative: element,
    head: element,
    tail: element,
    orderedElements: [element],
  });
  next.representativeByElement.set(element, element);
  next.nextByElement.set(element, null);
  next.attachedList = null;
  return next;
}

export function applyFind(state: MutableState, element: string, operationIndex = 0): MutableState {
  findSet(state, element);
  const next = cloneState(state);
  next.operationIndex = operationIndex;
  next.operationLabel = `Find(${element})`;
  next.attachedList = null;
  return next;
}

export function compareSetSizes(left: MutableSet, right: MutableSet): number {
  return left.orderedElements.length - right.orderedElements.length;
}

export function resolveTieBreaker(left: MutableSet, right: MutableSet): MutableSet {
  return left.representative.localeCompare(right.representative, 'de') < 0 ? left : right;
}

export function applyUnion(
  state: MutableState,
  leftElement: string,
  rightElement: string,
  operationIndex = 0,
): MutableState {
  const left = findSet(state, leftElement);
  const right = findSet(state, rightElement);
  const next = cloneState(state);
  next.operationIndex = operationIndex;
  next.operationLabel = `Union(${leftElement},${rightElement})`;
  if (left.representative === right.representative) {
    next.attachedList = null;
    return next;
  }
  const nextLeft = next.sets.find((set) => set.representative === left.representative);
  const nextRight = next.sets.find((set) => set.representative === right.representative);
  if (!nextLeft || !nextRight) throw new Error('Union-Zustand inkonsistent.');
  const sizeComparison = compareSetSizes(nextLeft, nextRight);
  const source =
    sizeComparison < 0
      ? nextLeft
      : sizeComparison > 0
        ? nextRight
        : resolveTieBreaker(nextLeft, nextRight);
  const target = source.representative === nextLeft.representative ? nextRight : nextLeft;
  const oldTargetTail = target.tail;
  next.nextByElement.set(oldTargetTail, source.head);
  target.orderedElements.push(...source.orderedElements);
  target.tail = source.tail;
  for (const element of source.orderedElements)
    next.representativeByElement.set(element, target.representative);
  next.sets = next.sets.filter((set) => set.representative !== source.representative);
  next.attachedList = {
    from: source.representative,
    to: target.representative,
    reason:
      sizeComparison === 0
        ? 'Gleichstand: lexikographisch kleinere Repräsentantenmenge gilt als kleiner.'
        : 'Weighted Union: kleinere Liste wird an die größere angehängt.',
  };
  return next;
}

export function computeUnionFindTrace(input: unknown): UnionFindState[] {
  const problem = validateUnionFindProblem(input);
  let state = createInitialState();
  const trace: UnionFindState[] = [];
  for (const [index, operation] of problem.operations.entries()) {
    const operationIndex = index + 1;
    if (operation.type === 'make_set')
      state = applyMakeSet(state, operation.element, operationIndex);
    else if (operation.type === 'find') state = applyFind(state, operation.element, operationIndex);
    else state = applyUnion(state, operation.left, operation.right, operationIndex);
    if (problem.checkpoints.includes(operationIndex)) trace.push(toPublicState(state));
  }
  validateUnionFindInvariants(trace.at(-1) ?? toPublicState(state));
  return trace;
}

export function serializeUnionFindState(state: UnionFindState): string {
  return state.sets
    .map((set) => `${set.representative}: ${set.orderedElements.join('>')}`)
    .join('; ');
}

export function serializeUnionFindTrace(trace: UnionFindState[]): string {
  return JSON.stringify(trace);
}

export function parseUnionFindStateText(text: string): UnionFindState['sets'] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  return trimmed
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [representativePart, elementsPart] = part.split(':');
      const representative = representativePart?.trim();
      const orderedElements = (elementsPart ?? '')
        .split(/[>\s,]+/u)
        .map((entry) => entry.trim())
        .filter(Boolean);
      return {
        representative: representative ?? '',
        head: orderedElements[0] ?? '',
        tail: orderedElements.at(-1) ?? '',
        size: orderedElements.length,
        orderedElements,
      };
    })
    .sort((left, right) => left.representative.localeCompare(right.representative, 'de'));
}

function expectedAttachedText(state: UnionFindState): string {
  return state.attachedList ? `${state.attachedList.from}->${state.attachedList.to}` : 'keine';
}

function normalizeAttached(value: string): string {
  return value.trim().replace(/\s+/gu, '').replace('→', '->').toLocaleUpperCase('de');
}

function stateFromSets(operationIndex: number, sets: UnionFindState['sets']): UnionFindState {
  const representativeByElement: Record<string, string> = {};
  const elements: UnionFindState['elements'] = [];
  for (const set of sets) {
    for (const [index, key] of set.orderedElements.entries()) {
      representativeByElement[key] = set.representative;
      elements.push({
        key,
        representative: set.representative,
        next: set.orderedElements[index + 1] ?? null,
      });
    }
  }
  return {
    operationIndex,
    operationLabel: `Nutzereingabe nach Schritt ${operationIndex}`,
    sets,
    elements: elements.sort((left, right) => left.key.localeCompare(right.key, 'de')),
    representativeByElement,
    attachedList: null,
  };
}

export function validateUnionFindInvariants(state: UnionFindState): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const set of state.sets) {
    if (!set.representative) errors.push('Menge ohne Repräsentant.');
    if (set.size !== set.orderedElements.length) errors.push(`${set.representative}: size falsch.`);
    if (set.head !== set.orderedElements[0]) errors.push(`${set.representative}: head falsch.`);
    if (set.tail !== set.orderedElements.at(-1)) errors.push(`${set.representative}: tail falsch.`);
    for (const element of set.orderedElements) {
      if (seen.has(element)) errors.push(`${element}: doppelt vorhanden.`);
      seen.add(element);
      if (state.representativeByElement[element] !== set.representative)
        errors.push(`${element}: Repräsentantenzeiger falsch.`);
    }
    const tail = state.elements.find((element) => element.key === set.tail);
    if (tail?.next !== null) errors.push(`${set.tail}: tail.next ist nicht NIL.`);
  }
  for (const element of state.elements) {
    if (!seen.has(element.key)) errors.push(`${element.key}: Element nicht über Liste erreichbar.`);
  }
  return errors;
}

function preflightScore(preflight: UnionFindPreflightAnswers): number {
  const checks = [
    preflight.algorithm === 'union_find_linked_lists',
    preflight.representation === 'linked_lists_with_representative_pointer',
    preflight.startsEmpty,
    preflight.weightedUnion,
    preflight.tieBreaker === 'lexicographically_smaller_representative_is_smaller_set',
    preflight.output === 'checkpoint_sets_representatives_next_size',
    preflight.nextDirection === 'head_to_tail',
    preflight.runtime === 'O(m + n log n)',
  ];
  return ratio(checks.filter(Boolean).length, checks.length, 2);
}

function ratio(points: number, total: number, maximum: number): number {
  return total === 0 ? 0 : (points / total) * maximum;
}

function rounded(value: number): number {
  return Math.round(value * 100) / 100;
}

function recommendationFor(errors: TraceError[], scoreRatio: number): TrainingRecommendation {
  if (errors.some((error) => error.errorCode === 'invalid_algorithm_choice'))
    return {
      code: 'read_foundations',
      label: 'Union-Find-Grundlagen lesen',
      reason: 'Die Listenrepräsentation wurde nicht sicher erkannt.',
    };
  if (errors.some((error) => error.errorCode === 'weighted_union_error'))
    return {
      code: 'repeat_weighted_union',
      label: 'Weighted Union wiederholen',
      reason: 'Die kleinere Liste wurde nicht konsistent an die größere gehängt.',
    };
  if (errors.some((error) => error.errorCode === 'stale_representative_pointer'))
    return {
      code: 'repeat_representatives',
      label: 'Repräsentantenzeiger trainieren',
      reason: 'Nach einer Union zeigen noch Elemente auf den alten Repräsentanten.',
    };
  if (errors.some((error) => error.errorCode === 'next_pointer_error'))
    return {
      code: 'repeat_pointers',
      label: 'next/head/tail trainieren',
      reason: 'Die Listenstruktur ist nicht konsistent aktualisiert.',
    };
  if (errors.some((error) => error.errorCode === 'tie_breaker_error'))
    return {
      code: 'repeat_tie_breaker',
      label: 'Gleichstandsregel wiederholen',
      reason: 'Die lexikographische Regel wurde falsch angewendet.',
    };
  if (scoreRatio >= 0.9)
    return {
      code: 'learning_path_complete',
      label: 'Lernpfad abgeschlossen',
      reason: 'Union-Find-Zustände und Regeln sind belastbar.',
    };
  return {
    code: 'repeat_full_task',
    label: 'Komplette Operationsfolge erneut bearbeiten',
    reason: 'Mehrere Strukturdetails benötigen weitere aktive Evidenz.',
  };
}

function addError(errors: TraceError[], error: TraceError) {
  if (
    !errors.some(
      (candidate) => candidate.errorCode === error.errorCode && candidate.step === error.step,
    )
  )
    errors.push(error);
}

export function scoreUnionFindTrace(
  problemInput: unknown,
  submission: UnionFindSubmission,
): UnionFindScore {
  const problem = validateUnionFindProblem(problemInput);
  const canonicalTrace = computeUnionFindTrace(problem);
  const canonicalByOperation = new Map(
    canonicalTrace.map((state) => [state.operationIndex, state]),
  );
  const userByOperation = new Map(
    submission.checkpoints.map((state) => [state.operationIndex, state]),
  );
  const errors: TraceError[] = [];
  const preflightPoints = preflightScore(submission.preflight);
  if (submission.preflight.algorithm !== 'union_find_linked_lists')
    addError(errors, {
      errorCode: 'invalid_algorithm_choice',
      step: null,
      evidence: 'Preflight: Algorithmus',
      expected: 'Union-Find mit verketteten Listen',
      actual: submission.preflight.algorithm,
      explanation: 'Die Aufgabe verlangt die Listenvariante, nicht Baum/Rank/Pfadkompression.',
      severity: 'schwer',
      topicId: TOPIC_ID,
      recommendedReview: 'Vorlesungsdefinition und Repräsentation wiederholen.',
    });
  if (submission.preflight.runtime !== 'O(m + n log n)')
    addError(errors, {
      errorCode: 'runtime_error',
      step: null,
      evidence: 'Preflight: Laufzeit',
      expected: 'O(m + n log n)',
      actual: submission.preflight.runtime,
      explanation: 'Weighted Union begrenzt die Anzahl der Repräsentantenzeiger-Aktualisierungen.',
      severity: 'mittel',
      topicId: TOPIC_ID,
      recommendedReview: 'Satz 24.1 wiederholen.',
    });

  let partitionTotal = 0;
  let partitionCorrect = 0;
  let representativeTotal = 0;
  let representativeCorrect = 0;
  let orderTotal = 0;
  let orderCorrect = 0;
  let metadataTotal = 0;
  let metadataCorrect = 0;
  let weightedTotal = 0;
  let weightedCorrect = 0;
  let complete = 0;

  for (const operationIndex of problem.checkpoints) {
    const expected = canonicalByOperation.get(operationIndex);
    const user = userByOperation.get(operationIndex);
    if (!expected || !user) continue;
    const actualSets = parseUnionFindStateText(user.stateText);
    const actualState = stateFromSets(operationIndex, actualSets);
    const invariantErrors = validateUnionFindInvariants(actualState);
    if (actualSets.length === 0 || invariantErrors.length > 0)
      addError(errors, {
        errorCode: actualSets.length === 0 ? 'incomplete_state_error' : 'next_pointer_error',
        step: operationIndex,
        evidence: `Zustand nach Schritt ${operationIndex}`,
        expected: serializeUnionFindState(expected),
        actual: user.stateText,
        explanation: invariantErrors[0] ?? 'Der Kontrollpunkt wurde nicht ausgefüllt.',
        severity: 'schwer',
        topicId: TOPIC_ID,
        recommendedReview: 'Liste mit Repräsentant: element>element; ... vollständig eintragen.',
      });

    const expectedGroups = expected.sets
      .map((set) => [...set.orderedElements].sort().join(','))
      .sort();
    const actualGroups = actualSets.map((set) => [...set.orderedElements].sort().join(',')).sort();
    partitionTotal += expectedGroups.length;
    if (JSON.stringify(expectedGroups) === JSON.stringify(actualGroups))
      partitionCorrect += expectedGroups.length;
    else
      addError(errors, {
        errorCode: 'wrong_set_membership',
        step: operationIndex,
        evidence: `Partition nach Schritt ${operationIndex}`,
        expected: expectedGroups,
        actual: actualGroups,
        explanation: 'Mindestens ein Element liegt in der falschen Menge.',
        severity: 'schwer',
        topicId: TOPIC_ID,
        recommendedReview: 'Union-Operationen der Reihe nach neu verfolgen.',
      });

    representativeTotal += expected.elements.length;
    let representativeMatches = 0;
    for (const element of expected.elements) {
      if (actualState.representativeByElement[element.key] === element.representative)
        representativeMatches += 1;
    }
    representativeCorrect += representativeMatches;
    if (representativeMatches !== expected.elements.length)
      addError(errors, {
        errorCode: 'stale_representative_pointer',
        step: operationIndex,
        evidence: `Repräsentantenzeiger nach Schritt ${operationIndex}`,
        expected: expected.representativeByElement,
        actual: actualState.representativeByElement,
        explanation:
          'Nach einer Union müssen alle Elemente der angehängten Liste auf den erhaltenen Repräsentanten zeigen.',
        severity: 'mittel',
        topicId: TOPIC_ID,
        recommendedReview: 'Repräsentantenzeiger der angehängten Liste markieren.',
      });

    orderTotal += expected.sets.length;
    let orderMatches = 0;
    for (const expectedSet of expected.sets) {
      const actualSet = actualSets.find((set) => set.representative === expectedSet.representative);
      if (actualSet?.orderedElements.join('>') === expectedSet.orderedElements.join('>'))
        orderMatches += 1;
    }
    orderCorrect += orderMatches;
    if (orderMatches !== expected.sets.length)
      addError(errors, {
        errorCode: 'list_order_error',
        step: operationIndex,
        evidence: `Listenreihenfolge nach Schritt ${operationIndex}`,
        expected: serializeUnionFindState(expected),
        actual: user.stateText,
        explanation: 'Die Reihenfolge der verketteten Liste bestimmt die next-Zeiger.',
        severity: 'mittel',
        topicId: TOPIC_ID,
        recommendedReview: 'Angehängte Liste bleibt in ihrer Reihenfolge am Ende der Zielliste.',
      });

    metadataTotal += expected.sets.length;
    const metadataMatches = expected.sets.filter((expectedSet) => {
      const actualSet = actualSets.find((set) => set.representative === expectedSet.representative);
      return (
        actualSet?.head === expectedSet.head &&
        actualSet.tail === expectedSet.tail &&
        actualSet.size === expectedSet.size
      );
    }).length;
    metadataCorrect += metadataMatches;
    if (metadataMatches !== expected.sets.length)
      addError(errors, {
        errorCode: 'wrong_head_tail',
        step: operationIndex,
        evidence: `head/tail/size nach Schritt ${operationIndex}`,
        expected: expected.sets.map(({ representative, head, tail, size }) => ({
          representative,
          head,
          tail,
          size,
        })),
        actual: actualSets.map(({ representative, head, tail, size }) => ({
          representative,
          head,
          tail,
          size,
        })),
        explanation: 'head, tail und size müssen aus der Liste ablesbar konsistent sein.',
        severity: 'mittel',
        topicId: TOPIC_ID,
        recommendedReview: 'Nach Union tail der Zielmenge und size aktualisieren.',
      });

    if (expected.attachedList) {
      weightedTotal += 1;
      const expectedAttach = expectedAttachedText(expected);
      if (normalizeAttached(user.attachedList) === normalizeAttached(expectedAttach))
        weightedCorrect += 1;
      else
        addError(errors, {
          errorCode: expected.attachedList.reason.startsWith('Gleichstand')
            ? 'tie_breaker_error'
            : 'weighted_union_error',
          step: operationIndex,
          evidence: `Angehängte Liste bei Schritt ${operationIndex}`,
          expected: expectedAttach,
          actual: user.attachedList,
          explanation: expected.attachedList.reason,
          severity: 'schwer',
          topicId: TOPIC_ID,
          recommendedReview:
            'Erst Größen vergleichen, bei Gleichstand lexikographische Regel anwenden.',
        });
    }
    if (actualSets.length > 0) complete += 1;
  }

  const rubricResults: RubricResult[] = [
    {
      criterionId: 'preflight',
      label: 'Repräsentation, Weighted Union und Tie-Breaker erkannt',
      points: rounded(preflightPoints),
      maxPoints: 2,
    },
    {
      criterionId: 'partition',
      label: 'Mengenpartition nach jedem Kontrollpunkt korrekt',
      points: rounded(ratio(partitionCorrect, partitionTotal, 2)),
      maxPoints: 2,
    },
    {
      criterionId: 'representatives',
      label: 'Repräsentanten und Repräsentantenzeiger korrekt',
      points: rounded(ratio(representativeCorrect, representativeTotal, 2)),
      maxPoints: 2,
    },
    {
      criterionId: 'list_order',
      label: 'Listenreihenfolge und next-Zeiger korrekt',
      points: rounded(ratio(orderCorrect, orderTotal, 2)),
      maxPoints: 2,
    },
    {
      criterionId: 'metadata',
      label: 'head, tail und size konsistent',
      points: rounded(ratio(metadataCorrect, metadataTotal, 1)),
      maxPoints: 1,
    },
    {
      criterionId: 'weighted_union',
      label: 'Angehängte Liste und Gleichstandsregel korrekt',
      points: rounded(ratio(weightedCorrect, weightedTotal, 2)),
      maxPoints: 2,
    },
    {
      criterionId: 'complete_checkpoints',
      label: 'Alle geforderten Zwischenzustände vollständig',
      points: rounded(ratio(complete, problem.checkpoints.length, 1)),
      maxPoints: 1,
    },
  ];
  const rawPoints = rounded(rubricResults.reduce((sum, result) => sum + result.points, 0));
  const completenessCap = errors.some((error) => error.errorCode === 'incomplete_state_error')
    ? MAX_POINTS * 0.8
    : MAX_POINTS;
  const revealCap = submission.solutionRevealed ? MAX_POINTS * 0.7 : MAX_POINTS;
  const points = rounded(Math.min(rawPoints, completenessCap, revealCap));
  return {
    points,
    maxPoints: MAX_POINTS,
    rawPoints,
    rubricResults,
    errors,
    recommendation: recommendationFor(errors, points / MAX_POINTS),
    canonicalTrace,
  };
}

export function canonicalUnionFindInput(
  problem: UnionFindTracingProblem,
): UnionFindUserCheckpoint[] {
  return computeUnionFindTrace(problem).map((state) => ({
    operationIndex: state.operationIndex,
    stateText: serializeUnionFindState(state),
    attachedList: expectedAttachedText(state),
  }));
}

export function deriveUnionFindMastery(attempts: MasteryEvidenceAttempt[]) {
  const relevant = attempts.filter((attempt) => attempt.maxScore > 0);
  const criterion = (attempt: MasteryEvidenceAttempt, id: string) => {
    const result = attempt.rubricResults.find((entry) => entry.criterionId === id);
    return result && result.maxPoints > 0 ? result.points / result.maxPoints : 0;
  };
  const modeWeight = { practice: 0.7, exam: 1, review: 0.8 } as const;
  const weighted = (selector: (attempt: MasteryEvidenceAttempt) => number) => {
    let numerator = 0;
    let denominator = 0;
    for (const attempt of relevant) {
      const disclosure = attempt.solutionRevealed
        ? 0.55
        : Math.max(0.75, 1 - attempt.hintsUsed.length * 0.08);
      const weight = modeWeight[attempt.mode] * disclosure;
      numerator += selector(attempt) * weight;
      denominator += weight;
    }
    const evidenceLimit = Math.min(0.9, 0.4 + relevant.length * 0.15);
    return rounded((denominator ? numerator / denominator : 0) * evidenceLimit);
  };
  const dimensions = {
    recognition: weighted((attempt) => criterion(attempt, 'preflight')),
    tracing: weighted((attempt) => attempt.score / attempt.maxScore),
    rule_application: weighted((attempt) => criterion(attempt, 'weighted_union')),
    representation_accuracy: weighted((attempt) => criterion(attempt, 'partition')),
    tie_breaking: weighted((attempt) => criterion(attempt, 'weighted_union')),
    consistency: weighted((attempt) => criterion(attempt, 'complete_checkpoints')),
    correctness_understanding: weighted((attempt) => criterion(attempt, 'representatives')),
    runtime_knowledge: weighted((attempt) => criterion(attempt, 'preflight')),
    timed_performance: weighted((attempt) =>
      attempt.mode === 'exam'
        ? Math.min(
            1,
            (attempt.score / attempt.maxScore) * (attempt.durationMs <= 12 * 60_000 ? 1 : 0.8),
          )
        : 0,
    ),
    set_representation: weighted((attempt) => criterion(attempt, 'partition')),
    weighted_union: weighted((attempt) => criterion(attempt, 'weighted_union')),
    pointer_updates: weighted((attempt) => criterion(attempt, 'list_order')),
    representative_updates: weighted((attempt) => criterion(attempt, 'representatives')),
  };
  const syntheticErrors: TraceError[] = relevant
    .flatMap((attempt) => attempt.errorCodes as TrainingErrorCode[])
    .map((errorCode) => ({
      errorCode,
      step: null,
      evidence: 'gespeicherter Versuch',
      expected: null,
      actual: null,
      explanation: 'Aus Versuch übernommen.',
      severity: 'mittel',
      topicId: TOPIC_ID,
      recommendedReview: 'Gezielt wiederholen.',
    }));
  return {
    dimensions,
    evidenceAttemptIds: relevant.map((attempt) => attempt.id),
    contentVersions: [...new Set(relevant.map((attempt) => attempt.contentVersion))],
    recommendation: recommendationFor(syntheticErrors, dimensions.tracing),
  };
}
