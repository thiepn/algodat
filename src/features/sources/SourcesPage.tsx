import { useState } from 'react';
import { sources } from '../../content/loaders/sources';
import { StatusBadge } from '../../ui/components/StatusBadge';

export function SourcesPage() {
  const [search, setSearch] = useState('');
  const [authority, setAuthority] = useState('alle');
  const [category, setCategory] = useState('alle');
  const [year, setYear] = useState('alle');
  const [status, setStatus] = useState('alle');
  const categories = [...new Set(sources.map((source) => source.category))].sort();
  const years = [
    ...new Set(
      sources.map((source) => source.year).filter((value): value is number => value !== null),
    ),
  ].sort();
  const filtered = sources.filter(
    (source) =>
      source.displayName.toLocaleLowerCase('de').includes(search.toLocaleLowerCase('de')) &&
      (authority === 'alle' || String(source.authorityLevel) === authority) &&
      (category === 'alle' || source.category === category) &&
      (year === 'alle' || String(source.year) === year) &&
      (status === 'alle' || source.verificationStatus === status),
  );
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Nur Metadaten</p>
        <h1>Quellenbrowser</h1>
        <p>Lokale Dateien werden nicht geöffnet, verlinkt oder in das PWA-Paket kopiert.</p>
      </header>
      <section className="filters" aria-label="Quellen filtern">
        <label>
          Dateiname
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Quelle suchen"
          />
        </label>
        <label>
          Autorität
          <select value={authority} onChange={(e) => setAuthority(e.target.value)}>
            <option value="alle">Alle</option>
            <option value="1">Stufe 1</option>
            <option value="2">Stufe 2</option>
            <option value="3">Stufe 3</option>
            <option value="4">Stufe 4</option>
          </select>
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
          Jahr
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="alle">Alle</option>
            {years.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="alle">Alle</option>
            <option value="official_verified">offiziell verifiziert</option>
            <option value="visual_review_required">Sichtprüfung offen</option>
            <option value="generated_unverified">generiert, ungeprüft</option>
          </select>
        </label>
      </section>
      <p className="result-count" aria-live="polite">
        {filtered.length} Quellen
      </p>
      <div className="source-list">
        {filtered.map((source) => (
          <details className="source-row" key={source.id}>
            <summary>
              <span>
                <strong>{source.displayName}</strong>
                <small>
                  {source.category} · {source.year ?? 'Jahr unbekannt'} · {source.pageCount ?? '–'}{' '}
                  Seiten
                </small>
              </span>
              <StatusBadge tone={source.authorityLevel === 1 ? 'success' : 'neutral'}>
                Stufe {source.authorityLevel}
              </StatusBadge>
            </summary>
            <dl className="metadata-list">
              <div>
                <dt>Evidenztyp</dt>
                <dd>{source.evidenceType}</dd>
              </div>
              <div>
                <dt>Extraktion</dt>
                <dd>
                  {source.extractionSucceeded === null
                    ? 'nicht anwendbar'
                    : source.extractionSucceeded
                      ? 'erfolgreich'
                      : 'nicht erfolgreich'}
                </dd>
              </div>
              <div>
                <dt>Sichtprüfung</dt>
                <dd>
                  {source.visualReviewRequired
                    ? 'erforderlich oder dokumentiert'
                    : 'nicht erforderlich'}
                </dd>
              </div>
              <div>
                <dt>Duplikatgruppe</dt>
                <dd>{source.duplicateGroupId ?? 'keine'}</dd>
              </div>
              <div>
                <dt>Kanonische Quelle</dt>
                <dd>{source.canonicalDocumentId}</dd>
              </div>
            </dl>
          </details>
        ))}
      </div>
    </div>
  );
}
