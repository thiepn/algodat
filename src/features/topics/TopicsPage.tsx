import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { topics } from '../../content/loaders/topics';
import { taskSlotLearningMap } from '../../content/loaders/study-content';
import { selectDuplicateSafeFrequency } from '../../content/selectors/frequency';
import { StatusBadge } from '../../ui/components/StatusBadge';
import { getRichModulesForTopic } from '../learning/study-module-details';
import { NextLearningActions } from '../study-content/NextLearningActions';
import { trainerPath } from '../study-content/resource-links';
import { trainerRegistry } from '../trainer/trainer-service';

export function TopicsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('alle');
  const [importance, setImportance] = useState('alle');
  const categories = [...new Set(topics.map((topic) => topic.category))].sort();
  const filtered = topics.filter(
    (topic) =>
      topic.name.toLocaleLowerCase('de').includes(search.toLocaleLowerCase('de')) &&
      (category === 'alle' || topic.category === category) &&
      (importance === 'alle' || topic.importance === importance),
  );
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Themenbasiert lernen</p>
        <h1>Themenindex</h1>
        <p>
          Der Themenindex führt zu Erklärungen, vollständigen Lernmodulen, Aufgaben-Guides, Trainern
          und sicheren Klausurenmetadaten.
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
      </section>
      <p className="result-count" aria-live="polite">
        {filtered.length} Themen
      </p>
      <div className="topic-list">
        {filtered.map((topic) => {
          const frequency = selectDuplicateSafeFrequency(topic);
          const moduleCount = getRichModulesForTopic(topic.id).length;
          return (
            <Link className="topic-row" to={`/themen/${topic.id}`} key={topic.id}>
              <div>
                <span className="topic-row__category">{topic.category}</span>
                <h2>{topic.name}</h2>
                <p>
                  {moduleCount} vollständige Lernmodule · {frequency.realExam} reale Ereignisse
                </p>
              </div>
              <StatusBadge tone={moduleCount ? 'success' : 'warning'}>
                {moduleCount ? 'lernbar' : 'nur Evidenz'}
              </StatusBadge>
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
  const modules = getRichModulesForTopic(topic.id);
  const primaryModule = modules[0];
  const taskEntries = taskSlotLearningMap.tasks.filter((task) => task.topicIds.includes(topic.id));
  const trainers = trainerRegistry.filter((trainer) => trainer.topicIds.includes(topic.id));
  const actions = [
    ...modules.slice(0, 2).map((module) => ({
      resourceId: `module:${module.moduleId}`,
      reason: 'Vollständige Erklärung mit Beispiel und Übungen lesen.',
    })),
    ...trainers.slice(0, 2).map((trainer) => ({
      resourceId: `trainer:${trainer.trainerId}`,
      reason: 'Direkt aktiv üben.',
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
          {primaryModule?.shortDescription ??
            'Dieses Thema besitzt belegte Quellen und wird über Aufgaben-Guides eingeordnet; ein vollständiges Modul ist noch als Inhaltslücke markiert.'}
        </p>
      </header>

      {primaryModule && (
        <>
          <section className="panel">
            <h2>Kurze Erklärung</h2>
            <p>{primaryModule.introduction}</p>
            <h3>Intuitives Beispiel</h3>
            <ol>
              {primaryModule.workedExamples[0]?.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>

          <div className="two-column">
            <section className="panel">
              <h2>Kernbegriffe</h2>
              <ul>
                {primaryModule.definitionSections.map((definition) => (
                  <li key={definition}>{definition}</li>
                ))}
              </ul>
            </section>
            <section className="panel">
              <h2>Algorithmus oder Prinzip</h2>
              <ul>
                {[...primaryModule.theoremSections, ...primaryModule.algorithmSections].map(
                  (item) => (
                    <li key={item}>{item}</li>
                  ),
                )}
              </ul>
            </section>
          </div>

          <div className="two-column">
            <section className="panel">
              <h2>Häufige Fehler</h2>
              <ul>
                {primaryModule.commonMistakes.map((mistake) => (
                  <li key={mistake}>{mistake}</li>
                ))}
              </ul>
            </section>
            <section className="panel">
              <h2>Klausurrelevanz</h2>
              <p>
                Reale Ereignisse: {frequency.realExam}. Probeklausuren: {frequency.mockExam}.
                Übungsbezüge: {frequency.exercise}.
              </p>
              <ul>
                {primaryModule.examTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}

      <NextLearningActions actions={actions} />

      {modules.length > 0 && (
        <section className="panel">
          <h2>Vollständige Lernmodule</h2>
          <div className="card-grid">
            {modules.map((module) => (
              <article className="card" key={module.moduleId}>
                <h3>{module.title}</h3>
                <p>{module.shortDescription}</p>
                <Link className="button-link" to={`/lernen/${module.slug}`}>
                  Modul öffnen
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {(taskEntries.length > 0 || trainers.length > 0) && (
        <section className="panel">
          <h2>Aufgaben und Trainer</h2>
          <div className="card-grid">
            {taskEntries.map((task) => (
              <article className="card" key={task.taskNumber}>
                <h3>{task.title}</h3>
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
      )}

      <section className="panel">
        <h2>Quellen</h2>
        <ul>
          {topic.sourceRefs.map((ref) => (
            <li key={`${ref.sourceId}-${ref.page}`}>Quelle aus Manifest, Seite {ref.page}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
