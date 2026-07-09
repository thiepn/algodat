import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type {
  DiagnosticAnswer,
  DiagnosticItem,
  DiagnosticSession,
} from '../../domain/foundations-diagnostic';
import {
  answerForItem,
  diagnosticRouteForRecommendation,
  finishDiagnosticSession,
  foundationCompetencies,
  itemForSession,
  loadDiagnosticSession,
  saveDiagnosticAnswer,
  startDiagnosticSession,
} from './foundations-diagnostic-service';

const allCompetencyIds = foundationCompetencies.map((competency) => competency.competencyId);

function modeLabel(mode: string) {
  if (mode === 'learn') return 'Lernen';
  if (mode === 'practice') return 'Üben';
  if (mode === 'exam') return 'Prüfung';
  return 'Diagnose';
}

async function startPreset(
  preset: 'schnellcheck' | 'standard' | 'thema',
  navigate: ReturnType<typeof useNavigate>,
  competencyTargets = allCompetencyIds,
) {
  const config = {
    mode: preset === 'thema' ? ('practice' as const) : ('diagnosis' as const),
    itemCount: preset === 'standard' ? 32 : preset === 'thema' ? 8 : 16,
    seed: `${preset}-phase14-v1`,
    competencyTargets,
    timeLimitMinutes: preset === 'standard' ? 35 : preset === 'schnellcheck' ? 20 : null,
  };
  const session = await startDiagnosticSession(config);
  navigate(`/diagnose/session/${session.id}`);
}

export function DiagnosticLandingPage() {
  const navigate = useNavigate();
  const [selectedCompetency, setSelectedCompetency] = useState(allCompetencyIds[0] ?? '');
  return (
    <section className="stack">
      <p className="eyebrow">Grundlagen-Diagnose · Phase 14</p>
      <h1>Kurze Klausurkompetenzen diagnostizieren</h1>
      <p>
        Der Bereich prüft kurze, objektiv bewertbare Grundlagen: Laufzeiten, Rekurrenzen,
        Sortieren/Suchen, Datenstrukturen, Graphen, Paradigmen und Beweismethoden. Jede Aufgabe ist
        quellengebunden und public-safe neu formuliert.
      </p>
      <div className="card-grid">
        <article className="card">
          <h2>Schnellcheck</h2>
          <p>16 Items, breite Abdeckung, keine Hinweise vor Abschluss.</p>
          <button onClick={() => void startPreset('schnellcheck', navigate)}>
            Schnellcheck starten
          </button>
        </article>
        <article className="card">
          <h2>Standarddiagnose</h2>
          <p>32 Items, stabilere Evidenz und ausführlicher Kompetenzbericht.</p>
          <button onClick={() => void startPreset('standard', navigate)}>
            Standarddiagnose starten
          </button>
        </article>
        <article className="card">
          <h2>Themendiagnose</h2>
          <label>
            Kompetenz wählen
            <select
              value={selectedCompetency}
              onChange={(event) => setSelectedCompetency(event.target.value)}
            >
              {foundationCompetencies.map((competency) => (
                <option key={competency.competencyId} value={competency.competencyId}>
                  {competency.title}
                </option>
              ))}
            </select>
          </label>
          <button onClick={() => void startPreset('thema', navigate, [selectedCompetency])}>
            Themendiagnose starten
          </button>
        </article>
      </div>
      <p>
        V1 bis V4 des Klausursimulators bleiben unverändert. Diese Diagnose ist ein eigener Bereich,
        keine offizielle Notenprognose.
      </p>
    </section>
  );
}

export function DiagnosticQuickStartPage() {
  const navigate = useNavigate();
  useEffect(() => {
    void startPreset('schnellcheck', navigate);
  }, [navigate]);
  return <p>Schnellcheck wird vorbereitet …</p>;
}

export function DiagnosticStandardStartPage() {
  const navigate = useNavigate();
  useEffect(() => {
    void startPreset('standard', navigate);
  }, [navigate]);
  return <p>Standarddiagnose wird vorbereitet …</p>;
}

export function DiagnosticTopicStartPage() {
  return <DiagnosticLandingPage />;
}

function isAnswered(item: DiagnosticItem, answer: DiagnosticAnswer) {
  if (item.itemType === 'matching') return Object.keys(answer.selectedPairs ?? {}).length > 0;
  if (item.itemType === 'ordering') return (answer.orderedIds ?? []).length > 0;
  if (item.itemType === 'numeric_short_answer') return answer.numericValue !== undefined;
  if (item.itemType === 'algorithm_selection') return Boolean(answer.algorithmId);
  return (answer.selectedOptionIds ?? []).length > 0;
}

function move<T>(values: T[], index: number, direction: -1 | 1) {
  const next = [...values];
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  const current = next[index];
  const other = next[target];
  if (current === undefined || other === undefined) return next;
  next[index] = other;
  next[target] = current;
  return next;
}

