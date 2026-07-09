import { afterEach, describe, expect, it } from 'vitest';
import {
  canonicalRowsAsInput,
  canonicalUnionFindInput,
  type PreflightAnswers,
  type UnionFindPreflightAnswers,
} from '../../src/domain/tracing';
import {
  answerFromAttempt,
  completeAttempt,
  createTrainingAttempt,
  getTrainerById,
  saveDraft,
  selectedTrainer,
  trainerRegistry,
  type KnapsackStoredAnswer,
  type UnionFindStoredAnswer,
} from '../../src/features/trainer/trainer-service';
import {
  canonicalProofAnswerForTrainer,
  completeProofAttempt,
  createProofAttempt,
  proofAnswerFromAttempt,
  saveProofDraft,
  type ProofStoredAnswer,
} from '../../src/features/trainer/proof-service';
import {
  canonicalRecurrenceAnswerForTrainer,
  completeRecurrenceAttempt,
  createRecurrenceAttempt,
  recurrenceAnswerFromAttempt,
  saveRecurrenceDraft,
  type RecurrenceStoredAnswer,
} from '../../src/features/trainer/recurrence-service';
import {
  canonicalDpDesignAnswerForTrainer,
  completeDpDesignAttempt,
  createDpDesignAttempt,
  dpDesignAnswerFromAttempt,
  saveDpDesignDraft,
  type DpDesignStoredAnswer,
} from '../../src/features/trainer/dp-design-service';
import { resetDatabase } from '../../src/persistence/database/database';
import { exportProgress, importProgress } from '../../src/persistence/database/transfer';
import { masteryRepository, practiceAttemptRepository } from '../../src/persistence/repositories';

const preflight: PreflightAnswers = {
  algorithm: 'knapsack_01',
  negativeWeights: false,
  indexingStartsAtZero: true,
  usesPreviousRow: true,
  eachItemAtMostOnce: true,
  output: 'complete_table_and_optimum',
  runtime: 'O(n · W)',
};

const unionFindPreflight: UnionFindPreflightAnswers = {
  algorithm: 'union_find_linked_lists',
  representation: 'linked_lists_with_representative_pointer',
  startsEmpty: true,
  weightedUnion: true,
  tieBreaker: 'lexicographically_smaller_representative_is_smaller_set',
  output: 'checkpoint_sets_representatives_next_size',
  nextDirection: 'head_to_tail',
  runtime: 'O(m + n log n)',
};

afterEach(async () => resetDatabase());

