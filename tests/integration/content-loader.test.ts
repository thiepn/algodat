import { describe, expect, it } from 'vitest';
import { cheatSheetContent } from '../../src/content/loaders/cheat-sheet';
import { content } from '../../src/content/loaders/content';
import { diagnosticContent } from '../../src/content/loaders/diagnostics';
import { studyOrchestratorContent } from '../../src/content/loaders/study-orchestrator';

describe('Content Loader und Referenzen', () => {
  it('lädt das sichere Phase-15-Paket mit Diagnosebank, Lernplan und elf Trainern', () => {
    expect(content.sources).toHaveLength(content.manifest.sourceCount);
    expect(content.topics).toHaveLength(content.manifest.topicCount);
    expect(content.profiles.map((profile) => profile.id)).toEqual([
      'standard-praesenz',
      'klausur-2021',
    ]);
    expect(content.trainers).toHaveLength(2);
    expect(content.proofTrainers).toHaveLength(1);
    expect(content.recurrenceTrainers).toHaveLength(1);
    expect(content.dpDesignTrainers).toHaveLength(1);
    expect(content.divideConquerDesignTrainers).toHaveLength(1);
    expect(content.greedyDesignTrainers).toHaveLength(1);
    expect(content.rbInsertionTrainers).toHaveLength(1);
    expect(content.graphTracingTrainers).toHaveLength(3);
    expect(content.examPackages).toHaveLength(4);
    expect(content.examTaskInstances).toHaveLength(25);
    expect(diagnosticContent.foundationCompetencies).toHaveLength(8);
    expect(diagnosticContent.diagnosticItems).toHaveLength(64);
    expect(diagnosticContent.diagnosticSessionTemplates).toHaveLength(3);
    expect(new Set(diagnosticContent.diagnosticItems.map((item) => item.itemType)).size).toBe(8);
    expect(studyOrchestratorContent.activityCatalog.length).toBeGreaterThanOrEqual(10);
    expect(studyOrchestratorContent.examSlotMap).toHaveLength(9);
    expect(studyOrchestratorContent.priorityPolicy.policyVersion).toBe('study-priority-v1');
    expect(cheatSheetContent.blocks.length).toBeGreaterThanOrEqual(16);
    expect(cheatSheetContent.presets.map((preset) => preset.mode)).toEqual([
      'standard',
      'weakness',
      'slot',
      'manual',
      'minimal',
    ]);
    expect(cheatSheetContent.layoutPolicy.pageCount).toBe(2);
    expect(content.examProfileCoverage.profiles).toHaveLength(6);
    expect(
      content.trainers.length +
        content.proofTrainers.length +
        content.recurrenceTrainers.length +
        content.dpDesignTrainers.length +
        content.divideConquerDesignTrainers.length +
        content.greedyDesignTrainers.length +
        content.rbInsertionTrainers.length +
        content.graphTracingTrainers.length,
    ).toBe(content.manifest.trainerCount);
    expect(
      [
        ...content.trainers,
        ...content.proofTrainers,
        ...content.recurrenceTrainers,
        ...content.dpDesignTrainers,
        ...content.divideConquerDesignTrainers,
        ...content.greedyDesignTrainers,
        ...content.rbInsertionTrainers,
        ...content.graphTracingTrainers,
      ].every((trainer) => trainer.publicDistributionStatus === 'public_safe'),
    ).toBe(true);
    expect(content.trainers.map((trainer) => trainer.id)).toEqual([
      'trainer-rucksack-dp-v1',
      'trainer-union-find-listen-v1',
    ]);
    expect(content.proofTrainers.map((trainer) => trainer.id)).toEqual([
      'trainer-schleifeninvariante-summe-v1',
    ]);
    expect(content.recurrenceTrainers.map((trainer) => trainer.id)).toEqual([
      'trainer-rekurrenz-master-fall1-v1',
    ]);
    expect(content.dpDesignTrainers.map((trainer) => trainer.id)).toEqual([
      'trainer-dp-entwurf-mine-v1',
    ]);
    expect(content.divideConquerDesignTrainers.map((trainer) => trainer.id)).toEqual([
      'trainer-dc-entwurf-maxwertdifferenz-v1',
    ]);
    expect(content.greedyDesignTrainers.map((trainer) => trainer.id)).toEqual([
      'trainer-greedy-entwurf-fitnesspunkte-v1',
    ]);
    expect(content.rbInsertionTrainers.map((trainer) => trainer.id)).toEqual([
      'trainer-rot-schwarz-einfuegen-v1',
    ]);
    expect(content.graphTracingTrainers.map((trainer) => trainer.id)).toEqual([
      'trainer-graph-floyd-warshall-v1',
      'trainer-graph-dijkstra-v1',
      'trainer-graph-prim-mst-v1',
    ]);
  });

  it('löst alle Quellenreferenzen auf existierende Seiten auf', () => {
    const byId = new Map(content.sources.map((source) => [source.id, source]));
    for (const item of [
      ...content.topics,
      ...content.profiles,
      ...content.fixtures,
      ...content.trainers,
      ...content.trainers.map((trainer) => trainer.problem),
      ...content.trainerRubrics,
      ...content.proofTrainers,
      ...content.proofTrainers.map((trainer) => trainer.problem),
      ...content.proofRubrics,
      ...content.recurrenceTrainers,
      ...content.recurrenceTrainers.map((trainer) => trainer.problem),
      ...content.recurrenceRubrics,
      ...content.dpDesignTrainers,
      ...content.dpDesignTrainers.map((trainer) => trainer.problem),
      ...content.dpDesignVariants,
      ...content.dpDesignRubrics,
      ...content.divideConquerDesignTrainers,
      ...content.divideConquerDesignTrainers.map((trainer) => trainer.problem),
      ...content.divideConquerDesignVariants,
      ...content.divideConquerDesignRubrics,
      ...content.greedyDesignTrainers,
      ...content.greedyDesignTrainers.map((trainer) => trainer.problem),
      ...content.greedyDesignVariants,
      ...content.greedyDesignRubrics,
      ...content.rbInsertionTrainers,
      ...content.rbInsertionTrainers.map((trainer) => trainer.problem),
      ...content.rbInsertionVariants,
      ...content.rbInsertionRubrics,
      ...content.graphTracingTrainers,
      ...content.graphTracingTrainers.map((trainer) => trainer.problem),
      ...content.graphTracingVariants,
      ...content.graphTracingRubrics,
      ...content.examPackages,
      ...content.examPackages.flatMap((examPackage) => examPackage.taskSlots),
      ...content.examTaskInstances,
      ...diagnosticContent.foundationCompetencies.map((competency) => ({
        id: competency.competencyId,
        sourceRefs: competency.sourceRefs,
      })),
      ...diagnosticContent.diagnosticItems,
      ...diagnosticContent.diagnosticMisconceptions.map((misconception) => ({
        id: misconception.misconceptionId,
        sourceRefs: misconception.sourceRefs,
      })),
    ]) {
      for (const ref of item.sourceRefs) {
        const source = byId.get(ref.sourceId);
        expect(source).toBeDefined();
        if (source?.pageCount) expect(ref.page).toBeLessThanOrEqual(source.pageCount);
      }
    }
  });
});
