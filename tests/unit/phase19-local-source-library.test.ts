import { beforeEach, describe, expect, it } from 'vitest';
import {
  exerciseSheets,
  indexedExams,
  normalizeFilename,
  sourceTaskRegions,
} from '../../src/features/documents/source-task-index';
import {
  connectLocalPdf,
  exportDocumentMappings,
  exportTaskRegionMetadata,
  listLocalDocuments,
  matchLocalPdf,
  saveLocalTaskRegion,
} from '../../src/features/documents/local-document-service';
import { resetDatabase } from '../../src/persistence/database/database';
import type { SourceTaskRegion } from '../../src/persistence/database/schema';

function pdfFile(name: string, content = '%PDF-1.4\n% lokal test\n') {
  return new File([content], name, { type: 'application/pdf', lastModified: 1_700_000_000_000 });
}

describe('Phase 19 lokale Originalquellenbibliothek', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it('indiziert Übungsblätter, Prüfungen und Aufgabenregionen ohne Volltext', () => {
    expect(exerciseSheets.length).toBeGreaterThanOrEqual(7);
    expect(exerciseSheets.reduce((sum, sheet) => sum + sheet.tasks.length, 0)).toBeGreaterThan(10);
    expect(indexedExams.length).toBeGreaterThanOrEqual(10);
    expect(indexedExams.reduce((sum, exam) => sum + exam.tasks.length, 0)).toBeGreaterThan(70);
    expect(sourceTaskRegions.length).toBeGreaterThan(80);
    for (const region of sourceTaskRegions) {
      expect(region.cropRegions.length).toBeGreaterThan(0);
      for (const crop of region.cropRegions) {
        expect(crop.coordinateSystem).toBe('normalized_page');
        expect(crop.x).toBeGreaterThanOrEqual(0);
        expect(crop.y).toBeGreaterThanOrEqual(0);
        expect(crop.width).toBeGreaterThan(0);
        expect(crop.height).toBeGreaterThan(0);
        expect(crop.x + crop.width).toBeLessThanOrEqual(1);
        expect(crop.y + crop.height).toBeLessThanOrEqual(1);
      }
    }
    expect(JSON.stringify(sourceTaskRegions)).not.toMatch(/Matrikelnummer|GebenSie|BetrachtenSie/u);
  });

  it('ordnet Dateien per normalisiertem Dateinamen zu und verlangt für Unbekanntes Bestätigung', async () => {
    expect(normalizeFilename('Übungsblatt 1.pdf')).toBe(normalizeFilename('Uebungsblatt 1.PDF'));
    const filename = await matchLocalPdf(pdfFile('Uebungsblatt 1.pdf'));
    expect(filename.state).toBe('filename_match');
    expect(filename.confidence).toBe('hoch');

    const unknown = await matchLocalPdf(pdfFile('meine-private-kopie.pdf'));
    expect(unknown.state).toBe('unbound');
    expect(unknown.confidence).toBe('keine');
  });

  it('speichert PDF-Bytes nur lokal und exportiert ausschließlich sichere Metadaten', async () => {
    const sheet = exerciseSheets[0];
    expect(sheet).toBeDefined();
    if (!sheet) throw new Error('Übungsblatt fehlt');
    const sourceId = sheet.sourceId;
    await connectLocalPdf(sourceId, pdfFile('Uebungsblatt 1.pdf'));
    const bindings = await listLocalDocuments();
    expect(bindings).toHaveLength(1);
    const binding = bindings[0];
    expect(binding).toBeDefined();
    if (!binding) throw new Error('Binding fehlt');
    expect(binding.bytes.byteLength).toBeGreaterThan(0);
    expect(binding.storageBackend).toBe('indexeddb_arraybuffer');

    const exported = exportDocumentMappings(bindings);
    expect(JSON.stringify(exported)).not.toContain('bytes');
    expect(JSON.stringify(exported)).not.toContain('%PDF');
    expect(exported[0]?.sourceId).toBe(sourceId);
  });

  it('exportiert lokale Crop-Metadaten ohne Bild- oder PDF-Payloads', async () => {
    const base = sourceTaskRegions[0];
    expect(base).toBeDefined();
    if (!base) throw new Error('Basisregion fehlt');
    const region: SourceTaskRegion = {
      ...base,
      id: 'local-test-region',
      regionId: 'local-test-region',
      verificationStatus: 'local_user_indexed' as const,
      cropRegions: [
        {
          page: 1,
          x: 0.1,
          y: 0.2,
          width: 0.5,
          height: 0.4,
          coordinateSystem: 'normalized_page' as const,
        },
      ],
    };
    await saveLocalTaskRegion(region);
    const exported = exportTaskRegionMetadata([region]);
    const serialized = JSON.stringify(exported);
    expect(serialized).toContain('normalized_page');
    expect(serialized).not.toMatch(/data:image|%PDF|base64|ArrayBuffer/u);
  });
});
