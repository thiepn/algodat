import { diagnosticContent } from '../../content/loaders/diagnostics';
import {
  createDiagnosticSession,
  emptyDiagnosticAnswer,
  finalizeDiagnosticSession,
  generateDeterministicDiagnosticVariant,
  restoreDiagnosticSession,
  type DiagnosticAnswer,
  type DiagnosticItem,
  type DiagnosticSession,
  type DiagnosticSessionConfig,
} from '../../domain/foundations-diagnostic';
import { diagnosticSessionRepository } from '../../persistence/repositories';

export const diagnosticItems = diagnosticContent.diagnosticItems;
export const foundationCompetencies = diagnosticContent.foundationCompetencies;
export const diagnosticTemplates = diagnosticContent.diagnosticSessionTemplates;

export function getDiagnosticItemById(itemId: string): DiagnosticItem | undefined {
  return diagnosticItems.find((item) => item.id === itemId);
}

export function getDiagnosticSessionTemplate(templateId: string) {
  return diagnosticTemplates.find((template) => template.id === templateId);
}

export async function startDiagnosticSession(config: DiagnosticSessionConfig) {
  const session = createDiagnosticSession(diagnosticItems, config);
  await diagnosticSessionRepository.put(session);
  return session;
}

export async function loadDiagnosticSession(sessionId: string) {
  const stored = await diagnosticSessionRepository.get(sessionId);
  return stored ? restoreDiagnosticSession(stored) : undefined;
}

export async function saveDiagnosticAnswer(
  session: DiagnosticSession,
  answer: DiagnosticAnswer,
  now = new Date().toISOString(),
) {
  const next: DiagnosticSession = {
    ...session,
    responses: { ...session.responses, [answer.itemId]: answer },
    confidenceResponses: {
      ...session.confidenceResponses,
      [answer.itemId]: answer.confidence,
    },
    currentItemIndex: Math.min(session.currentItemIndex + 1, session.itemIds.length - 1),
    updatedAt: now,
  };
  await diagnosticSessionRepository.put(next);
  return next;
}

export async function finishDiagnosticSession(session: DiagnosticSession) {
  const completed = finalizeDiagnosticSession(session, diagnosticItems, foundationCompetencies);
  await diagnosticSessionRepository.put(completed);
  return completed;
}

export function itemForSession(session: DiagnosticSession): DiagnosticItem | undefined {
  const itemId = session.itemIds[session.currentItemIndex];
  const item = itemId ? getDiagnosticItemById(itemId) : undefined;
  return item ? generateDeterministicDiagnosticVariant(item, session.seed) : undefined;
}

export function answerForItem(item: DiagnosticItem): DiagnosticAnswer {
  return emptyDiagnosticAnswer(item);
}

export function diagnosticRouteForRecommendation(targetId: string): string {
  if (targetId === 'trainer-rekurrenz-master-fall1-v1') return `/trainer/rekurrenzen/${targetId}`;
  if (targetId === 'trainer-union-find-listen-v1') return `/trainer/tracing/${targetId}`;
  if (targetId === 'trainer-rot-schwarz-einfuegen-v1')
    return `/trainer/baeume/rot-schwarz/${targetId}`;
  if (targetId === 'trainer-graph-floyd-warshall-v1')
    return `/trainer/graphen/floyd-warshall/${targetId}`;
  if (targetId === 'trainer-graph-dijkstra-v1') return `/trainer/graphen/dijkstra/${targetId}`;
  if (targetId === 'trainer-graph-prim-mst-v1') return `/trainer/graphen/prim/${targetId}`;
  if (targetId === 'trainer-dp-entwurf-mine-v1') return `/trainer/entwurf/dp/${targetId}`;
  if (targetId === 'trainer-greedy-entwurf-fitnesspunkte-v1')
    return `/trainer/entwurf/greedy/${targetId}`;
  if (targetId === 'trainer-dc-entwurf-maxwertdifferenz-v1')
    return `/trainer/entwurf/divide-and-conquer/${targetId}`;
  if (targetId === 'trainer-schleifeninvariante-summe-v1') return `/trainer/beweise/${targetId}`;
  return '/trainer';
}
