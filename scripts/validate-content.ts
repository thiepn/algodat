import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  CitationFixturesFileSchema,
  ContentHealthSchema,
  ContentManifestSchema,
  DivideConquerDesignRubricsFileSchema,
  DivideConquerDesignTrainersFileSchema,
  DivideConquerDesignVariantsFileSchema,
  DpDesignRubricsFileSchema,
  DpDesignTrainersFileSchema,
  DpDesignVariantsFileSchema,
  ExamPackagesFileSchema,
  ExamProfileCoverageFileSchema,
  ExamScoringPoliciesFileSchema,
  ExamTaskInstancesFileSchema,
  ExamProfilesFileSchema,
  GreedyDesignRubricsFileSchema,
  GreedyDesignTrainersFileSchema,
  GreedyDesignVariantsFileSchema,
  GraphTracingRubricsFileSchema,
  GraphTracingTrainersFileSchema,
  GraphTracingVariantsFileSchema,
  RbInsertionRubricsFileSchema,
  RbInsertionTrainersFileSchema,
  RbInsertionVariantsFileSchema,
  ProofRubricsFileSchema,
  ProofTrainersFileSchema,
  RecurrenceRubricsFileSchema,
  RecurrenceTrainersFileSchema,
  SafeSourcesFileSchema,
  TopicsIndexFileSchema,
  TracingRubricsFileSchema,
  TracingTrainersFileSchema,
} from '../src/content/schemas';
import {
  DiagnosticItemsFileSchema,
  DiagnosticMisconceptionsFileSchema,
  DiagnosticRecommendationRulesFileSchema,
  DiagnosticSessionTemplatesFileSchema,
  FoundationCompetenciesFileSchema,
} from '../src/domain/foundations-diagnostic/schemas';
import {
  ExamDatePhasePolicySchema,
  ExamSlotCompetencyMapFileSchema,
  ReadinessPolicySchema,
  SpacedReviewPolicySchema,
  StudyActivityCatalogFileSchema,
  StudyPlanDefaultSettingsSchema,
  StudyPriorityPolicySchema,
} from '../src/domain/study-orchestrator/schemas';
import {
  CheatSheetCatalogFileSchema,
  CheatSheetLayoutPolicySchema,
  CheatSheetPresetsFileSchema,
} from '../src/domain/cheat-sheet/schemas';
import { generatedDir, readJson, sha256File } from './content-utils';