describe('Trainer-Persistenz', () => {
  it('legt einen Versuch an, speichert einen Zwischenschritt und setzt ihn nach Reload fort', async () => {
    const attempt = await createTrainingAttempt('practice', preflight);
    const answer = answerFromAttempt(attempt) as KnapsackStoredAnswer;
    answer.rows[0] = { index: 0, values: Array(9).fill(0), tieChoices: {} };
    await saveDraft(attempt, answer);
    const reloaded = await practiceAttemptRepository.get(attempt.id);
    expect(reloaded?.status).toBe('draft');
    expect(
      reloaded && (answerFromAttempt(reloaded) as KnapsackStoredAnswer).rows[0]?.values,
    ).toEqual(Array(9).fill(0));
  });

  it('schließt den Versuch ab, lädt die Auswertung und aktualisiert reproduzierbare Mastery', async () => {
    if (!selectedTrainer) throw new Error('Trainer fehlt.');
    const attempt = await createTrainingAttempt('exam', preflight);
    const answer = {
      ...(answerFromAttempt(attempt) as KnapsackStoredAnswer),
      rows: canonicalRowsAsInput(selectedTrainer.problem),
      finalValue: 12,
    };
    const { completed, result, mastery } = await completeAttempt(attempt, answer);
    expect(completed.status).toBe('completed');
    expect(result.points).toBe(12);
    expect((await practiceAttemptRepository.get(attempt.id))?.score).toBe(12);
    expect((await masteryRepository.get(`mastery-${attempt.trainerId}`))?.dimensions).toEqual(
      mastery.dimensions,
    );
  });

  it('exportiert, importiert und meldet Inhaltsversionen ohne Datenverlust', async () => {
    const attempt = await createTrainingAttempt('practice', preflight);
    const exported = await exportProgress();
    await resetDatabase();
    expect((await importProgress(exported)).contentVersionChanged).toBe(false);
    expect((await practiceAttemptRepository.get(attempt.id))?.trainerId).toBe(attempt.trainerId);
    await expect(
      importProgress({ ...exported, practiceAttempts: [{ kaputt: true }] }),
    ).rejects.toThrow();
  });

  it('setzt einen offenen Versuch ausdrücklich zurück', async () => {
    const attempt = await createTrainingAttempt('practice', preflight);
    await practiceAttemptRepository.delete(attempt.id);
    expect(await practiceAttemptRepository.get(attempt.id)).toBeUndefined();
  });

  it('verwaltet parallele Versuche verschiedener Trainer und Mastery V2 getrennt', async () => {
    const unionTrainer = getTrainerById('trainer-union-find-listen-v1');
    if (
      !selectedTrainer ||
      !unionTrainer ||
      unionTrainer.problem.algorithm !== 'union_find_linked_lists'
    )
      throw new Error('Trainer fehlen.');
    expect(trainerRegistry.map((entry) => entry.trainerId)).toEqual([
      'trainer-rucksack-dp-v1',
      'trainer-union-find-listen-v1',
      'trainer-schleifeninvariante-summe-v1',
      'trainer-rekurrenz-master-fall1-v1',
      'trainer-dp-entwurf-mine-v1',
      'trainer-dc-entwurf-maxwertdifferenz-v1',
      'trainer-greedy-entwurf-fitnesspunkte-v1',
      'trainer-rot-schwarz-einfuegen-v1',
      'trainer-graph-floyd-warshall-v1',
      'trainer-graph-dijkstra-v1',
      'trainer-graph-prim-mst-v1',
    ]);

    const knapsackAttempt = await createTrainingAttempt('exam', preflight, selectedTrainer.id);
    const knapsackAnswer: KnapsackStoredAnswer = {
      ...(answerFromAttempt(knapsackAttempt) as KnapsackStoredAnswer),
      rows: canonicalRowsAsInput(selectedTrainer.problem),
      finalValue: 12,
    };
    await completeAttempt(knapsackAttempt, knapsackAnswer);

    const unionAttempt = await createTrainingAttempt('exam', unionFindPreflight, unionTrainer.id);
    const unionAnswer: UnionFindStoredAnswer = {
      ...(answerFromAttempt(unionAttempt) as UnionFindStoredAnswer),
      checkpoints: canonicalUnionFindInput(unionTrainer.problem),
    };
    const { completed, result, mastery } = await completeAttempt(unionAttempt, unionAnswer);
    expect(completed.score).toBe(12);
    expect(result.errors).toHaveLength(0);
    expect((mastery.dimensions as Record<string, number>).weighted_union).toBeGreaterThan(0);
    expect(await masteryRepository.get(`mastery-${selectedTrainer.id}`)).toBeDefined();
    expect(await masteryRepository.get(`mastery-${unionTrainer.id}`)).toBeDefined();
  });

  it('legt einen Beweisversuch an, speichert ihn und aktualisiert Mastery V3', async () => {
    const attempt = await createProofAttempt('exam');
    expect(attempt.trainerKind).toBe('proof');
    const draft = proofAnswerFromAttempt(attempt);
    draft.preflight.accumulator = 's';
    await saveProofDraft(attempt, draft);
    const reloaded = await practiceAttemptRepository.get(attempt.id);
    expect((reloaded?.answers[0] as ProofStoredAnswer).preflight.accumulator).toBe('s');

    const { completed, result, mastery } = await completeProofAttempt(
      attempt,
      canonicalProofAnswerForTrainer(),
    );
    expect(completed.score).toBe(16);
    expect(result.errors).toHaveLength(0);
    expect(mastery.dimensions.proof_structure).toBeGreaterThan(0);
    expect(await masteryRepository.get(`mastery-${attempt.trainerId}`)).toBeDefined();
  });

  it('legt einen Rekurrenzversuch an, speichert ihn und aktualisiert Mastery V4', async () => {
    const attempt = await createRecurrenceAttempt('learn');
    expect(attempt.trainerKind).toBe('proof');
    expect(attempt.answerPayloadSchemaVersion).toBe('recurrence-answer-v1');
    const draft = recurrenceAnswerFromAttempt(attempt);
    draft.parameters.a = '8';
    await saveRecurrenceDraft(attempt, draft);
    const reloaded = await practiceAttemptRepository.get(attempt.id);
    expect((reloaded?.answers[0] as RecurrenceStoredAnswer).parameters.a).toBe('8');

    const { completed, result, mastery } = await completeRecurrenceAttempt(
      attempt,
      canonicalRecurrenceAnswerForTrainer(),
    );
    expect(completed.score).toBe(23);
    expect(result.errors).toHaveLength(0);
    expect(mastery.dimensions.master_theorem_application).toBeGreaterThan(0);
    expect(await masteryRepository.get(`mastery-${attempt.trainerId}`)).toBeDefined();
  });

  it('legt einen DP-Entwurfsversuch an, speichert ihn und aktualisiert Mastery V5', async () => {
    const attempt = await createDpDesignAttempt('practice');
    expect(attempt.trainerKind).toBe('design');
    expect(attempt.answerPayloadSchemaVersion).toBe('dp-design-answer-v1');
    const draft = dpDesignAnswerFromAttempt(attempt);
    draft.state.tableName = 'G';
    await saveDpDesignDraft(attempt, draft);
    const reloaded = await practiceAttemptRepository.get(attempt.id);
    expect((reloaded?.answers[0] as DpDesignStoredAnswer).state.tableName).toBe('G');

    const { completed, result, mastery } = await completeDpDesignAttempt(
      attempt,
      canonicalDpDesignAnswerForTrainer(),
    );
    expect(completed.score).toBe(54);
    expect(result.examPoints).toBe(8);
    expect(result.errors).toHaveLength(0);
    expect(mastery.dimensions.state_definition).toBeGreaterThan(0);
    expect(await masteryRepository.get(`mastery-${attempt.trainerId}`)).toBeDefined();
  });
});
