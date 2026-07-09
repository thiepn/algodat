import {
  DiagnosticAnswerSchema,
  DiagnosticItemSchema,
  DiagnosticItemsFileSchema,
  DiagnosticSessionConfigSchema,
  DiagnosticSessionSchema,
  FoundationCompetencySchema,
  FoundationCompetenciesFileSchema,
  type DiagnosticAnswer,
  type DiagnosticError,
  type DiagnosticCompetencyResult,
  type DiagnosticItem,
  type DiagnosticItemResult,
  type DiagnosticRecommendation,
  type DiagnosticSession,
  type DiagnosticSessionConfig,
  type FoundationCompetency,
} from './schemas';
import type { DiagnosticErrorCode, DiagnosticMasteryV13 } from './types';

const engineVersion = 'foundations-diagnostic-v1';
const schemaVersion = '1.0.0';

export function validateFoundationCompetency(input: unknown): FoundationCompetency {
  return FoundationCompetencySchema.parse(input);
}

export function validateDiagnosticItem(input: unknown): DiagnosticItem {
  return DiagnosticItemSchema.parse(input);
}

export function validateItemBank(input: unknown): DiagnosticItem[] {
  const items = DiagnosticItemsFileSchema.parse(input);
  const ids = new Set<string>();
  for (const item of items) {
    if (ids.has(item.id)) throw new Error(`Doppelte Item-ID: ${item.id}`);
    ids.add(item.id);
    if (item.publicDistributionStatus !== 'public_safe')
      throw new Error(`${item.id}: nicht public-safe.`);
    if (item.solutionValidationStatus !== 'deterministic_engine_verified')
      throw new Error(`${item.id}: Lösung nicht deterministisch validiert.`);
  }
  return items;
}