const manifest = ContentManifestSchema.parse(
  await readJson(path.join(generatedDir, 'content-manifest.json')),
);
const sources = SafeSourcesFileSchema.parse(
  await readJson(path.join(generatedDir, 'sources.json')),
);
const topics = TopicsIndexFileSchema.parse(
  await readJson(path.join(generatedDir, 'topics-index.json')),
);
const profiles = ExamProfilesFileSchema.parse(
  await readJson(path.join(generatedDir, 'exam-profiles.json')),
);
const fixtures = CitationFixturesFileSchema.parse(
  await readJson(path.join(generatedDir, 'citation-fixtures.json')),
);
const health = ContentHealthSchema.parse(
  await readJson(path.join(generatedDir, 'content-health.json')),
);
const trainers = TracingTrainersFileSchema.parse(
  await readJson(path.join(generatedDir, 'tracing-trainers.json')),
);
const rubrics = TracingRubricsFileSchema.parse(
  await readJson(path.join(generatedDir, 'tracing-rubrics.json')),
);
const proofTrainers = ProofTrainersFileSchema.parse(
  await readJson(path.join(generatedDir, 'proof-trainers.json')),
);
const proofRubrics = ProofRubricsFileSchema.parse(
  await readJson(path.join(generatedDir, 'proof-rubrics.json')),
);
const recurrenceTrainers = RecurrenceTrainersFileSchema.parse(
  await readJson(path.join(generatedDir, 'recurrence-trainers.json')),
);
const recurrenceRubrics = RecurrenceRubricsFileSchema.parse(
  await readJson(path.join(generatedDir, 'recurrence-rubrics.json')),
);
const dpDesignTrainers = DpDesignTrainersFileSchema.parse(
  await readJson(path.join(generatedDir, 'dp-design-trainers.json')),
);
const dpDesignRubrics = DpDesignRubricsFileSchema.parse(
  await readJson(path.join(generatedDir, 'dp-design-rubrics.json')),
);
const dpDesignVariants = DpDesignVariantsFileSchema.parse(
  await readJson(path.join(generatedDir, 'dp-design-variants.json')),
);
const divideConquerDesignTrainers = DivideConquerDesignTrainersFileSchema.parse(
  await readJson(path.join(generatedDir, 'divide-conquer-design-trainers.json')),
);
const divideConquerDesignRubrics = DivideConquerDesignRubricsFileSchema.parse(
  await readJson(path.join(generatedDir, 'divide-conquer-design-rubrics.json')),
);
const divideConquerDesignVariants = DivideConquerDesignVariantsFileSchema.parse(
  await readJson(path.join(generatedDir, 'divide-conquer-design-variants.json')),
);
const greedyDesignTrainers = GreedyDesignTrainersFileSchema.parse(
  await readJson(path.join(generatedDir, 'greedy-design-trainers.json')),
);
const greedyDesignRubrics = GreedyDesignRubricsFileSchema.parse(
  await readJson(path.join(generatedDir, 'greedy-design-rubrics.json')),
);
const greedyDesignVariants = GreedyDesignVariantsFileSchema.parse(
  await readJson(path.join(generatedDir, 'greedy-design-variants.json')),
);
const rbInsertionTrainers = RbInsertionTrainersFileSchema.parse(
  await readJson(path.join(generatedDir, 'rb-insertion-trainers.json')),
);
const rbInsertionRubrics = RbInsertionRubricsFileSchema.parse(
  await readJson(path.join(generatedDir, 'rb-insertion-rubrics.json')),
);
const rbInsertionVariants = RbInsertionVariantsFileSchema.parse(
  await readJson(path.join(generatedDir, 'rb-insertion-variants.json')),
);
const graphTracingTrainers = GraphTracingTrainersFileSchema.parse(
  await readJson(path.join(generatedDir, 'graph-tracing-trainers.json')),
);
const graphTracingRubrics = GraphTracingRubricsFileSchema.parse(
  await readJson(path.join(generatedDir, 'graph-tracing-rubrics.json')),
);
const graphTracingVariants = GraphTracingVariantsFileSchema.parse(
  await readJson(path.join(generatedDir, 'graph-tracing-variants.json')),
);
const examProfileCoverage = ExamProfileCoverageFileSchema.parse(
  await readJson(path.join(generatedDir, 'exam-profile-coverage.json')),
);
const examPackages = ExamPackagesFileSchema.parse(
  await readJson(path.join(generatedDir, 'exam-packages.json')),
);
const examTaskInstances = ExamTaskInstancesFileSchema.parse(
  await readJson(path.join(generatedDir, 'exam-task-instances.json')),
);
ExamScoringPoliciesFileSchema.parse(
  await readJson(path.join(generatedDir, 'exam-scoring-policies.json')),
);
const foundationCompetencies = FoundationCompetenciesFileSchema.parse(
  await readJson(path.join(generatedDir, 'foundation-competencies.json')),
);
const diagnosticItemFiles = [
  'diagnostic-items-asymptotics.json',
  'diagnostic-items-recurrences.json',
  'diagnostic-items-sorting-search.json',
  'diagnostic-items-data-structures.json',
  'diagnostic-items-graphs.json',
  'diagnostic-items-paradigms.json',
  'diagnostic-items-proofs.json',
];
const diagnosticItems = DiagnosticItemsFileSchema.parse(
  (
    await Promise.all(
      diagnosticItemFiles.map((fileName) => readJson(path.join(generatedDir, fileName))),
    )
  ).flat(),
);
const diagnosticTemplates = DiagnosticSessionTemplatesFileSchema.parse(
  await readJson(path.join(generatedDir, 'diagnostic-session-templates.json')),
);
const diagnosticMisconceptions = DiagnosticMisconceptionsFileSchema.parse(
  await readJson(path.join(generatedDir, 'diagnostic-misconceptions.json')),
);
const diagnosticRecommendationRules = DiagnosticRecommendationRulesFileSchema.parse(
  await readJson(path.join(generatedDir, 'diagnostic-recommendation-rules.json')),
);
const studyActivityCatalog = StudyActivityCatalogFileSchema.parse(
  await readJson(path.join(generatedDir, 'study-activity-catalog.json')),
);
const examSlotCompetencyMap = ExamSlotCompetencyMapFileSchema.parse(
  await readJson(path.join(generatedDir, 'exam-slot-competency-map.json')),
);
const studyPriorityPolicy = StudyPriorityPolicySchema.parse(
  await readJson(path.join(generatedDir, 'study-priority-policy.json')),
);
const spacedReviewPolicy = SpacedReviewPolicySchema.parse(
  await readJson(path.join(generatedDir, 'spaced-review-policy.json')),
);
const readinessPolicy = ReadinessPolicySchema.parse(
  await readJson(path.join(generatedDir, 'readiness-policy.json')),
);
const examDatePhasePolicy = ExamDatePhasePolicySchema.parse(
  await readJson(path.join(generatedDir, 'exam-date-phase-policy.json')),
);
const studyPlanDefaultSettings = StudyPlanDefaultSettingsSchema.parse(
  await readJson(path.join(generatedDir, 'study-plan-default-settings.json')),
);
const cheatSheetBlocks = CheatSheetCatalogFileSchema.parse(
  await readJson(path.join(generatedDir, 'cheat-sheet-blocks.json')),
);
const cheatSheetPresets = CheatSheetPresetsFileSchema.parse(
  await readJson(path.join(generatedDir, 'cheat-sheet-presets.json')),
);
const cheatSheetLayoutPolicy = CheatSheetLayoutPolicySchema.parse(
  await readJson(path.join(generatedDir, 'cheat-sheet-layout-policy.json')),
);
const sourceMap = new Map(sources.map((source) => [source.id, source]));
const errors: string[] = [];
const topicIds = new Set(topics.map((topic) => topic.id));
const trainerIds = new Set([
  ...trainers.map((trainer) => trainer.id),
  ...proofTrainers.map((trainer) => trainer.id),
  ...recurrenceTrainers.map((trainer) => trainer.id),
  ...dpDesignTrainers.map((trainer) => trainer.id),
  ...divideConquerDesignTrainers.map((trainer) => trainer.id),
  ...greedyDesignTrainers.map((trainer) => trainer.id),
  ...rbInsertionTrainers.map((trainer) => trainer.id),
  ...graphTracingTrainers.map((trainer) => trainer.id),
]);

