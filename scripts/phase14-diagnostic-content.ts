import {
  DiagnosticItemsFileSchema,
  DiagnosticMisconceptionsFileSchema,
  DiagnosticRecommendationRulesFileSchema,
  DiagnosticSessionTemplatesFileSchema,
  FoundationCompetenciesFileSchema,
  type DiagnosticItem,
  type FoundationCompetency,
} from '../src/domain/foundations-diagnostic/schemas';

interface InventoryFile {
  competencies: FoundationCompetency[];
}

interface GroupSpec {
  group: string;
  correctLabel: string;
  wrongLabels: string[];
  matchingPairs: Array<[string, string]>;
  order: string[];
  numericPrompt: string;
  numericAnswer: number;
  algorithmPrompt: string;
  algorithmCorrect: string;
  algorithmOptions: string[];
  complexityPrompt: string;
  complexityCorrect: string;
  complexityOptions: string[];
  primaryErrorCode: string;
}

const specs: Record<string, GroupSpec> = {
  asymptotics: {
    group: 'asymptotics',
    correctLabel: 'Worst-Case-Analyse betrachtet den ungünstigsten zulässigen Eingabefall.',
    wrongLabels: [
      'O-Notation ist immer eine exakte Schranke.',
      'Konstante Faktoren dominieren asymptotisch.',
    ],
    matchingPairs: [
      ['O', 'obere asymptotische Schranke'],
      ['Worst Case', 'ungünstigster zulässiger Eingabefall'],
    ],
    order: ['konstant', 'logarithmisch', 'linear', 'polynomiell', 'exponentiell'],
    numericPrompt: 'Wie viele führende Terme bestimmen bei n^2 + 3n + 7 die asymptotische Klasse?',
    numericAnswer: 1,
    algorithmPrompt: 'Welche Analyse passt zu „ungünstigster zulässiger Eingabefall“?',
    algorithmCorrect: 'worst_case',
    algorithmOptions: ['worst_case', 'best_case', 'zufallsfall'],
    complexityPrompt: 'Klassifiziere n^2 + 3n + 7.',
    complexityCorrect: 'quadratisch',
    complexityOptions: ['linear', 'quadratisch', 'exponentiell'],
    primaryErrorCode: 'asymptotic_notation_error',
  },
  recurrences: {
    group: 'recurrences',
    correctLabel: 'Eine Rekurrenz beschreibt eine Laufzeit über kleinere Teilproblemgrößen.',
    wrongLabels: [
      'Master-Theorem gilt ohne Formprüfung immer.',
      'Rekursionsbäume ersetzen die Kostenaddition.',
    ],
    matchingPairs: [
      ['a', 'Anzahl rekursiver Teilprobleme'],
      ['b', 'Faktor der Teilproblemverkleinerung'],
    ],
    order: ['Rekurrenzform lesen', 'Parameter bestimmen', 'Terme vergleichen', 'Fall begründen'],
    numericPrompt: 'Welchen Wert hat a in T(n)=2T(n/2)+n?',
    numericAnswer: 2,
    algorithmPrompt: 'Welche Methode passt zur Fallklassifikation von T(n)=aT(n/b)+f(n)?',
    algorithmCorrect: 'master_theorem',
    algorithmOptions: ['master_theorem', 'binary_search', 'prim'],
    complexityPrompt: 'Klassifiziere T(n)=2T(n/2)+O(1) grob.',
    complexityCorrect: 'linear',
    complexityOptions: ['logarithmisch', 'linear', 'exponentiell'],
    primaryErrorCode: 'master_theorem_case_error',
  },
  sorting_search: {
    group: 'sorting_search',
    correctLabel: 'Binäre Suche setzt eine sortierte Suchmenge voraus.',
    wrongLabels: ['Binäre Suche funktioniert ohne Ordnung.', 'MergeSort ist ein Greedy-Verfahren.'],
    matchingPairs: [
      ['Binäre Suche', 'sortierte Suchmenge vorausgesetzt'],
      ['MergeSort', 'Divide-and-Conquer-Sortieren'],
    ],
    order: ['Intervall prüfen', 'Mitte wählen', 'Vergleich auswerten', 'Intervall halbieren'],
    numericPrompt: 'Wie viele Hälften bleiben nach einem Binärsuche-Vergleich aktiv?',
    numericAnswer: 1,
    algorithmPrompt: 'Welches Verfahren passt zu einer sortierten Folge und Intervallhalbierung?',
    algorithmCorrect: 'binary_search',
    algorithmOptions: ['binary_search', 'union_find', 'floyd_warshall'],
    complexityPrompt: 'Klassifiziere die typische Halbierungssuche grob.',
    complexityCorrect: 'logarithmisch',
    complexityOptions: ['konstant', 'logarithmisch', 'quadratisch'],
    primaryErrorCode: 'search_precondition_error',
  },
  data_structures: {
    group: 'data_structures',
    correctLabel: 'Union-Find verwaltet disjunkte Mengen über Make-Set, Find und Union.',
    wrongLabels: ['Queues arbeiten nach LIFO.', 'Ein Heap ist dasselbe wie ein binärer Suchbaum.'],
    matchingPairs: [
      ['Stack', 'LIFO'],
      ['Queue', 'FIFO'],
    ],
    order: ['Make-Set', 'Find', 'Union', 'Repräsentanten prüfen'],
    numericPrompt: 'Wie viele Grundoperationen nennt die Union-Find-Kurzbeschreibung?',
    numericAnswer: 3,
    algorithmPrompt: 'Welche Datenstruktur passt zu disjunkten Mengen?',
    algorithmCorrect: 'union_find',
    algorithmOptions: ['union_find', 'queue', 'heap'],
    complexityPrompt: 'Klassifiziere O(log n) als Laufzeitfamilie.',
    complexityCorrect: 'logarithmisch',
    complexityOptions: ['konstant', 'logarithmisch', 'exponentiell'],
    primaryErrorCode: 'data_structure_operation_error',
  },
  graph_basics: {
    group: 'graph_basics',
    correctLabel: 'Graphaufgaben unterscheiden gerichtete und ungerichtete Graphen.',
    wrongLabels: [
      'Negative Kante und negativer Kreis bedeuten dasselbe.',
      'Ein Spannbaum darf Kreise enthalten.',
    ],
    matchingPairs: [
      ['gerichtet', 'Kanten besitzen Richtung'],
      ['ungerichtet', 'Kanten besitzen keine Richtung'],
    ],
    order: ['Graphart lesen', 'Gewichte prüfen', 'Zusammenhang prüfen', 'Problemklasse wählen'],
    numericPrompt: 'Wie viele Richtungsvarianten nennt die gerichtete/ungerichtete Unterscheidung?',
    numericAnswer: 2,
    algorithmPrompt: 'Welche Struktur verbindet alle Knoten ohne Kreis?',
    algorithmCorrect: 'spanning_tree',
    algorithmOptions: ['spanning_tree', 'negative_cycle', 'priority_queue'],
    complexityPrompt:
      'Klassifiziere die Prüfung „gerichtet oder ungerichtet“ als Modellentscheidung.',
    complexityCorrect: 'graphmodell',
    complexityOptions: ['graphmodell', 'sortierlaufzeit', 'rekurrenzfall'],
    primaryErrorCode: 'graph_type_error',
  },
  graph_algorithms: {
    group: 'graph_algorithms',
    correctLabel: 'Prim und Kruskal lösen MST-Probleme, nicht allgemeine kürzeste-Wege-Probleme.',
    wrongLabels: [
      'Dijkstra ist für negative Kanten immer die richtige Wahl.',
      'Floyd-Warshall ist ein MST-Verfahren.',
    ],
    matchingPairs: [
      ['Dijkstra', 'Single-Source kürzeste Wege unter passenden Voraussetzungen'],
      ['Prim', 'minimaler Spannbaum'],
    ],
    order: [
      'Problemklasse lesen',
      'Kantengewichte prüfen',
      'Voraussetzungen prüfen',
      'Algorithmus wählen',
    ],
    numericPrompt: 'Wie viele Problemklassen werden hier unterschieden: MST und kürzeste Wege?',
    numericAnswer: 2,
    algorithmPrompt: 'Welcher Algorithmus passt zu paarweisen kürzesten Wegen als Matrixverfahren?',
    algorithmCorrect: 'floyd_warshall',
    algorithmOptions: ['floyd_warshall', 'prim', 'kruskal'],
    complexityPrompt: 'Klassifiziere ein MST-Problem fachlich.',
    complexityCorrect: 'spannbaum',
    complexityOptions: ['spannbaum', 'single_source_shortest_path', 'sortierung'],
    primaryErrorCode: 'mst_shortest_path_confusion',
  },
  paradigms: {
    group: 'paradigms',
    correctLabel: 'Divide-and-Conquer zerlegt in Teilprobleme und kombiniert deren Ergebnisse.',
    wrongLabels: [
      'DP und D&C sind immer identisch.',
      'Greedy benötigt nie einen Korrektheitsbeweis.',
    ],
    matchingPairs: [
      ['DP', 'überlappende Teilprobleme und Zustände'],
      ['D&C', 'zerlegen und kombinieren'],
    ],
    order: [
      'Problemstruktur erkennen',
      'Paradigma wählen',
      'Algorithmus formulieren',
      'Korrektheit begründen',
    ],
    numericPrompt:
      'Wie viele Bestandteile nennt die Entwurfsaufgabe: Idee, Algorithmus, Laufzeit, Korrektheit?',
    numericAnswer: 4,
    algorithmPrompt:
      'Welches Paradigma passt zu überlappenden Teilproblemen mit gespeicherten Zuständen?',
    algorithmCorrect: 'dynamic_programming',
    algorithmOptions: ['dynamic_programming', 'divide_and_conquer', 'greedy'],
    complexityPrompt: 'Klassifiziere „zerlegen und kombinieren“ als Paradigma.',
    complexityCorrect: 'divide_and_conquer',
    complexityOptions: ['divide_and_conquer', 'queue', 'shortest_path'],
    primaryErrorCode: 'dp_dnc_confusion',
  },
  proofs: {
    group: 'proofs',
    correctLabel: 'Korrektheitsbeweis und Laufzeitanalyse beantworten unterschiedliche Fragen.',
    wrongLabels: [
      'Eine Laufzeitangabe beweist automatisch Korrektheit.',
      'Ein Invariantenbeweis braucht keine Erhaltung.',
    ],
    matchingPairs: [
      ['Initialisierung', 'Invariante gilt vor dem ersten Schritt'],
      ['Erhaltung', 'Invariante bleibt nach einem Schritt gültig'],
    ],
    order: ['Behauptung formulieren', 'Basis prüfen', 'Voraussetzung nutzen', 'Schritt zeigen'],
    numericPrompt: 'Wie viele Kernteile besitzt die Induktion hier: Basis, Voraussetzung, Schritt?',
    numericAnswer: 3,
    algorithmPrompt: 'Welche Beweismethode passt zu Schleifen?',
    algorithmCorrect: 'loop_invariant',
    algorithmOptions: ['loop_invariant', 'mst_algorithm', 'hash_probe'],
    complexityPrompt: 'Klassifiziere „Korrektheit statt Kosten“.',
    complexityCorrect: 'beweisziel',
    complexityOptions: ['beweisziel', 'laufzeitklasse', 'datenstruktur'],
    primaryErrorCode: 'correctness_runtime_confusion',
  },
};

