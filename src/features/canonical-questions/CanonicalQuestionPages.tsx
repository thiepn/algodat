import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { content } from '../../content/loaders/content';
import type { CanonicalQuestionBlock } from '../../content/schemas';
import { PlannedState } from '../../ui/feedback/PlannedState';

const enabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_CANONICAL_QUESTION_PREVIEW === 'true';

export function isPubliclyVisibleQuestion(
  question: (typeof content.canonicalQuestions.questions)[number],
): boolean {
  return (
    question.verificationStatus === 'verified' &&
    question.manuallyVerified &&
    question.contentReviewStatus === 'content_reviewed' &&
    question.finalReviewStatus === 'final_reviewed' &&
    question.bodyBlocks.length > 0
  );
}

function Block({ block }: { block: CanonicalQuestionBlock }) {
  switch (block.type) {
    case 'paragraph':
      return <p>{block.text}</p>;
    case 'ordered_list':
      return (
        <ol>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    case 'unordered_list':
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case 'math':
      return (
        <p
          aria-label={block.textAlternative}
          dangerouslySetInnerHTML={{
            __html: katex.renderToString(block.latex, { displayMode: true, throwOnError: false }),
          }}
        />
      );
    case 'pseudocode':
      return (
        <pre aria-label={block.textAlternative}>
          <code>{block.code}</code>
        </pre>
      );
    case 'array':
      return (
        <figure>
          <figcaption>{block.label}</figcaption>
          <ol aria-label={block.textAlternative}>
            {block.values.map((value, index) => (
              <li key={`${index}-${String(value)}`}>{String(value)}</li>
            ))}
          </ol>
        </figure>
      );
    case 'matrix':
    case 'dp_table':
      return (
        <figure>
          <figcaption>{block.label}</figcaption>
          <table aria-label={block.textAlternative}>
            <thead>
              <tr>
                {block.columnHeaders.map((header) => (
                  <th key={header} scope="col">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, columnIndex) => (
                    <td key={`${rowIndex}-${columnIndex}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      );
    case 'graph':
      return (
        <figure>
          <figcaption>{block.label}</figcaption>
          <p>{block.textAlternative}</p>
          <ul>
            {block.edges.map((edge, index) => (
              <li key={`${edge.from}-${edge.to}-${index}`}>
                {edge.from} {edge.directed ? '→' : '—'} {edge.to}
                {edge.label ? ` (${edge.label})` : ''}
              </li>
            ))}
          </ul>
        </figure>
      );
    case 'tree':
      return (
        <figure>
          <figcaption>{block.label}</figcaption>
          <p>{block.representation}</p>
          <p className="sr-only">{block.textAlternative}</p>
        </figure>
      );
    case 'operation_sequence':
      return (
        <section aria-label={block.label}>
          <h3>{block.label}</h3>
          <ol>
            {block.operations.map((operation) => (
              <li key={operation}>{operation}</li>
            ))}
          </ol>
          <p className="sr-only">{block.textAlternative}</p>
        </section>
      );
    case 'definition_list':
      return (
        <dl>
          {block.entries.map((entry) => (
            <div key={entry.term}>
              <dt>{entry.term}</dt>
              <dd>{entry.definition}</dd>
            </div>
          ))}
        </dl>
      );
    case 'subtask':
      return (
        <section>
          <h3>{block.label}</h3>
          {block.blocks.map((nested, index) => (
            <Block block={nested} key={`${nested.type}-${index}`} />
          ))}
        </section>
      );
    case 'callout':
      return (
        <aside className="notice">
          <h3>{block.title}</h3>
          <p>{block.text}</p>
        </aside>
      );
  }
}

function QuestionView({
  question,
}: {
  question: (typeof content.canonicalQuestions.questions)[number];
}) {
  return (
    <article className="content-section" aria-labelledby="canonical-question-title">
      <p className="eyebrow">
        {question.collectionType === 'mock_exam' ? 'Probeklausur' : question.collectionType}
      </p>
      <h1 id="canonical-question-title">{question.title}</h1>
      <p>
        Aufgabe {question.taskNumber}
        {question.points === null ? '' : ` · ${question.points} Punkte`} ·{' '}
        {question.publicationMode === 'public_safe_reconstruction'
          ? 'eigenständige Rekonstruktion'
          : question.publicationMode}
      </p>
      {question.bodyBlocks.map((block, index) => (
        <Block block={block} key={`${block.type}-${index}`} />
      ))}
      <h2>Erwartete Abgabe</h2>
      <ul>
        {question.expectedDeliverables.map((deliverable) => (
          <li key={deliverable}>{deliverable}</li>
        ))}
      </ul>
      <h2>Lösung</h2>
      <p>Status: {question.solutionStatus}</p>
      {question.solution.blocks.map((block, index) => (
        <Block block={block} key={`solution-${block.type}-${index}`} />
      ))}
      <h2>Quellkontext und Prüfung</h2>
      <p>Sammlung: {question.collectionId}. Die Aufgabenansicht benötigt keine lokale Datei.</p>
      <ul>
        {question.sourceRefs.map((sourceRef) => (
          <li key={`${sourceRef.sourceId}-${sourceRef.page}`}>
            {sourceRef.sourceId}, Seite {sourceRef.page}
            {sourceRef.label ? `: ${sourceRef.label}` : ''}
          </li>
        ))}
      </ul>
      <p>
        Manuell geprüft am {question.verifiedAt} · {question.verifiedBy}
      </p>
    </article>
  );
}

export function CanonicalQuestionPreviewPage() {
  if (!enabled)
    return (
      <PlannedState
        title="Kanonische Fragenvorschau"
        description="Die Vorschau ist außerhalb der Entwicklung deaktiviert."
      />
    );
  const questions = content.canonicalQuestions.questions.filter(isPubliclyVisibleQuestion);
  return (
    <section className="page-stack">
      <h1>Kanonische Fragenvorschau</h1>
      <p>Es werden ausschließlich vollständig und manuell geprüfte Fragen angezeigt.</p>
      {questions.length === 0 ? (
        <p className="notice">Noch keine veröffentlichungsfähige Frage freigegeben.</p>
      ) : (
        <div className="card-grid">
          {questions.map((question) => (
            <article className="task-card" key={question.questionId}>
              <h2>{question.title}</h2>
              <p>
                {question.collectionId} · Aufgabe {question.taskNumber}
              </p>
              <Link className="button-link" to={`/fragen-vorschau/${question.questionId}`}>
                Frage öffnen
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function CanonicalQuestionPreviewDetailPage() {
  const { questionId } = useParams();
  if (!enabled)
    return (
      <PlannedState
        title="Kanonische Fragenvorschau"
        description="Die Vorschau ist außerhalb der Entwicklung deaktiviert."
      />
    );
  const question = content.canonicalQuestions.questions.find(
    (candidate) => candidate.questionId === questionId && isPubliclyVisibleQuestion(candidate),
  );
  if (!question)
    return (
      <PlannedState
        title="Frage nicht verfügbar"
        description="Diese Frage ist nicht manuell geprüft oder existiert nicht."
      />
    );
  const questions = content.canonicalQuestions.questions.filter(isPubliclyVisibleQuestion);
  const index = questions.findIndex((candidate) => candidate.questionId === question.questionId);
  return (
    <section className="page-stack">
      <QuestionView question={question} />
      <nav aria-label="Fragenavigation">
        {index > 0 && (
          <Link to={`/fragen-vorschau/${questions[index - 1]?.questionId}`}>Vorherige Frage</Link>
        )}
        {index < questions.length - 1 && (
          <Link to={`/fragen-vorschau/${questions[index + 1]?.questionId}`}>Nächste Frage</Link>
        )}
      </nav>
    </section>
  );
}

export function CanonicalQuestionReviewPage() {
  const { questionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  if (!import.meta.env.DEV)
    return (
      <PlannedState
        title="Korpusreview"
        description="Diese Prüfroute ist ausschließlich in der Entwicklung verfügbar."
      />
    );
  const collectionFilter = searchParams.get('sammlung') ?? 'alle';
  const statusFilter = searchParams.get('status') ?? 'alle';
  const taskFilter = searchParams.get('aufgabe') ?? 'alle';
  const filteredDecisions = content.questionIdentityDecisions.decisions.filter(
    (decision) =>
      (collectionFilter === 'alle' || decision.collectionId === collectionFilter) &&
      (statusFilter === 'alle' || decision.decisionState === statusFilter) &&
      (taskFilter === 'alle' || String(decision.taskNumber) === taskFilter),
  );
  const currentDecision = questionId
    ? filteredDecisions.find((decision) => decision.canonicalQuestionId === questionId)
    : filteredDecisions[0];
  const question = currentDecision?.canonicalQuestionId
    ? content.canonicalQuestions.questions.find(
        (candidate) => candidate.questionId === currentDecision.canonicalQuestionId,
      )
    : undefined;
  if (!question)
    return (
      <PlannedState
        title="Korpusreview"
        description="Der kanonische Korpus enthält noch keine Frage."
      />
    );
  const evidenceLink = content.questionEvidenceLinks.links.find(
    (link) => link.questionId === question.questionId,
  );
  const mapping = content.questionResourceMappingReport.mappings.find(
    (candidate) => candidate.questionId === question.questionId,
  );
  const collection = content.canonicalQuestions.collections.find(
    (candidate) => candidate.collectionId === question.collectionId,
  );
  const currentIndex = filteredDecisions.findIndex(
    (decision) => decision.canonicalQuestionId === question.questionId,
  );
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'alle') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };
  return (
    <section className="page-stack">
      <header>
        <p className="eyebrow">Entwicklungswerkzeug</p>
        <h1>Korpusreview</h1>
        <div className="filter-row" aria-label="Korpusfilter">
          <label>
            Sammlung
            <select
              value={collectionFilter}
              onChange={(event) => updateFilter('sammlung', event.target.value)}
            >
              <option value="alle">Alle</option>
              {content.canonicalQuestions.collections.map((candidate) => (
                <option value={candidate.collectionId} key={candidate.collectionId}>
                  {candidate.collectionId}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              value={statusFilter}
              onChange={(event) => updateFilter('status', event.target.value)}
            >
              <option value="alle">Alle</option>
              <option value="verified_canonical_question">Kanonisch verifiziert</option>
              <option value="merged_duplicate_evidence">Dublette zusammengeführt</option>
              <option value="split_into_multiple_questions">In mehrere Fragen geteilt</option>
              <option value="blocked_missing_source">Quelle fehlt</option>
              <option value="blocked_unreadable_source">Quelle unlesbar</option>
              <option value="blocked_missing_visual_data">Visuelle Daten fehlen</option>
              <option value="blocked_identity_uncertain">Identität unklar</option>
              <option value="blocked_publication_uncertain">Publikation unklar</option>
            </select>
          </label>
          <label>
            Aufgabe
            <select
              value={taskFilter}
              onChange={(event) => updateFilter('aufgabe', event.target.value)}
            >
              <option value="alle">Alle</option>
              {Array.from({ length: 9 }, (_, index) => index + 1).map((taskNumber) => (
                <option value={taskNumber} key={taskNumber}>
                  {taskNumber}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
      {collection && (
        <aside className="notice">
          <h2>Sammlungsfortschritt</h2>
          <p>
            {collection.collectionId}: {collection.state} · {collection.decidedTaskCount}/
            {collection.expectedTaskCount ?? '?'} Aufgaben entschieden
          </p>
          <p>{collection.reviewNotes}</p>
        </aside>
      )}
      <QuestionView question={question} />
      <aside className="notice">
        <h2>Prüfcheckliste</h2>
        <ul>
          <li>Entscheidung: {currentDecision?.decisionState}</li>
          <li>Inhaltsreview: {question.contentReviewStatus}</li>
          <li>Finalreview: {question.finalReviewStatus}</li>
          <li>Unabhängiger Zweitreview: {question.independentSecondReview ? 'ja' : 'nein'}</li>
          <li>Publikationsmodus: {question.publicationMode}</li>
          <li>Evidenz: {evidenceLink?.evidenceIds.join(', ') ?? 'fehlt'}</li>
          <li>Lösungsevidenz: {evidenceLink?.solutionEvidenceIds.join(', ') || 'keine'}</li>
          <li>
            Zuordnungen: Themen {mapping?.topicIds.join(', ') ?? 'fehlt'}, Slots{' '}
            {mapping?.taskSlotNumbers.join(', ') ?? 'fehlt'}, Trainer{' '}
            {mapping?.trainerIds.join(', ') || 'keiner vorhanden'}
          </li>
        </ul>
        {currentDecision?.decisionState.startsWith('blocked_') && (
          <p>Blockiergrund: {currentDecision.notes}</p>
        )}
      </aside>
      <nav aria-label="Kandidatennavigation">
        {currentIndex > 0 && (
          <Link
            to={`/__review/questions/${filteredDecisions[currentIndex - 1]?.canonicalQuestionId}`}
          >
            Vorheriger Kandidat
          </Link>
        )}
        {currentIndex < filteredDecisions.length - 1 && (
          <Link
            to={`/__review/questions/${filteredDecisions[currentIndex + 1]?.canonicalQuestionId}`}
          >
            Nächster Kandidat
          </Link>
        )}
      </nav>
    </section>
  );
}
