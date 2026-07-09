import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { topics } from '../../content/loaders/topics';
import { selectDuplicateSafeFrequency } from '../../content/selectors/frequency';
import { StatusBadge } from '../../ui/components/StatusBadge';

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
        <p>Reale Klausuren, Probeklausuren und Übungen werden getrennt ausgewiesen.</p>
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
  return (
    <div className="page-flow">
      <Link className="back-link" to="/themen">
        ← Themenindex
      </Link>
      <header className="page-header">
        <p className="eyebrow">{topic.category}</p>
        <h1>{topic.name}</h1>
        <p>
          Diese Phase zeigt ausschließlich Metadaten und Evidenz – noch keine erzeugte
          Lernzusammenfassung.
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
      {topic.id === 'topic-f5b57f47447c' && (
        <Link className="button-link" to="/trainer/tracing/trainer-rucksack-dp-v1">
          Rucksack-DP aktiv trainieren
        </Link>
      )}
    </div>
  );
}
