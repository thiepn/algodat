import type { LocalDocumentBinding } from '../../persistence/database/schema';
import { localDocumentRepository } from '../../persistence/repositories';

async function sha256Hex(buffer: ArrayBuffer): Promise<string | null> {
  if (!globalThis.crypto?.subtle) return null;
  const digest = await globalThis.crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function connectLocalPdf(sourceId: string, file: File): Promise<LocalDocumentBinding> {
  if (file.type !== 'application/pdf' && !file.name.toLocaleLowerCase('de').endsWith('.pdf')) {
    throw new Error('Bitte eine PDF-Datei auswählen.');
  }
  const bytes = await file.arrayBuffer();
  const now = new Date().toISOString();
  const binding: LocalDocumentBinding = {
    id: `local-document-${sourceId}`,
    sourceId,
    displayName: file.name,
    fileName: file.name,
    mimeType: 'application/pdf',
    sizeBytes: file.size,
    sha256: await sha256Hex(bytes.slice(0)),
    connectedAt: now,
    updatedAt: now,
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
  return localDocumentRepository.get(documentId);
}

export async function removeLocalDocument(documentId: string): Promise<void> {
  await localDocumentRepository.delete(documentId);
}

export function storageUsage(bindings: LocalDocumentBinding[]): number {
  return bindings.reduce((sum, binding) => sum + binding.sizeBytes, 0);
}

export function exportDocumentMappings(bindings: LocalDocumentBinding[]) {
  return bindings.map(
    ({ id, sourceId, displayName, fileName, sizeBytes, sha256, connectedAt }) => ({
      id,
      sourceId,
      displayName,
      fileName,
      sizeBytes,
      sha256,
      connectedAt,
      note: 'Export enthält keine PDF-Bytes.',
    }),
  );
}
