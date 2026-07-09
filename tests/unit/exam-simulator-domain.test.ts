import { describe, expect, it } from 'vitest';
import { content } from '../../src/content/loaders/content';
import {
  addExact,
  aggregateExamScores,
  allowedExamTransitions,
  assembleExamPackage,
  computeProfileCoverage,
  computeRemainingTime,
  createExamSession,
  createRecoverySnapshot,
  deriveTimerWarnings,
  exact,
  exactToLabel,
  finalizeExamSubmission,
  getExamTaskAdapter,
  restoreRecoverySnapshot,
  transitionExamSession,
} from '../../src/domain/exam-simulator';
import { createCanonicalExamAnswer } from '../../src/domain/exam-simulator/tasks/registry';

const examPackage = content.examPackages.find(
  (candidate) => candidate.id === 'exam-package-kernkompetenz-v3',
)!;

describe('Exam-Simulator-Domain', () => {
  it('validiert und assembliert nur das Kernkompetenz-Package als startbar', () => {
    const result = assembleExamPackage(examPackage);
    expect(result.ok).toBe(true);
    expect(examPackage.historicalExam).toBe(false);
    expect(examPackage.fullyAutoGradable).toBe(true);
    expect(examPackage.taskSlots).toHaveLength(7);
  });

  it('klassifiziert historische Profile nicht fälschlich als startbar', () => {
    for (const profile of content.examProfileCoverage.profiles) {
      const computed = computeProfileCoverage(profile);
      expect(computed.startable).toBe(false);
      expect(computed.coverageStatus).not.toBe('fully_supported');
    }
  });

  it('führt erlaubte und verbotene Session-Übergänge deterministisch', () => {
    const session = createExamSession({
      examPackage,
      mode: 'strict_exam',
      now: '2026-07-08T10:00:00.000Z',
      contentVersion: content.manifest.contentVersion,
    });
    expect(allowedExamTransitions('created')).toContain('briefing');
    const briefing = transitionExamSession(session, 'briefing', '2026-07-08T10:00:01.000Z');
    expect(briefing.ok).toBe(true);
    const illegal = transitionExamSession({ ...session, status: 'submitted' }, 'running', 'x');
    expect(illegal.ok).toBe(false);
  });

  it('berechnet Timer und Warnungen ohne setInterval als Zeitquelle', () => {
    const session = {
      ...createExamSession({
        examPackage,
        mode: 'strict_exam',
        now: '2026-07-08T10:00:00.000Z',
        contentVersion: content.manifest.contentVersion,
      }),
      startedAt: '2026-07-08T10:00:00.000Z',
      deadlineAt: '2026-07-08T13:22:00.000Z',
      status: 'running' as const,
    };
    const remaining = computeRemainingTime(
      session.deadlineAt,
      Date.parse('2026-07-08T13:17:00.000Z'),
    );
    expect(remaining).toBe(5 * 60_000);
    expect(deriveTimerWarnings(session, examPackage, remaining)).toContain('5-minuten-verbleibend');
  });

  it('erkennt beschädigte Recovery-Snapshots', () => {
    const session = createExamSession({
      examPackage,
      mode: 'strict_exam',
      now: '2026-07-08T10:00:00.000Z',
      contentVersion: content.manifest.contentVersion,
    });
    const snapshot = createRecoverySnapshot({
      session,
      savedAt: '2026-07-08T10:01:00.000Z',
      adapterVersions: {},
      taskPayloadVersions: {},
    });
    expect(restoreRecoverySnapshot(snapshot).ok).toBe(true);
    expect(restoreRecoverySnapshot({ ...snapshot, checksum: 'kaputt' }).ok).toBe(false);
  });

  it('aggregiert Punkte exakt rational', () => {
    expect(exactToLabel(addExact(exact(1, 3), exact(1, 6)))).toBe('0.5');
  });

  it('bewertet alle sieben Adapter mit kanonischen Golden-Antworten voll', () => {
    const scores = examPackage.taskSlots.map((slot) => {
      const answer = createCanonicalExamAnswer(slot.trainerId);
      return getExamTaskAdapter(slot.trainerId).gradeAfterSubmission(answer, slot);
    });
    const aggregate = aggregateExamScores(scores);
    expect(exactToLabel(aggregate.totalScore)).toBe('56');
    expect(scores.every((score) => score.errors.length === 0)).toBe(true);
  });

  it('bewertet den Phase-10-Floyd-Warshall-Adapter mit kanonischer Antwort voll', () => {
    const adapter = getExamTaskAdapter('trainer-graph-floyd-warshall-v1');
    const answer = createCanonicalExamAnswer('trainer-graph-floyd-warshall-v1');
    const score = adapter.gradeAfterSubmission(answer, {
      id: 'exam-task-phase10-fw',
      taskSlotId: 'slot-phase10-fw',
      trainerId: 'trainer-graph-floyd-warshall-v1',
      adapterId: 'adapter-floyd-warshall-v1',
      title: 'Floyd-Warshall',
      family: 'tracing',
      rendererType: 'floyd_warshall_matrix',
      examPoints: { numerator: 4, denominator: 1 },
      internalMaxPoints: 40,
      sourceRefs: [{ sourceId: 'src-35405e721f05', page: 5 }],
    });
    expect(score.internalScore).toBe(40);
    expect(exactToLabel(score.mappedExamScore)).toBe('4');
    expect(score.errors).toHaveLength(0);
  });

  it('bewertet den Phase-11-Dijkstra-Adapter mit kanonischer Antwort voll', () => {
    const adapter = getExamTaskAdapter('trainer-graph-dijkstra-v1');
    const answer = createCanonicalExamAnswer('trainer-graph-dijkstra-v1');
    const score = adapter.gradeAfterSubmission(answer, {
      id: 'exam-task-phase11-dijkstra',
      taskSlotId: 'slot-phase11-dijkstra',
      trainerId: 'trainer-graph-dijkstra-v1',
      adapterId: 'adapter-dijkstra-v1',
      title: 'Dijkstra',
      family: 'tracing',
      rendererType: 'dijkstra_trace',
      examPoints: { numerator: 5, denominator: 1 },
      internalMaxPoints: 40,
      sourceRefs: [{ sourceId: 'src-1ea0642ec775', page: 6 }],
    });
    expect(score.internalScore).toBe(40);
    expect(exactToLabel(score.mappedExamScore)).toBe('5');
    expect(score.errors).toHaveLength(0);
  });

  it('bewertet den Phase-12-Prim-Adapter mit kanonischer Antwort voll', () => {
    const adapter = getExamTaskAdapter('trainer-graph-prim-mst-v1');
    const answer = createCanonicalExamAnswer('trainer-graph-prim-mst-v1');
    const score = adapter.gradeAfterSubmission(answer, {
      id: 'exam-task-phase12-prim',
      taskSlotId: 'slot-phase12-prim',
      trainerId: 'trainer-graph-prim-mst-v1',
      adapterId: 'adapter-prim-mst-v1',
      title: 'Prim',
      family: 'tracing',
      rendererType: 'prim_mst_trace',
      examPoints: { numerator: 4, denominator: 1 },
      internalMaxPoints: 40,
      sourceRefs: [{ sourceId: 'src-35405e721f05', page: 3 }],
    });
    expect(score.internalScore).toBe(40);
    expect(exactToLabel(score.mappedExamScore)).toBe('4');
    expect(score.errors).toHaveLength(0);
  });

  it('bewertet den Phase-13-Divide-and-Conquer-Adapter mit kanonischer Antwort voll', () => {
    const adapter = getExamTaskAdapter('trainer-dc-entwurf-maxwertdifferenz-v1');
    const answer = createCanonicalExamAnswer('trainer-dc-entwurf-maxwertdifferenz-v1');
    const score = adapter.gradeAfterSubmission(answer, {
      id: 'exam-task-phase13-dc',
      taskSlotId: 'slot-phase13-dc',
      trainerId: 'trainer-dc-entwurf-maxwertdifferenz-v1',
      adapterId: 'adapter-divide-conquer-design-v1',
      title: 'Divide-and-Conquer',
      family: 'design',
      rendererType: 'divide_conquer_max_difference',
      examPoints: { numerator: 8, denominator: 1 },
      internalMaxPoints: 48,
      sourceRefs: [{ sourceId: 'src-88179ac88dc5', page: 7 }],
    });
    expect(score.internalScore).toBe(48);
    expect(exactToLabel(score.mappedExamScore)).toBe('8');
    expect(score.errors).toHaveLength(0);
  });

  it('finalisiert eine vollständige Prüfung und erzeugt einen Bericht', () => {
    let session = createExamSession({
      examPackage,
      mode: 'strict_exam',
      now: '2026-07-08T10:00:00.000Z',
      contentVersion: content.manifest.contentVersion,
    });
    session = {
      ...session,
      status: 'running',
      startedAt: '2026-07-08T10:00:00.000Z',
      deadlineAt: '2026-07-08T13:22:00.000Z',
      taskStates: Object.fromEntries(
        examPackage.taskSlots.map((slot) => [
          slot.taskSlotId,
          {
            ...session.taskStates[slot.taskSlotId]!,
            answer: createCanonicalExamAnswer(slot.trainerId),
            completionStatus: 'answered',
          },
        ]),
      ),
    };
    const { session: graded, report } = finalizeExamSubmission(
      session,
      examPackage,
      '2026-07-08T11:00:00.000Z',
    );
    expect(graded.status).toBe('graded');
    expect(exactToLabel(report.aggregate.totalScore)).toBe('56');
    expect(report.masteryImpact.exam_readiness).toBeGreaterThan(0);
  });
});
