import { Link } from 'react-router-dom';
import { coreContent as content } from '../../content/loaders/core';
import { getRichModulesForTask } from '../learning/study-module-details';
import { getTaskLearningEntry } from '../../content/loaders/study-content';
import { trainerRegistry } from '../trainer/trainer-service';
import { trainerPath } from '../study-content/resource-links';

export function ExamStructurePage() {
  const profile =
    content.profiles.find((candidate) => candidate.id === 'standard-praesenz') ??
    content.profiles[0];
  if (!profile)
    return (
      <section className="page-flow">
        <h1>Prüfungsstruktur nicht verfügbar</h1>
        <p>Das aktuelle Aufgabenprofil konnte nicht aus den validierten Inhalten geladen werden.</p>
      </section>
    );
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Aktuelle Prüfungsstruktur</p>
        <h1>Aktuelle Prüfungsstruktur</h1>
        <p>
          Das produktive Studienmodell organisiert die Vorbereitung um Aufgabe 1 bis 9. Historische
          Ausnahmen bleiben Analysemetadaten, aber nicht das primäre Prüfungsprofil.
        </p>
      </header>

      <section className="panel">
        <h2>Unterstütztes Modell</h2>
        <p>
          Die aktuelle Produktansicht geht von neun Aufgaben aus. Jede Aufgabe verbindet typische
          Punkte, erwartete Antwortbestandteile, Lernmodule, Trainer und sichere Klausurenmetadaten.
          Nicht belegte historische Sonderformen werden nicht als aktuelles Profil angeboten.
        </p>
      </section>

      <section className="task-table-wrapper">
        <table>
          <caption>Aufgabe 1 bis 9 mit Lernabdeckung</caption>
          <thead>
            <tr>
              <th>Aufgabe</th>
              <th>Format</th>
              <th>Typische Punkte</th>
              <th>Lernmodule</th>
              <th>Trainer</th>
              <th>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {profile.tasks.map((task) => {
              const learningEntry = getTaskLearningEntry(task.taskNumber);
              const modules = getRichModulesForTask(task.taskNumber);
              const trainers = trainerRegistry.filter((trainer) =>
                learningEntry?.trainerIds.includes(trainer.trainerId),
              );
              return (
                <tr key={task.taskNumber}>
                  <td>Aufgabe {task.taskNumber}</td>
                  <td>{task.format}</td>
                  <td>{task.typicalPoints}</td>
                  <td>
                    {modules.slice(0, 3).map((module) => (
                      <Link key={module.moduleId} to={`/lernen/${module.slug}`}>
                        {module.title}
                      </Link>
                    ))}
                  </td>
                  <td>
                    {trainers.slice(0, 2).map((trainer) => (
                      <Link key={trainer.trainerId} to={trainerPath(trainer.trainerId)}>
                        {trainer.title}
                      </Link>
                    ))}
                  </td>
                  <td>
                    <Link to={`/aufgaben/${task.taskNumber}`}>Guide öffnen</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="panel">
        <h2>Aktuelle Probeklausur</h2>
        <p>
          Der Simulator bietet eine aktuelle, neu zusammengestellte Probeklausur auf Basis der
          stärksten produktiven Trainerfamilien. Sie ist keine historische Originalklausur.
        </p>
        <Link className="button-link" to="/simulator">
          Aktuelle Probeklausur öffnen
        </Link>
      </section>
    </div>
  );
}