function option(
  id: string,
  text: string,
  correct: boolean,
  competency: FoundationCompetency,
): DiagnosticItem['options'][number] {
  const misconception = competency.commonMisconceptions[correct ? 0 : id.endsWith('a') ? 0 : 1];
  return {
    id,
    text,
    correct,
    misconceptionId: correct ? undefined : misconception?.misconceptionId,
    distractorCategory: correct ? undefined : misconception?.category,
    reasonIncorrect: correct ? undefined : misconception?.description,
    diagnosticValue: correct
      ? undefined
      : 'Dieser Distraktor identifiziert eine typische Kurzaufgabenfalle.',
    remediationTarget: correct ? undefined : misconception?.remediationTarget,
    sourceRefs: competency.sourceRefs,
  };
}

function baseItem(
  competency: FoundationCompetency,
  itemType: DiagnosticItem['itemType'],
  contentVersion: string,
  index: number,
): Omit<DiagnosticItem, 'id' | 'prompt' | 'options' | 'answerDefinition' | 'rubric'> {
  return {
    schemaVersion: '1.0.0',
    contentVersion,
    competencyIds: [competency.competencyId],
    topicIds: competency.topicIds,
    examTaskNumbers: competency.examTaskNumbers,
    difficulty: index < 4 ? 'leicht' : 'mittel',
    itemType,
    feedbackRules: [
      {
        id: 'feedback-rule',
        level: 2,
        message: `${competency.title}: nutze die belegte Definition und prüfe die Voraussetzung.`,
      },
    ],
    misconceptionIds: competency.commonMisconceptions.map((entry) => entry.misconceptionId),
    relatedTrainerIds: competency.relatedTrainerIds,
    estimatedSeconds: itemType === 'matching' || itemType === 'ordering' ? 75 : 45,
    sourceRefs: competency.sourceRefs,
    verificationStatus: competency.verificationStatus,
    publicDistributionStatus: 'public_safe',
    solutionValidationStatus: 'deterministic_engine_verified',
    engineVersion: 'foundations-diagnostic-v1',
    lastReviewed: '2026-07-09',
  };
}

