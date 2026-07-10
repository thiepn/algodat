import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  regionValidationIssues,
  sourceCoverageSummary,
  sourceTaskCoverageRecords,
  sourceTaskRegions,
} from '../src/features/documents/source-task-index';

const coveragePath = resolve('data/source-task-coverage.json');
const validationPath = resolve('data/source-region-validation-report.json');

async function writeJson(path: string, value: unknown) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

const generatedAt = '2026-07-10T00:00:00.000Z';

await writeJson(coveragePath, {
  schemaVersion: 1,
  generatedAt,
  privacy: {
    pdfBytesIncluded: false,
    screenshotsIncluded: false,
    extractedFullTextIncluded: false,
    absoluteLocalPathsIncluded: false,
  },
  summary: sourceCoverageSummary,
  records: sourceTaskCoverageRecords,
});

await writeJson(validationPath, {
  schemaVersion: 1,
  generatedAt,
  validatorSet: [
    'task_without_page_mapping',
    'solution_without_source_mapping',
    'crop_bounds_invalid',
    'zero_crop',
    'duplicate_task_region',
    'wrong_document_type',
    'invalid_task_number',
    'missing_topic_mapping',
    'missing_learning_action',
    'full_page_fallback_mislabeled_precise',
    'same_incorrect_region',
  ],
  summary: {
    regionsChecked: sourceTaskRegions.length,
    errors: regionValidationIssues.filter((issue) => issue.severity === 'error').length,
    warnings: regionValidationIssues.filter((issue) => issue.severity === 'warning').length,
    infos: regionValidationIssues.filter((issue) => issue.severity === 'info').length,
    hasBlockingErrors: regionValidationIssues.some((issue) => issue.severity === 'error'),
  },
  issues: regionValidationIssues,
});

console.log(`Source coverage written to ${coveragePath}`);
console.log(`Region validation written to ${validationPath}`);
