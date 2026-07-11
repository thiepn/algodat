import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Link, useParams } from 'react-router-dom';
import { content } from '../../content/loaders/content';
import type { CanonicalQuestionBlock } from '../../content/schemas';
import { PlannedState } from '../../ui/feedback/PlannedState';

const enabled =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_CANONICAL_QUESTION_PREVIEW === 'true';

function isPubliclyVisibleQuestion(
  question: (typeof content.canonicalQuestions.questions)[number],
): boolean {
  return (
    question.verificationStatus === 'verified' &&
    question.manuallyVerified &&
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
  if (!import.meta.env.DEV)
    return (
      <PlannedState
        title="Korpusreview"
        description="Diese Prüfroute ist ausschließlich in der Entwicklung verfügbar."
      />
    );
  const question = questionId
    ? content.canonicalQuestions.questions.find((candidate) => candidate.questionId === questionId)
    : content.canonicalQuestions.questions[0];
  if (!question)
    return (
      <PlannedState
        title="Korpusreview"
        description="Der kanonische Korpus enthält noch keine Frage."
      />
    );
  return (
    <section className="page-stack">
      <QuestionView question={question} />
      <aside className="notice">
        <h2>Prüfcheckliste</h2>
        <ul>
          <li>Identität: {question.manuallyVerified ? 'geprüft' : 'offen'}</li>
          <li>Publikationsmodus: {question.publicationMode}</li>
          <li>Quellen: {question.sourceRefs.length}</li>
          <li>
            Zuordnungen: Themen {question.topicIds.length}, Slots {question.taskSlotNumbers.length},
            Trainer {question.trainerIds.length}
          </li>
        </ul>
      </aside>
    </section>
  );
}