function makeItemsForCompetency(
  competency: FoundationCompetency,
  contentVersion: string,
): DiagnosticItem[] {
  const spec = specs[competency.group];
  if (!spec) throw new Error(`Keine Phase-14-Spezifikation für ${competency.group}`);
  const prefix = competency.competencyId.replace('foundation-', 'fd-');
  const items: DiagnosticItem[] = [];

  items.push({
    ...baseItem(competency, 'single_choice', contentVersion, 0),
    id: `${prefix}-single-choice`,
    prompt: {
      stem: `Welche Aussage ist für „${competency.title}“ belegt?`,
      instruction: 'Wähle genau eine Antwort.',
    },
    options: [
      option('correct', spec.correctLabel, true, competency),
      option('wrong-a', spec.wrongLabels[0] ?? 'Falsche Aussage.', false, competency),
      option('wrong-b', spec.wrongLabels[1] ?? 'Falsche Aussage.', false, competency),
    ],
    answerDefinition: { correctOptionIds: ['correct'] },
    rubric: { maxPoints: 1, partialCredit: 'none' },
  });

  items.push({
    ...baseItem(competency, 'multiple_choice', contentVersion, 1),
    id: `${prefix}-multiple-choice`,
    prompt: {
      stem: `Welche zwei Aussagen gehören zur Kompetenz „${competency.title}“?`,
      instruction: 'Wähle alle richtigen Antworten.',
    },
    options: [
      option('fact-1', competency.canonicalFacts[0] ?? spec.correctLabel, true, competency),
      option('fact-2', competency.canonicalFacts[1] ?? spec.correctLabel, true, competency),
      option('distractor-a', spec.wrongLabels[0] ?? 'Falsche Aussage.', false, competency),
      option('distractor-b', spec.wrongLabels[1] ?? 'Falsche Aussage.', false, competency),
    ],
    answerDefinition: { correctOptionIds: ['fact-1', 'fact-2'] },
    rubric: { maxPoints: 2, partialCredit: 'per_correct_option' },
  });

  items.push({
    ...baseItem(competency, 'true_false_reason', contentVersion, 2),
    id: `${prefix}-true-false-reason`,
    prompt: {
      stem: spec.correctLabel,
      instruction: 'Entscheide Wahr/Falsch und wähle die passende Begründung.',
    },
    options: [
      option('truth-true', 'Wahr', true, competency),
      option('truth-false', 'Falsch', false, competency),
      option('reason-source', `Begründung: ${competency.canonicalFacts[0]}`, true, competency),
      option('reason-trap', `Begründung: ${spec.wrongLabels[0]}`, false, competency),
    ],
    answerDefinition: { correctOptionIds: ['truth-true'], correctReasonId: 'reason-source' },
    rubric: { maxPoints: 2, partialCredit: 'per_component' },
  });

  items.push({
    ...baseItem(competency, 'matching', contentVersion, 3),
    id: `${prefix}-matching`,
    prompt: {
      stem: `Ordne die Begriffe zur Kompetenz „${competency.title}“ zu.`,
      instruction: 'Wähle für jeden linken Begriff die passende rechte Beschreibung.',
    },
    options: spec.matchingPairs.flatMap(([left, right], pairIndex) => [
      option(`left-${pairIndex}`, left, true, competency),
      option(`right-${pairIndex}`, right, true, competency),
    ]),
    answerDefinition: {
      correctPairs: Object.fromEntries(
        spec.matchingPairs.map((_, pairIndex) => [`left-${pairIndex}`, `right-${pairIndex}`]),
      ),
    },
    rubric: { maxPoints: spec.matchingPairs.length, partialCredit: 'per_pair' },
  });

  items.push({
    ...baseItem(competency, 'ordering', contentVersion, 4),
    id: `${prefix}-ordering`,
    prompt: {
      stem: `Bringe die Arbeitsschritte für „${competency.title}“ in eine sinnvolle Reihenfolge.`,
      instruction: 'Nutze die Pfeil-Schaltflächen oder die Tastaturreihenfolge.',
    },
    options: spec.order.map((text, orderIndex) =>
      option(`step-${orderIndex}`, text, true, competency),
    ),
    answerDefinition: { correctOrderIds: spec.order.map((_, orderIndex) => `step-${orderIndex}`) },
    rubric: { maxPoints: Math.max(1, spec.order.length - 1), partialCredit: 'adjacent_pairs' },
  });

  items.push({
    ...baseItem(competency, 'numeric_short_answer', contentVersion, 5),
    id: `${prefix}-numeric`,
    prompt: {
      stem: spec.numericPrompt,
      instruction: 'Gib eine ganze Zahl ein.',
    },
    options: [],
    answerDefinition: { numericAnswer: spec.numericAnswer, tolerance: 0 },
    rubric: { maxPoints: 1, partialCredit: 'none' },
  });

  items.push({
    ...baseItem(competency, 'algorithm_selection', contentVersion, 6),
    id: `${prefix}-algorithm-selection`,
    prompt: {
      stem: spec.algorithmPrompt,
      instruction: 'Wähle den passenden Algorithmus, Begriff oder die passende Struktur.',
    },
    options: spec.algorithmOptions.map((value) =>
      option(value, value.replaceAll('_', ' '), value === spec.algorithmCorrect, competency),
    ),
    answerDefinition: { correctAlgorithmId: spec.algorithmCorrect },
    rubric: { maxPoints: 1, partialCredit: 'none' },
  });

  items.push({
    ...baseItem(competency, 'complexity_classification', contentVersion, 7),
    id: `${prefix}-complexity-classification`,
    prompt: {
      stem: spec.complexityPrompt,
      instruction: 'Wähle die passende Klassifikation.',
    },
    options: spec.complexityOptions.map((value) =>
      option(value, value.replaceAll('_', ' '), value === spec.complexityCorrect, competency),
    ),
    answerDefinition: {
      correctOptionIds: [spec.complexityCorrect],
      complexityClass: spec.complexityCorrect,
    },
    rubric: { maxPoints: 1, partialCredit: 'none' },
  });

  return items;
}

