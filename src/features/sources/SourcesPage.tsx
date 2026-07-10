import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { sources } from '../../content/loaders/sources';
import { taskSlotLearningMap } from '../../content/loaders/study-content';
import { topics } from '../../content/loaders/topics';
import { StatusBadge } from '../../ui/components/StatusBadge';
import { richStudyModules } from '../learning/study-module-details';
import { trainerRegistry } from '../trainer/trainer-service';
import { listLocalDocuments } from '../documents/local-document-service';
import type { LocalDocumentBinding } from '../../persistence/database/schema';

function normalStatus(status: string) {
  if (status === 'official_verified') return 'offiziell geprüft';
  if (status === 'verified_against_official_source') return 'gegen Quelle geprüft';
  if (status === 'visual_review_required') return 'Sichtprüfung offen';
  if (status === 'extraction_uncertain') return 'Extraktion unsicher';
  return 'intern markiert';
}

export function SourcesPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('alle');
  const [year, setYear] = useState('alle');
  const [bindings, setBindings] = useState<LocalDocumentBinding[]>([]);
  useEffect(() => void listLocalDocuments().then(setBindings), []);
  const connected = useMemo(() => new Set(bindings.map((binding) => binding.sourceId)), [bindings]);
  const categories = [...new Set(sources.map((source) => source.category))].sort();
  const years = [
    ...new Set(
      sources.map((source) => source.year).filter((value): value is number => value !== null),
    ),
  ].sort();
  const filtered = sources.filter(
    (source) =>
      source.displayName.toLocaleLowerCase('de').includes(search.toLocaleLowerCase('de')) &&
      (category === 'alle' || source.category === category) &&
      (year === 'alle' || String(source.year) === year),
  );
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Quellen als Lernmaterial</p>
        <h1>Quellenbibliothek</h1>
        <p>
          Diese Ansicht zeigt, was du mit einer Quelle lernen kannst: Themen, Aufgaben, Module,
          Trainer, Fragen und lokale PDF-Verbindung. Technische IDs bleiben in Details.
        </p>
      </header>
      <section className="filters" aria-label="Quellen filtern">
        <label>
          Quelle suchen
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="z. B. Vorlesung oder Klausur"
          />
        </label>
        <label>
          Dokumenttyp
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="alle">Alle</option>
            {categories.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Jahr
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="alle">Alle</option>
            {years.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </section>
      <p className="result-count" aria-live="polite">
        {filtered.length} Quellen
      </p>
      <div className="source-list">
        {filtered.map((source) => {
          const linkedModules = richStudyModules.filter((module) =>
            module.sourceRefs.some((ref) => ref.sourceId === source.id),
          );
          const linkedTasks = taskSlotLearningMap.tasks.filter((task) =>
            task.sourceRefs.some((ref) => ref.sourceId === source.id),
          );
          const linkedTopics = topics.filter((topic) =>
            topic.sourceRefs.some((ref) => ref.sourceId === source.id),
          );
          const linkedTrainers = trainerRegistry.filter((trainer) =>
            trainer.sourceRefs.some((ref) => ref.sourceId === source.id),
          );
          return (
            <article className="source-row source-row--article" key={source.id}>
              <div>
                <p className="eyebrow">{source.category}</p>
                <h2>{source.title}</h2>
                <p>
                  {source.year ?? 'Jahr unbekannt'} · {source.pageCount ?? 'unbekannte'} Seiten ·{' '}
                  {normalStatus(source.verificationStatus)}
                </p>
                <div className="evidence-chips">
                  {linkedTopics.slice(0, 4).map((topic) => (
                    <span key={topic.id}>{topic.name}</span>
                  ))}
                  {linkedTasks.slice(0, 3).map((task) => (
                    <span key={task.taskNumber}>Aufgabe {task.taskNumber}</span>
                  ))}
                </div>
                <p>
                  {linkedModules.length} Lernmodule · {linkedTrainers.length} Trainer ·{' '}
                  {connected.has(source.id) ? 'lokale PDF verbunden' : 'Datei nicht verbunden'}
                </p>
              </div>
              <div className="source-actions">
                {connected.has(source.id) ? (
                  <>
                    <Link className="button-link" to={`/dokumente/local-document-${source.id}`}>
                      PDF öffnen
                    </Link>
                    <Link className="button-link" to={`/dokumente/local-document-${source.id}`}>
                      Seite öffnen
                    </Link>
                  </>
                ) : (
                  <Link className="button-link" to={`/dokumente/verbinden?source=${source.id}`}>
                    Lokale PDF verbinden
                  </Link>
                )}
                {linkedModules[0] && (
                  <Link className="button-link" to={`/lernen/${linkedModules[0].slug}`}>
                    Lernmodul öffnen
                  </Link>
                )}
                <details>
                  <summary>Technische Details</summary>
                  <dl className="metadata-list">
                    <div>
                      <dt>Quellen-ID</dt>
                      <dd>{source.id}</dd>
                    </div>
                    <div>
                      <dt>Duplikatgruppe</dt>
                      <dd>{source.duplicateGroupId ?? 'keine'}</dd>
                    </div>
                    <div>
                      <dt>Extraktion</dt>
                      <dd>{source.extractionSucceeded ? 'erfolgreich' : 'nicht oder unsicher'}</dd>
                    </div>
                  </dl>
                </details>
              </div>
              <StatusBadge tone={connected.has(source.id) ? 'success' : 'neutral'}>
                {connected.has(source.id) ? 'PDF verbunden' : 'lokal verbindbar'}
              </StatusBadge>
            </article>
          );
        })}
      </div>
    </div>
  );
}