function DiagnosticItemRenderer({
  item,
  answer,
  setAnswer,
}: {
  item: DiagnosticItem;
  answer: DiagnosticAnswer;
  setAnswer: (answer: DiagnosticAnswer) => void;
}) {
  const selected = answer.selectedOptionIds ?? [];
  const updateSelected = (ids: string[]) =>
    setAnswer({ ...answer, selectedOptionIds: ids, answeredAt: new Date().toISOString() });

  if (item.itemType === 'multiple_choice') {
    return (
      <fieldset>
        <legend>{item.prompt.instruction}</legend>
        {item.options.map((option) => (
          <label key={option.id} className="choice-line">
            <input
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={(event) =>
                updateSelected(
                  event.target.checked
                    ? [...selected, option.id]
                    : selected.filter((id) => id !== option.id),
                )
              }
            />
            {option.text}
          </label>
        ))}
      </fieldset>
    );
  }

  if (item.itemType === 'true_false_reason') {
    const truthIds = item.options
      .filter((option) => option.id.startsWith('truth'))
      .map((option) => option.id);
    const reasonIds = item.options
      .filter((option) => option.id.startsWith('reason'))
      .map((option) => option.id);
    const setGroup = (ids: string[], value: string) =>
      updateSelected([...selected.filter((id) => !ids.includes(id)), value]);
    return (
      <div className="stack">
        <fieldset>
          <legend>Wahr oder falsch?</legend>
          {item.options
            .filter((option) => truthIds.includes(option.id))
            .map((option) => (
              <label key={option.id} className="choice-line">
                <input
                  type="radio"
                  name={`${item.id}-truth`}
                  checked={selected.includes(option.id)}
                  onChange={() => setGroup(truthIds, option.id)}
                />
                {option.text}
              </label>
            ))}
        </fieldset>
        <fieldset>
          <legend>Begründung</legend>
          {item.options
            .filter((option) => reasonIds.includes(option.id))
            .map((option) => (
              <label key={option.id} className="choice-line">
                <input
                  type="radio"
                  name={`${item.id}-reason`}
                  checked={selected.includes(option.id)}
                  onChange={() => setGroup(reasonIds, option.id)}
                />
                {option.text}
              </label>
            ))}
        </fieldset>
      </div>
    );
  }

  if (item.itemType === 'matching') {
    const left = item.options.filter((option) => option.id.startsWith('left'));
    const right = item.options.filter((option) => option.id.startsWith('right'));
    return (
      <fieldset>
        <legend>{item.prompt.instruction}</legend>
        {left.map((leftOption) => (
          <label key={leftOption.id}>
            {leftOption.text}
            <select
              value={answer.selectedPairs?.[leftOption.id] ?? ''}
              onChange={(event) =>
                setAnswer({
                  ...answer,
                  selectedPairs: {
                    ...(answer.selectedPairs ?? {}),
                    [leftOption.id]: event.target.value,
                  },
                  answeredAt: new Date().toISOString(),
                })
              }
            >
              <option value="">Bitte wählen</option>
              {right.map((rightOption) => (
                <option key={rightOption.id} value={rightOption.id}>
                  {rightOption.text}
                </option>
              ))}
            </select>
          </label>
        ))}
      </fieldset>
    );
  }

  if (item.itemType === 'ordering') {
    const order = answer.orderedIds?.length
      ? answer.orderedIds
      : item.options.map((option) => option.id);
    const optionById = new Map(item.options.map((option) => [option.id, option]));
    return (
      <ol className="ordered-list">
        {order.map((id, index) => (
          <li key={id}>
            {optionById.get(id)?.text}
            <button
              type="button"
              onClick={() =>
                setAnswer({
                  ...answer,
                  orderedIds: move(order, index, -1),
                  answeredAt: new Date().toISOString(),
                })
              }
            >
              nach oben
            </button>
            <button
              type="button"
              onClick={() =>
                setAnswer({
                  ...answer,
                  orderedIds: move(order, index, 1),
                  answeredAt: new Date().toISOString(),
                })
              }
            >
              nach unten
            </button>
          </li>
        ))}
      </ol>
    );
  }

  if (item.itemType === 'numeric_short_answer') {
    return (
      <label>
        Zahl
        <input
          inputMode="numeric"
          value={answer.numericValue ?? ''}
          onChange={(event) =>
            setAnswer({
              ...answer,
              numericValue: event.target.value,
              answeredAt: new Date().toISOString(),
            })
          }
        />
      </label>
    );
  }

  if (item.itemType === 'algorithm_selection') {
    return (
      <fieldset>
        <legend>{item.prompt.instruction}</legend>
        {item.options.map((option) => (
          <label key={option.id} className="choice-line">
            <input
              type="radio"
              name={item.id}
              checked={answer.algorithmId === option.id}
              onChange={() =>
                setAnswer({
                  ...answer,
                  algorithmId: option.id,
                  answeredAt: new Date().toISOString(),
                })
              }
            />
            {option.text}
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <fieldset>
      <legend>{item.prompt.instruction}</legend>
      {item.options.map((option) => (
        <label key={option.id} className="choice-line">
          <input
            type="radio"
            name={item.id}
            checked={selected.includes(option.id)}
            onChange={() => updateSelected([option.id])}
          />
          {option.text}
        </label>
      ))}
    </fieldset>
  );
}

export function DiagnosticSessionPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const item = session ? itemForSession(session) : undefined;
  const [answer, setAnswer] = useState<DiagnosticAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    void loadDiagnosticSession(sessionId).then((stored) => {
      if (!stored) return;
      setSession(stored);
      const currentItem = itemForSession(stored);
      if (currentItem) setAnswer(stored.responses[currentItem.id] ?? answerForItem(currentItem));
    });
  }, [sessionId]);

  const activeAnswer = answer ?? (item ? answerForItem(item) : null);

  if (!session || !item || !activeAnswer) return <p>Diagnosesitzung wird geladen …</p>;

  const progress = `${session.currentItemIndex + 1}/${session.itemIds.length}`;

  async function submitCurrent() {
    if (!item || !activeAnswer || !session) return;
    if (!isAnswered(item, activeAnswer)) {
      setError('Bitte bestätige eine Antwort, bevor du fortfährst.');
      return;
    }
    setError(null);
    const saved = await saveDiagnosticAnswer(session, activeAnswer);
    if (session.currentItemIndex >= session.itemIds.length - 1) {
      const completed = await finishDiagnosticSession(saved);
      navigate(`/diagnose/auswertung/${completed.id}`);
      return;
    }
    const nextItem = itemForSession(saved);
    setSession(saved);
    if (nextItem) setAnswer(saved.responses[nextItem.id] ?? answerForItem(nextItem));
  }

  return (
    <section className="stack">
      <p className="eyebrow">
        {modeLabel(session.mode)} · Item {progress}
      </p>
      <h1>{item.prompt.stem}</h1>
      <DiagnosticItemRenderer item={item} answer={activeAnswer} setAnswer={setAnswer} />
      <fieldset>
        <legend>Wie sicher bist du?</legend>
        {[1, 2, 3, 4, 5].map((value) => (
          <label key={value} className="choice-line">
            <input
              type="radio"
              name="confidence"
              checked={activeAnswer.confidence === value}
              onChange={() =>
                setAnswer({
                  ...activeAnswer,
                  confidence: value as DiagnosticAnswer['confidence'],
                  answeredAt: new Date().toISOString(),
                })
              }
            />
            {value} ·{' '}
            {value === 1 ? 'geraten' : value === 5 ? 'sehr sicher' : 'unsicher bis sicher'}
          </label>
        ))}
      </fieldset>
      {error ? <p role="alert">{error}</p> : null}
      <button onClick={() => void submitCurrent()}>
        {session.currentItemIndex >= session.itemIds.length - 1
          ? 'Diagnose abschließen'
          : 'Antwort speichern und weiter'}
      </button>
      <p>Autosave aktiv. Feedback erscheint in Diagnose- und Prüfungsmodus erst nach Abschluss.</p>
    </section>
  );
}

export function DiagnosticResultPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<DiagnosticSession | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    void loadDiagnosticSession(sessionId).then((stored) => {
      if (stored) setSession(stored);
    });
  }, [sessionId]);

  const sortedCompetencies = useMemo(
    () => [...(session?.competencyResults ?? [])].sort((a, b) => a.scoreRatio - b.scoreRatio),
    [session],
  );

  if (!session) return <p>Auswertung wird geladen …</p>;

  return (
    <section className="stack">
      <p className="eyebrow">Diagnoseauswertung · {modeLabel(session.mode)}</p>
      <h1>
        {session.finalScore.points}/{session.finalScore.maxPoints} Punkte
      </h1>
      <p>
        Konfidenz verändert die fachliche Punktzahl nicht. Sie zeigt nur, ob sichere und unsichere
        Antworten zur Leistung passen.
      </p>
      <h2>Kompetenzen</h2>
      <div className="card-grid">
        {sortedCompetencies.map((result) => (
          <article className="card" key={result.competencyId}>
            <h3>{result.title}</h3>
            <p>
              {Math.round(result.scoreRatio * 100)} % · {result.evidenceCount} Items · Konfidenz{' '}
              {Math.round(result.confidence * 100)} %
            </p>
            {result.misconceptionIds.length ? (
              <p>Fehlvorstellungen: {result.misconceptionIds.join(', ')}</p>
            ) : (
              <p>Keine Fehlvorstellung erkannt.</p>
            )}
          </article>
        ))}
      </div>
      <h2>Empfohlene nächste Schritte</h2>
      <ul>
        {session.recommendations.map((recommendation) => (
          <li key={recommendation.id}>
            {recommendation.targetType === 'trainer' ? (
              <Link to={diagnosticRouteForRecommendation(recommendation.targetId)}>
                {recommendation.label}
              </Link>
            ) : (
              <strong>{recommendation.label}</strong>
            )}
            : {recommendation.reason}
          </li>
        ))}
      </ul>
      <h2>Quellenstatus</h2>
      <p>
        Alle Items sind public-safe und verweisen intern auf offizielle Quellen mit Seitenbezug. Die
        Original-PDFs werden nicht verlinkt.
      </p>
      <Link to="/diagnose">Neue Diagnose starten</Link>
    </section>
  );
}
