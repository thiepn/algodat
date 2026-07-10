import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { sources } from '../../content/loaders/sources';
import { taskSlotLearningMap } from '../../content/loaders/study-content';
import { topics } from '../../content/loaders/topics';
import { approvedHostedMaterialForSource } from '../../content/loaders/hosted-materials';
import { richStudyModules } from '../learning/study-module-details';
import { trainerPath } from '../study-content/resource-links';
import { trainerRegistry } from '../trainer/trainer-service';
import { exerciseSheets, indexedExams, sourceTitle } from '../documents/source-task-index';

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
  const categories = [...new Set(sources.map((source) => source.category))].sort();
  const years = [
    ...new Set(
      sources.map((source) => source.year).filter((value): value is number => value !== null),
    ),
  ].sort();
  const normalizedSearch = search.toLocaleLowerCase('de');
  const filtered = sources.filter(
    (source) =>
      `${source.displayName} ${sourceTitle(source.id)}`
        .toLocaleLowerCase('de')
        .includes(normalizedSearch) &&
      (category === 'alle' || source.category === category) &&
      (year === 'alle' || String(source.year) === year),
  );
  const exerciseTasksBySource = useMemo(
    () =>
      new Map(
        sources.map((source) => [
          source.id,
          exerciseSheets
            .flatMap((sheet) => sheet.tasks)
            .filter((task) => task.sourceId === source.id || task.solutionSourceId === source.id),
        ]),
      ),
    [],
  );
  const examTasksBySource = useMemo(
    () =>
      new Map(
        sources.map((source) => [
          source.id,
          indexedExams
            .flatMap((exam) => exam.tasks)
            .filter((task) => task.sourceId === source.id || task.solutionSourceId === source.id),
        ]),
      ),
    [],
  );
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Quellen als Lernmaterial</p>
        <h1>Quellenbibliothek</h1>
        <p>
          Diese Ansicht zeigt sichere Quellenmetadaten, zugehörige Themen, Aufgaben, Module und
          Trainer. Originaldokumente erscheinen nur, wenn sie explizit zur Veröffentlichung
          freigegeben sind.
        </p>
      </header>
      <section className="filters" aria-label="Quellen filtern">
        <label>
          Quelle suchen
          <input
            placeholder="z. B. Vorlesung oder Klausur"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          const exerciseTasks = exerciseTasksBySource.get(source.id) ?? [];
          const examTasks = examTasksBySource.get(source.id) ?? [];
          const hostedMaterial = approvedHostedMaterialForSource(source.id);
          return (
            <article className="source-row source-row--article" key={source.id}>
              <div>
                <p className="eyebrow">{source.category}</p>
                <h2>{sourceTitle(source.id)}</h2>
                <p>
                  {source.year ?? 'Jahr unbekannt'} · {source.pageCount ?? 'unbekannte'} Seiten ·{' '}
                  {normalStatus(source.verificationStatus)}
                </p>
                <div className="evidence-chips">
                  {linkedTopics.slice(0, 4).map((topic) => (
                    <span key={topic.id}>{topic.name}</span>
                  ))}
                  {exerciseTasks.slice(0, 3).map((task) => (
                    <span key={task.id}>Übung {task.taskNumber}</span>
                  ))}
                  {examTasks.slice(0, 3).map((task) => (
                    <span key={task.id}>Klausuraufgabe {task.taskNumber}</span>
                  ))}
                  {linkedTasks.slice(0, 3).map((task) => (
                    <span key={task.taskNumber}>Slot {task.taskNumber}</span>
                  ))}
                </div>
                <p>
                  {linkedModules.length} Lernmodule · {linkedTrainers.length} Trainer ·{' '}
                  {exerciseTasks.length} Übungsaufgaben · {examTasks.length} Klausuraufgaben
                </p>
                {!hostedMaterial && (
                  <p className="notice">Originaldokument nicht öffentlich eingebunden.</p>
                )}
              </div>
              <div className="source-actions">
                {hostedMaterial?.officialUrl && (
                  <a
                    className="button-link"
                    href={hostedMaterial.officialUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Offizielle Quelle öffnen
                  </a>
                )}
                {hostedMaterial?.assetPath && (
                  <a className="button-link" href={hostedMaterial.assetPath}>
                    Genehmigtes Material öffnen
                  </a>
                )}
                {linkedModules[0] && (
                  <Link className="button-link" to={`/lernen/${linkedModules[0].slug}`}>
                    Lernmodul öffnen
                  </Link>
                )}
                {linkedTrainers[0] && (
                  <Link className="button-link" to={trainerPath(linkedTrainers[0].trainerId)}>
                    Trainer starten
                  </Link>
                )}
                <details>
                  <summary>Provenienzdetails anzeigen</summary>
                  <dl className="metadata-list">
                    <div>
                      <dt>Quellen-ID</dt>
                      <dd>{source.id}</dd>
                    </div>
                    <div>
                      <dt>Dateiname</dt>
                      <dd>{source.displayName}</dd>
                    </div>
                    <div>
                      <dt>Duplikatgruppe</dt>
                      <dd>{source.duplicateGroupId ?? 'keine'}</dd>
                    </div>
                    <div>
                      <dt>Extraktion</dt>
                      <dd>{source.extractionSucceeded ? 'erfolgreich' : 'nicht oder unsicher'}</dd>
                    </div>
                    <div>
                      <dt>Hosted Material</dt>
                      <dd>
                        {hostedMaterial ? hostedMaterial.publicationStatus : 'nicht genehmigt'}
                      </dd>
                    </div>
                  </dl>
                </details>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
