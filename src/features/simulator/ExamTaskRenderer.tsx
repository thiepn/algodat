import type { ChangeEvent } from 'react';
import { getExamTaskAdapter } from '../../domain/exam-simulator';
import type { ExamTaskDefinition } from '../../content/schemas';
import {
  getGraphTracingTrainerById,
  getRegistryEntry,
  getTrainerById,
} from '../trainer/trainer-service';

export type DraftCompletion = {
  status: 'unanswered' | 'started' | 'incomplete' | 'complete';
  missing: string[];
};

export interface ExamTaskRendererDefinition {
  familyId: string;
  rendererId: string;
  supportedTaskTypes: string[];
  serializeAnswer: (answer: unknown) => unknown;
  deserializeAnswer: (answer: unknown) => unknown;
  validateDraft: (answer: unknown) => DraftCompletion;
  evaluateSubmission: (
    answer: unknown,
    task: ExamTaskDefinition,
  ) => ReturnType<ReturnType<typeof getExamTaskAdapter>['gradeAfterSubmission']>;
  buildModelSolution: (trainerId: string) => unknown;
  accessibilityMetadata: { label: string; summary: string };
}

const labels: Record<string, string> = {
  nilConvention: 'NIL-Blatt-Konvention',
  insertedKeys: 'Einfügefolge',
  fixupCases: 'Reparaturfälle',
  finalTree: 'Finaler Baum',
  blackHeight: 'Schwarzhöhe',
  runtime: 'Laufzeit',
  explanation: 'Begründung',
  startVertex: 'Startknoten',
  markedOrder: 'Markierungsreihenfolge',
  distanceTable: 'Distanztabelle',
  predecessorTable: 'Vorgängertabelle',
  relaxationLog: 'Relaxationsprotokoll',
  selectedVertices: 'Aufnahmereihenfolge',
  selectedEdges: 'Ausgewählte MST-Kanten',
  keyTable: 'key-Tabelle',
  parentTable: 'parent-Tabelle',
  totalWeight: 'Gesamtgewicht',
  safeEdgeExplanation: 'Schnittargument',
  vertexOrder: 'Knotenreihenfolge',
  d0: 'Matrix D(0)',
  d1: 'Matrix D(1)',
  d2: 'Matrix D(2)',
  d3: 'Matrix D(3)',
  d4: 'Matrix D(4)',
  recurrence: 'Rekurrenz',
  baseCase: 'Basisfall',
  interpretation: 'Probleminterpretation',
  state: 'Zustandsdefinition',
  evaluation: 'Auswertungsreihenfolge',
  algorithm: 'Pseudocode',
  proof: 'Korrektheitsargument',
  complexity: 'Aufwand',
  decomposition: 'Zerlegung',
  combine: 'Kombination',
  initialization: 'Initialisierung',
  preservation: 'Erhaltung',
  termination: 'Terminierung',
  conclusion: 'Schlussfolgerung',
  hypothesis: 'Induktionsvoraussetzung',
  claim: 'Behauptung',
  invariant: 'Schleifeninvariante',
  parameters: 'Master-Parameter',
  recursionTree: 'Rekursionsbaum',
};

function title(key: string) {
  return (
    labels[key] ?? key.replace(/([A-Z])/gu, ' $1').replace(/^./u, (letter) => letter.toUpperCase())
  );
}

function leafEntries(value: unknown, path = ''): Array<{ path: string; value: string }> {
  if (!value || typeof value !== 'object')
    return path ? [{ path, value: String(value ?? '') }] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
    if (
      [
        'kind',
        'trainerKind',
        'problemId',
        'preflight',
        'rows',
        'checkpoints',
        'finalValue',
      ].includes(key)
    )
      return [];
    const next = path ? `${path}.${key}` : key;
    return child && typeof child === 'object'
      ? leafEntries(child, next)
      : [{ path: next, value: String(child ?? '') }];
  });
}

