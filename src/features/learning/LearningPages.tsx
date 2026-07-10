import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { sources } from '../../content/loaders/sources';
import { topics } from '../../content/loaders/topics';
import { NextLearningActions } from '../study-content/NextLearningActions';
import { trainerPath } from '../study-content/resource-links';
import { trainerRegistry } from '../trainer/trainer-service';
import {
  getRichModuleBySlug,
  richStudyModules,
  type RichStudyModule,
} from './study-module-details';

const progressStorageKey = 'algodat.phase18.module-progress';

type ModuleProgress = Record<string, { completedSectionIds: string[]; lastSectionId: string }>;

function readProgress(): ModuleProgress {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(progressStorageKey) ?? '{}') as ModuleProgress;
  } catch {
    return {};
  }
}

function writeProgress(progress: ModuleProgress) {
  window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
}

function sourceLabel(sourceId: string) {
  const source = sources.find((candidate) => candidate.id === sourceId);
  return source?.title ?? source?.displayName ?? 'Quelle aus Manifest';
}

function topicName(topicId: string) {
  return topics.find((topic) => topic.id === topicId)?.name ?? 'zugeordnetes Thema';
}

function sectionList(module: RichStudyModule) {
  return [
    {
      id: 'ziele',
      title: 'Was du nach diesem Modul kannst',
      content: <BulletList items={module.learningObjectives} />,
    },
    {
      id: 'intuition',
      title: 'Intuition',
      content: <ParagraphList items={module.intuitionSections} />,
    },
    {
      id: 'definitionen',
      title: 'Begriffe und Definitionen',
      content: <ParagraphList items={module.definitionSections} />,
    },
    {
      id: 'verfahren',
      title: 'Verfahren oder Algorithmus',
      content: (
        <>
          <ParagraphList items={[...module.theoremSections, ...module.algorithmSections]} />
          {module.pseudocodeBlocks.map((block) => (
            <figure className="code-card" key={block.title}>
              <figcaption>{block.title}</figcaption>
              <pre>
                <code>{block.code}</code>
              </pre>
            </figure>
          ))}
        </>
      ),
    },
    {
      id: 'beispiel',
      title: 'vollständiges Beispiel',
      content: (
        <div className="card-grid">
          {module.workedExamples.map((example) => (
            <article className="card" key={example.title}>
              <h3>{example.title}</h3>
              <ol>
                {example.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      ),
    },
    {
      id: 'korrektheit',
      title: 'Warum das funktioniert',
      content: <ParagraphList items={module.proofSections} />,
    },
    {
      id: 'laufzeit',
      title: 'Laufzeit',
      content: <ParagraphList items={module.complexitySections} />,
    },
    {
      id: 'fehler',
      title: 'häufige Fehler',
      content: <BulletList items={module.commonMistakes} />,
    },
    {
      id: 'strategie',
      title: 'Klausurstrategie',
      content: <BulletList items={module.examTips} />,
    },
    {
      id: 'uebungen',
      title: 'Mini-Übungen',
      content: (
        <ol>
          {module.miniExercises.map((exercise) => (
            <li key={exercise.prompt}>{exercise.prompt}</li>
          ))}
        </ol>
      ),
    },
    {
      id: 'loesungen',
      title: 'Lösungen',
      content: (
        <details className="answer-details">
          <summary>Lösungen zu den Mini-Übungen anzeigen</summary>
          <ol>
            {module.miniExercises.map((exercise) => (
              <li key={exercise.prompt}>{exercise.solution}</li>
            ))}
          </ol>
        </details>
      ),
    },
    {
      id: 'trainer',
      title: 'Passender Trainer',
      content: <TrainerLinks trainerIds={module.trainerIds} />,
    },
    {
      id: 'fragen',
      title: 'Verwandte Fragen',
      content: (
        <div className="button-row">
          {module.taskNumbers.map((taskNumber) => (
            <Link
              className="button-link"
              key={taskNumber}
              to={`/klausuren/fragen?aufgabe=${taskNumber}`}
            >
              Fragen zu Aufgabe {taskNumber}
            </Link>
          ))}
        </div>
      ),
    },
    {
      id: 'quellen',
      title: 'Quellen',
      content: (
        <>
          <p>
            Die fachlichen Aussagen dieses Moduls sind an die folgenden Datei- und Seitenbezüge
            gebunden. Die PDF-Dateien selbst bleiben lokal und werden nicht ausgeliefert.
          </p>
          <ul>
            {module.sourceRefs.map((ref) => (
              <li key={`${ref.sourceId}-${ref.page}`}>
                {sourceLabel(ref.sourceId)}, Seite {ref.page}
              </li>
            ))}
          </ul>
          <details>
            <summary>Technische Quellen-IDs anzeigen</summary>
            <ul>
              {module.sourceRefs.map((ref) => (
                <li key={`${ref.sourceId}-${ref.page}-technical`}>
                  {ref.sourceId}, Seite {ref.page}
                </li>
              ))}
            </ul>
          </details>
        </>
      ),
    },
  ];
}

export function LearningIndexPage() {
  const grouped = useMemo(
    () =>
      richStudyModules.reduce<Record<string, RichStudyModule[]>>((groups, module) => {
        const firstTask = module.taskNumbers[0] ?? 0;
        const key =
          firstTask <= 1
            ? 'Grundlagen'
            : firstTask <= 4
              ? 'Datenstrukturen und Graphen'
              : firstTask <= 6
                ? 'Beweise und Laufzeiten'
                : 'Entwurf und Transfer';
        groups[key] ??= [];
        groups[key].push(module);
        return groups;
      }, {}),
    [],
  );
  const progress = readProgress();
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Lernen</p>
        <h1>Vollständige Lernmodule</h1>
        <p>
          Diese Module sind keine Metadatenkarten: Jede Seite enthält Erklärung, Definitionen,
          Algorithmus, Beispiel, Begründung, Laufzeit, Übungen, Trainer und Quellen.
        </p>
      </header>
      {Object.entries(grouped).map(([group, modules]) => (
        <section className="panel" key={group}>
          <h2>{group}</h2>
          <div className="card-grid">
            {modules.map((module) => {
              const moduleProgress = progress[module.moduleId];
              const completed = moduleProgress?.completedSectionIds.length ?? 0;
              return (
                <article className="card" key={module.moduleId}>
                  <p className="eyebrow">
                    {module.taskNumbers.map((taskNumber) => `Aufgabe ${taskNumber}`).join(', ')}
                  </p>
                  <h3>{module.title}</h3>
                  <p>{module.shortDescription}</p>
                  <p className="quiet">
                    {completed}/14 Abschnitte abgeschlossen · Status:{' '}
                    {module.verificationStatus === 'verified_against_official_source'
                      ? 'quellengeprüft'
                      : 'teilweise geprüft'}
                  </p>
                  <Link className="button-link" to={`/lernen/${module.slug}`}>
                    {moduleProgress ? 'Fortsetzen' : 'Modul öffnen'}
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function LearningModulePage() {
  const { moduleSlug } = useParams();
  const module = moduleSlug ? getRichModuleBySlug(moduleSlug) : undefined;
  const [progress, setProgress] = useState<ModuleProgress>(() => readProgress());
  const [activeSectionId, setActiveSectionId] = useState('');
  const sections = module ? sectionList(module) : [];
  const moduleProgress = module ? progress[module.moduleId] : undefined;
  const completed = new Set(moduleProgress?.completedSectionIds ?? []);

  if (!module)
    return (
      <section className="page-flow">
        <h1>Lernmodul nicht gefunden</h1>
        <Link to="/lernen">Zur Lernübersicht</Link>
      </section>
    );

  const activeIndex = Math.max(
    0,
    sections.findIndex(
      (section) => section.id === ((activeSectionId || moduleProgress?.lastSectionId) ?? 'ziele'),
    ),
  );
  const activeSection = sections[activeIndex] ?? sections[0];
  if (!activeSection)
    return (
      <section className="page-flow">
        <h1>Lernmodul ohne Abschnitte</h1>
        <Link to="/lernen">Zur Lernübersicht</Link>
      </section>
    );
  const save = (nextSectionId: string, nextCompleted = completed) => {
    const next = {
      ...progress,
      [module.moduleId]: {
        completedSectionIds: [...nextCompleted],
        lastSectionId: nextSectionId,
      },
    };
    setProgress(next);
    writeProgress(next);
    setActiveSectionId(nextSectionId);
  };
  const previous = sections[Math.max(0, activeIndex - 1)] ?? activeSection;
  const next = sections[Math.min(sections.length - 1, activeIndex + 1)] ?? activeSection;

  return (
    <div className="page-flow learning-module">
      <Link className="back-link" to="/lernen">
        ← Lernübersicht
      </Link>
      <header className="page-header">
        <p className="eyebrow">
          {module.taskNumbers.map((taskNumber) => `Aufgabe ${taskNumber}`).join(', ')}
        </p>
        <h1>{module.title}</h1>
        <p>{module.introduction}</p>
      </header>

      <div className="two-column two-column--wide-left">
        <aside className="panel module-toc" aria-label="Modulabschnitte">
          <h2>Modulfortschritt</h2>
          <p className="quiet">
            {completed.size}/{sections.length} Abschnitte abgeschlossen. Der Fortschritt bleibt nur
            lokal in diesem Browser.
          </p>
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              className={section.id === activeSection.id ? 'module-toc__active' : undefined}
              onClick={() => save(section.id)}
            >
              {completed.has(section.id) ? '✓ ' : ''}
              {section.title}
            </button>
          ))}
        </aside>

        <article className="panel module-section">
          <p className="eyebrow">
            Abschnitt {activeIndex + 1} von {sections.length}
          </p>
          <h2>{activeSection.title}</h2>
          {activeSection.content}
          <div className="button-row">
            <button type="button" disabled={activeIndex === 0} onClick={() => save(previous.id)}>
              Vorheriger Abschnitt
            </button>
            <button
              type="button"
              onClick={() => {
                const nextCompleted = new Set(completed);
                nextCompleted.add(activeSection.id);
                save(activeSection.id, nextCompleted);
              }}
            >
              Abschnitt als erledigt markieren
            </button>
            <button
              className="primary-button"
              type="button"
              disabled={activeIndex === sections.length - 1}
              onClick={() => save(next.id)}
            >
              Nächster Abschnitt
            </button>
          </div>
        </article>
      </div>

      <section className="panel">
        <h2>Einordnung</h2>
        <div className="evidence-chips">
          {module.topicIds.map((topicId) => (
            <span key={topicId}>{topicName(topicId)}</span>
          ))}
        </div>
      </section>

      <NextLearningActions
        actions={[
          ...module.trainerIds.map((trainerId) => ({
            resourceId: `trainer:${trainerId}`,
            reason: 'Aktives Üben mit direkter Eingabe.',
          })),
          ...module.taskNumbers.slice(0, 2).map((taskNumber) => ({
            resourceId: `klausuren:fragen?aufgabe=${taskNumber}`,
            reason: `Sichere alte Fragenmetadaten zu Aufgabe ${taskNumber} ansehen.`,
          })),
        ]}
      />
    </div>
  );
}

function ParagraphList({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function TrainerLinks({ trainerIds }: { trainerIds: string[] }) {
  if (trainerIds.length === 0)
    return <p>Für dieses Modul ist noch kein produktiver Trainer freigegeben.</p>;
  return (
    <div className="button-row">
      {trainerIds.map((trainerId) => {
        const trainer = trainerRegistry.find((candidate) => candidate.trainerId === trainerId);
        return (
          <Link className="button-link" key={trainerId} to={trainerPath(trainerId)}>
            {trainer?.title ?? 'Trainer öffnen'}
          </Link>
        );
      })}
    </div>
  );
}
