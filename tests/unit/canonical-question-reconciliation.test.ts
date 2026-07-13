import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import corpusData from '../../data/canonical-questions.json';
import evidenceData from '../../data/question-evidence-links.json';
import identityData from '../../data/question-identity-decisions.json';
import mappingData from '../../data/question-resource-mapping-report.json';
import {
  CanonicalQuestionsFileSchema,
  QuestionIdentityDecisionsFileSchema,
} from '../../src/content/schemas';
import { validateCanonicalQuestionReviewData } from '../../src/domain/canonical-questions/reconciliation';
import { validateCanonicalQuestionCorpus } from '../../src/domain/canonical-questions/validation';
import { isPubliclyVisibleQuestion } from '../../src/features/canonical-questions/CanonicalQuestionPages';

const corpus = validateCanonicalQuestionCorpus(corpusData);

describe('Identitäts- und Sammlungsreview', () => {
  it('entscheidet 51 Kandidaturen und führt den Rest explizit offen', () => {
    const review = validateCanonicalQuestionReviewData({
      questions: corpus.questions,
      identityDecisions: identityData,
      evidenceLinks: evidenceData,
      resourceMappings: mappingData,
      originalCandidateCount: 84,
    });
    expect(review.identityDecisions.decisions).toHaveLength(51);
    expect(review.identityDecisions.openCandidateCount).toBe(33);
    expect(
      review.identityDecisions.decisions.every(
        (decision) => decision.reviewerStatus === 'final_reviewed',
      ),
    ).toBe(true);
  });

  it('markiert mock-2023 nur mit vollständigen neun Aufgaben als komplett', () => {
    const collection = corpus.collections.find(
      (candidate) => candidate.collectionId === 'mock-2023',
    );
    expect(collection?.state).toBe('complete');
    expect(collection?.verifiedQuestionIds).toHaveLength(9);

    const invalid = structuredClone(corpusData);
    invalid.collections[0]!.decidedTaskCount = 8;
    expect(() => CanonicalQuestionsFileSchema.parse(invalid)).toThrow(/vollständige Sammlung/u);
  });

  it('unterstützt Dubletten-, Split- und Solution-only-Entscheidungen ohne neue Fragen zu erfinden', () => {
    const fixture = structuredClone(identityData) as unknown as Record<string, unknown>;
    const decisions = fixture.decisions as Array<Record<string, unknown>>;
    decisions.push({
      candidateId: 'fixture-duplicate',
      canonicalQuestionId: null,
      resultQuestionIds: [],
      decisionState: 'merged_duplicate_evidence',
      evidenceIds: ['e-1', 'e-2'],
      collectionId: 'fixture',
      taskNumber: 1,
      subtasks: [],
      duplicateRelationship: 'Beide Evidenzen zeigen dieselbe Aufgabe.',
      identityConfidence: 'hoch',
      reviewerStatus: 'final_reviewed',
      notes: 'Visuell abgeglichen.',
    });
    decisions.push({
      candidateId: 'fixture-split',
      canonicalQuestionId: null,
      resultQuestionIds: ['mock-x-task-1-a', 'mock-x-task-1-b'],
      decisionState: 'split_into_multiple_questions',
      evidenceIds: ['e-3'],
      collectionId: 'fixture',
      taskNumber: 1,
      subtasks: ['a', 'b'],
      duplicateRelationship: 'Eine OCR-Evidenz enthält zwei getrennte Aufgaben.',
      identityConfidence: 'hoch',
      reviewerStatus: 'final_reviewed',
      notes: 'Aufgabengrenzen visuell geprüft.',
    });
    const excluded = fixture.excludedEvidence as Array<Record<string, unknown>>;
    excluded.push({
      evidenceId: 'e-4',
      sourceId: 'src-fixture',
      page: 2,
      decision: 'solution_only_evidence',
      notes: 'Nur eine Lösung, kein eigener Aufgabenkörper.',
    });
    expect(QuestionIdentityDecisionsFileSchema.parse(fixture).decisions).toHaveLength(53);
  });

  it('segregiert blockierte Kandidaturen vom öffentlichen Korpus', () => {
    const blocked = structuredClone(identityData) as unknown as Record<string, unknown>;
    const decisions = blocked.decisions as Array<Record<string, unknown>>;
    decisions.push({
      candidateId: 'blocked-fixture',
      canonicalQuestionId: null,
      resultQuestionIds: [],
      decisionState: 'blocked_missing_visual_data',
      evidenceIds: ['e-blocked'],
      collectionId: 'fixture',
      taskNumber: 2,
      subtasks: [],
      duplicateRelationship: 'Keine Dublette feststellbar.',
      identityConfidence: 'niedrig',
      reviewerStatus: 'final_reviewed',
      notes: 'Graph fehlt; erneute Quellenbeschaffung nötig.',
    });
    blocked.openCandidateCount = 32;
    const review = validateCanonicalQuestionReviewData({
      questions: corpus.questions,
      identityDecisions: blocked,
      evidenceLinks: evidenceData,
      resourceMappings: mappingData,
      originalCandidateCount: 84,
    });
    expect(review.identityDecisions.decisions.at(-1)?.decisionState).toBe(
      'blocked_missing_visual_data',
    );
    expect(corpus.questions).toHaveLength(51);
  });

  it('weist unzugängliche Graph- und Matrixblöcke zurück', () => {
    for (const [questionId, blockType] of [
      ['mock-2023-task-2', 'graph'],
      ['mock-2023-task-3', 'matrix'],
    ] as const) {
      const invalid = structuredClone(corpusData) as unknown as {
        questions: Array<{ questionId: string; bodyBlocks: Array<Record<string, unknown>> }>;
      };
      const block = invalid.questions
        .find((question) => question.questionId === questionId)
        ?.bodyBlocks.find((candidate) => candidate.type === blockType);
      delete block?.textAlternative;
      expect(() => validateCanonicalQuestionCorpus(invalid)).toThrow();
    }
  });

  it('zeigt öffentlich nur final geprüfte Fragen und hält die Review-Route aus Produktion heraus', () => {
    expect(corpus.questions.every(isPubliclyVisibleQuestion)).toBe(true);
    const unfinished = { ...corpus.questions[0]!, finalReviewStatus: 'content_reviewed' };
    expect(isPubliclyVisibleQuestion(unfinished as never)).toBe(false);
    const routerSource = readFileSync('src/app/router.tsx', 'utf8');
    expect(routerSource).toMatch(/import\.meta\.env\.DEV\s*\?\s*\[/u);
    expect(routerSource).toContain("path: '__review/questions/:questionId?'");
  });

  it('blockiert eine fehlende oder falsche Lösungsevidenz-Verknüpfung', () => {
    const invalidLinks = structuredClone(evidenceData);
    invalidLinks.links = invalidLinks.links.filter(
      (link) => link.questionId !== 'mock-2023-task-8',
    );
    expect(() =>
      validateCanonicalQuestionReviewData({
        questions: corpus.questions,
        identityDecisions: identityData,
        evidenceLinks: invalidLinks,
        resourceMappings: mappingData,
        originalCandidateCount: 84,
      }),
    ).toThrow(/Evidenzverknüpfung/u);
  });
});
