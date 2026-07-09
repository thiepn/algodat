import { describe, expect, it } from 'vitest';
import routeManifest from '../../data/final-route-manifest.json';
import slotCoverage from '../../data/final-exam-slot-coverage.json';
import topicCoverage from '../../data/final-topic-coverage.json';

describe('Phase-16-Release-Audits', () => {
  it('validiert das finale Routenmanifest ohne private oder unklare Routen', () => {
    expect(routeManifest.releaseCandidate).toBe('1.0.0-rc.2');
    expect(routeManifest.routes.length).toBeGreaterThanOrEqual(10);
    expect(routeManifest.routes.every((route) => route.publicSafe)).toBe(true);
    expect(routeManifest.routes.map((route) => route.routeId)).toContain('spickzettel');
    expect(routeManifest.routes.map((route) => route.routeId)).toContain('simulator-session');
    expect(routeManifest.routes.every((route) => !route.path.includes('pdfs'))).toBe(true);
  });

  it('validiert die finale Themenabdeckung als ehrliche Gap-Matrix', () => {
    expect(topicCoverage.releaseCandidate).toBe('1.0.0-rc.2');
    expect(topicCoverage.auditedTopicCount).toBe(76);
    expect(topicCoverage.topics.length).toBeGreaterThanOrEqual(10);
    expect(
      topicCoverage.topics.every(
        (topic) =>
          topicCoverage.coverageLevels.includes(topic.level) &&
          topic.remainingGap.trim().length > 0,
      ),
    ).toBe(true);
  });

  it('validiert die finale Slot-Abdeckung für Aufgabe 1 bis 9', () => {
    expect(slotCoverage.releaseCandidate).toBe('1.0.0-rc.2');
    expect(slotCoverage.slots.map((slot) => slot.taskNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(slotCoverage.slots.every((slot) => slot.remainingGaps.trim().length > 0)).toBe(true);
    expect(slotCoverage.slots.some((slot) => slot.coverageLevel === 'diagnostic_only')).toBe(true);
  });
});