export function buildPhase14DiagnosticContent(inventory: InventoryFile, contentVersion: string) {
  const competencies = FoundationCompetenciesFileSchema.parse(inventory.competencies);
  const items = DiagnosticItemsFileSchema.parse(
    competencies.flatMap((competency) => makeItemsForCompetency(competency, contentVersion)),
  );
  const byGroup = (group: string) =>
    items.filter((item) =>
      item.competencyIds.some(
        (id) => competencies.find((competency) => competency.competencyId === id)?.group === group,
      ),
    );
  const templates = DiagnosticSessionTemplatesFileSchema.parse([
    {
      id: 'diagnostic-template-schnellcheck-v1',
      title: 'Schnellcheck Grundlagen',
      mode: 'diagnosis',
      itemCount: 16,
      timeLimitMinutes: 20,
      competencyTargets: competencies.map((competency) => competency.competencyId),
    },
    {
      id: 'diagnostic-template-standard-v1',
      title: 'Standarddiagnose Grundlagen',
      mode: 'diagnosis',
      itemCount: 32,
      timeLimitMinutes: 35,
      competencyTargets: competencies.map((competency) => competency.competencyId),
    },
    {
      id: 'diagnostic-template-thema-v1',
      title: 'Themendiagnose',
      mode: 'practice',
      itemCount: 8,
      timeLimitMinutes: null,
      competencyTargets: ['foundation-asymptotics'],
    },
  ]);
  const misconceptions = DiagnosticMisconceptionsFileSchema.parse(
    competencies.flatMap((competency) =>
      competency.commonMisconceptions.map((misconception) => ({
        misconceptionId: misconception.misconceptionId,
        category: misconception.category,
        title: misconception.description,
        remediationTarget: misconception.remediationTarget,
        sourceRefs: competency.sourceRefs,
      })),
    ),
  );
  const recommendationRules = DiagnosticRecommendationRulesFileSchema.parse(
    competencies.flatMap((competency) =>
      competency.relatedTrainerIds.slice(0, 1).map((trainerId) => ({
        id: `rule-${competency.competencyId}`,
        errorCode: specs[competency.group]?.primaryErrorCode ?? 'manual_review_recommended',
        targetType: 'trainer',
        targetId: trainerId,
        label: `${competency.title} mit tiefem Trainer stabilisieren`,
      })),
    ),
  );

  return {
    competencies,
    items,
    itemFiles: {
      'diagnostic-items-asymptotics.json': byGroup('asymptotics'),
      'diagnostic-items-recurrences.json': byGroup('recurrences'),
      'diagnostic-items-sorting-search.json': byGroup('sorting_search'),
      'diagnostic-items-data-structures.json': byGroup('data_structures'),
      'diagnostic-items-graphs.json': [...byGroup('graph_basics'), ...byGroup('graph_algorithms')],
      'diagnostic-items-paradigms.json': byGroup('paradigms'),
      'diagnostic-items-proofs.json': byGroup('proofs'),
    },
    templates,
    misconceptions,
    recommendationRules,
  };
}
