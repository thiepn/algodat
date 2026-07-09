import type { ExamRecoverySnapshot, ExamSession } from '../types';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
    .join(',')}}`;
}

export function checksumPayload(value: unknown): string {
  let hash = 0;
  const text = stableStringify(value);
  for (let index = 0; index < text.length; index += 1)
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  return hash.toString(16).padStart(8, '0');
}

export function createRecoverySnapshot({
  session,
  savedAt,
  adapterVersions,
  taskPayloadVersions,
}: {
  session: ExamSession;
  savedAt: string;
  adapterVersions: Record<string, string>;
  taskPayloadVersions: Record<string, string>;
}): ExamRecoverySnapshot {
  return {
    id: `snapshot-${session.id}`,
    sessionId: session.id,
    snapshotVersion: 'exam-snapshot-v1',
    checksum: checksumPayload(session),
    savedAt,
    contentVersion: session.contentVersion,
    packageVersion: session.examPackageVersion,
    adapterVersions,
    taskPayloadVersions,
    payload: session,
  };
}
