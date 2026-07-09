import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { dataDir, readJson, root, sha256 } from './content-utils';

interface Validation {
  passed: boolean;
  passed_count?: number;
  check_count?: number;
  passedCount?: number;
  checkCount?: number;
}
interface Manifest {
  documents: Array<{ path: string; sha256: string }>;
}

const phase0 = await readJson<Validation>(path.join(dataDir, 'validation-results.json'));
const phase0a = await readJson<Validation>(path.join(dataDir, 'phase0a-validation-results.json'));
if (!phase0.passed || !phase0a.passed)
  throw new Error('Phase 0 oder Phase 0A ist nicht validiert.');

const manifest = await readJson<Manifest>(path.join(dataDir, 'source-manifest.json'));
const sourceByHash = new Map(manifest.documents.map((source) => [source.sha256, source]));
const pdfDirectory = path.join(root, 'pdfs');

let pdfAuditNote =
  'lokaler PDF-Hashabgleich übersprungen, weil pdfs/ im öffentlichen Build nicht vorhanden ist.';

try {
  const relocatedNames = await readdir(pdfDirectory);
  const relocatedPdfs = relocatedNames.filter((name) => name.toLocaleLowerCase().endsWith('.pdf'));
  const unrecognized: string[] = [];
  for (const name of relocatedPdfs) {
    const hash = sha256(await readFile(path.join(pdfDirectory, name)));
    if (!sourceByHash.has(hash)) unrecognized.push(name);
  }
  if (unrecognized.length)
    throw new Error(
      `Verschobene Quelldateien stimmen mit keinem bekannten Hash überein:\n${unrecognized.join('\n')}`,
    );
  pdfAuditNote = `${relocatedPdfs.length} verschobene PDFs hashgleich zum Manifest.`;
} catch (error) {
  const isMissingPdfDirectory =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'ENOENT';
  if (!isMissingPdfDirectory) throw error;
}

console.log(
  `Phase-Daten gültig: Phase 0 ${phase0.passed_count ?? phase0.passedCount}/${phase0.check_count ?? phase0.checkCount}, Phase 0A ${phase0a.passedCount}/${phase0a.checkCount}; ${pdfAuditNote}`,
);
