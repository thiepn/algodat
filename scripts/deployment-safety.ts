import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { walk } from './content-utils';

const textExtensions = new Set(['.js', '.json', '.html', '.css', '.webmanifest']);
const allowedApplicationPngs = new Set([
  'icons/app-icon-192.png',
  'icons/app-icon-512.png',
  'icons/maskable-icon-512.png',
]);

export interface DeploymentInspection {
  fileCount: number;
  errors: string[];
}

export async function inspectDeploymentAssets(dist: string): Promise<DeploymentInspection> {
  const files = await walk(dist);
  const errors: string[] = [];

  for (const file of files) {
    const relative = path.relative(dist, file).replaceAll('\\', '/');
    const extension = path.extname(file).toLocaleLowerCase();
    if (['.pdf', '.jpg', '.jpeg'].includes(extension)) {
      errors.push(`Private Binärdatei im Deployment: ${relative}`);
    }
    if (extension === '.png' && !allowedApplicationPngs.has(relative)) {
      errors.push(`Nicht freigegebene PNG-Datei im Deployment: ${relative}`);
    }
    if (extension === '.map') {
      errors.push(`Unerlaubte Source Map im Deployment: ${relative}`);
    }
    if (textExtensions.has(extension) || path.basename(file).startsWith('sw.')) {
      const contents = await readFile(file, 'utf8');
      if (/info 1 copy/iu.test(contents)) errors.push(`Privater Quellordner in ${relative}`);
      if (/(?:^|["'`/\\])pdfs[\\/]/iu.test(contents))
        errors.push(`Privater PDF-Quellordner in ${relative}`);
      if (/[A-Z]:[\\/]{1,2}(?:Users|Dokumente|Documents)[\\/]{1,2}/u.test(contents)) {
        errors.push(`Windows-Absolutpfad in ${relative}`);
      }
      if (/Users[\\/]junso/iu.test(contents)) errors.push(`Privater Benutzerpfad in ${relative}`);
      if (/(?:href|src|url)\s*[:=]\s*["'`][^"'`]*\.pdf/iu.test(contents)) {
        errors.push(`Öffentlicher PDF-Verweis in ${relative}`);
      }
      if (/precacheAndRoute\([^)]*(?:\.pdf|info 1 copy)/isu.test(contents)) {
        errors.push(`Private Quelle im Precache: ${relative}`);
      }
      if (
        /["']publicDistributionStatus["']\s*:\s*["']local_only["']/iu.test(contents) ||
        /["']publicDistributionStatus["']\s*:\s*["']blocked["']/iu.test(contents) ||
        /["']solutionValidationStatus["']\s*:\s*["']generated_unverified["']/iu.test(contents) ||
        /["']solutionValidationStatus["']\s*:\s*["']unverified["']/iu.test(contents)
      ) {
        errors.push(`Nicht öffentlich freigegebener Inhaltsstatus in ${relative}`);
      }
      if (/ambiguous_productive_item|mehrdeutiges produktives item/iu.test(contents)) {
        errors.push(`Mehrdeutiger produktiver Diagnoseinhalt in ${relative}`);
      }
      if (/debugtrace|debug-trace|referenztrace|referenceTrace/iu.test(contents)) {
        errors.push(`Unerlaubter Debug- oder Referenztrace in ${relative}`);
      }
      if (/source-audit|raw-source|ocr-cache|visual-review-results/iu.test(contents)) {
        errors.push(`Private Source-Audit-Rohdaten in ${relative}`);
      }
      if (
        /["'](?:practiceAttempts|diagnosticSessions|examResults|studyPlans|reviewSchedules)["']\s*:\s*\[/iu.test(
          contents,
        ) ||
        /fullUserHistory|completeUserHistory|vollstaendige-nutzerhistorie|vollständige-nutzerhistorie/iu.test(
          contents,
        )
      ) {
        errors.push(`Vollständige Nutzerhistorie im Deployment: ${relative}`);
      }
      if (
        /invalid-policy-config|policyValidationStatus["']?\s*:\s*["']invalid["']|ungueltige-policy|ungültige-policy/iu.test(
          contents,
        )
      ) {
        errors.push(`Ungültige Orchestrator-Policy im Deployment: ${relative}`);
      }
      if (
        /private-test-fixture|privateTestFixture|testfixture-private|private-fixture/iu.test(
          contents,
        )
      ) {
        errors.push(`Private Testfixture im Deployment: ${relative}`);
      }
      if (
        /algodat-progress-export|progressExport|exportedUserData|exportierte-nutzerdaten/iu.test(
          contents,
        )
      ) {
        errors.push(`Exportdatei oder Exportnutzdaten im Deployment: ${relative}`);
      }
      if (
        /invalid-cheat-sheet-block|cheatSheetBlockValidationStatus["']?\s*:\s*["']invalid["']/iu.test(
          contents,
        )
      ) {
        errors.push(`Ungültiger Spickzettelblock im Deployment: ${relative}`);
      }
      if (
        /fullyAutoGradable["']?\s*:\s*false|ungradableExamSlot|unbewertbarer-examslot/iu.test(
          contents,
        )
      ) {
        errors.push(`Unbewertbarer ExamSlot im Deployment: ${relative}`);
      }
      if (
        /solutionBeforeSubmission|referenceSolutionPreSubmission|loesungVorAbgabe|lösungVorAbgabe/iu.test(
          contents,
        )
      ) {
        errors.push(`Referenzlösung vor Abgabe im Deployment: ${relative}`);
      }
    }
  }

  return { fileCount: files.length, errors };
}