function updateAtPath(value: unknown, path: string, next: string): unknown {
  const copy = structuredClone(value as object) as Record<string, unknown>;
  const keys = path.split('.');
  let cursor = copy;
  for (const key of keys.slice(0, -1)) cursor = cursor[key] as Record<string, unknown>;
  cursor[keys.at(-1)!] = next;
  return copy;
}

function isLongField(path: string) {
  return /explanation|proof|preservation|conclusion|algorithm|recursionTree|relaxation|table|matrix|case/i.test(
    path,
  );
}

function genericCompletion(answer: unknown): DraftCompletion {
  const fields = leafEntries(answer);
  const filled = fields.filter((field) => field.value.trim()).length;
  if (!filled)
    return {
      status: 'unanswered',
      missing: fields.map((field) => title(field.path.split('.').at(-1)!)),
    };
  const missing = fields
    .filter((field) => !field.value.trim())
    .map((field) => title(field.path.split('.').at(-1)!));
  return { status: missing.length ? 'incomplete' : 'complete', missing };
}

export const examTaskRendererRegistry: ExamTaskRendererDefinition[] = [
  'knapsack',
  'union_find',
  'red_black_tree_insertion',
  'proof_loop_invariant',
  'recurrence_runtime_proof',
  'divide_conquer_max_difference',
  'dp_design_mine',
  'greedy_design_fitnesspunkte',
  'dijkstra_trace',
  'floyd_warshall_matrix',
  'prim_mst_trace',
].map((rendererId) => ({
  familyId: rendererId,
  rendererId,
  supportedTaskTypes: [rendererId],
  serializeAnswer: (answer) => structuredClone(answer),
  deserializeAnswer: (answer) => structuredClone(answer),
  validateDraft: genericCompletion,
  evaluateSubmission: (answer, task) =>
    getExamTaskAdapter(task.trainerId).gradeAfterSubmission(answer, task),
  buildModelSolution: (trainerId) => {
    // Die kanonische Antwort wird erst von der Ergebnisansicht angefordert.
    const adapter = getExamTaskAdapter(trainerId);
    return adapter.initializeExamAnswer();
  },
  accessibilityMetadata: {
    label: `Strukturierte Antwort: ${rendererId}`,
    summary:
      'Alle Felder sind beschriftet; vor der Abgabe wird keine fachliche Rückmeldung gegeben.',
  },
}));

export function getExamTaskRenderer(rendererType: string) {
  const renderer = examTaskRendererRegistry.find((entry) => entry.rendererId === rendererType);
  if (!renderer) throw new Error(`Kein Klausur-Renderer für ${rendererType}.`);
  return renderer;
}

export function completionForExamAnswer(
  task: ExamTaskDefinition,
  answer: unknown,
): DraftCompletion {
  if (!answer) return { status: 'unanswered', missing: ['Antwort'] };
  if (task.rendererType === 'knapsack') {
    const value = answer as { rows?: Array<{ values?: unknown[] }>; finalValue?: unknown };
    const missing = [
      ...(value.rows?.flatMap((row, index) =>
        row.values?.some((cell) => cell === null || cell === '') ? [`Tabellenzeile ${index}`] : [],
      ) ?? ['DP-Tabelle']),
      ...(value.finalValue === null || value.finalValue === '' ? ['Optimalwert'] : []),
    ];
    return { status: missing.length ? 'incomplete' : 'complete', missing };
  }
  if (task.rendererType === 'union_find') {
    const value = answer as {
      checkpoints?: Array<{ operationIndex?: number; stateText?: string; attachedList?: string }>;
    };
    const missing = (value.checkpoints ?? []).flatMap((checkpoint) =>
      [
        !(checkpoint.stateText ?? '').trim()
          ? `Zustand nach Schritt ${checkpoint.operationIndex ?? '?'}`
          : '',
        !(checkpoint.attachedList ?? '').trim()
          ? `Angehängte Liste nach Schritt ${checkpoint.operationIndex ?? '?'}`
          : '',
      ].filter(Boolean),
    );
    return { status: missing.length ? 'incomplete' : 'complete', missing };
  }
  return getExamTaskRenderer(task.rendererType).validateDraft(answer);
}

