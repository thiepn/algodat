import { Suspense, lazy, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { LocalDocumentBinding, SourceTaskRegion } from '../../persistence/database/schema';
import { hrefForResource, labelForResource, trainerPath } from '../study-content/resource-links';
import { getLocalDocumentBySource } from './local-document-service';
import { sourceTitle, topicNames } from './source-task-index';

const LocalPdfRenderer = lazy(() =>
  import('./local-pdf-renderer').then((module) => ({ default: module.LocalPdfRenderer })),
);

interface OriginalTaskViewProps {
  title: string;
  region: SourceTaskRegion | null;
  taskNumber: number;
  topicIds: string[];
  trainerIds: string[];
  moduleIds: string[];
  fallbackBackLink: string;
}

export function OriginalTaskView({
  title,
  region,
  taskNumber,
  topicIds,
  trainerIds,
  moduleIds,
  fallbackBackLink,
}: OriginalTaskViewProps) {
  const [binding, setBinding] = useState<LocalDocumentBinding | undefined>();
  const [solutionBinding, setSolutionBinding] = useState<LocalDocumentBinding | undefined>();

  useEffect(() => {
    void getLocalDocumentBySource(region?.sourceId).then(setBinding);
    void getLocalDocumentBySource(region?.solutionSourceId).then(setSolutionBinding);
  }, [region?.solutionSourceId, region?.sourceId]);

  if (!region) {
    return (
      <div className="page-flow">
        <Link className="back-link" to={fallbackBackLink}>
          ← Zurück
        </Link>
        <h1>Originalregion nicht indexiert</h1>
        <p>Für diese Aufgabe existiert noch keine sichere Seiten- oder Crop-Zuordnung.</p>
        <Link className="button-link" to="/dokumente/indexierung">
          Region lokal indexieren
        </Link>
      </div>
    );
  }

  const names = topicNames(topicIds);
  return (
    <div className="page-flow">
      <Link className="back-link" to={fallbackBackLink}>
        ← Zurück
      </Link>
      <header className="page-header">
        <p className="eyebrow">Lokale Originalquelle</p>
        <h1>{title}</h1>
        <p>
          Aufgabe {taskNumber} · Seiten {region.pageStart}
          {region.pageEnd !== region.pageStart ? `–${region.pageEnd}` : ''} ·{' '}
          {sourceTitle(region.sourceId)}
        </p>
      </header>

      <section className="panel">
        <h2>Sichere öffentliche Metadaten</h2>
        <dl className="metadata-list">
          <div>
            <dt>Status</dt>
            <dd>
              {region.verificationStatus === 'metadata_only'
                ? 'Seite/Region aus sicheren Metadaten; bei Bedarf lokal präzisieren.'
                : region.verificationStatus}
            </dd>
          </div>
          <div>
            <dt>Themen</dt>
            <dd>{names.length ? names.join(', ') : 'Noch nicht zugeordnet'}</dd>
          </div>
          <div>
            <dt>Trainer</dt>
            <dd>{trainerIds.length ? trainerIds.join(', ') : 'Kein direkter Trainer'}</dd>
          </div>
        </dl>
        <div className="button-row">
          {moduleIds.slice(0, 3).map((moduleId) => (
            <Link className="button-link" key={moduleId} to={hrefForResource(`module:${moduleId}`)}>
              {labelForResource(`module:${moduleId}`)}
            </Link>
          ))}
          {trainerIds.slice(0, 2).map((trainerId) => (
            <Link className="button-link" key={trainerId} to={trainerPath(trainerId)}>
              Trainer starten: {trainerId}
            </Link>
          ))}
          <Link className="button-link" to="/lernplan/heute">
            Zum Lernplan hinzufügen
          </Link>
        </div>
      </section>

      {!binding ? (
        <section className="panel">
          <h2>Lokale Originaldatei nicht verbunden</h2>
          <p>
            Die App kennt Quelle, Seite und sichere Themenmetadaten. Das exakte Original wird erst
            angezeigt, wenn du die passende PDF-Datei lokal verbindest.
          </p>
          <p>
            Erwartete Quelle: {sourceTitle(region.sourceId)} · Seite {region.pageStart}
          </p>
          <Link className="button-link" to={`/dokumente/verbinden?source=${region.sourceId}`}>
            Dokument verbinden
          </Link>
        </section>
      ) : (
        <Suspense fallback={<p>Lokaler PDF-Renderer wird geladen …</p>}>
          <LocalPdfRenderer
            binding={binding}
            cropRegions={region.cropRegions}
            label={title}
            pageEnd={region.pageEnd}
            pageStart={region.pageStart}
            solutionBinding={solutionBinding}
            solutionPageStart={region.solutionPageStart}
          />
        </Suspense>
      )}
    </div>
  );
}
