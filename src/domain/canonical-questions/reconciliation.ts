import {
  QuestionEvidenceLinksFileSchema,
  QuestionIdentityDecisionsFileSchema,
  QuestionResourceMappingReportSchema,
  type CanonicalQuestion,
} from '../../content/schemas';

export function validateCanonicalQuestionReviewData(input: {
  questions: CanonicalQuestion[];
  identityDecisions: unknown;
  evidenceLinks: unknown;
  resourceMappings: unknown;
  originalCandidateCount: number;
}) {
  const identityDecisions = QuestionIdentityDecisionsFileSchema.parse(input.identityDecisions);
  const evidenceLinks = QuestionEvidenceLinksFileSchema.parse(input.evidenceLinks);
  const resourceMappings = QuestionResourceMappingReportSchema.parse(input.resourceMappings);
  const questionIds = new Set(input.questions.map((question) => question.questionId));
  const finalDecisionIds = new Set(
    identityDecisions.decisions
      .filter((decision) => decision.decisionState === 'verified_canonical_question')
      .map((decision) => decision.canonicalQuestionId),
  );
  const linkIds = new Set(evidenceLinks.links.map((link) => link.questionId));
  const mappingIds = new Set(resourceMappings.mappings.map((mapping) => mapping.questionId));

  for (const questionId of questionIds) {
    if (!finalDecisionIds.has(questionId))
      throw new Error(`${questionId}: finale Identitätsentscheidung fehlt.`);
    if (!linkIds.has(questionId)) throw new Error(`${questionId}: Evidenzverknüpfung fehlt.`);
    if (!mappingIds.has(questionId)) throw new Error(`${questionId}: Ressourcenmapping fehlt.`);
  }
  if (
    identityDecisions.decisions.length + identityDecisions.openCandidateCount !==
    input.originalCandidateCount
  )
    throw new Error(
      'Entschiedene und offene Identitätskandidaturen ergeben nicht den Originalbestand.',
    );
  if (resourceMappings.mappedCanonicalQuestionCount !== resourceMappings.mappings.length)
    throw new Error('Mapping-Zähler stimmt nicht mit den Mapping-Datensätzen überein.');

  return { identityDecisions, evidenceLinks, resourceMappings };
}
