import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { MasteryRecord, PracticeAttempt } from '../../content/schemas';
import { masteryRepository, practiceAttemptRepository } from '../../persistence/repositories';
import { ErrorAnalysis, MasteryImpact, RubricBreakdown } from './components/TrainerComponents';
import {
  canonicalRecurrenceTextForTrainer,
  scoreStoredRecurrenceAttempt,
} from './recurrence-service';
import { getRecurrenceTrainerById } from './trainer-service';

export function RecurrenceResultPage() {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState<PracticeAttempt | null>(null);
  const [mastery, setMastery] = useState<MasteryRecord | null>(null);
  useEffect(() => {
    if (!attemptId) return;
    void practiceAttemptRepository.get(attemptId).then(async (storedAttempt) => {
      setAttempt(storedAttempt ?? null);
      setMastery(
        storedAttempt
          ? ((await masteryRepository.get(`mastery-${storedAttempt.trainerId}`)) ?? null)
          : null,
      );
    });
  }, [attemptId]);
  const trainer = getRecurrenceTrainerById(attempt?.trainerId);
  if (!trainer || !attempt) return <p role="status">Rekurrenzauswertung wird geladen.</p>;
  const result = scoreStoredRecurrenceAttempt(attempt);
  return (
    <div className="page-flow result-page">
      <header className="score-hero" aria-live="polite">
        <p className="eyebrow">Rekurrenzauswertung abgeschlossen</p>
        <h1>
          {result.points} von {result.maxPoints} Punkten
        </h1>
        <p>{result.recommendation.reason}</p>
      </header>
      <section>
        <h2>Stufe 1: Ergebnis</h2>
        <p className="notice">
          <strong>{result.errors.length ? 'Noch nicht vollständig korrekt' : 'Korrekt'}</strong> ·{' '}
          {result.points}/{result.maxPoints} Punkte · {result.errors.length} Fehlerbefunde
        </p>
      </section>
      <section>
        <h2>Stufe 2: Rubrik und Erklärung</h2>
        <RubricBreakdown results={result.rubricResults} />
        <ErrorAnalysis errors={result.errors} />
      </section>
      <details className="canonical-solution">
        <summary>Stufe 3: vollständigen kanonischen Rekurrenzbeweis aufdecken</summary>
        <ol>
          {canonicalRecurrenceTextForTrainer().map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </details>
      {mastery && <MasteryImpact dimensions={mastery.dimensions} />}
      <section className="next-action-card">
        <h2>Nächste deterministische Empfehlung</h2>
        <p>
          <strong>{result.recommendation.label}</strong>
        </p>
        <p>{result.recommendation.reason}</p>
        <Link className="button-link" to={`/trainer/rekurrenzen/${trainer.id}`}>
          Neuen Rekurrenzmodus wählen
        </Link>
      </section>
    </div>
  );
}
