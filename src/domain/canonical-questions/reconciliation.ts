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
  const excludedEvidenceIds = new Set(
    identityDecisions.excludedEvidence.map((evidence) => evidence.evidenceId),
  );

  for (const questionId of questionIds) {
    if (!finalDecisionIds.has(questionId))
      throw new Error(`${questionId}: finale Identitätsentscheidung fehlt.`);
    if (!linkIds.has(questionId)) throw new Error(`${questionId}: Evidenzverknüpfung fehlt.`);
    if (!mappingIds.has(questionId)) throw new Error(`${questionId}: Ressourcenmapping fehlt.`);
    const question = input.questions.find((candidate) => candidate.questionId === questionId)!;
    const mapping = resourceMappings.mappings.find(
      (candidate) => candidate.questionId === questionId,
    )!;
    for (const key of [
      'topicIds',
      'taskSlotNumbers',
      'moduleIds',
      'trainerIds',
      'diagnosticCompetencyIds',
    ] as const)
      if (JSON.stringify(mapping[key]) !== JSON.stringify(question[key]))
        throw new Error(`${questionId}: Ressourcenmapping und kanonische Frage weichen ab.`);
    const trainerIsLinked = mapping.trainerIds.length > 0;
    const coverageRequiresTrainer = ['available', 'full', 'partial'].includes(
      mapping.trainerCoverage,
    );
    if (trainerIsLinked !== coverageRequiresTrainer)
      throw new Error(`${questionId}: Trainerabdeckung ist nicht konsistent ausgewiesen.`);
  }
  for (const link of evidenceLinks.links)
    if (
      [...link.evidenceIds, ...link.solutionEvidenceIds].some((id) => excludedEvidenceIds.has(id))
    )
      throw new Error(`${link.questionId}: ausgeschlossene Evidenz ist als Frage verknüpft.`);
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
