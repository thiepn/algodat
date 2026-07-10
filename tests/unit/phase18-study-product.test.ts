import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { richStudyModules } from '../../src/features/learning/study-module-details';
import { taskGuides } from '../../src/features/tasks/task-guides';

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

describe('Phase 18 Studienprodukt', () => {
  it('liefert vollständige Lernmodule statt Metadatenkarten', () => {
    expect(richStudyModules.length).toBeGreaterThanOrEqual(18);
    for (const module of richStudyModules) {
      expect(module.slug).toMatch(/^[a-z0-9-]+$/u);
      expect(module.introduction.length).toBeGreaterThan(80);
      expect(module.learningObjectives.length).toBeGreaterThanOrEqual(2);
      expect(module.definitionSections.length).toBeGreaterThan(0);
      expect(module.algorithmSections.length).toBeGreaterThan(0);
      expect(module.workedExamples[0]?.steps.length).toBeGreaterThanOrEqual(3);
      expect(module.proofSections.length).toBeGreaterThan(0);
      expect(module.complexitySections.length).toBeGreaterThan(0);
      expect(module.commonMistakes.length).toBeGreaterThan(0);
      expect(module.examTips.length).toBeGreaterThan(0);
      expect(module.miniExercises.length).toBeGreaterThan(0);
      expect(module.sourceRefs.length).toBeGreaterThan(0);
      expect(module.publicDistributionStatus).toBe('public_safe');
    }
  });

  it('deckt die geforderten Kernbereiche mit Lernmodulen ab', () => {
    const slugs = new Set(richStudyModules.map((module) => module.slug));
    [
      'asymptotische-notation',
      'pseudocode-lesen-und-schreiben',
      'binaere-suche',
      'mergesort',
      'rekurrenzen-und-master-theorem',
      'schleifeninvarianten',
      'arrays-stacks-queues-und-zeiger',
      'union-find-mit-listen',
      'rot-schwarz-baeume-und-einfuegen',
      'dynamische-programmierung-grundlagen',
      'null-eins-rucksack-dp',
      'dp-entwurf-mine',
      'greedy-entwurf-und-austauschargument',
      'divide-and-conquer-maximale-wertdifferenz',
      'graphen-bfs-dfs-und-begriffe',
      'dijkstra',
      'floyd-warshall',
      'prim-und-minimale-spannbaeume',
    ].forEach((slug) => expect(slugs.has(slug)).toBe(true));
  });

  it('macht alle Aufgaben 1 bis 9 zu vollständigen Guides mit Beispiel', () => {
    expect(taskGuides.map((guide) => guide.taskNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const guide of taskGuides) {
      expect(guide.tests.length).toBeGreaterThan(20);
      expect(guide.typicalStructure.length).toBeGreaterThan(0);
      expect(guide.expectedAnswerComponents.length).toBeGreaterThan(0);
      expect(guide.solvingWorkflow.length).toBeGreaterThanOrEqual(3);
      expect(guide.workedExample.steps.length).toBeGreaterThanOrEqual(3);
      expect(guide.workedExample.modelAnswer.length).toBeGreaterThan(0);
      expect(guide.submissionChecklist.length).toBeGreaterThan(0);
      expect(guide.practiceSet.length).toBeGreaterThan(0);
    }
  });

  it('schließt unzulässige Fragen aus der normalen Klausurenbibliothek aus', () => {
    const library = readJson<{
      questions: Array<{
        paraphrasedTitle: string;
        topicTags: string[];
        verificationStatus: string;
        evidenceType: string;
        sourceRefs: unknown[];
      }>;
    }>('src/content/generated/exam-library.json');
    const audit = readJson<{ excludedQuestionCount: number }>(
      'src/content/generated/exam-question-publication-audit.json',
    );
    expect(audit.excludedQuestionCount).toBeGreaterThan(0);
    expect(
      library.questions.every(
        (question) =>
          question.verificationStatus !== 'generated_unverified' &&
          question.evidenceType !== 'generated_example' &&
          !/Thema aus Quelle zu verifizieren/iu.test(question.paraphrasedTitle) &&
          question.topicTags.length > 0 &&
          question.sourceRefs.length > 0,
      ),
    ).toBe(true);
  });

  it('entfernt Klausurprofile aus Navigation und studentischem Simulatorfluss', () => {
    const appShell = readFileSync('src/app/layouts/AppLayout.tsx', 'utf8');
    const router = readFileSync('src/app/router.tsx', 'utf8');
    const simulator = readFileSync('src/features/simulator/SimulatorPages.tsx', 'utf8');
    expect(appShell).not.toContain('Klausurprofile');
    expect(router).toContain(
      'path: \'klausurprofile\', element: <Navigate to="/pruefungsstruktur" replace />',
    );
    expect(simulator).not.toContain('Startbestätigung');
    expect(simulator).not.toContain('JSON');
    expect(simulator).toContain('Prüfung starten');
    expect(simulator).toContain('Aufgabe ${index + 1}');
  });

  it('dokumentiert die entspannte Bundle-Policy im Analyse-Script', () => {
    const script = readFileSync('scripts/analyze-bundle.ts', 'utf8');
    expect(script).toContain('entryRawBytes');
    expect(script).toContain('entryGzipBytes');
    expect(script).toContain('totalRawBytes');
    expect(script).toContain('totalGzipBytes');
    expect(script).toContain('warning500k');
    expect(script).toContain('warning1MB');
    expect(script).toContain('withinEmergencyLimit');
    expect(script).toContain('5_000_000');
  });
});
