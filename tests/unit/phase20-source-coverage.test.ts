import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sources } from '../../src/content/loaders/sources';
import {
  buildRegionValidationIssues,
  cropPrecisionForRegion,
  regionValidationIssues,
  searchSourceLibrary,
  sourceCoverageSummary,
  sourceTaskCoverageRecords,
  sourceTaskRegions,
} from '../../src/features/documents/source-task-index';

const coverageJson = JSON.parse(readFileSync('data/source-task-coverage.json', 'utf8')) as {
  summary: typeof sourceCoverageSummary;
  records: typeof sourceTaskCoverageRecords;
};

const validationJson = JSON.parse(
  readFileSync('data/source-region-validation-report.json', 'utf8'),
) as {
  summary: {
    regionsChecked: number;
    errors: number;
    warnings: number;
    infos: number;
    hasBlockingErrors: boolean;
  };
  issues: typeof regionValidationIssues;
};

describe('Phase 20 Quellenabdeckung und Regionenqualität', () => {
  it('inventarisiert jede bekannte Quelle in einem privacy-sicheren Coverage-Report', () => {
    expect(sourceTaskCoverageRecords).toHaveLength(sources.length);
    expect(coverageJson.records).toHaveLength(sources.length);
    expect(coverageJson.summary.totalSources).toBe(sources.length);
    expect(coverageJson.summary.indexedExerciseSheets).toBeGreaterThanOrEqual(7);
    expect(coverageJson.summary.indexedExerciseTasks).toBeGreaterThanOrEqual(15);
    expect(coverageJson.summary.indexedExamTasks).toBeGreaterThanOrEqual(80);

    const serialized = JSON.stringify(coverageJson);
    expect(serialized).not.toMatch(/%PDF|data:image|base64|ArrayBuffer|C:\\Users|pdfs\//u);
    expect(serialized).not.toMatch(
      /Matrikelnummer|Geben Sie|Betrachten Sie|Loesungsskizze.*Gegeben/u,
    );
  });

  it('klassifiziert Vollseiten-Fallbacks nicht als präzise Crops', () => {
    const precisions = sourceTaskRegions.map(cropPrecisionForRegion);
    expect(precisions).toContain('full_page_fallback');
    expect(precisions).not.toContain('exact_task_crop');
    expect(precisions).not.toContain('exact_subtask_crop');
    expect(sourceCoverageSummary.cropPrecision.full_page_fallback).toBeGreaterThan(0);
  });

  it('führt die geforderten Validierungen aus und blockiert keine gültigen statischen Regionen', () => {
    const issues = buildRegionValidationIssues(sourceTaskRegions);
    expect(issues).toEqual(regionValidationIssues);
    expect(validationJson.summary.regionsChecked).toBe(sourceTaskRegions.length);
    expect(validationJson.summary.hasBlockingErrors).toBe(false);
    expect(validationJson.summary.errors).toBe(0);
    expect(issues.some((issue) => issue.code === 'same_incorrect_region')).toBe(true);
    expect(issues.some((issue) => issue.code === 'full_page_fallback_mislabeled_precise')).toBe(
      false,
    );
  });

  it('durchsucht nur sichere Metadaten nach Jahr, Aufgabe, Thema, Trainer, Modul und Datei', () => {
    const yearResults = searchSourceLibrary('2023');
    expect(yearResults.length).toBeGreaterThan(0);
    expect(yearResults.some((result) => result.year === 2023)).toBe(true);

    const taskResults = searchSourceLibrary('3');
    expect(taskResults.length).toBeGreaterThan(0);
    expect(
      taskResults.some(
        (result) =>
          result.taskNumbers.includes(3) ||
          result.filename.toLocaleLowerCase('de').includes('aufgabe'),
      ),
    ).toBe(true);

    const serialized = JSON.stringify(taskResults);
    expect(serialized).not.toMatch(/Matrikelnummer|%PDF|base64|C:\\Users|pdfs\//u);
  });
});