for (const entry of manifest.files) {
  if ((await sha256File(path.join(generatedDir, entry.name))) !== entry.sha256)
    errors.push(`Hash abweichend: ${entry.name}`);
}
for (const item of [...topics, ...profiles, ...fixtures]) {
  for (const ref of item.sourceRefs) {
    const source = sourceMap.get(ref.sourceId);
    if (!source) errors.push(`${item.id}: Quelle ${ref.sourceId} fehlt`);
    else if (source.pageCount !== null && ref.page > source.pageCount)
      errors.push(`${item.id}: Seite ${ref.page} fehlt`);
  }
  if (
    item.verificationStatus === 'official_verified' &&
    item.sourceRefs.some((ref) => sourceMap.get(ref.sourceId)?.authorityLevel !== 1)
  ) {
    errors.push(`${item.id}: official_verified ohne Autorität 1`);
  }
}
for (const item of [
  ...trainers,
  ...trainers.map((trainer) => trainer.problem),
  ...rubrics,
  ...proofTrainers,
  ...proofTrainers.map((trainer) => trainer.problem),
  ...proofRubrics,
  ...recurrenceTrainers,
  ...recurrenceTrainers.map((trainer) => trainer.problem),
  ...recurrenceRubrics,
  ...dpDesignTrainers,
  ...dpDesignTrainers.map((trainer) => trainer.problem),
  ...dpDesignVariants,
  ...dpDesignRubrics,
  ...divideConquerDesignTrainers,
  ...divideConquerDesignTrainers.map((trainer) => trainer.problem),
  ...divideConquerDesignVariants,
  ...divideConquerDesignRubrics,
  ...greedyDesignTrainers,
  ...greedyDesignTrainers.map((trainer) => trainer.problem),
  ...greedyDesignVariants,
  ...greedyDesignRubrics,
  ...rbInsertionTrainers,
  ...rbInsertionTrainers.map((trainer) => trainer.problem),
  ...rbInsertionVariants,
  ...rbInsertionRubrics,
  ...graphTracingTrainers,
  ...graphTracingTrainers.map((trainer) => trainer.problem),
  ...graphTracingVariants,
  ...graphTracingRubrics,
  ...examPackages,
  ...examPackages.flatMap((examPackage) => examPackage.taskSlots),
  ...examTaskInstances,
  ...foundationCompetencies.map((competency) => ({
    id: competency.competencyId,
    sourceRefs: competency.sourceRefs,
  })),
  ...diagnosticItems,
  ...diagnosticTemplates.map((template) => ({ id: template.id, sourceRefs: [] })),
  ...diagnosticMisconceptions.map((misconception) => ({
    id: misconception.misconceptionId,
    sourceRefs: misconception.sourceRefs,
  })),
  ...diagnosticRecommendationRules.map((rule) => ({ id: rule.id, sourceRefs: [] })),
]) {
  if ('publicDistributionStatus' in item && item.publicDistributionStatus !== 'public_safe')
    errors.push(`${item.id}: nicht öffentlicher Trainerinhalt im Bundle`);
  for (const ref of item.sourceRefs) {
    const source = sourceMap.get(ref.sourceId);
    if (!source) errors.push(`${item.id}: Quelle ${ref.sourceId} fehlt`);
    else if (source.pageCount !== null && ref.page > source.pageCount)
      errors.push(`${item.id}: Seite ${ref.page} fehlt`);
  }
}
const competencyIds = new Set(foundationCompetencies.map((competency) => competency.competencyId));
const misconceptionIds = new Set(
  diagnosticMisconceptions.map((misconception) => misconception.misconceptionId),
);
const diagnosticTemplateIds = new Set(diagnosticTemplates.map((template) => template.id));
const examPackageIds = new Set(examPackages.map((examPackage) => examPackage.id));
const activityIds = new Set(studyActivityCatalog.map((activity) => activity.activityId));
const cheatSheetBlockIds = new Set(cheatSheetBlocks.map((block) => block.blockId));
const diagnosticItemIds = new Set<string>();
for (const competency of foundationCompetencies) {
  for (const topicId of competency.topicIds)
    if (!topicIds.has(topicId)) errors.push(`${competency.competencyId}: Thema fehlt ${topicId}`);
  for (const trainerId of competency.relatedTrainerIds)
    if (!trainerIds.has(trainerId))
      errors.push(`${competency.competencyId}: Trainer fehlt ${trainerId}`);
}
for (const item of diagnosticItems) {
  if (diagnosticItemIds.has(item.id)) errors.push(`${item.id}: doppelte Diagnoseitem-ID`);
  diagnosticItemIds.add(item.id);
  if (item.publicDistributionStatus !== 'public_safe')
    errors.push(`${item.id}: Diagnoseitem nicht public_safe`);
  if (item.solutionValidationStatus !== 'deterministic_engine_verified')
    errors.push(`${item.id}: Diagnoseitem ohne deterministische Lösung`);
  for (const competencyId of item.competencyIds)
    if (!competencyIds.has(competencyId))
      errors.push(`${item.id}: Kompetenz fehlt ${competencyId}`);
  for (const topicId of item.topicIds)
    if (!topicIds.has(topicId)) errors.push(`${item.id}: Thema fehlt ${topicId}`);
  for (const trainerId of item.relatedTrainerIds)
    if (!trainerIds.has(trainerId)) errors.push(`${item.id}: Trainer fehlt ${trainerId}`);
  for (const misconceptionId of item.misconceptionIds)
    if (!misconceptionIds.has(misconceptionId))
      errors.push(`${item.id}: Misconception fehlt ${misconceptionId}`);
  for (const option of item.options) {
    if (!option.correct && !option.misconceptionId)
      errors.push(`${item.id}/${option.id}: Distraktor ohne misconceptionId`);
    if (!option.correct && !option.reasonIncorrect)
      errors.push(`${item.id}/${option.id}: Distraktor ohne Fehlergrund`);
  }
}
for (const template of diagnosticTemplates) {
  for (const competencyId of template.competencyTargets)
    if (!competencyIds.has(competencyId))
      errors.push(`${template.id}: Kompetenz fehlt ${competencyId}`);
}
for (const rule of diagnosticRecommendationRules) {
  if (rule.targetType === 'trainer' && !trainerIds.has(rule.targetId))
    errors.push(`${rule.id}: Empfehlungstrainer fehlt ${rule.targetId}`);
}
for (const activity of studyActivityCatalog) {
  if (activity.publicDistributionStatus !== 'public_safe')
    errors.push(`${activity.activityId}: Aktivität nicht public_safe`);
  for (const competencyId of activity.targetCompetencyIds)
    if (!competencyIds.has(competencyId))
      errors.push(`${activity.activityId}: Kompetenz fehlt ${competencyId}`);
  for (const prerequisiteId of activity.prerequisiteCompetencyIds)
    if (!competencyIds.has(prerequisiteId))
      errors.push(`${activity.activityId}: Voraussetzungskompetenz fehlt ${prerequisiteId}`);
  if (activity.relatedTrainerId && !trainerIds.has(activity.relatedTrainerId))
    errors.push(`${activity.activityId}: Trainer fehlt ${activity.relatedTrainerId}`);
  if (
    activity.relatedDiagnosticTemplateId &&
    !diagnosticTemplateIds.has(activity.relatedDiagnosticTemplateId)
  )
    errors.push(
      `${activity.activityId}: Diagnose-Template fehlt ${activity.relatedDiagnosticTemplateId}`,
    );
  if (activity.relatedExamPackageId && !examPackageIds.has(activity.relatedExamPackageId))
    errors.push(`${activity.activityId}: ExamPackage fehlt ${activity.relatedExamPackageId}`);
  if (activity.minimumMinutes > activity.estimatedMinutes)
    errors.push(`${activity.activityId}: Mindestdauer größer als Schätzdauer`);
  if (activity.estimatedMinutes > activity.maximumMinutes)
    errors.push(`${activity.activityId}: Schätzdauer größer als Maximaldauer`);
}
for (const slot of examSlotCompetencyMap) {
  for (const trainerId of slot.trainerIds)
    if (!trainerIds.has(trainerId)) errors.push(`${slot.slotId}: Trainer fehlt ${trainerId}`);
  for (const competencyId of slot.competencyIds)
    if (!competencyIds.has(competencyId))
      errors.push(`${slot.slotId}: Kompetenz fehlt ${competencyId}`);
  for (const activityId of slot.activityIds)
    if (!activityIds.has(activityId)) errors.push(`${slot.slotId}: Aktivität fehlt ${activityId}`);
}
for (const block of cheatSheetBlocks) {
  if (block.publicDistributionStatus !== 'public_safe')
    errors.push(`${block.blockId}: Spickzettelblock nicht public_safe`);
  if (block.solutionValidationStatus === 'unverified')
    errors.push(`${block.blockId}: Spickzettelblock nicht verifiziert`);
  for (const topicId of block.topicIds)
    if (!topicIds.has(topicId)) errors.push(`${block.blockId}: Thema fehlt ${topicId}`);
  for (const ref of block.sourceRefs) {
    const source = sourceMap.get(ref.sourceId);
    if (!source) errors.push(`${block.blockId}: Quelle ${ref.sourceId} fehlt`);
    else if (source.pageCount !== null && ref.page > source.pageCount)
      errors.push(`${block.blockId}: Seite ${ref.page} fehlt`);
  }
  if (/(?:^|["'`/\\])pdfs[\\/]|[A-Z]:[\\/]|Users[\\/]junso|\.pdf/iu.test(JSON.stringify(block)))
    errors.push(`${block.blockId}: Spickzettelblock enthält privaten Pfad oder PDF-Link`);
}
for (const preset of cheatSheetPresets) {
  for (const blockId of preset.defaultBlockIds)
    if (!cheatSheetBlockIds.has(blockId))
      errors.push(`${preset.presetId}: Spickzettelblock fehlt ${blockId}`);
}
if (cheatSheetLayoutPolicy.pageCount !== 2)
  errors.push('Phase 16: Spickzettel-Layout ist nicht auf exakt zwei Seiten begrenzt');
if (new Set(examSlotCompetencyMap.map((slot) => slot.taskNumber)).size < 9)
  errors.push('Phase 15: nicht alle Aufgaben 1 bis 9 im Slot-Mapping');
if (spacedReviewPolicy.intervalDays.join(',') !== '1,3,7,14,30')
  errors.push('Phase 15: Review-Intervalle weichen von dokumentierter Basis ab');
if (readinessPolicy.thresholds.examReadyAt <= readinessPolicy.thresholds.mostlyStableBelow)
  errors.push('Phase 15: Readiness-Schwellen inkonsistent');
if (!examDatePhasePolicy.phases.some((phase) => phase.phase === 'final_review_phase'))
  errors.push('Phase 15: Prüfungsdatums-Policy ohne finale Wiederholungsphase');
if (studyPlanDefaultSettings.dailyMinuteBudget < 15) errors.push('Phase 15: Tagesbudget zu klein');
void studyPriorityPolicy;
if (diagnosticItems.length < 60)
  errors.push(`Phase 14: zu wenige produktive Items (${diagnosticItems.length})`);
if (new Set(foundationCompetencies.map((competency) => competency.group)).size < 8)
  errors.push('Phase 14: weniger als acht Kompetenzgruppen');
if (new Set(diagnosticItems.map((item) => item.itemType)).size < 8)
  errors.push('Phase 14: weniger als acht produktive Itemtypen');
for (const profile of examProfileCoverage.profiles) {
  if (profile.coverageStatus !== 'fully_supported' && profile.startable)
    errors.push(`${profile.profileId}: unvollständiges Profil ist startbar`);
}
for (const examPackage of examPackages) {
  const sumNumerator = examPackage.taskSlots.reduce(
    (sum, slot) => sum + slot.examPoints.numerator * examPackage.totalPoints.denominator,
    0,
  );
  const expectedNumerator =
    examPackage.totalPoints.numerator *
    examPackage.taskSlots.reduce((product, slot) => product * slot.examPoints.denominator, 1);
  const normalizedSum = examPackage.taskSlots.reduce(
    (sum, slot) => sum + slot.examPoints.numerator / slot.examPoints.denominator,
    0,
  );
  if (
    Math.abs(
      normalizedSum - examPackage.totalPoints.numerator / examPackage.totalPoints.denominator,
    ) > 1e-9
  )
    errors.push(`${examPackage.id}: Punktesumme inkonsistent`);
  if (examPackage.historicalExam)
    errors.push(`${examPackage.id}: historische Klausur fälschlich startbar`);
  if (!examPackage.fullyAutoGradable)
    errors.push(`${examPackage.id}: startbares Paket ist nicht vollständig bewertbar`);
  void sumNumerator;
  void expectedNumerator;
}
for (const topic of topics) {
  for (const prerequisite of topic.prerequisites) {
    if (
      !topics.some((candidate) => candidate.name === prerequisite) &&
      prerequisite !== 'Algorithmen und Berechnungsprobleme'
    ) {
      errors.push(`${topic.id}: Voraussetzung fehlt: ${prerequisite}`);
    }
  }
}
const combined = await Promise.all(
  manifest.files.map((entry) => readFile(path.join(generatedDir, entry.name), 'utf8')),
);
const forbidden = [/info 1 copy/iu, /[A-Z]:\\/u, /Users[\\/]junso/iu];
for (const pattern of forbidden)
  if (combined.some((text) => pattern.test(text))) errors.push(`Verbotener Inhalt: ${pattern}`);
if (!health.phase0ValidationPassed || !health.phase0aValidationPassed)
  errors.push('Phase-Gate ist nicht grün.');
if (health.brokenReferenceCount !== 0) errors.push('Content Health meldet gebrochene Referenzen.');

if (errors.length) throw new Error(`Content-Validierung fehlgeschlagen:\n${errors.join('\n')}`);
console.log(
  `Content-Validierung bestanden: ${manifest.files.length} Dateien, 0 gebrochene Referenzen.`,
);
