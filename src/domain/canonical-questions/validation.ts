import { CanonicalQuestionsFileSchema, type CanonicalQuestion } from '../../content/schemas';

export type CanonicalQuestionCorpus = ReturnType<typeof CanonicalQuestionsFileSchema.parse>;

const placeholderPattern =
  /(?:thema aus quelle zu verifizieren|apply the appropriate method|choose a small instance|tbd|todo)/iu;
const localDependencyPattern = /(?:[a-z]:\\|file:\/\/|\.pdf\b|pdfs[\\/])/iu;

export function validateCanonicalQuestionCorpus(input: unknown): CanonicalQuestionCorpus {
  const corpus = CanonicalQuestionsFileSchema.parse(input);
  const issues: string[] = [];

  corpus.questions.forEach((question) => validateQuestion(question, issues));
  if (issues.length > 0)
    throw new Error(`Kanonischer Fragenkorpus ist ungültig:\n- ${issues.join('\n- ')}`);
  return corpus;
}

function validateQuestion(question: CanonicalQuestion, issues: string[]): void {
  const prefix = `${question.questionId}:`;
  const bodyText = JSON.stringify(question.bodyBlocks);
  const solutionText = JSON.stringify(question.solution.blocks);
  if (placeholderPattern.test(question.title) || placeholderPattern.test(bodyText))
    issues.push(`${prefix} Platzhalter oder generische Anweisung im Aufgabenkörper.`);
  if (localDependencyPattern.test(bodyText) || localDependencyPattern.test(solutionText))
    issues.push(`${prefix} lokaler Pfad oder PDF-Abhängigkeit in öffentlichen Inhalten.`);
  if (question.bodyBlocks.length === 0) issues.push(`${prefix} Aufgabenkörper fehlt.`);
  if (question.expectedDeliverables.length === 0) issues.push(`${prefix} erwartete Abgabe fehlt.`);
  if (question.sourceRefs.length === 0) issues.push(`${prefix} Quellenbezug fehlt.`);
  if (question.solutionStatus !== 'no_solution_known' && question.solutionSourceRefs.length === 0)
    issues.push(`${prefix} Lösungsquellenbezug fehlt.`);
  if (question.topicIds.length === 0) issues.push(`${prefix} Themenzuordnung fehlt.`);
  if (question.taskSlotNumbers.length === 0)
    issues.push(`${prefix} Aufgaben-Slot-Zuordnung fehlt.`);
  if (!question.manuallyVerified) issues.push(`${prefix} manuelle Prüfung fehlt.`);
  if (question.contentReviewStatus !== 'content_reviewed')
    issues.push(`${prefix} Inhaltsreview fehlt.`);
  if (question.finalReviewStatus !== 'final_reviewed') issues.push(`${prefix} Finalreview fehlt.`);
  if (question.publicationMode === 'exact_approved' && question.hostedMaterialApproval === null)
    issues.push(`${prefix} exact_approved ohne Rechtefreigabe.`);

  const bodySubtasks = question.bodyBlocks
    .filter((block) => block.type === 'subtask')
    .map((block) => block.label);
  if (
    new Set(question.subtaskLabels).size !== question.subtaskLabels.length ||
    JSON.stringify(bodySubtasks) !== JSON.stringify(question.subtaskLabels)
  )
    issues.push(`${prefix} Unteraufgabenlabels stimmen nicht mit den Inhaltsblöcken überein.`);

  for (const block of [
    ...flattenBlocks(question.bodyBlocks),
    ...flattenBlocks(question.solution.blocks),
  ]) {
    if (
      [
        'math',
        'pseudocode',
        'array',
        'matrix',
        'graph',
        'tree',
        'dp_table',
        'operation_sequence',
      ].includes(block.type) &&
      !('textAlternative' in block)
    )
      issues.push(`${prefix} visueller Block ${block.type} ohne Textalternative.`);
    if (block.type === 'graph') {
      const nodeIds = new Set(block.nodes.map((node) => node.id));
      if (block.edges.some((edge) => !nodeIds.has(edge.from) || !nodeIds.has(edge.to)))
        issues.push(`${prefix} Graphkante verweist auf einen fehlenden Knoten.`);
      const positioned = block.nodes.filter((node) => node.x !== undefined && node.y !== undefined);
      if (positioned.length > 0 && positioned.length !== block.nodes.length)
        issues.push(`${prefix} Graphkoordinaten sind nur teilweise vorhanden.`);
    }
    if (block.type === 'tree' && block.nodes) {
      const nodeIds = new Set(block.nodes.map((node) => node.id));
      if (
        block.nodes.some(
          (node) =>
            (node.left !== null && !nodeIds.has(node.left)) ||
            (node.right !== null && !nodeIds.has(node.right)),
        )
      )
        issues.push(`${prefix} Baumkante verweist auf einen fehlenden Knoten.`);
      if (!block.nilConvention) issues.push(`${prefix} strukturierter Baum ohne NIL-Konvention.`);
    }
  }
}

function flattenBlocks(blocks: CanonicalQuestion['bodyBlocks']): CanonicalQuestion['bodyBlocks'] {
  return blocks.flatMap((block) =>
    block.type === 'subtask' ? [block, ...flattenBlocks(block.blocks)] : [block],
  );
}
