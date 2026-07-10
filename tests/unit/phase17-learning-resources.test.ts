import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

interface StudyModulesFile {
  modules: Array<{
    moduleId: string;
    trainerIds: string[];
    sourceRefs: Array<{ sourceId: string; page: number }>;
    publicDistributionStatus: string;
  }>;
}

interface TaskMapFile {
  tasks: Array<{
    taskNumber: number;
    trainerIds: string[];
    studyModuleIds: string[];
    actionableLearningResourceIds: string[];
    recommendedOrder: string[];
    sourceRefs: Array<{ sourceId: string; page: number }>;
  }>;
}

interface ExamLibraryFile {
  publicationPolicy: string;
  exams: Array<{ sourceRefs: Array<{ sourceId: string; page: number }>; tasks: unknown[] }>;
  questions: Array<
    Record<string, unknown> & { sourceRefs: Array<{ sourceId: string; page: number }> }
  >;
}

describe('Phase 17 Lernressourcen', () => {
  const modules = readJson<StudyModulesFile>('data/study-modules.json');
  const taskMap = readJson<TaskMapFile>('data/task-slot-learning-map.json');
  const examLibrary = readJson<ExamLibraryFile>('src/content/generated/exam-library.json');

  it('macht alle Aufgaben 1 bis 9 zu handlungsfähigen Lernhubs', () => {
    expect(taskMap.tasks.map((task) => task.taskNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(taskMap.tasks.every((task) => task.actionableLearningResourceIds.length > 0)).toBe(true);
    expect(taskMap.tasks.every((task) => task.recommendedOrder.length > 0)).toBe(true);
    expect(taskMap.tasks.every((task) => task.sourceRefs.length > 0)).toBe(true);
  });

  it('ordnet alle elf produktiven Trainer mindestens einem Lernhub zu', () => {
    const expectedTrainerIds = [
      'trainer-rucksack-dp-v1',
      'trainer-union-find-listen-v1',
      'trainer-schleifeninvariante-summe-v1',
      'trainer-rekurrenz-master-fall1-v1',
      'trainer-dp-entwurf-mine-v1',
      'trainer-greedy-entwurf-fitnesspunkte-v1',
      'trainer-rot-schwarz-einfuegen-v1',
      'trainer-graph-floyd-warshall-v1',
      'trainer-graph-dijkstra-v1',
      'trainer-graph-prim-mst-v1',
      'trainer-dc-entwurf-maxwertdifferenz-v1',
    ];
    const mappedTrainerIds = new Set(taskMap.tasks.flatMap((task) => task.trainerIds));
    expect(expectedTrainerIds.every((trainerId) => mappedTrainerIds.has(trainerId))).toBe(true);
  });

  it('veröffentlicht nur quellgebundene, öffentliche Lernmodule', () => {
    const moduleIds = new Set(modules.modules.map((module) => module.moduleId));
    expect(modules.modules.length).toBeGreaterThanOrEqual(11);
    expect(
      modules.modules.every((module) => module.publicDistributionStatus === 'public_safe'),
    ).toBe(true);
    expect(modules.modules.every((module) => module.sourceRefs.length > 0)).toBe(true);
    expect(
      taskMap.tasks
        .flatMap((task) => task.studyModuleIds)
        .every((moduleId) => moduleIds.has(moduleId)),
    ).toBe(true);
  });

  it('hält die Klausurenbibliothek frei von Originaltext- und PDF-Pfaden', () => {
    const serialized = JSON.stringify(examLibrary);
    expect(examLibrary.publicationPolicy).toContain('keine Original-PDFs');
    expect(serialized).not.toMatch(/pdfs[\\/]/iu);
    expect(serialized).not.toMatch(/[A-Z]:\\\\/u);
    expect(serialized).not.toContain('originalText');
    expect(examLibrary.questions.every((question) => question.sourceRefs.length > 0)).toBe(true);
  });
});
