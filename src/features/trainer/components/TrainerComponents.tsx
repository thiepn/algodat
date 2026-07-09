import katex from 'katex';
import 'katex/dist/katex.min.css';
import type {
  DpDesignTrainer,
  DivideConquerDesignTrainer,
  GreedyDesignTrainer,
  GraphTracingTrainer,
  ProofTrainer,
  RbInsertionTrainer,
  RecurrenceTrainer,
  TracingTrainer,
} from '../../../content/schemas';
import type { DpDesignError } from '../../../domain/dp-design';
import type { DivideConquerDesignError } from '../../../domain/divide-conquer-design';
import type { GreedyDesignError } from '../../../domain/greedy-design';
import type { GraphTracingError } from '../../../domain/graph-tracing';
import type { RbInsertionError } from '../../../domain/red-black-tree';
import type { ProofError } from '../../../domain/proofs';
import type { RecurrenceError } from '../../../domain/recurrences';
import type {
  CanonicalTraceStep,
  MasteryDimensions,
  RubricResult,
  TraceError,
  TrainingMode,
  UnionFindState,
  UnionFindUserCheckpoint,
  UserTraceRow,
} from '../../../domain/tracing';

export function MathFormula({ formula, label }: { formula: string; label: string }) {
  return (
    <span
      className="math-formula"
      role="math"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: katex.renderToString(formula, { throwOnError: false }) }}
    />
  );
}

