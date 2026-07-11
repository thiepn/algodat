import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
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

interface HostedMaterialRecord {
  assetPath: string | null;
  officialUrl: string | null;
  distributionBasis: string;
  rightsHolder: string;
  permissionNote: string;
  sha256: string | null;
  publicationStatus: string;
}

async function readHostedMaterials(manifestPath?: string): Promise<HostedMaterialRecord[]> {
  const candidates = manifestPath
    ? [manifestPath]
    : [path.join(process.cwd(), 'data', 'hosted-materials.json')];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(await readFile(candidate, 'utf8')) as HostedMaterialRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // Kein Manifest im jeweiligen Kontext; ohne Manifest ist kein Hosted Asset freigegeben.
    }
  }
  return [];
}

function allowedHostedMaterial(records: HostedMaterialRecord[], relative: string) {
  return records.find(
    (record) =>
      record.publicationStatus === 'approved' &&
      record.assetPath === `/${relative}` &&
      ['author_owned', 'explicit_permission', 'open_license'].includes(record.distributionBasis) &&
      record.rightsHolder &&
      record.permissionNote &&
      record.sha256,
  );
}

function allowedOfficialPdfLink(records: HostedMaterialRecord[], url: string) {
  return records.some(
    (record) =>
      record.publicationStatus === 'approved' &&
      record.distributionBasis === 'official_public_url' &&
      record.officialUrl === url &&
      record.rightsHolder &&
      record.permissionNote,
  );
}

function allowedHostedMaterialLink(records: HostedMaterialRecord[], link: string) {
  const normalized = link.replace(/^\.?\//u, '');
  const materialsIndex = normalized.indexOf('materials-approved/');
  if (materialsIndex < 0) return false;
  return Boolean(allowedHostedMaterial(records, normalized.slice(materialsIndex)));
}

export async function inspectDeploymentAssets(
  dist: string,
  hostedMaterialsManifestPath?: string,
): Promise<DeploymentInspection> {
  const files = await walk(dist);
  const errors: string[] = [];
  const hostedMaterials = await readHostedMaterials(hostedMaterialsManifestPath);

  for (const file of files) {
    const relative = path.relative(dist, file).replaceAll('\\', '/');
    const extension = path.extname(file).toLocaleLowerCase();
    const hostedMaterial = relative.startsWith('materials-approved/')
      ? allowedHostedMaterial(hostedMaterials, relative)
      : null;
    if (relative.startsWith('materials-approved/') && !hostedMaterial) {
      errors.push(`Nicht genehmigtes Hosted Material im Deployment: ${relative}`);
    }
    if (hostedMaterial) {
      const bytes = await readFile(file);
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      if (sha256 !== hostedMaterial.sha256) {
        errors.push(`Hosted-Material-Hash stimmt nicht: ${relative}`);
      }
    }
    if (['.pdf', '.jpg', '.jpeg'].includes(extension) && !hostedMaterial) {
      errors.push(`Private Binärdatei im Deployment: ${relative}`);
    }
    if (['.webp', '.gif', '.bmp', '.tiff'].includes(extension) && !hostedMaterial) {
      errors.push(`Nicht freigegebene gerenderte Bilddatei im Deployment: ${relative}`);
    }
    if (extension === '.png' && !allowedApplicationPngs.has(relative) && !hostedMaterial) {
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
      const pdfLinks = [
        ...contents.matchAll(/(?:href|src|url)\s*[:=]\s*["'`]([^"'`]*\.pdf)["'`]/giu),
      ].map((match) => match[1]);
      if (
        pdfLinks.some(
          (link) =>
            link &&
            !allowedHostedMaterialLink(hostedMaterials, link) &&
            !allowedOfficialPdfLink(hostedMaterials, link),
        )
      ) {
        errors.push(`Öffentlicher PDF-Verweis in ${relative}`);
      }
      if (/data:image\/(?:png|jpeg|jpg|webp|gif);base64,/iu.test(contents)) {
        errors.push(`Base64-Bildpayload im Deployment: ${relative}`);
      }
      const suspiciousPublicTitles = [
        ...contents.matchAll(/["']title["']\s*:\s*["']([^"'\r\n]{161,})["']/giu),
      ];
      if (suspiciousPublicTitles.length) {
        errors.push(`Verdächtig langer öffentlicher Metadatentitel in ${relative}`);
      }
      if (
        /["']title["']\s*:\s*["'][^"']*(?:Aufgabe[^"']*){2,}(?:Matrikelnummer|Seite)/iu.test(
          contents,
        )
      ) {
        errors.push(`Möglicher OCR- oder Prüfungsdump im Titelfeld: ${relative}`);
      }
      if (
        /(?:renderedPage|pageScreenshot|ocrFullText|extractedFullText|["']screenshots?["']\s*:|["']seitenbilder?["']\s*:)/iu.test(
          contents,
        )
      ) {
        errors.push(`Screenshot- oder Volltext-Artefakt im Deployment: ${relative}`);
      }
      if (
        /(?:browserFileHandle|fileHandleMetadata"\s*:\s*\{[^}]*kind|webkitRelativePath"\s*:\s*"[^"]+)/iu.test(
          contents,
        )
      ) {
        errors.push(`Browser-Dateihandle oder lokaler Dateipfad im Deployment: ${relative}`);
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
