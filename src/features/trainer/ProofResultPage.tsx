import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { MasteryRecord, PracticeAttempt } from '../../content/schemas';
import { masteryRepository, practiceAttemptRepository } from '../../persistence/repositories';
import { ErrorAnalysis, MasteryImpact, RubricBreakdown } from './components/TrainerComponents';
import { canonicalProofTextForTrainer, scoreStoredProofAttempt } from './proof-service';
import { getProofTrainerById } from './trainer-service';

export function ProofResultPage() {
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
  const trainer = getProofTrainerById(attempt?.trainerId);
  if (!trainer || !attempt) return <p role="status">Beweisauswertung wird geladen.</p>;
  const result = scoreStoredProofAttempt(attempt);
  return (
    <div className="page-flow result-page">
      <header className="score-hero" aria-live="polite">
        <p className="eyebrow">Beweisauswertung abgeschlossen</p>
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
        <summary>Stufe 3: vollständigen kanonischen Beweis aufdecken</summary>
        <ol>
          {canonicalProofTextForTrainer().map((line) => (
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
        <Link className="button-link" to={`/trainer/beweise/${trainer.id}`}>
          Neuen Beweismodus wählen
        </Link>
      </section>
    </div>
  );
}
