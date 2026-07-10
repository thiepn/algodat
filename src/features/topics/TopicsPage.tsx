import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { topics } from '../../content/loaders/topics';
import { getStudyModulesForTopic, taskSlotLearningMap } from '../../content/loaders/study-content';
import { selectDuplicateSafeFrequency } from '../../content/selectors/frequency';
import { StatusBadge } from '../../ui/components/StatusBadge';
import { NextLearningActions } from '../study-content/NextLearningActions';
import { trainerPath } from '../study-content/resource-links';
import { trainerRegistry } from '../trainer/trainer-service';

export function TopicsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('alle');
  const [importance, setImportance] = useState('alle');
  const [coverage, setCoverage] = useState('alle');
  const [evidence, setEvidence] = useState('alle');
  const categories = [...new Set(topics.map((topic) => topic.category))].sort();
  const filtered = topics.filter((topic) => {
    const frequency = selectDuplicateSafeFrequency(topic);
    return (
      topic.name.toLocaleLowerCase('de').includes(search.toLocaleLowerCase('de')) &&
      (category === 'alle' || topic.category === category) &&
      (importance === 'alle' || topic.importance === importance) &&
      (coverage === 'alle' ||
        (coverage === 'offiziell'
          ? topic.officialSourceCoverage > 0
          : topic.exerciseCoverage > 0)) &&
      (evidence === 'alle' ||
        (evidence === 'real'
          ? frequency.realExam > 0
          : evidence === 'mock'
            ? frequency.mockExam > 0
            : frequency.exercise > 0))
    );
  });
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">76 belegte Themen</p>
        <h1>Themenindex</h1>
        <p>
          Themen führen zu Aufgaben, Lernmodulen, Trainern und Klausurmetadaten. Reale Klausuren,
          Probeklausuren und Übungen werden getrennt ausgewiesen.
        </p>
      </header>
      <section className="filters" aria-label="Themen filtern">
        <label>
          Suche
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="z. B. Dijkstra"
          />
        </label>
        <label>
          Kategorie
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="alle">Alle</option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Wichtigkeit
          <select value={importance} onChange={(e) => setImportance(e.target.value)}>
            <option value="alle">Alle</option>
            <option>mittel</option>
            <option>hoch</option>
            <option>sehr hoch</option>
          </select>
        </label>
        <label>
          Abdeckung
          <select value={coverage} onChange={(e) => setCoverage(e.target.value)}>
            <option value="alle">Alle</option>
            <option value="offiziell">Offizielle Quelle</option>
            <option value="uebung">Übung</option>
          </select>
        </label>
        <label>
          Evidenz
          <select value={evidence} onChange={(e) => setEvidence(e.target.value)}>
            <option value="alle">Alle</option>
            <option value="real">Reale Klausur</option>
            <option value="mock">Probeklausur</option>
            <option value="exercise">Übung</option>
          </select>
        </label>
      </section>
      <p className="result-count" aria-live="polite">
        {filtered.length} Themen
      </p>
      <div className="topic-list">
        {filtered.map((topic) => {
          const frequency = selectDuplicateSafeFrequency(topic);
          return (
            <Link className="topic-row" to={`/themen/${topic.id}`} key={topic.id}>
              <div>
                <span className="topic-row__category">{topic.category}</span>
                <h2>{topic.name}</h2>
              </div>
              <div className="evidence-chips">
                <span title="Reale Klausuren">Real {frequency.realExam}</span>
                <span title="Probeklausuren">Probe {frequency.mockExam}</span>
                <span title="Übungen">Übung {frequency.exercise}</span>
                <StatusBadge tone={topic.officialSourceCoverage ? 'success' : 'warning'}>
                  {topic.officialSourceCoverage ? 'offiziell belegt' : 'sekundär'}
                </StatusBadge>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function TopicDetailPage() {
  const { topicId } = useParams();
  const topic = topics.find((candidate) => candidate.id === topicId);
  if (!topic)
    return (
      <section>
        <h1>Thema nicht gefunden</h1>
        <Link to="/themen">Zum Index</Link>
      </section>
    );
  const frequency = selectDuplicateSafeFrequency(topic);
  const modules = getStudyModulesForTopic(topic.id);
  const taskEntries = taskSlotLearningMap.tasks.filter((task) => task.topicIds.includes(topic.id));
  const trainers = trainerRegistry.filter((trainer) => trainer.topicIds.includes(topic.id));
  const actions = [
    ...trainers.slice(0, 3).map((trainer) => ({
      resourceId: `trainer:${trainer.trainerId}`,
      reason: 'Dieser Trainer ist direkt mit dem Thema verbunden.',
    })),
    ...taskEntries.slice(0, 2).map((task) => ({
      resourceId: `klausuren:fragen?aufgabe=${task.taskNumber}`,
      reason: `Historische Metadaten für Aufgabe ${task.taskNumber} ansehen.`,
    })),
  ];

  return (
    <div className="page-flow">
      <Link className="back-link" to="/themen">
        ← Themenindex
      </Link>
      <header className="page-header">
        <p className="eyebrow">{topic.category}</p>
        <h1>{topic.name}</h1>
        <p>
          Diese Seite verbindet belegte Evidenz mit konkreten Lernaktionen. Wenn kein Modul
          existiert, bleibt die Seite bewusst bei Evidenz und Navigation.
        </p>
      </header>

      <div className="metric-grid">
        <article>
          <strong>{frequency.realExam}</strong>
          <span>reale Prüfungsereignisse</span>
        </article>
        <article>
          <strong>{frequency.mockExam}</strong>
          <span>Probeklausurereignisse</span>
        </article>
        <article>
          <strong>{topic.officialSourceCoverage}</strong>
          <span>offizielle Quellen</span>
        </article>
        <article>
          <strong>{topic.exerciseCoverage}</strong>
          <span>Übungsquellen</span>
        </article>
      </div>

      <NextLearningActions actions={actions} />

      {modules.length > 0 && (
        <section className="panel">
          <h2>Lernmodule zu diesem Thema</h2>
          <div className="card-grid">
            {modules.map((module) => (
              <article className="card" key={module.moduleId}>
                <h3>{module.title}</h3>
                <p>{module.summary}</p>
                <ul>
                  {module.coreIdeas.map((idea) => (
                    <li key={idea}>{idea}</li>
                  ))}
                </ul>
                <p className="quiet">
                  Quellen:{' '}
                  {module.sourceRefs.map((ref) => `${ref.sourceId} S. ${ref.page}`).join(', ')}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <h2>Verknüpfte Aufgaben und Trainer</h2>
        <div className="card-grid">
          {taskEntries.map((task) => (
            <article className="card" key={task.taskNumber}>
              <h3>{task.title}</h3>
              <p>Abdeckung: {task.coverageLevel}</p>
              <Link className="button-link" to={`/aufgaben/${task.taskNumber}`}>
                Aufgabe {task.taskNumber} öffnen
              </Link>
            </article>
          ))}
          {trainers.map((trainer) => (
            <article className="card" key={trainer.trainerId}>
              <p className="eyebrow">{trainer.algorithmFamily}</p>
              <h3>{trainer.title}</h3>
              <Link className="button-link" to={trainerPath(trainer.trainerId)}>
                Trainer öffnen
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