export function validateCompetencyBank(input: unknown): FoundationCompetency[] {
  const competencies = FoundationCompetenciesFileSchema.parse(input);
  const ids = new Set<string>();
  for (const competency of competencies) {
    if (ids.has(competency.competencyId))
      throw new Error(`Doppelte Kompetenz-ID: ${competency.competencyId}`);
    ids.add(competency.competencyId);
  }
  return competencies;
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededSort<T extends { id: string }>(values: T[], seed: string): T[] {
  return [...values].sort((left, right) => {
    const a = hashSeed(`${seed}:${left.id}`);
    const b = hashSeed(`${seed}:${right.id}`);
    return a === b ? left.id.localeCompare(right.id, 'de') : a - b;
  });
}

export function selectDiagnosticItems(
  items: DiagnosticItem[],
  config: DiagnosticSessionConfig,
): DiagnosticItem[] {
  const parsed = DiagnosticSessionConfigSchema.parse(config);
  const targetSet = new Set(parsed.competencyTargets);
  const candidates = items.filter(
    (item) => targetSet.size === 0 || item.competencyIds.some((id) => targetSet.has(id)),
  );
  if (candidates.length === 0) throw new Error('Keine Diagnoseitems für diese Auswahl verfügbar.');

  const grouped = new Map<string, DiagnosticItem[]>();
  for (const item of candidates) {
    const key = item.competencyIds[0] ?? 'unknown';
    grouped.set(key, [...(grouped.get(key) ?? []), item]);
  }

  const selected: DiagnosticItem[] = [];
  const groupIds = seededSort(
    [...grouped.keys()].map((id) => ({ id })),
    parsed.seed,
  ).map((entry) => entry.id);
  let round = 0;
  while (selected.length < parsed.itemCount && selected.length < candidates.length) {
    for (const groupId of groupIds) {
      const bucket = seededSort(grouped.get(groupId) ?? [], `${parsed.seed}:${round}`);
      const next = bucket.find((item) => !selected.some((chosen) => chosen.id === item.id));
      if (next) selected.push(next);
      if (selected.length >= parsed.itemCount) break;
    }
    round += 1;
  }
  return selected;
}

export function createDiagnosticSession(
  items: DiagnosticItem[],
  config: DiagnosticSessionConfig,
  now = new Date().toISOString(),
): DiagnosticSession {
  const parsed = DiagnosticSessionConfigSchema.parse(config);
  const selected = selectDiagnosticItems(items, parsed);
  return DiagnosticSessionSchema.parse({
    id: `diagnostic-${parsed.mode}-${hashSeed(`${parsed.seed}:${now}`).toString(16)}`,
    schemaVersion,
    sessionType: 'foundations_diagnostic',
    configVersion: 'diagnostic-session-config-v1',
    itemBankVersion: items[0]?.contentVersion ?? 'unknown',
    masteryModelVersion: 'mastery-v13',
    seed: parsed.seed,
    mode: parsed.mode,
    competencyTargets: parsed.competencyTargets,
    itemIds: selected.map((item) => item.id),
    currentItemIndex: 0,
    responses: {},
    confidenceResponses: {},
    startedAt: now,
    updatedAt: now,
    completedAt: null,
    durationMs: 0,
    itemResults: [],
    competencyResults: [],
    errors: [],
    recommendations: [],
    finalScore: { points: 0, maxPoints: 0 },
  });
}

function sameSet(left: string[], right: string[]): boolean {
  const a = new Set(left);
  const b = new Set(right);
  return a.size === b.size && [...a].every((value) => b.has(value));
}

function countMatches(left: string[], right: string[]): number {
  const expected = new Set(right);
  return left.filter((value) => expected.has(value)).length;
}

export function computeDiagnosticPartialCredit(
  item: DiagnosticItem,
  answer: DiagnosticAnswer,
): { points: number; completeness: number; reasoningSelection: number } {
  const max = item.rubric.maxPoints;
  const expectedOptions = item.answerDefinition.correctOptionIds ?? [];
  const selectedOptions = answer.selectedOptionIds ?? [];
  if (item.itemType === 'single_choice' || item.itemType === 'complexity_classification') {
    const correct = sameSet(selectedOptions, expectedOptions);
    return { points: correct ? max : 0, completeness: correct ? 1 : 0, reasoningSelection: 1 };
  }
  if (item.itemType === 'true_false_reason') {
    const statement = selectedOptions.includes(expectedOptions[0] ?? '');
    const reason = selectedOptions.includes(item.answerDefinition.correctReasonId ?? '');
    const points = (statement ? max / 2 : 0) + (reason ? max / 2 : 0);
    return { points, completeness: points / max, reasoningSelection: reason ? 1 : 0 };
  }
  if (item.itemType === 'multiple_choice') {
    const correctSelected = countMatches(selectedOptions, expectedOptions);
    const falseSelected = selectedOptions.filter((id) => !expectedOptions.includes(id)).length;
    const raw = (correctSelected / Math.max(1, expectedOptions.length)) * max - falseSelected;
    const exact = sameSet(selectedOptions, expectedOptions);
    return {
      points: exact ? max : Math.max(0, Math.min(max - 0.5, raw)),
      completeness: correctSelected / Math.max(1, expectedOptions.length),
      reasoningSelection: falseSelected === 0 ? 1 : 0.4,
    };
  }
  if (item.itemType === 'matching') {
    const expectedPairs = item.answerDefinition.correctPairs ?? {};
    const selectedPairs = answer.selectedPairs ?? {};
    const total = Object.keys(expectedPairs).length;
    const correct = Object.entries(expectedPairs).filter(
      ([left, right]) => selectedPairs[left] === right,
    ).length;
    return {
      points: total === 0 ? 0 : (correct / total) * max,
      completeness: total === 0 ? 0 : correct / total,
      reasoningSelection: 1,
    };
  }
  if (item.itemType === 'ordering') {
    const expected = item.answerDefinition.correctOrderIds ?? [];
    const actual = answer.orderedIds ?? [];
    const pairs = Math.max(1, expected.length - 1);
    let correctPairs = 0;
    for (let index = 0; index < expected.length - 1; index += 1) {
      const left = expected[index];
      const right = expected[index + 1];
      const actualLeft = actual.indexOf(left ?? '');
      const actualRight = actual.indexOf(right ?? '');
      if (actualLeft >= 0 && actualRight === actualLeft + 1) correctPairs += 1;
    }
    return {
      points: (correctPairs / pairs) * max,
      completeness: correctPairs / pairs,
      reasoningSelection: 1,
    };
  }
  if (item.itemType === 'numeric_short_answer') {
    const numeric = Number(answer.numericValue);
    const expected = item.answerDefinition.numericAnswer ?? Number.NaN;
    const tolerance = item.answerDefinition.tolerance ?? 0;
    const correct = Number.isFinite(numeric) && Math.abs(numeric - expected) <= tolerance;
    return { points: correct ? max : 0, completeness: correct ? 1 : 0, reasoningSelection: 1 };
  }
  if (item.itemType === 'algorithm_selection') {
    const correct = answer.algorithmId === item.answerDefinition.correctAlgorithmId;
    return {
      points: correct ? max : 0,
      completeness: correct ? 1 : 0,
      reasoningSelection: correct ? 1 : 0,
    };
  }
  return { points: 0, completeness: 0, reasoningSelection: 0 };
}

function errorCodeForItem(item: DiagnosticItem, selectedOptionIds: string[]): DiagnosticErrorCode {
  const firstMisconception = item.options.find(
    (option) => selectedOptionIds.includes(option.id) && option.misconceptionId,
  );
  const category = firstMisconception?.distractorCategory ?? item.misconceptionIds[0] ?? '';
  if (item.itemType === 'multiple_choice') {
    const expected = item.answerDefinition.correctOptionIds ?? [];
    if (selectedOptionIds.some((id) => !expected.includes(id))) return 'over_selection_error';
    return 'under_selection_error';
  }
  if (/best_vs_worst/u.test(category)) return 'best_worst_case_confusion';
  if (/stable_vs_in_place/u.test(category)) return 'sorting_stability_error';
  if (/directed_vs_undirected/u.test(category)) return 'graph_type_error';
  if (/shortest_path/u.test(category)) return 'shortest_path_precondition_error';
  if (/mst_shortest_path/u.test(category)) return 'mst_shortest_path_confusion';
  if (/bst_vs_heap/u.test(category)) return 'bst_vs_heap_confusion';
  if (/algorithm_mixup/u.test(category)) return 'dp_dnc_confusion';
  if (/result_vs_proof/u.test(category)) return 'correctness_runtime_confusion';
  if (/notation/u.test(category)) return 'recurrence_form_error';
  if (item.competencyIds.includes('foundation-asymptotics')) return 'asymptotic_notation_error';
  if (item.competencyIds.includes('foundation-recurrences')) return 'master_theorem_case_error';
  if (item.competencyIds.includes('foundation-sorting-search')) return 'search_precondition_error';
  if (item.competencyIds.includes('foundation-data-structures'))
    return 'data_structure_operation_error';
  if (item.competencyIds.includes('foundation-graph-basics')) return 'graph_connectivity_error';
  if (item.competencyIds.includes('foundation-graph-algorithms'))
    return 'shortest_path_algorithm_error';
  if (item.competencyIds.includes('foundation-paradigms')) return 'greedy_dp_confusion';
  if (item.competencyIds.includes('foundation-proofs')) return 'proof_method_error';
  return 'manual_review_recommended';
}

export function classifyDiagnosticErrors(
  item: DiagnosticItem,
  answer: DiagnosticAnswer,
  points: number,
): DiagnosticError[] {
  if (points === item.rubric.maxPoints) return [];
  const selectedOptionIds = answer.selectedOptionIds ?? [];
  const selected = item.options.filter((option) => selectedOptionIds.includes(option.id));
  const misconception =
    selected.find((option) => option.misconceptionId) ??
    item.options.find((option) => !option.correct);
  return [
    {
      errorCode: errorCodeForItem(item, selectedOptionIds),
      itemId: item.id,
      competencyIds: item.competencyIds,
      selectedAnswer: answer,
      expectedAnswer: item.answerDefinition,
      evidence: selected.map((option) => option.text).join(' · ') || 'Antwort unvollständig.',
      misconceptionId: misconception?.misconceptionId ?? 'incomplete-answer',
      sourceRefs: item.sourceRefs,
      severity: points === 0 ? 'schwer' : 'mittel',
      rootCauseErrorId: null,
      masteryDimensions: item.competencyIds,
      relatedTrainerIds: item.relatedTrainerIds,
      recommendedReviewActivity: misconception?.remediationTarget ?? 'Grundlagenitem wiederholen.',
    },
  ];
}

export function gradeDiagnosticItem(
  item: DiagnosticItem,
  answerInput: DiagnosticAnswer,
  elapsedSeconds = item.estimatedSeconds,
): DiagnosticItemResult {
  const answer = DiagnosticAnswerSchema.parse(answerInput);
  if (answer.itemId !== item.id) throw new Error('Antwort gehört nicht zum Item.');
  const partial = computeDiagnosticPartialCredit(item, answer);
  const points = Math.round(partial.points * 100) / 100;
  const errors = classifyDiagnosticErrors(item, answer, points);
  return {
    itemId: item.id,
    competencyIds: item.competencyIds,
    itemType: item.itemType,
    points,
    maxPoints: item.rubric.maxPoints,
    correct: points === item.rubric.maxPoints,
    completeness: partial.completeness,
    reasoningSelection: partial.reasoningSelection,
    confidence: answer.confidence,
    timeEfficiency: Math.max(0, Math.min(1, item.estimatedSeconds / Math.max(1, elapsedSeconds))),
    errors,
  };
}

export function calculateDiagnosticConfidence(results: DiagnosticItemResult[]): number {
  if (results.length === 0) return 0;
  const calibration =
    results.reduce((sum, result) => {
      const expected = result.confidence / 5;
      const actual = result.correct ? 1 : 0;
      return sum + (1 - Math.abs(expected - actual));
    }, 0) / results.length;
  return Math.round(calibration * 100) / 100;
}

export function aggregateCompetencyResults(
  competencies: FoundationCompetency[],
  results: DiagnosticItemResult[],
): DiagnosticCompetencyResult[] {
  return competencies
    .map((competency) => {
      const relevant = results.filter((result) =>
        result.competencyIds.includes(competency.competencyId),
      );
      const points = relevant.reduce((sum, result) => sum + result.points, 0);
      const maxPoints = relevant.reduce((sum, result) => sum + result.maxPoints, 0);
      const misconceptionIds = [
        ...new Set(
          relevant.flatMap((result) => result.errors.map((error) => error.misconceptionId)),
        ),
      ];
      return {
        competencyId: competency.competencyId,
        title: competency.title,
        points: Math.round(points * 100) / 100,
        maxPoints: Math.round(maxPoints * 100) / 100,
        scoreRatio: maxPoints > 0 ? Math.round((points / maxPoints) * 100) / 100 : 0,
        evidenceCount: relevant.length,
        confidence: calculateDiagnosticConfidence(relevant),
        misconceptionIds,
        relatedTrainerIds: competency.relatedTrainerIds,
      };
    })
    .filter((result) => result.evidenceCount > 0);
}

export function recommendDeepTrainer(
  competencies: FoundationCompetency[],
  competencyResults: DiagnosticCompetencyResult[],
): DiagnosticRecommendation[] {
  return competencyResults
    .filter((result) => result.scoreRatio < 0.8)
    .flatMap((result, index) => {
      const competency = competencies.find(
        (candidate) => candidate.competencyId === result.competencyId,
      );
      const trainerId = competency?.relatedTrainerIds[0];
      return [
        {
          id: `recommendation-${result.competencyId}`,
          priority: index + 1,
          label: trainerId ? 'Tiefen Trainer öffnen' : 'Grundlagen wiederholen',
          reason: `${result.title}: ${Math.round(result.scoreRatio * 100)} % bei ${result.evidenceCount} Items.`,
          targetType: trainerId ? ('trainer' as const) : ('review' as const),
          targetId: trainerId ?? result.competencyId,
        },
      ];
    });
}

export function recommendReviewItems(results: DiagnosticItemResult[]): DiagnosticRecommendation[] {
  return results
    .filter((result) => !result.correct)
    .slice(0, 5)
    .map((result, index) => ({
      id: `review-${result.itemId}`,
      priority: index + 10,
      label: 'Kurzitem wiederholen',
      reason:
        result.errors[0]?.recommendedReviewActivity ?? 'Fehlerhaftes Item gezielt wiederholen.',
      targetType: 'review',
      targetId: result.itemId,
    }));
}

export function finalizeDiagnosticSession(
  session: DiagnosticSession,
  items: DiagnosticItem[],
  competencies: FoundationCompetency[],
  now = new Date().toISOString(),
): DiagnosticSession {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const results = session.itemIds.flatMap((itemId) => {
    const item = itemMap.get(itemId);
    const answer = session.responses[itemId];
    if (!item || !answer) return [];
    return [gradeDiagnosticItem(item, answer)];
  });
  const competencyResults = aggregateCompetencyResults(competencies, results);
  const recommendations = [
    ...recommendDeepTrainer(competencies, competencyResults),
    ...recommendReviewItems(results),
  ].sort((left, right) => left.priority - right.priority);
  const points = results.reduce((sum, result) => sum + result.points, 0);
  const maxPoints = results.reduce((sum, result) => sum + result.maxPoints, 0);
  return DiagnosticSessionSchema.parse({
    ...session,
    updatedAt: now,
    completedAt: now,
    durationMs: Math.max(session.durationMs, Date.parse(now) - Date.parse(session.startedAt)),
    currentItemIndex: session.itemIds.length,
    itemResults: results,
    competencyResults,
    errors: results.flatMap((result) => result.errors),
    recommendations,
    finalScore: {
      points: Math.round(points * 100) / 100,
      maxPoints: Math.round(maxPoints * 100) / 100,
    },
  });
}

export function restoreDiagnosticSession(input: unknown): DiagnosticSession {
  return DiagnosticSessionSchema.parse(input);
}

export function generateDeterministicDiagnosticVariant(
  item: DiagnosticItem,
  seed: string,
): DiagnosticItem {
  return {
    ...item,
    options: seededSort(item.options, seed),
  };
}

export function deriveDiagnosticMasteryV13(sessions: DiagnosticSession[]): DiagnosticMasteryV13 {
  const completed = sessions.filter((session) => session.completedAt);
  const dimensions: Record<string, number> = {};
  for (const result of completed.flatMap((session) => session.competencyResults)) {
    const current = dimensions[result.competencyId] ?? 0;
    const evidenceBoost = Math.min(1, result.evidenceCount / 4);
    dimensions[result.competencyId] = Math.max(current, result.scoreRatio * evidenceBoost);
  }
  return {
    evidenceSessionIds: completed.map((session) => session.id),
    dimensions,
  };
}

export function emptyDiagnosticAnswer(item: DiagnosticItem): DiagnosticAnswer {
  return {
    itemId: item.id,
    selectedOptionIds: [],
    selectedPairs: {},
    orderedIds: [],
    confidence: 3,
    answeredAt: new Date().toISOString(),
  };
}

export const foundationsDiagnosticEngineVersion = engineVersion;