export function ExamTaskRenderer({
  task,
  answer,
  onChange,
}: {
  task: ExamTaskDefinition;
  answer: unknown;
  onChange: (answer: unknown) => void;
}) {
  const effectiveAnswer = answer ?? getExamTaskAdapter(task.trainerId).initializeExamAnswer();
  const registry = getRegistryEntry(task.trainerId);
  const tracing = getTrainerById(task.trainerId);
  const graph = getGraphTracingTrainerById(task.trainerId);
  const problem = tracing?.problem ?? graph?.problem;
  return (
    <section className="exam-renderer" aria-label={`Aufgabe: ${task.title}`}>
      <div className="exam-task-statement">
        <h2>Aufgabenstellung</h2>
        <p>{registry?.description ?? task.title}</p>
        {problem && 'inputDescription' in problem && (
          <p>
            <strong>Eingabe:</strong> {String(problem.inputDescription)}
          </p>
        )}
        {problem && 'outputDescription' in problem && (
          <p>
            <strong>Erwartete Ausgabe:</strong> {String(problem.outputDescription)}
          </p>
        )}
        {graph && 'startVertex' in graph.problem && (
          <GraphSummary
            vertices={graph.problem.vertices}
            edges={graph.problem.edges}
            kind={graph.problem.graphKind}
            start={graph.problem.startVertex}
            tiePolicy={
              'tiePolicy' in graph.problem
                ? graph.problem.tiePolicy
                : 'Die vorgegebene Knotenreihenfolge entscheidet Gleichstände.'
            }
          />
        )}
        {tracing?.problem.algorithm === 'knapsack_01' && (
          <KnapsackInput task={task} answer={effectiveAnswer} onChange={onChange} />
        )}
        {tracing?.problem.algorithm === 'union_find_linked_lists' && (
          <UnionFindInput task={task} answer={effectiveAnswer} onChange={onChange} />
        )}
      </div>
      {!tracing ||
      (tracing.problem.algorithm !== 'knapsack_01' &&
        tracing.problem.algorithm !== 'union_find_linked_lists') ? (
        <StructuredFields answer={effectiveAnswer} onChange={onChange} />
      ) : null}
      <p className="notice" aria-live="polite">
        Klausurmodus: Vollständigkeit wird gespeichert; fachliche Rückmeldung erscheint erst nach
        der Abgabe.
      </p>
    </section>
  );
}

function GraphSummary({
  vertices,
  edges,
  kind,
  start,
  tiePolicy,
}: {
  vertices: string[];
  edges: Array<{ from: string; to: string; weight: number }>;
  kind: string;
  start: string;
  tiePolicy: string;
}) {
  return (
    <section className="panel compact-panel">
      <h3>Graphdaten</h3>
      <p>
        {kind === 'weighted_directed' ? 'Gerichteter' : 'Ungerichteter'} gewichteter Graph;
        Startknoten: {start}. {tiePolicy}
      </p>
      <p aria-label="Kantenliste">
        {edges.map((edge) => `${edge.from}–${edge.to} (${edge.weight})`).join(', ')}
      </p>
      <p>Knotenreihenfolge: {vertices.join(', ')}</p>
    </section>
  );
}

