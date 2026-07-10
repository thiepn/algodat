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
import {
  cropPrecisionForRegion,
  cropPrecisionLabel,
  documentKindForSource,
  searchSourceLibrary,
  sourceCoverageSummary,
  sourceTaskRegions,
  sourceTitle,
  topicNames,
  type CoverageState,
  type CropPrecision,
} from './source-task-index';

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

function coverageStateLabel(state: CoverageState) {
  switch (state) {
    case 'fully_indexed':
      return 'vollständig indexiert';
    case 'pages_mapped_crop_pending':
      return 'Seiten zugeordnet, Crop offen';
    case 'tasks_partially_indexed':
      return 'Aufgaben teilweise indexiert';
    case 'solution_mapping_missing':
      return 'Lösungszuordnung fehlt';
    case 'document_unmatched':
      return 'Dokument nicht abgeglichen';
    case 'source_metadata_only':
      return 'nur Quellenmetadaten';
  }
}

function precisionClassName(precision: CropPrecision) {
  return precision === 'full_page_fallback' || precision === 'unmapped'
    ? 'status-badge status-badge--warning'
    : 'status-badge status-badge--success';
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
        <Link className="button-link" to="/dokumente/indexierung/qualitaet">
          Crop-Qualität prüfen
        </Link>
        <Link className="button-link" to="/dokumente/abdeckung">
          Quellenabdeckung öffnen
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

interface MatchResultRow {
  id: string;
  filename: string;
  matchedSourceId: string;
  confidence: string;
  documentType: string;
  pageCount: number | null;
  bindingStatus: string;
  actionRequired: string;
}

export function DocumentConnectPage() {
  const [searchParams] = useSearchParams();
  const initialSource = searchParams.get('source') ?? sources[0]?.id ?? '';
  const [bindings, setBindings] = useState<LocalDocumentBinding[]>([]);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [results, setResults] = useState<MatchResultRow[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState(initialSource);
  useEffect(() => void listLocalDocuments().then(setBindings), []);

  const inspectFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const nextPending: PendingFile[] = [];
    const nextResults: MatchResultRow[] = [];
    let autoConnected = 0;
    for (const file of Array.from(files)) {
      const match = await matchLocalPdf(file);
      const sourceId = match.sourceId ?? selectedSourceId;
      const matchedSource = sources.find((source) => source.id === sourceId);
      if (
        sourceId &&
        (match.state === 'exact_hash_match' || match.state === 'filename_match') &&
        match.sourceId
      ) {
        await connectLocalPdf(sourceId, file, match.state);
        autoConnected += 1;
        nextResults.push({
          id: `${file.name}-${file.size}-${file.lastModified}-auto`,
          filename: file.name,
          matchedSourceId: sourceId,
          confidence: match.confidence,
          documentType: matchedSource?.category ?? 'unbekannt',
          pageCount: matchedSource?.pageCount ?? null,
          bindingStatus: 'automatisch verbunden',
          actionRequired: 'Keine Aktion erforderlich.',
        });
      } else {
        nextPending.push({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          file,
          match,
          selectedSourceId: sourceId,
        });
        nextResults.push({
          id: `${file.name}-${file.size}-${file.lastModified}-pending`,
          filename: file.name,
          matchedSourceId: sourceId,
          confidence: match.confidence,
          documentType: matchedSource?.category ?? 'manuelle Zuordnung',
          pageCount: matchedSource?.pageCount ?? null,
          bindingStatus: 'wartet auf Bestätigung',
          actionRequired: match.reason,
        });
      }
    }
    setPending(nextPending);
    setResults(nextResults);
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

      {results.length > 0 && (
        <section className="panel">
          <h2>Matching-Ergebnisse</h2>
          <div className="task-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Datei</th>
                  <th>Quelle</th>
                  <th>Vertrauen</th>
                  <th>Dokumenttyp</th>
                  <th>Seiten</th>
                  <th>Binding-Status</th>
                  <th>Erforderliche Aktion</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row) => (
                  <tr key={row.id}>
                    <td>{row.filename}</td>
                    <td>{sourceTitle(row.matchedSourceId)}</td>
                    <td>{row.confidence}</td>
                    <td>{row.documentType}</td>
                    <td>{row.pageCount ?? 'unbekannt'}</td>
                    <td>{row.bindingStatus}</td>
                    <td>{row.actionRequired}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

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
  const [subtask, setSubtask] = useState('gesamt');
  const [page, setPage] = useState(1);
  const [solutionSourceId, setSolutionSourceId] = useState('');
  const [solutionPage, setSolutionPage] = useState(1);
  const [crop, setCrop] = useState({ x: 0.08, y: 0.12, width: 0.84, height: 0.55 });
  const [undoStack, setUndoStack] = useState<Array<typeof crop>>([]);
  const [redoStack, setRedoStack] = useState<Array<typeof crop>>([]);
  const [message, setMessage] = useState('');
  useEffect(() => void listLocalTaskRegions().then(setRegions), []);
  const source = sources.find((candidate) => candidate.id === sourceId);
  const staticRegionsForSource = useMemo(
    () => sourceTaskRegions.filter((region) => region.sourceId === sourceId),
    [sourceId],
  );
  const localRegionsForSource = useMemo(
    () => regions.filter((region) => region.sourceId === sourceId),
    [regions, sourceId],
  );
  const currentStaticRegion = staticRegionsForSource.find(
    (region) => region.taskNumber === taskNumber,
  );
  const validationWarnings = [
    page < 1 ? 'Die Seite muss mindestens 1 sein.' : '',
    crop.width <= 0 || crop.height <= 0 ? 'Der Crop darf keine Nullfläche haben.' : '',
    crop.x < 0 || crop.y < 0 || crop.x + crop.width > 1 || crop.y + crop.height > 1
      ? 'Der Crop liegt außerhalb der normalisierten Seite.'
      : '',
    !currentStaticRegion?.topicIds.length
      ? 'Für diese Aufgabe fehlt noch eine Themenzuordnung.'
      : '',
    !currentStaticRegion?.trainerIds.length
      ? 'Für diese Aufgabe fehlt noch eine direkte Lernaktion.'
      : '',
  ].filter(Boolean);

  const setCropWithHistory = (nextCrop: typeof crop) => {
    setUndoStack((stack) => [...stack.slice(-19), crop]);
    setRedoStack([]);
    setCrop(nextCrop);
  };

  const selectRegion = (region: SourceTaskRegion) => {
    const firstCrop = region.cropRegions[0];
    setTaskNumber(region.taskNumber);
    setSubtask(region.subtask ?? 'gesamt');
    setPage(region.pageStart);
    if (firstCrop) {
      setCrop({ x: firstCrop.x, y: firstCrop.y, width: firstCrop.width, height: firstCrop.height });
    }
    setSolutionSourceId(region.solutionSourceId ?? '');
    setSolutionPage(region.solutionPageStart ?? region.pageStart);
    setMessage(`Aufgabe ${region.taskNumber} geladen.`);
  };

  const adjustCrop = (delta: Partial<typeof crop>) => {
    setCropWithHistory({
      x: Math.min(1, Math.max(0, crop.x + (delta.x ?? 0))),
      y: Math.min(1, Math.max(0, crop.y + (delta.y ?? 0))),
      width: Math.min(1, Math.max(0.01, crop.width + (delta.width ?? 0))),
      height: Math.min(1, Math.max(0.01, crop.height + (delta.height ?? 0))),
    });
  };

  const undo = () => {
    const previous = undoStack.at(-1);
    if (!previous) return;
    setRedoStack((stack) => [...stack, crop]);
    setUndoStack((stack) => stack.slice(0, -1));
    setCrop(previous);
  };

  const redo = () => {
    const next = redoStack.at(-1);
    if (!next) return;
    setUndoStack((stack) => [...stack, crop]);
    setRedoStack((stack) => stack.slice(0, -1));
    setCrop(next);
  };

  const save = async () => {
    if (
      validationWarnings.some(
        (warning) => warning.includes('außerhalb') || warning.includes('Nullfläche'),
      )
    ) {
      setMessage('Speichern gestoppt: Bitte zuerst die Crop-Warnungen korrigieren.');
      return;
    }
    const now = new Date().toISOString();
    const region: SourceTaskRegion = {
      id: `local-region-${sourceId}-aufgabe-${taskNumber}`,
      regionId: `local-region-${sourceId}-aufgabe-${taskNumber}`,
      sourceId,
      documentKind: source ? documentKindForSource(source) : 'lecture_reference',
      year: source?.year ?? null,
      sheetNumber: null,
      examId: null,
      taskNumber,
      subtask: subtask.trim() && subtask.trim() !== 'gesamt' ? subtask.trim() : null,
      pageStart: page,
      pageEnd: page,
      cropRegions: [{ page, ...crop, coordinateSystem: 'normalized_page' }],
      solutionSourceId: solutionSourceId || null,
      solutionPageStart: solutionSourceId ? solutionPage : null,
      solutionPageEnd: solutionSourceId ? solutionPage : null,
      topicIds: currentStaticRegion?.topicIds ?? [],
      trainerIds: currentStaticRegion?.trainerIds ?? [],
      taskSlot: currentStaticRegion?.taskSlot ?? null,
      verificationStatus: 'local_user_indexed',
      updatedAt: now,
    };
    await saveLocalTaskRegion(region);
    setRegions(await listLocalTaskRegions());
    setMessage('Lokale Aufgabenregion gespeichert. Export enthält nur Metadaten.');
  };

  const saveAndNext = async () => {
    await save();
    setTaskNumber((value) => value + 1);
    setMessage('Gespeichert; nächste Aufgabe ist vorbereitet.');
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
            <select
              value={sourceId}
              onChange={(event) => {
                setSourceId(event.target.value);
                setTaskNumber(1);
              }}
            >
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
          <label>
            Teilaufgaben in dieser Region
            <input value={subtask} onChange={(event) => setSubtask(event.target.value)} />
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
          <label>
            Lösungsquelle
            <select
              value={solutionSourceId}
              onChange={(event) => setSolutionSourceId(event.target.value)}
            >
              <option value="">Keine Lösungsquelle verknüpft</option>
              {sources.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {sourceTitle(candidate.id)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Lösungsseite
            <input
              min={1}
              type="number"
              value={solutionPage}
              onChange={(event) => setSolutionPage(Number(event.target.value))}
            />
          </label>
          <div className="button-row">
            <button
              type="button"
              onClick={() => {
                const previous =
                  localRegionsForSource
                    .filter((region) => region.taskNumber < taskNumber)
                    .sort((left, right) => right.taskNumber - left.taskNumber)[0] ??
                  staticRegionsForSource
                    .filter((region) => region.taskNumber < taskNumber)
                    .sort((left, right) => right.taskNumber - left.taskNumber)[0];
                if (previous?.cropRegions[0]) {
                  const previousCrop = previous.cropRegions[0];
                  setCropWithHistory({
                    x: previousCrop.x,
                    y: previousCrop.y,
                    width: previousCrop.width,
                    height: previousCrop.height,
                  });
                  setMessage('Crop von benachbarter Aufgabe kopiert.');
                }
              }}
            >
              Crop von vorheriger Aufgabe kopieren
            </button>
            <button type="button" disabled={undoStack.length === 0} onClick={undo}>
              Rückgängig
            </button>
            <button type="button" disabled={redoStack.length === 0} onClick={redo}>
              Wiederholen
            </button>
          </div>
          <div className="button-row">
            <button type="button" onClick={() => void save()}>
              Region lokal speichern
            </button>
            <button type="button" onClick={() => void saveAndNext()}>
              Speichern und nächste Aufgabe
            </button>
          </div>
          <p aria-live="polite">{message}</p>
        </div>
        <div>
          <div className="button-row">
            <button type="button" onClick={() => setTaskNumber((value) => Math.max(1, value - 1))}>
              Vorherige Aufgabe
            </button>
            <button type="button" onClick={() => setTaskNumber((value) => value + 1)}>
              Nächste Aufgabe
            </button>
          </div>
          <div className="document-indexer__preview-grid">
            <div
              className="crop-preview"
              aria-label="Vorschau der normalisierten Aufgaben-Crop-Region"
              role="application"
              tabIndex={0}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 0.05 : 0.01;
                if (event.key === 'ArrowLeft') adjustCrop({ x: -step });
                if (event.key === 'ArrowRight') adjustCrop({ x: step });
                if (event.key === 'ArrowUp') adjustCrop({ y: -step });
                if (event.key === 'ArrowDown') adjustCrop({ y: step });
              }}
            >
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
            <div className="crop-preview" aria-label="Vorschau der Lösungsregion">
              <span
                className="pdf-crop-overlay pdf-crop-overlay--solution"
                style={{ left: '8%', top: '12%', width: '84%', height: '55%' }}
              />
            </div>
          </div>
          <p className="notice">
            Tastatur: Fokus auf die Aufgabenvorschau setzen, dann Pfeiltasten zum Verschieben
            nutzen; Umschalt + Pfeiltaste bewegt in größeren Schritten.
          </p>
          <h2>Validierungswarnungen</h2>
          {validationWarnings.length === 0 ? (
            <p className="notice">Keine blockierenden Warnungen für diese Eingabe.</p>
          ) : (
            <ul>
              {validationWarnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="panel">
        <h2>Dokument-Aufgabenliste und Fortschritt</h2>
        <p>
          {localRegionsForSource.length} lokale Regionen · {staticRegionsForSource.length} statische
          Seitenzuordnungen · aktuelle Aufgabe {taskNumber}
        </p>
        <div className="source-list">
          {staticRegionsForSource.slice(0, 20).map((region) => (
            <article className="source-row source-row--article" key={region.regionId}>
              <div>
                <h3>Aufgabe {region.taskNumber}</h3>
                <p>
                  Seite {region.pageStart} · {cropPrecisionLabel(cropPrecisionForRegion(region))} ·{' '}
                  {topicNames(region.topicIds).join(', ') || 'Themen offen'}
                </p>
              </div>
              <button type="button" onClick={() => selectRegion(region)}>
                In Werkbank laden
              </button>
            </article>
          ))}
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

export function DocumentCropQualityPage() {
  const rows = sourceTaskRegions.map((region) => ({
    region,
    precision: cropPrecisionForRegion(region),
  }));
  const fullPageRows = rows.filter((row) => row.precision === 'full_page_fallback');
  return (
    <div className="page-flow">
      <Link className="back-link" to="/dokumente">
        ← Dokumente
      </Link>
      <header className="page-header">
        <p className="eyebrow">Regionenqualität</p>
        <h1>Crop-Qualität prüfen</h1>
        <p>
          Diese Seite trennt exakte lokale Crops strikt von Vollseiten-Fallbacks. Vollseiten werden
          nicht als präzise Aufgabenregionen ausgegeben.
        </p>
      </header>
      <section className="metric-grid">
        <article>
          <strong>{sourceTaskRegions.length}</strong>
          <span>statische Aufgabenregionen</span>
        </article>
        <article>
          <strong>{fullPageRows.length}</strong>
          <span>Vollseiten-Fallbacks</span>
        </article>
        <article>
          <strong>{sourceCoverageSummary.validationIssues.error}</strong>
          <span>blockierende Validierungsfehler</span>
        </article>
      </section>
      <section className="panel">
        <h2>Qualitätsklassen</h2>
        <div className="task-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Region</th>
                <th>Quelle</th>
                <th>Aufgabe</th>
                <th>Crop-Präzision</th>
                <th>Lösungsstatus</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 120).map(({ region, precision }) => (
                <tr key={region.regionId}>
                  <td>{region.regionId}</td>
                  <td>{sourceTitle(region.sourceId)}</td>
                  <td>{region.taskNumber}</td>
                  <td>
                    <span className={precisionClassName(precision)}>
                      {cropPrecisionLabel(precision)}
                    </span>
                  </td>
                  <td>
                    {region.solutionSourceId
                      ? `Lösung: ${sourceTitle(region.solutionSourceId)}`
                      : 'Lösungsquelle fehlt'}
                  </td>
                  <td>
                    <Link className="button-link" to="/dokumente/indexierung">
                      lokal präzisieren
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function DocumentCoveragePage() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchSourceLibrary(query), [query]);
  return (
    <div className="page-flow">
      <Link className="back-link" to="/dokumente">
        ← Dokumente
      </Link>
      <header className="page-header">
        <p className="eyebrow">Quellenabdeckung</p>
        <h1>Lokale Quellenbibliothek durchsuchen</h1>
        <p>
          Suche nur in sicheren Metadaten: Blatt, Klausurjahr, Aufgabennummer, Teilaufgabe, Thema,
          Trainer, Modul und Dateiname. PDF-Inhalte und lokale Pfade werden nicht indexiert.
        </p>
      </header>
      <section className="metric-grid">
        <article>
          <strong>{sourceCoverageSummary.totalSources}</strong>
          <span>inventarisierte Quellen</span>
        </article>
        <article>
          <strong>{sourceCoverageSummary.indexedExerciseTasks}</strong>
          <span>Übungsaufgaben mit Seitenbezug</span>
        </article>
        <article>
          <strong>{sourceCoverageSummary.indexedExamTasks}</strong>
          <span>Klausuraufgaben mit Seitenbezug</span>
        </article>
      </section>
      <section className="panel">
        <label>
          Metadaten-Suche
          <input
            placeholder="z. B. 2023, Aufgabe 4, Dijkstra, Blatt 2"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      </section>
      <section className="panel">
        <h2>Abdeckungsstatus</h2>
        <div className="task-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Quelle</th>
                <th>Typ</th>
                <th>Jahr/Blatt</th>
                <th>Aufgaben</th>
                <th>Status</th>
                <th>Crop</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.sourceId}>
                  <td>
                    {result.label}
                    <br />
                    <small>{result.filename}</small>
                  </td>
                  <td>{result.documentKind}</td>
                  <td>
                    {result.year ?? 'Jahr offen'}
                    {result.sheetNumber !== null ? ` · Blatt ${result.sheetNumber}` : ''}
                  </td>
                  <td>
                    {result.taskNumbers.length ? result.taskNumbers.join(', ') : 'nicht indexiert'}
                  </td>
                  <td>{coverageStateLabel(result.coverageState)}</td>
                  <td>
                    <span className={precisionClassName(result.cropPrecision)}>
                      {cropPrecisionLabel(result.cropPrecision)}
                    </span>
                  </td>
                  <td>
                    <Link
                      className="button-link"
                      to={`/dokumente/verbinden?source=${result.sourceId}`}
                    >
                      lokal verbinden
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="panel">
        <h2>Coverage-State-Zählung</h2>
        <ul>
          {Object.entries(sourceCoverageSummary.coverageStates).map(([state, count]) => (
            <li key={state}>
              {coverageStateLabel(state as CoverageState)}: {count}
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