export function TrainingModeSelector({
  mode,
  setMode,
  reviewAvailable,
}: {
  mode: TrainingMode;
  setMode: (mode: TrainingMode) => void;
  reviewAvailable: boolean;
}) {
  const modes: Array<{ id: TrainingMode; title: string; description: string }> = [
    {
      id: 'practice',
      title: 'Übungsmodus',
      description: 'Hinweise und schrittweise Prüfung sind verfügbar.',
    },
    {
      id: 'exam',
      title: 'Prüfungsmodus',
      description: 'Keine Hinweise und kein Feedback vor der Abgabe.',
    },
    {
      id: 'review',
      title: 'Wiederholungsmodus',
      description: 'Konzentriert sich auf Fehler aus früheren Versuchen.',
    },
  ];
  return (
    <fieldset className="mode-selector">
      <legend>Trainingsmodus</legend>
      {modes.map((entry) => (
        <label key={entry.id}>
          <input
            type="radio"
            name="mode"
            value={entry.id}
            checked={mode === entry.id}
            disabled={entry.id === 'review' && !reviewAvailable}
            onChange={() => setMode(entry.id)}
          />
          <span>
            <strong>{entry.title}</strong>
            <small>
              {entry.id === 'review' && !reviewAvailable
                ? 'Erst nach einem abgeschlossenen Versuch verfügbar.'
                : entry.description}
            </small>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

export function ProblemBriefing({ trainer }: { trainer: TracingTrainer }) {
  return (
    <section className="trainer-briefing" aria-labelledby="briefing-title">
      <div>
        <p className="eyebrow">Quellenausgerichtete Trainingsinstanz</p>
        <h2 id="briefing-title">{trainer.problemClass}</h2>
        <p>{trainer.typicalExamTask}</p>
      </div>
      <dl className="metadata-list">
        <div>
          <dt>Eingabe</dt>
          <dd>{trainer.inputDescription}</dd>
        </div>
        <div>
          <dt>Ausgabe</dt>
          <dd>{trainer.outputDescription}</dd>
        </div>
        <div>
          <dt>Laufzeit</dt>
          <dd>{trainer.runtime}</dd>
        </div>
        <div>
          <dt>Invariante</dt>
          <dd>{trainer.centralInvariant}</dd>
        </div>
      </dl>
    </section>
  );
}

export function ProblemVisualization({ trainer }: { trainer: TracingTrainer }) {
  if (trainer.problem.algorithm === 'union_find_linked_lists') {
    const y = 32;
    const elements = trainer.problem.elements;
    return (
      <figure className="problem-visualization union-visualization">
        <figcaption>Startzustand: leere Union-Find-Struktur mit Listenrepräsentation</figcaption>
        <svg role="img" aria-label="Elemente für Union-Find" viewBox="0 0 520 90">
          {elements.map((element, index) => {
            const x = 24 + index * 80;
            return (
              <g key={element}>
                <rect x={x} y={y} width="48" height="34" rx="8" />
                <text x={x + 24} y={y + 22} textAnchor="middle">
                  {element}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="sr-description">
          Textalternative: Anfangs existiert noch keine Menge. Make-Set erzeugt für jedes Element
          eine Ein-Element-Liste. next-Zeiger verlaufen von head nach tail.
        </p>
      </figure>
    );
  }
  return (
    <figure className="problem-visualization">
      <figcaption>Trainingsobjekte und Kapazität W = {trainer.problem.capacity}</figcaption>
      <div className="item-visuals" aria-hidden="true">
        {trainer.problem.items.map((item) => (
          <span key={item.id} style={{ minHeight: `${3.4 + item.weight * 0.25}rem` }}>
            <strong>{item.id}</strong>
            <small>
              g={item.weight}, v={item.value}
            </small>
          </span>
        ))}
      </div>
      <p className="sr-description">
        Textalternative:{' '}
        {trainer.problem.items
          .map((item) => `Objekt ${item.id} mit Gewicht ${item.weight} und Wert ${item.value}`)
          .join('; ')}
        . Kapazität {trainer.problem.capacity}.
      </p>
    </figure>
  );
}

export function SourceCitationPanel({
  trainer,
}: {
  trainer:
    | TracingTrainer
    | ProofTrainer
    | RecurrenceTrainer
    | DpDesignTrainer
    | DivideConquerDesignTrainer
    | GreedyDesignTrainer
    | RbInsertionTrainer
    | GraphTracingTrainer;
}) {
  return (
    <details className="source-citation">
      <summary>
        <strong>Quellen und Verifikation</strong>
        <span>gegen offizielle Quellen geprüft</span>
      </summary>
      <div className="source-citation__panel">
        <ul>
          {trainer.sourceRefs.map((reference) => (
            <li key={`${reference.sourceId}-${reference.page}`}>
              {reference.label ?? 'Offizielle Primärquelle'}, Seite/Folie {reference.page}
              <small> · Quellen-ID {reference.sourceId}</small>
            </li>
          ))}
        </ul>
        <p className="quiet">
          Die öffentliche Aufgabe ist neu formuliert. Original-PDFs werden weder verlinkt noch
          ausgeliefert.
        </p>
      </div>
    </details>
  );
}

export function StepNavigator({
  current,
  total,
  onSelect,
}: {
  current: number;
  total: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className="step-navigator" aria-label="Bearbeitungsschritte">
      {Array.from({ length: total }, (_, index) => (
        <button
          type="button"
          key={index}
          aria-current={current === index ? 'step' : undefined}
          onClick={() => onSelect(index)}
        >
          <span>{index}</span>
          {index === 0 ? 'Basis' : `Objekt ${index}`}
        </button>
      ))}
    </nav>
  );
}

export function UnionFindOperationList({ trainer }: { trainer: TracingTrainer }) {
  if (trainer.problem.algorithm !== 'union_find_linked_lists') return null;
  return (
    <section className="panel">
      <h2>Operationsfolge und Kontrollpunkte</h2>
      <ol>
        {trainer.problem.operations.map((operation, index) => {
          const operationNumber = index + 1;
          const label =
            operation.type === 'make_set'
              ? `Make-Set(${operation.element})`
              : operation.type === 'find'
                ? `Find(${operation.element})`
                : `Union(${operation.left},${operation.right})`;
          return (
            <li key={`${operationNumber}-${label}`}>
              {label}{' '}
              {trainer.problem.algorithm === 'union_find_linked_lists' &&
                trainer.problem.checkpoints.includes(operationNumber) && (
                  <strong>· Zustand zeichnen</strong>
                )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function UnionFindStateVisualization({ state }: { state: UnionFindState | null }) {
  if (!state)
    return (
      <figure className="problem-visualization">
        <figcaption>Noch kein parsebarer eigener Zustand.</figcaption>
        <p className="sr-description">
          Trage Mengen im Format „Repräsentant: Element&gt;Element; ...“ ein.
        </p>
      </figure>
    );
  return (
    <figure className="problem-visualization union-visualization">
      <figcaption>Visuelle Listenansicht nach Schritt {state.operationIndex}</figcaption>
      <div className="union-list-stack" aria-hidden="true">
        {state.sets.map((set) => (
          <div className="union-list-row" key={set.representative}>
            <span className="status-badge status-badge--info">
              rep {set.representative} · size {set.size}
            </span>
            {set.orderedElements.map((element, index) => (
              <span className="union-node" key={element}>
                <strong>{element}</strong>
                <small>{index === 0 ? 'head' : index === set.size - 1 ? 'tail' : 'next'}</small>
              </span>
            ))}
          </div>
        ))}
      </div>
      <p className="sr-description">
        Textalternative:{' '}
        {state.sets
          .map(
            (set) =>
              `Menge ${set.representative} mit ${set.orderedElements.join(' nach ')}; head ${set.head}, tail ${set.tail}, size ${set.size}`,
          )
          .join('. ')}
      </p>
    </figure>
  );
}

export function UnionFindInputPanel({
  checkpoint,
  disabled,
  onChange,
}: {
  checkpoint: UnionFindUserCheckpoint;
  disabled: boolean;
  onChange: (checkpoint: UnionFindUserCheckpoint) => void;
}) {
  return (
    <section className="step-input" aria-labelledby="uf-input-title">
      <h2 id="uf-input-title">Zustand nach Schritt {checkpoint.operationIndex} aktiv eingeben</h2>
      <p>
        Format: <code>J: J&gt;H; G: G&gt;F</code>. Die Reihenfolge beschreibt die next-Zeiger von
        head nach tail.
      </p>
      <label className="wide-input">
        Mengen, Repräsentanten und Listenreihenfolge
        <textarea
          value={checkpoint.stateText}
          disabled={disabled}
          rows={4}
          onChange={(event) => onChange({ ...checkpoint, stateText: event.target.value })}
        />
      </label>
      <label className="wide-input">
        Welche Liste wurde bei dieser Operation angehängt?
        <input
          value={checkpoint.attachedList}
          disabled={disabled}
          placeholder="z. B. H->J oder keine"
          onChange={(event) => onChange({ ...checkpoint, attachedList: event.target.value })}
        />
      </label>
    </section>
  );
}

export function TraceTable({
  rows,
  capacity,
  current,
}: {
  rows: UserTraceRow[];
  capacity: number;
  current: number;
}) {
  return (
    <div
      className="trace-table-scroll"
      role="region"
      aria-label="Distanz- und Wertetabelle, horizontal scrollbar"
      tabIndex={0}
    >
      <table className="trace-table">
        <caption>Aktueller eigener Zustand der Opt-Tabelle</caption>
        <thead>
          <tr>
            <th scope="col">i \ w</th>
            {Array.from({ length: capacity + 1 }, (_, w) => (
              <th scope="col" key={w}>
                {w}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, current + 1).map((row) => (
            <tr key={row.index}>
              <th scope="row">{row.index}</th>
              {row.values.map((value, index) => (
                <td key={index}>{value ?? '–'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StepInputPanel({
  row,
  capacity,
  ties,
  disabled,
  onChange,
}: {
  row: UserTraceRow;
  capacity: number;
  ties: number[];
  disabled: boolean;
  onChange: (row: UserTraceRow) => void;
}) {
  return (
    <section className="step-input" aria-labelledby="step-input-title">
      <h2 id="step-input-title">Zeile {row.index} aktiv eingeben</h2>
      <p>
        Gib {capacity + 1} ganzzahlige Werte für w = 0 bis {capacity} ein.
      </p>
      <div className="cell-input-grid">
        {Array.from({ length: capacity + 1 }, (_, capacityValue) => (
          <label key={capacityValue}>
            w = {capacityValue}
            <input
              type="number"
              min="0"
              step="1"
              value={row.values[capacityValue] ?? ''}
              disabled={disabled}
              aria-label={`Opt[${row.index},${capacityValue}]`}
              onChange={(event) => {
                const values = [...row.values];
                values[capacityValue] =
                  event.target.value === '' ? null : Number(event.target.value);
                onChange({ ...row, values });
              }}
            />
          </label>
        ))}
      </div>
      {ties.map((capacityValue) => {
        const key = `${row.index}:${capacityValue}`;
        return (
          <fieldset key={key} className="tie-choice">
            <legend>Gleichstand bei w = {capacityValue}</legend>
            <label>
              <input
                type="radio"
                name={key}
                disabled={disabled}
                checked={row.tieChoices[key] === 'exclude'}
                onChange={() =>
                  onChange({ ...row, tieChoices: { ...row.tieChoices, [key]: 'exclude' } })
                }
              />{' '}
              Neues Objekt weglassen
            </label>
            <label>
              <input
                type="radio"
                name={key}
                disabled={disabled}
                checked={row.tieChoices[key] === 'include'}
                onChange={() =>
                  onChange({ ...row, tieChoices: { ...row.tieChoices, [key]: 'include' } })
                }
              />{' '}
              Neues Objekt aufnehmen
            </label>
          </fieldset>
        );
      })}
    </section>
  );
}

export function RubricBreakdown({ results }: { results: RubricResult[] }) {
  return (
    <div className="task-table-wrapper">
      <table>
        <caption>Deterministische Teilpunkt-Rubrik</caption>
        <thead>
          <tr>
            <th>Kriterium</th>
            <th>Punkte</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.criterionId}>
              <td>{result.label}</td>
              <td>
                {result.points} / {result.maxPoints}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ErrorAnalysis({
  errors,
}: {
  errors: Array<
    | TraceError
    | ProofError
    | RecurrenceError
    | DpDesignError
    | DivideConquerDesignError
    | GreedyDesignError
    | RbInsertionError
    | GraphTracingError
  >;
}) {
  if (!errors.length) return <p className="notice">Keine fachlichen Fehler erkannt.</p>;
  return (
    <div className="error-analysis">
      {errors.map((error, index) => (
        <article key={`${error.errorCode}-${index}`}>
          <h3>{error.errorCode}</h3>
          <p>
            <strong>{error.evidence}</strong>: {error.explanation}
          </p>
          <p className="quiet">
            Erwartet: {String(error.expected)} · Eingabe: {String(error.actual)}
          </p>
          <p>{error.recommendedReview}</p>
        </article>
      ))}
    </div>
  );
}

export function CanonicalSolutionViewer({ trace }: { trace: CanonicalTraceStep[] }) {
  return (
    <details className="canonical-solution">
      <summary>Stufe 3: vollständige Musterlösung aufdecken</summary>
      <div
        className="trace-table-scroll"
        role="region"
        aria-label="Kanonische Lösungstabelle"
        tabIndex={0}
      >
        <table className="trace-table">
          <caption>Von der Engine erzeugte Opt-Tabelle</caption>
          <tbody>
            {trace.map((row) => (
              <tr key={row.index}>
                <th scope="row">i={row.index}</th>
                {row.values.map((value, index) => (
                  <td key={index}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>Endwert: {trace.at(-1)?.values.at(-1)}. Laufzeit: O(n · W).</p>
    </details>
  );
}

export function UnionFindCanonicalSolutionViewer({ trace }: { trace: UnionFindState[] }) {
  return (
    <details className="canonical-solution">
      <summary>Stufe 3: vollständige Union-Find-Musterlösung aufdecken</summary>
      <div className="task-table-wrapper">
        <table>
          <caption>Kanonische Zustände der Listenrepräsentation</caption>
          <thead>
            <tr>
              <th>Schritt</th>
              <th>Mengen</th>
              <th>Angehängt</th>
            </tr>
          </thead>
          <tbody>
            {trace.map((state) => (
              <tr key={state.operationIndex}>
                <th scope="row">{state.operationIndex}</th>
                <td>
                  {state.sets
                    .map((set) => `${set.representative}: ${set.orderedElements.join('>')}`)
                    .join('; ')}
                </td>
                <td>
                  {state.attachedList
                    ? `${state.attachedList.from}->${state.attachedList.to}`
                    : 'keine'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>Laufzeitmodell: Make-Set/Find in O(1), gewichtete Sequenz in O(m + n log n).</p>
    </details>
  );
}

export function MasteryImpact({
  dimensions,
}: {
  dimensions: MasteryDimensions | Record<string, number>;
}) {
  return (
    <section>
      <h2>Auswirkung auf Beherrschung</h2>
      <div className="mastery-grid">
        {Object.entries(dimensions).map(([name, value]) => (
          <div key={name}>
            <span>{name.replaceAll('_', ' ')}</span>
            <strong>{Math.round(value * 100)} %</strong>
            <progress max="1" value={value}>
              {Math.round(value * 100)} %
            </progress>
          </div>
        ))}
      </div>
    </section>
  );
}
