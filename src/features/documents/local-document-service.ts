import { sources } from '../../content/loaders/sources';
import type { LocalDocumentBinding, SourceTaskRegion } from '../../persistence/database/schema';
import { localDocumentRepository, localTaskRegionRepository } from '../../persistence/repositories';
import { normalizeFilename } from './source-task-index';

async function sha256Hex(buffer: ArrayBuffer): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null;
  const digest = await globalThis.crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export interface DocumentMatchCandidate {
  sourceId: string | null;
  state:
    | 'exact_hash_match'
    | 'filename_match'
    | 'probable_match'
    | 'manual_match'
    | 'unbound'
    | 'mismatch';
  confidence: 'hoch' | 'mittel' | 'niedrig' | 'keine';
  reason: string;
  sha256: string | null;
}

export async function matchLocalPdf(
  file: File,
  knownSha256?: string | null,
): Promise<DocumentMatchCandidate> {
  const sha256 = knownSha256 ?? (await sha256Hex(await file.arrayBuffer()));
  const existing = await localDocumentRepository.list();
  const sameHash = sha256 ? existing.find((binding) => binding.sha256 === sha256) : undefined;
  if (sameHash) {
    return {
      sourceId: sameHash.sourceId,
      state: 'exact_hash_match',
      confidence: 'hoch',
      reason: 'SHA-256 stimmt mit einer bereits lokal verbundenen Datei überein.',
      sha256,
    };
  }

  const normalized = normalizeFilename(file.name);
  const filenameMatch = sources.find(
    (source) =>
      normalizeFilename(source.displayName) === normalized ||
      normalizeFilename(source.title) === normalized,
  );
  if (filenameMatch) {
    return {
      sourceId: filenameMatch.id,
      state: 'filename_match',
      confidence: 'hoch',
      reason: 'Dateiname stimmt mit dem Quellenmanifest überein.',
      sha256,
    };
  }

  const probable = sources.find((source) => {
    const sourceName = normalizeFilename(source.displayName);
    return (
      sourceName.length > 5 &&
      (normalized.includes(sourceName) || sourceName.includes(normalized)) &&
      (!source.pageCount || file.size > source.pageCount * 1024)
    );
  });
  if (probable) {
    return {
      sourceId: probable.id,
      state: 'probable_match',
      confidence: 'mittel',
      reason: 'Normalisierter Dateiname und Größenheuristik passen wahrscheinlich.',
      sha256,
    };
  }

  return {
    sourceId: null,
    state: 'unbound',
    confidence: 'keine',
    reason: 'Keine sichere automatische Zuordnung gefunden. Bitte Quelle manuell auswählen.',
    sha256,
  };
}

export async function connectLocalPdf(
  sourceId: string,
  file: File,
  confirmedState?: DocumentMatchCandidate['state'],
): Promise<LocalDocumentBinding> {
  if (file.type !== 'application/pdf' && !file.name.toLocaleLowerCase('de').endsWith('.pdf')) {
    throw new Error('Bitte eine PDF-Datei auswählen.');
  }
  const source = sources.find((candidate) => candidate.id === sourceId);
  const bytes = await file.arrayBuffer();
  const sha256 = await sha256Hex(bytes.slice(0));
  const match = await matchLocalPdf(file, sha256);
  const now = new Date().toISOString();
  const bindingId = `local-document-${sourceId}`;
  const binding: LocalDocumentBinding = {
    id: bindingId,
    bindingId,
    sourceId,
    expectedFilename: source?.displayName ?? file.name,
    actualFilename: file.name,
    fileHandleMetadata: {
      name: file.name,
      lastModified: Number.isFinite(file.lastModified) ? file.lastModified : null,
      webkitRelativePath:
        'webkitRelativePath' in file ? String(file.webkitRelativePath || '') : undefined,
    },
    displayName: file.name,
    fileName: file.name,
    mimeType: 'application/pdf',
    sizeBytes: file.size,
    byteSize: file.size,
    pageCount: source?.pageCount ?? null,
    sha256,
    connectedAt: now,
    lastOpenedAt: now,
    updatedAt: now,
    storageBackend: 'indexeddb_arraybuffer',
    permissionState: 'granted',
    matchingState: match.sourceId === sourceId ? match.state : (confirmedState ?? 'manual_match'),
    bytes,
  };
  await localDocumentRepository.put(binding);
  return binding;
}

export async function listLocalDocuments(): Promise<LocalDocumentBinding[]> {
  return localDocumentRepository.list();
}

export async function getLocalDocument(
  documentId: string,
): Promise<LocalDocumentBinding | undefined> {
  const binding = await localDocumentRepository.get(documentId);
  if (!binding) return binding;
  const updated = {
    ...binding,
    lastOpenedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await localDocumentRepository.put(updated);
  return updated;
}

export async function getLocalDocumentBySource(
  sourceId: string | null | undefined,
): Promise<LocalDocumentBinding | undefined> {
  if (!sourceId) return undefined;
  const bindings = await localDocumentRepository.list();
  return bindings.find((binding) => binding.sourceId === sourceId);
}

export async function removeLocalDocument(documentId: string): Promise<void> {
  await localDocumentRepository.delete(documentId);
}

export function storageUsage(bindings: LocalDocumentBinding[]): number {
  return bindings.reduce((sum, binding) => sum + binding.sizeBytes, 0);
}

export function exportDocumentMappings(bindings: LocalDocumentBinding[]) {
  return bindings.map(
    ({
      id,
      bindingId,
      sourceId,
      expectedFilename,
      actualFilename,
      fileName,
      sizeBytes,
      byteSize,
      pageCount,
      sha256,
      connectedAt,
      matchingState,
      storageBackend,
      permissionState,
    }) => ({
      id,
      bindingId,
      sourceId,
      expectedFilename,
      actualFilename,
      fileName,
      sizeBytes,
      byteSize,
      pageCount,
      sha256,
      connectedAt,
      matchingState,
      storageBackend,
      permissionState,
      note: 'Export enthält keine PDF-Bytes, keine Screenshots und keine Browser-Dateihandles.',
    }),
  );
}

export async function saveLocalTaskRegion(region: SourceTaskRegion): Promise<void> {
  await localTaskRegionRepository.put(region);
}

export async function listLocalTaskRegions(): Promise<SourceTaskRegion[]> {
  return localTaskRegionRepository.list();
}

export async function removeLocalTaskRegion(regionId: string): Promise<void> {
  await localTaskRegionRepository.delete(regionId);
}

export function exportTaskRegionMetadata(regions: SourceTaskRegion[]) {
  return regions.map((region) => ({
    ...region,
    note: 'Export enthält nur Metadaten und normalisierte Crop-Koordinaten.',
  }));
}
