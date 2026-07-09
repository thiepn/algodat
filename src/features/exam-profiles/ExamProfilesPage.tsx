import { usePreferences } from '../../app/providers/PreferencesProvider';
import { coreContent as content } from '../../content/loaders/core';
import { StatusBadge } from '../../ui/components/StatusBadge';

export function ExamProfilesPage() {
  const { selectedExamProfileId, setSelectedExamProfileId } = usePreferences();
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Historische Regime</p>
        <h1>Klausurprofile</h1>
        <p>
          Profile bündeln belegte Muster. Sie sind ausdrücklich keine Garantie für eine zukünftige
          Klausur.
        </p>
      </header>
      <div className="profile-tabs" role="tablist" aria-label="Klausurprofil wählen">
        {content.profiles.map((profile) => (
          <button
            key={profile.id}
            type="button"
            role="tab"
            aria-selected={selectedExamProfileId === profile.id}
            onClick={() => setSelectedExamProfileId(profile.id)}
          >
            {profile.title}
          </button>
        ))}
      </div>
      {content.profiles
        .filter((profile) => profile.id === selectedExamProfileId)
        .map((profile) => (
          <section key={profile.id} className="profile-detail">
            <div className="profile-summary">
              <div>
                <p className="eyebrow">{profile.confidence}</p>
                <h2>{profile.title}</h2>
                <p>{profile.description}</p>
              </div>
              <dl className="profile-facts">
                <div>
                  <dt>Aufgaben</dt>
                  <dd>{profile.taskCount}</dd>
                </div>
                <div>
                  <dt>Punkte</dt>
                  <dd>{profile.totalPoints}</dd>
                </div>
                <div>
                  <dt>Dauer</dt>
                  <dd>
                    {profile.durationMinutes ? `${profile.durationMinutes} Minuten` : 'unbekannt'}
                  </dd>
                </div>
                <div>
                  <dt>Belegte Sets</dt>
                  <dd>{profile.supportingExamIds.length}</dd>
                </div>
              </dl>
            </div>
            <p className="notice">
              <strong>Dauer-Evidenz:</strong> {profile.durationEvidence}
            </p>
            <div className="task-table-wrapper">
              <table>
                <caption>Aufgabenstruktur für {profile.title}</caption>
                <thead>
                  <tr>
                    <th>Aufgabe</th>
                    <th>Format</th>
                    <th>Punkte</th>
                    <th>Beispiele</th>
                    <th>Erwartete Bestandteile</th>
                    <th>Priorität</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.tasks.map((task) => (
                    <tr key={task.taskNumber}>
                      <td>
                        <strong>{task.taskNumber}</strong>
                      </td>
                      <td>{task.format}</td>
                      <td>{task.typicalPoints}</td>
                      <td>{task.historicalTopics.join(', ')}</td>
                      <td>{task.answerComponents}</td>
                      <td>
                        <StatusBadge tone={task.priority === 'sehr hoch' ? 'warning' : 'info'}>
                          {task.priority}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3>Abweichungen und Grenzen</h3>
              <ul>
                {profile.deviations.map((deviation) => (
                  <li key={deviation}>{deviation}</li>
                ))}
              </ul>
            </div>
          </section>
        ))}
    </div>
  );
}
