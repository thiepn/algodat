import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { PracticeAttempt } from '../../content/schemas';
import { masteryRepository, practiceAttemptRepository } from '../../persistence/repositories';
import { trainerRegistry } from './trainer-service';

export function TrainerOverview() {
  const [attempts, setAttempts] = useState<PracticeAttempt[]>([]);
  const [mastery, setMastery] = useState<Record<string, Record<string, number>>>({});
  useEffect(() => {
    void Promise.all([practiceAttemptRepository.list(), masteryRepository.list()]).then(
      ([storedAttempts, masteryRecords]) => {
        setAttempts(storedAttempts);
        setMastery(
          Object.fromEntries(
            masteryRecords.map((record) => [record.topicOrTaskId, record.dimensions]),
          ),
        );
      },
    );
  }, []);
  const drafts = attempts.filter((attempt) => attempt.status === 'draft');
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Elf verifizierte Lernpfade</p>
        <h1>Trainer</h1>
        <p>
          Die Registry enthält nur öffentliche, quellenausgerichtete Trainer. Jeder Versuch wird
          lokal gespeichert und deterministisch ausgewertet.
        </p>
      </header>
      <section className="trainer-grid" aria-label="Verfügbare Trainer">
        {trainerRegistry.map((entry) => {
          const completed = attempts
            .filter(
              (attempt) => attempt.trainerId === entry.trainerId && attempt.status === 'completed',
            )
            .sort((left, right) => right.attemptedAt.localeCompare(left.attemptedAt));
          const latest = completed[0];
          const dimensions = mastery[entry.trainerId];
          const masteryLabel =
            entry.rendererType === 'recurrence_runtime_proof'
              ? 'Master-Theorem'
              : entry.rendererType === 'floyd_warshall_matrix'
                ? 'Floyd-Warshall'
                : entry.rendererType === 'dijkstra_trace'
                  ? 'Dijkstra'
                  : entry.rendererType === 'prim_mst_trace'
                    ? 'Prim-MST'
                    : entry.rendererType === 'red_black_tree_insertion'
                      ? 'Rot-Schwarz'
                      : entry.rendererType === 'greedy_design_fitnesspunkte'
                        ? 'Greedy-Entwurf'
                        : entry.rendererType === 'divide_conquer_max_difference'
                          ? 'D&C-Entwurf'
                          : entry.rendererType === 'dp_design_mine'
                            ? 'DP-Entwurf'
                            : entry.trainerKind === 'proof'
                              ? 'Beweisstruktur'
                              : 'Tracing';
          const masteryValue =
            entry.rendererType === 'recurrence_runtime_proof'
              ? dimensions?.master_theorem_application
              : entry.rendererType === 'floyd_warshall_matrix'
                ? dimensions?.fw_iterationen
                : entry.rendererType === 'dijkstra_trace'
                  ? dimensions?.dijkstra_extract_min
                  : entry.rendererType === 'prim_mst_trace'
                    ? dimensions?.prim_sichere_kante
                    : entry.rendererType === 'red_black_tree_insertion'
                      ? dimensions?.rb_reparaturfaelle
                      : entry.rendererType === 'greedy_design_fitnesspunkte'
                        ? dimensions?.greedy_rule
                        : entry.rendererType === 'divide_conquer_max_difference'
                          ? dimensions?.combine_cases
                          : entry.rendererType === 'dp_design_mine'
                            ? dimensions?.state_definition
                            : entry.trainerKind === 'proof'
                              ? dimensions?.proof_structure
                              : dimensions?.tracing;
          return (
            <article className="trainer-card" key={entry.trainerId}>
              <div>
                <span className="status-badge status-badge--success">verifiziert</span>
                <p className="eyebrow">{entry.algorithmFamily}</p>
                <h2>{entry.title}</h2>
                <p>{entry.description}</p>
                <p className="quiet">
                  Modi: {entry.availableModes.join(', ')} · Renderer: {entry.rendererType}
                </p>
                {latest ? (
                  <p className="notice">
                    Letzter Versuch: {latest.score}/{latest.maxScore} Punkte.
                  </p>
                ) : (
                  <p className="quiet">Noch kein abgeschlossener Versuch.</p>
                )}
                {dimensions && (
                  <p className="quiet">
                    Mastery-Auszug: {masteryLabel} {Math.round((masteryValue ?? 0) * 100)} %, Regeln{' '}
                    {Math.round(
                      (dimensions.rule_application ?? dimensions.tie_breaking ?? 0) * 100,
                    )}{' '}
                    %
                  </p>
                )}
              </div>
              <Link className="button-link" to={trainerBasePath(entry.trainerId)}>
                Lernpfad öffnen
              </Link>
            </article>
          );
        })}
      </section>
      {drafts.length > 0 && (
        <section>
          <h2>Offene Versuche</h2>
          <ul>
            {drafts.map((attempt) => (
              <li key={attempt.id}>
                <Link to={`${trainerBasePath(attempt.trainerId)}/versuch/${attempt.id}`}>
                  {attempt.trainerId} vom {new Date(attempt.startedAt).toLocaleString('de-DE')}{' '}
                  fortsetzen
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export const TracingOverview = TrainerOverview;
export const ProofOverview = TrainerOverview;
export const RecurrenceOverview = TrainerOverview;
export const DesignOverview = TrainerOverview;

function trainerBasePath(trainerId: string): string {
  const entry = trainerRegistry.find((candidate) => candidate.trainerId === trainerId);
  if (entry?.rendererType === 'greedy_design_fitnesspunkte')
    return `/trainer/entwurf/greedy/${trainerId}`;
  if (entry?.rendererType === 'divide_conquer_max_difference')
    return `/trainer/entwurf/divide-and-conquer/${trainerId}`;
  if (entry?.rendererType === 'floyd_warshall_matrix')
    return `/trainer/graphen/floyd-warshall/${trainerId}`;
  if (entry?.rendererType === 'dijkstra_trace') return `/trainer/graphen/dijkstra/${trainerId}`;
  if (entry?.rendererType === 'prim_mst_trace') return `/trainer/graphen/prim/${trainerId}`;
  if (entry?.rendererType === 'red_black_tree_insertion')
    return `/trainer/baeume/rot-schwarz/${trainerId}`;
  if (entry?.rendererType === 'dp_design_mine') return `/trainer/entwurf/dp/${trainerId}`;
  if (entry?.rendererType === 'recurrence_runtime_proof')
    return `/trainer/rekurrenzen/${trainerId}`;
  if (entry?.trainerKind === 'proof') return `/trainer/beweise/${trainerId}`;
  return `/trainer/tracing/${trainerId}`;
}