function KnapsackInput({
  task,
  answer,
  onChange,
}: {
  task: ExamTaskDefinition;
  answer: unknown;
  onChange: (answer: unknown) => void;
}) {
  const trainer = getTrainerById(task.trainerId);
  const value = answer as {
    rows: Array<{
      index: number;
      values: Array<number | null>;
      tieChoices: Record<string, string>;
    }>;
    finalValue: number | null;
  };
  if (!trainer || trainer.problem.algorithm !== 'knapsack_01') return null;
  return (
    <>
      <section className="panel compact-panel">
        <h3>Eingabedaten</h3>
        <p>
          Kapazität W = {trainer.problem.capacity}; Objekte:{' '}
          {trainer.problem.items
            .map((item) => `${item.id}: Gewicht ${item.weight}, Wert ${item.value}`)
            .join('; ')}
          .
        </p>
        <p>Nutze Opt[i,w] mit Zeilen und Kapazitäten ab 0 sowie die vorherige Zeile.</p>
      </section>
      <section className="task-table-wrapper">
        <h3>DP-Tabelle Opt[i,w]</h3>
        <table>
          <thead>
            <tr>
              <th>i \\ w</th>
              {Array.from({ length: trainer.problem.capacity + 1 }, (_, w) => (
                <th key={w}>{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {value.rows.map((row, rowIndex) => (
              <tr key={row.index}>
                <th>{row.index}</th>
                {row.values.map((cell, columnIndex) => (
                  <td key={columnIndex}>
                    <input
                      aria-label={`Opt ${row.index} ${columnIndex}`}
                      inputMode="numeric"
                      value={cell ?? ''}
                      onChange={(event) => {
                        const next = structuredClone(value);
                        const parsed =
                          event.target.value === '' ? null : Number(event.target.value);
                        next.rows[rowIndex]!.values[columnIndex] = Number.isFinite(parsed)
                          ? parsed
                          : null;
                        onChange(next);
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <label>
        Optimalwert Opt[n,W]
        <input
          inputMode="numeric"
          value={value.finalValue ?? ''}
          onChange={(event) =>
            onChange({
              ...value,
              finalValue: event.target.value === '' ? null : Number(event.target.value),
            })
          }
        />
      </label>
    </>
  );
}

function UnionFindInput({
  task,
  answer,
  onChange,
}: {
  task: ExamTaskDefinition;
  answer: unknown;
  onChange: (answer: unknown) => void;
}) {
  const trainer = getTrainerById(task.trainerId);
  const value = answer as {
    checkpoints: Array<{ operationIndex: number; stateText: string; attachedList: string }>;
  };
  if (!trainer || trainer.problem.algorithm !== 'union_find_linked_lists') return null;
  return (
    <>
      <section className="panel compact-panel">
        <h3>Operationsfolge</h3>
        <ol>
          {trainer.problem.operations.map((operation, index) => (
            <li key={index}>
              {operation.type === 'union'
                ? `Union(${operation.left}, ${operation.right})`
                : `Make-Set(${operation.element})`}
            </li>
          ))}
        </ol>
        <p>
          Weighted Union: kleinere Liste an größere; bei Gleichstand wird die lexikographisch
          kleinere Repräsentantenmenge angehängt.
        </p>
      </section>
      {value.checkpoints.map((checkpoint, index) => (
        <fieldset key={checkpoint.operationIndex}>
          <legend>Zustand nach Operation {checkpoint.operationIndex}</legend>
          <label>
            Repräsentanten, Listenreihenfolge, next-Zeiger und Größen
            <textarea
              value={checkpoint.stateText}
              onChange={(event) => {
                const next = structuredClone(value);
                next.checkpoints[index]!.stateText = event.target.value;
                onChange(next);
              }}
            />
          </label>
          <label>
            Angehängte Liste bzw. Find-Ergebnis
            <input
              value={checkpoint.attachedList}
              onChange={(event) => {
                const next = structuredClone(value);
                next.checkpoints[index]!.attachedList = event.target.value;
                onChange(next);
              }}
            />
          </label>
        </fieldset>
      ))}
    </>
  );
}

function StructuredFields({
  answer,
  onChange,
}: {
  answer: unknown;
  onChange: (answer: unknown) => void;
}) {
  return (
    <section className="structured-answer-fields">
      <h3>Strukturierte Antwort</h3>
      {leafEntries(answer).map((field) => (
        <label className="wide-input" key={field.path}>
          {title(field.path.split('.').at(-1)!)}
          {isLongField(field.path) ? (
            <textarea
              value={field.value}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                onChange(updateAtPath(answer, field.path, event.target.value))
              }
            />
          ) : (
            <input
              value={field.value}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChange(updateAtPath(answer, field.path, event.target.value))
              }
            />
          )}
        </label>
      ))}
    </section>
  );
}
