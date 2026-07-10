import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { sources } from '../../content/loaders/sources';
import type { LocalDocumentBinding, SourceTaskRegion } from '../../persistence/database/schema';
import {
  connectLocalPdf,
  exportDocumentMappings,
  exportTaskRegionMetadata,
  getLocalDocument,
  listLocalDocuments,
  listLocalTaskRegions,
  matchLocalPdf,
  removeLocalDocument,
  removeLocalTaskRegion,
  saveLocalTaskRegion,
  storageUsage,
  type DocumentMatchCandidate,
} from './local-document-service';
import { sourceTaskRegions, sourceTitle, topicNames } from './source-task-index';

const LocalPdfRenderer = lazy(() =>
  import('./local-pdf-renderer').then((module) => ({ default: module.LocalPdfRenderer })),
);

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function sourceForBinding(binding: LocalDocumentBinding) {
  return sources.find((source) => source.id === binding.sourceId);
}

function connectedSourceIds(bindings: LocalDocumentBinding[]) {
  return new Set(bindings.map((binding) => binding.sourceId));
}

export function DocumentIndexPage() {
  const [bindings, setBindings] = useState<LocalDocumentBinding[]>([]);
  const [regions, setRegions] = useState<SourceTaskRegion[]>([]);
  useEffect(() => void listLocalDocuments().then(setBindings), []);
  useEffect(() => void listLocalTaskRegions().then(setRegions), []);
  const connected = connectedSourceIds(bindings);
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Private Dokumente</p>
        <h1>Lokale PDF-Bibliothek</h1>
        <p>
          PDF-Dateien werden nur in deinem Browser gespeichert. Es gibt keinen Upload, keine
          Veröffentlichung, kein Service-Worker-Precache und keinen Export der PDF-Bytes.
        </p>
      </header>

      <section className="metric-grid">
        <article>
          <strong>{bindings.length}</strong>
          <span>verbundene PDFs</span>
        </article>
        <article>
          <strong>{formatBytes(storageUsage(bindings))}</strong>
          <span>lokal belegter Speicher</span>
        </article>
        <article>
          <strong>{sourceTaskRegions.length + regions.length}</strong>
          <span>statische und lokale Regionen</span>
        </article>
      </section>

      <div className="button-row">
        <Link className="button-link" to="/dokumente/verbinden">
          Lokale PDFs verbinden
        </Link>
        <Link className="button-link" to="/dokumente/indexierung">
          Aufgabenregion indexieren
        </Link>
        <Link className="button-link" to="/dokumente/zuordnungen">
          Zuordnungen exportieren
        </Link>
      </div>

      <section className="panel">
        <h2>Verbundene Dokumente</h2>
        {bindings.length === 0 ? (
          <p>
            Noch keine lokale PDF verbunden. Wähle eine Datei aus deinem privaten pdfs-Ordner aus.
          </p>
        ) : (
          <div className="source-list">
            {bindings.map((binding) => {
              const source = sourceForBinding(binding);
              return (
                <article className="source-row source-row--article" key={binding.id}>
                  <div>
                    <p className="eyebrow">{source?.category ?? 'Quelle'}</p>
                    <h2>{source?.title ? sourceTitle(source.id) : binding.actualFilename}</h2>
                    <p>
                      {binding.actualFilename} · {formatBytes(binding.byteSize)} ·{' '}
                      {binding.matchingState} · verbunden am{' '}
                      {new Date(binding.connectedAt).toLocaleString('de-DE')}
                    </p>
                  </div>
                  <Link className="button-link" to={`/dokumente/${binding.id}`}>
                    PDF öffnen
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="panel">
        <h2>Quellen mit Verbindungsstatus</h2>
        <div className="source-list">
          {sources.slice(0, 100).map((source) => (
            <article className="source-row source-row--article" key={source.id}>
              <div>
                <h3>{sourceTitle(source.id)}</h3>
                <p>
                  {source.category} · {source.year ?? 'Jahr unbekannt'} ·{' '}
                  {connected.has(source.id) ? 'PDF verbunden' : 'Datei nicht verbunden'}
                </p>
              </div>
              {connected.has(source.id) ? (
                <Link className="button-link" to={`/dokumente/local-document-${source.id}`}>
                  PDF öffnen
                </Link>
              ) : (
                <Link className="button-link" to={`/dokumente/verbinden?source=${source.id}`}>
                  Lokale PDF verbinden
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

interface PendingFile {
  id: string;
  file: File;
  match: DocumentMatchCandidate;
  selectedSourceId: string;
}

export function DocumentConnectPage() {
  const [searchParams] = useSearchParams();
  const initialSource = searchParams.get('source') ?? sources[0]?.id ?? '';
  const [bindings, setBindings] = useState<LocalDocumentBinding[]>([]);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState(initialSource);
  useEffect(() => void listLocalDocuments().then(setBindings), []);

  const inspectFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const nextPending: PendingFile[] = [];
    let autoConnected = 0;
    for (const file of Array.from(files)) {
      const match = await matchLocalPdf(file);
      const sourceId = match.sourceId ?? selectedSourceId;
      if (
        sourceId &&
        (match.state === 'exact_hash_match' || match.state === 'filename_match') &&
        match.sourceId
      ) {
        await connectLocalPdf(sourceId, file, match.state);
        autoConnected += 1;
      } else {
        nextPending.push({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          file,
          match,
          selectedSourceId: sourceId,
        });
      }
    }
    setPending(nextPending);
    setBindings(await listLocalDocuments());
    setMessage(
      autoConnected
        ? `${autoConnected} PDF-Datei(en) sicher automatisch verbunden. Unsichere Treffer warten auf Bestätigung.`
        : 'Keine Datei wurde hochgeladen. Bitte unsichere oder manuelle Zuordnungen bestätigen.',
    );
  };

  const confirmPending = async (item: PendingFile) => {
    await connectLocalPdf(item.selectedSourceId, item.file, item.match.state || 'manual_match');
    setPending((items) => items.filter((candidate) => candidate.id !== item.id));
    setBindings(await listLocalDocuments());
    setMessage('Lokale PDF-Bindung bestätigt. Die Datei bleibt ausschließlich im Browser.');
  };

  return (
    <div className="page-flow">
      <Link className="back-link" to="/dokumente">
        ← Dokumente
      </Link>
      <header className="page-header">
        <p className="eyebrow">Nur lokal</p>
        <h1>Lokale PDFs verbinden</h1>
        <p>
          Wähle eine oder mehrere PDF-Dateien aus. Exakte Hash- oder Dateinamen-Treffer werden
          automatisch verbunden; wahrscheinliche und manuelle Treffer brauchen deine Bestätigung.
        </p>
      </header>
      <section className="panel">
        <h2>Dateien auswählen</h2>
        <label>
          Quelle für manuelle Zuordnung
          <select
            value={selectedSourceId}
            onChange={(event) => setSelectedSourceId(event.target.value)}
          >
            {sources.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {sourceTitle(candidate.id)}
              </option>
            ))}
          </select>
        </label>
        <label>
          PDF-Datei oder mehrere PDFs
          <input
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={(event) => void inspectFiles(event.target.files)}
          />
        </label>
        <p className="notice">
          Die Anwendung erhält nur die von dir ausgewählten Dateien. Keine PDF-Bytes, Screenshots
          oder extrahierten Volltexte verlassen dein Gerät.
        </p>
        <p aria-live="polite">{message}</p>
      </section>

      {pending.length > 0 && (
        <section className="panel">
          <h2>Bestätigung erforderlich</h2>
          {pending.map((item) => (
            <article className="source-row source-row--article" key={item.id}>
              <div>
                <h3>{item.file.name}</h3>
                <p>
                  Matching: {item.match.state} · Vertrauen: {item.match.confidence} ·{' '}
                  {item.match.reason}
                </p>
                <label>
                  Zu bindende Quelle
                  <select
                    value={item.selectedSourceId}
                    onChange={(event) =>
                      setPending((items) =>
                        items.map((candidate) =>
                          candidate.id === item.id
                            ? { ...candidate, selectedSourceId: event.target.value }
                            : candidate,
                        ),
                      )
                    }
                  >
                    {sources.map((source) => (
                      <option key={source.id} value={source.id}>
                        {sourceTitle(source.id)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <button type="button" onClick={() => void confirmPending(item)}>
                Zuordnung bestätigen
              </button>
            </article>
          ))}
        </section>
      )}

      <section className="panel">
        <h2>Aktuelle lokale Bindings</h2>
        <ul>
          {bindings.map((binding) => (
            <li key={binding.id}>
              {binding.actualFilename} · {formatBytes(binding.byteSize)} · {binding.matchingState}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function DocumentDetailPage() {
  const { documentId } = useParams();
  const [binding, setBinding] = useState<LocalDocumentBinding | undefined>();
  const [page, setPage] = useState(1);
  useEffect(() => {
    if (documentId) void getLocalDocument(documentId).then(setBinding);
  }, [documentId]);

  const source = binding ? sourceForBinding(binding) : undefined;
  const relevantRegions = useMemo(
    () => sourceTaskRegions.filter((region) => region.sourceId === binding?.sourceId).slice(0, 12),
    [binding?.sourceId],
  );

  if (!documentId || !binding)
    return (
      <section className="page-flow">
        <h1>Dokument nicht verbunden</h1>
        <p>Die PDF-Datei ist auf diesem Gerät nicht verbunden oder wurde entfernt.</p>
        <Link to="/dokumente/verbinden">Dokument erneut verbinden</Link>
      </section>
    );

  return (
    <div className="page-flow">
      <Link className="back-link" to="/dokumente">
        ← Dokumente
      </Link>
      <header className="page-header">
        <p className="eyebrow">Lokale PDF</p>
        <h1>{source?.title ? sourceTitle(source.id) : binding.actualFilename}</h1>
        <p>
          Datei bleibt lokal: {binding.actualFilename} · {formatBytes(binding.byteSize)} ·{' '}
          {binding.matchingState}
        </p>
      </header>
      <div className="button-row">
        <label>
          Seite öffnen
          <input
            min={1}
            type="number"
            value={page}
            onChange={(event) => setPage(Number(event.target.value))}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            void removeLocalDocument(binding.id).then(() => setBinding(undefined));
          }}
        >
          Lokale Bindung entfernen
        </button>
      </div>
      <Suspense fallback={<p>Lokaler PDF-Renderer wird geladen …</p>}>
        <LocalPdfRenderer binding={binding} label="Lokales Dokument" pageStart={page} />
      </Suspense>
      <section className="panel">
        <h2>Indizierte Regionen in diesem Dokument</h2>
        {relevantRegions.length === 0 ? (
          <p>Für dieses Dokument sind noch keine Aufgabenregionen zugeordnet.</p>
        ) : (
          <ul>
            {relevantRegions.map((region) => (
              <li key={region.regionId}>
                Aufgabe {region.taskNumber}, Seite {region.pageStart} ·{' '}
                {topicNames(region.topicIds).join(', ') || 'Themen offen'}
              </li>
            ))}
          </ul>
        )}
      </section>
      <details className="panel">
        <summary>Technische lokale Bindung</summary>
        <dl className="metadata-list">
          <div>
            <dt>Manifestquelle</dt>
            <dd>{binding.sourceId}</dd>
          </div>
          <div>
            <dt>SHA-256</dt>
            <dd>{binding.sha256 ?? 'im Browser nicht verfügbar'}</dd>
          </div>
          <div>
            <dt>Speicherbackend</dt>
            <dd>{binding.storageBackend}</dd>
          </div>
        </dl>
      </details>
    </div>
  );
}

export function DocumentIndexingPage() {
  const [regions, setRegions] = useState<SourceTaskRegion[]>([]);
  const [sourceId, setSourceId] = useState(sources[0]?.id ?? '');
  const [taskNumber, setTaskNumber] = useState(1);
  const [page, setPage] = useState(1);
  const [crop, setCrop] = useState({ x: 0.08, y: 0.12, width: 0.84, height: 0.55 });
  const [message, setMessage] = useState('');
  useEffect(() => void listLocalTaskRegions().then(setRegions), []);
  const source = sources.find((candidate) => candidate.id === sourceId);

  const save = async () => {
    const now = new Date().toISOString();
    const region: SourceTaskRegion = {
      id: `local-region-${sourceId}-aufgabe-${taskNumber}`,
      regionId: `local-region-${sourceId}-aufgabe-${taskNumber}`,
      sourceId,
      documentKind: source?.category === 'Übung' ? 'exercise_sheet' : 'past_exam',
      year: source?.year ?? null,
      sheetNumber: null,
      examId: null,
      taskNumber,
      subtask: null,
      pageStart: page,
      pageEnd: page,
      cropRegions: [{ page, ...crop, coordinateSystem: 'normalized_page' }],
      solutionSourceId: null,
      solutionPageStart: null,
      solutionPageEnd: null,
      topicIds: [],
      trainerIds: [],
      taskSlot: null,
      verificationStatus: 'local_user_indexed',
      updatedAt: now,
    };
    await saveLocalTaskRegion(region);
    setRegions(await listLocalTaskRegions());
    setMessage('Lokale Aufgabenregion gespeichert. Export enthält nur Metadaten.');
  };

  return (
    <div className="page-flow">
      <Link className="back-link" to="/dokumente">
        ← Dokumente
      </Link>
      <header className="page-header">
        <p className="eyebrow">Lokale Indexierung</p>
        <h1>Aufgabenregion indexieren</h1>
        <p>
          Markiere eine normalisierte Crop-Region. Gespeichert werden nur Koordinaten und
          Zuordnungen, niemals Screenshots oder PDF-Bytes.
        </p>
      </header>

      <section className="panel document-indexer">
        <div>
          <label>
            Verbundene oder erwartete Quelle
            <select value={sourceId} onChange={(event) => setSourceId(event.target.value)}>
              {sources.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {sourceTitle(candidate.id)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Aufgabe
            <input
              min={1}
              type="number"
              value={taskNumber}
              onChange={(event) => setTaskNumber(Number(event.target.value))}
            />
          </label>
          <label>
            Seite
            <input
              min={1}
              type="number"
              value={page}
              onChange={(event) => setPage(Number(event.target.value))}
            />
          </label>
          {(['x', 'y', 'width', 'height'] as const).map((field) => (
            <label key={field}>
              {field}
              <input
                max={1}
                min={0}
                step={0.01}
                type="number"
                value={crop[field]}
                onChange={(event) =>
                  setCrop((value) => ({ ...value, [field]: Number(event.target.value) }))
                }
              />
            </label>
          ))}
          <button type="button" onClick={() => void save()}>
            Region lokal speichern
          </button>
          <p aria-live="polite">{message}</p>
        </div>
        <div className="crop-preview" aria-label="Vorschau der normalisierten Crop-Region">
          <span
            className="pdf-crop-overlay"
            style={{
              left: `${crop.x * 100}%`,
              top: `${crop.y * 100}%`,
              width: `${crop.width * 100}%`,
              height: `${crop.height * 100}%`,
            }}
          />
        </div>
      </section>

      <section className="panel">
        <h2>Lokale Regionen</h2>
        <ul>
          {regions.map((region) => (
            <li key={region.id}>
              {sourceTitle(region.sourceId)} · Aufgabe {region.taskNumber} · Seite{' '}
              {region.pageStart}{' '}
              <button type="button" onClick={() => void removeLocalTaskRegion(region.id)}>
                entfernen
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function DocumentMappingsPage() {
  const [bindings, setBindings] = useState<LocalDocumentBinding[]>([]);
  const [regions, setRegions] = useState<SourceTaskRegion[]>([]);
  useEffect(() => void listLocalDocuments().then(setBindings), []);
  useEffect(() => void listLocalTaskRegions().then(setRegions), []);
  const documentExport = JSON.stringify(exportDocumentMappings(bindings), null, 2);
  const regionExport = JSON.stringify(exportTaskRegionMetadata(regions), null, 2);
  return (
    <div className="page-flow">
      <Link className="back-link" to="/dokumente">
        ← Dokumente
      </Link>
      <header className="page-header">
        <p className="eyebrow">Sicherer Export</p>
        <h1>Lokale Zuordnungen</h1>
        <p>
          Diese Exporte enthalten nur sichere Metadaten. PDF-Bytes, Screenshots, extrahierte
          Volltexte, Base64-Bilder und Browser-Dateihandles sind ausgeschlossen.
        </p>
      </header>
      <section className="panel">
        <h2>Dokumentbindungen</h2>
        <button type="button" onClick={() => void navigator.clipboard?.writeText(documentExport)}>
          Dokument-Mapping kopieren
        </button>
        <pre>{documentExport}</pre>
      </section>
      <section className="panel">
        <h2>Aufgabenregionen</h2>
        <button type="button" onClick={() => void navigator.clipboard?.writeText(regionExport)}>
          Regionen-Metadaten kopieren
        </button>
        <pre>{regionExport}</pre>
      </section>
    </div>
  );
}
