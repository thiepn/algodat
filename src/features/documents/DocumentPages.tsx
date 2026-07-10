import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { sources } from '../../content/loaders/sources';
import type { LocalDocumentBinding } from '../../persistence/database/schema';
import {
  connectLocalPdf,
  exportDocumentMappings,
  getLocalDocument,
  listLocalDocuments,
  removeLocalDocument,
  storageUsage,
} from './local-document-service';

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function sourceForBinding(binding: LocalDocumentBinding) {
  return sources.find((source) => source.id === binding.sourceId);
}

export function DocumentIndexPage() {
  const [bindings, setBindings] = useState<LocalDocumentBinding[]>([]);
  useEffect(() => void listLocalDocuments().then(setBindings), []);
  const connectedSourceIds = new Set(bindings.map((binding) => binding.sourceId));
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
          <strong>{sources.length}</strong>
          <span>Quellenkarten im Manifest</span>
        </article>
      </section>

      <div className="button-row">
        <Link className="button-link" to="/dokumente/verbinden">
          Lokale PDFs verbinden
        </Link>
        <button
          type="button"
          onClick={() => {
            const payload = JSON.stringify(exportDocumentMappings(bindings), null, 2);
            void navigator.clipboard?.writeText(payload);
          }}
        >
          Mapping ohne PDF-Bytes kopieren
        </button>
      </div>

      <section className="panel">
        <h2>Verbundene Dokumente</h2>
        {bindings.length === 0 ? (
          <p>
            Noch keine lokale PDF verbunden. Wähle eine Datei aus deinem privaten `pdfs`-Ordner aus.
          </p>
        ) : (
          <div className="source-list">
            {bindings.map((binding) => {
              const source = sourceForBinding(binding);
              return (
                <article className="source-row source-row--article" key={binding.id}>
                  <div>
                    <p className="eyebrow">{source?.category ?? 'Quelle'}</p>
                    <h2>{source?.title ?? binding.displayName}</h2>
                    <p>
                      {binding.fileName} · {formatBytes(binding.sizeBytes)} · verbunden am{' '}
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
          {sources.slice(0, 80).map((source) => (
            <article className="source-row source-row--article" key={source.id}>
              <div>
                <h3>{source.title}</h3>
                <p>
                  {source.category} · {source.year ?? 'Jahr unbekannt'} ·{' '}
                  {connectedSourceIds.has(source.id) ? 'PDF verbunden' : 'Datei nicht verbunden'}
                </p>
              </div>
              {connectedSourceIds.has(source.id) ? (
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

export function DocumentConnectPage() {
  const [bindings, setBindings] = useState<LocalDocumentBinding[]>([]);
  const [message, setMessage] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState(sources[0]?.id ?? '');
  useEffect(() => void listLocalDocuments().then(setBindings), []);
  const source = sources.find((candidate) => candidate.id === selectedSourceId);
  const connect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedSourceId) return;
    const connected: LocalDocumentBinding[] = [];
    for (const file of Array.from(files)) {
      const guessedSource =
        sources.find(
          (candidate) =>
            candidate.displayName.toLocaleLowerCase('de') === file.name.toLocaleLowerCase('de') ||
            candidate.title.toLocaleLowerCase('de') === file.name.toLocaleLowerCase('de'),
        ) ?? source;
      if (!guessedSource) continue;
      connected.push(await connectLocalPdf(guessedSource.id, file));
    }
    setBindings(await listLocalDocuments());
    setMessage(
      `${connected.length} lokale PDF-Datei(en) verbunden. Keine Datei wurde hochgeladen.`,
    );
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
          Wähle eine oder mehrere PDF-Dateien aus. Wenn der Dateiname zu einer Manifestquelle passt,
          wird diese automatisch verbunden; sonst nutzt die App die ausgewählte Quelle.
        </p>
      </header>
      <section className="panel">
        <h2>Dateien auswählen</h2>
        <label>
          Quelle für nicht automatisch erkannte Dateien
          <select
            value={selectedSourceId}
            onChange={(event) => setSelectedSourceId(event.target.value)}
          >
            {sources.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {candidate.title}
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
            onChange={(event) => void connect(event.target.files)}
          />
        </label>
        <p className="notice">
          Browser mit Verzeichnis-Auswahl können den lokalen `pdfs`-Ordner im Dateidialog markieren.
          Die Anwendung erhält nur die von dir ausgewählten Dateien.
        </p>
        <p aria-live="polite">{message}</p>
      </section>
      <section className="panel">
        <h2>Aktuelle lokale Bindings</h2>
        <ul>
          {bindings.map((binding) => (
            <li key={binding.id}>
              {binding.displayName} · {formatBytes(binding.sizeBytes)}
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
  const objectUrl = useMemo(() => {
    if (!binding) return undefined;
    return URL.createObjectURL(new Blob([binding.bytes], { type: binding.mimeType }));
  }, [binding]);
  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl],
  );
  if (!documentId || !binding)
    return (
      <section className="page-flow">
        <h1>Dokument nicht verbunden</h1>
        <p>Die PDF-Datei ist auf diesem Gerät nicht verbunden oder wurde entfernt.</p>
        <Link to="/dokumente/verbinden">PDF erneut verbinden</Link>
      </section>
    );
  const source = sourceForBinding(binding);
  return (
    <div className="page-flow">
      <Link className="back-link" to="/dokumente">
        ← Dokumente
      </Link>
      <header className="page-header">
        <p className="eyebrow">Lokale PDF</p>
        <h1>{source?.title ?? binding.displayName}</h1>
        <p>
          Datei bleibt lokal: {binding.fileName} · {formatBytes(binding.sizeBytes)}. Der Viewer
          nutzt die native PDF-Anzeige des Browsers.
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
        <a
          className="button-link"
          href={`${objectUrl ?? ''}#page=${page}`}
          target="_blank"
          rel="noreferrer"
        >
          Seite {page} in PDF öffnen
        </a>
        <button
          type="button"
          onClick={() => {
            void removeLocalDocument(binding.id).then(() => setBinding(undefined));
          }}
        >
          Lokale Bindung entfernen
        </button>
      </div>
      {objectUrl && (
        <iframe
          className="pdf-viewer"
          title={`Lokale PDF ${binding.displayName}`}
          src={`${objectUrl}#page=${page}`}
        />
      )}
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
        </dl>
      </details>
    </div>
  );
}
