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
  if (question.topicIds.length === 0) issues.push(`${prefix} Themenzuordnung fehlt.`);
  if (question.taskSlotNumbers.length === 0)
    issues.push(`${prefix} Aufgaben-Slot-Zuordnung fehlt.`);
  if (!question.manuallyVerified) issues.push(`${prefix} manuelle Prüfung fehlt.`);
  if (question.publicationMode === 'exact_approved' && question.hostedMaterialApproval === null)
    issues.push(`${prefix} exact_approved ohne Rechtefreigabe.`);

  for (const block of flattenBlocks(question.bodyBlocks)) {
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
  }
}

function flattenBlocks(blocks: CanonicalQuestion['bodyBlocks']): CanonicalQuestion['bodyBlocks'] {
  return blocks.flatMap((block) =>
    block.type === 'subtask' ? [block, ...flattenBlocks(block.blocks)] : [block],
  );
}
