import { describe, expect, it } from 'vitest';
import corpus from '../../data/canonical-questions.json';
import { validateCanonicalQuestionCorpus } from '../../src/domain/canonical-questions/validation';

describe('kanonischer Fragenkorpus', () => {
  it('enthält nur manuell geprüfte, vollständige öffentliche Fragen', () => {
    const validated = validateCanonicalQuestionCorpus(corpus);
    expect(validated.questions).toHaveLength(9);
    expect(validated.questions[0]?.questionId).toBe('mock-2023-task-1');
    expect(validated.questions[0]?.bodyBlocks.length).toBeGreaterThan(1);
  });

  it('weist Platzhalter, lokale PDF-Abhängigkeiten und fehlende Zugänglichkeit zurück', () => {
    const invalid = structuredClone(corpus);
    invalid.questions[0]!.bodyBlocks[0] = {
      type: 'paragraph',
      text: 'Thema aus Quelle zu verifizieren: siehe C:\\private\\pdfs\\aufgabe.pdf',
    };
    expect(() => validateCanonicalQuestionCorpus(invalid)).toThrow(/Platzhalter|lokaler Pfad/u);
  });

  it('erfordert eine Rechtefreigabe für exact_approved', () => {
    const invalid = structuredClone(corpus);
    invalid.questions[0]!.publicationMode = 'exact_approved';
    invalid.questions[0]!.hostedMaterialApproval = null;
    expect(() => validateCanonicalQuestionCorpus(invalid)).toThrow(/Freigabe/u);
  });

  it('hält nicht entschiedene Evidenz außerhalb des kanonischen Korpus', () => {
    const validated = validateCanonicalQuestionCorpus(corpus);
    expect(validated.questions.some((question) => question.questionId === 'q-68424bad7007')).toBe(
      false,
    );
  });
});
