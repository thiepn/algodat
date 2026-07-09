import { coreContent as content } from '../../content/loaders/core';
import { StatusBadge } from '../../ui/components/StatusBadge';

export function DiagnosticsPage() {
  const entries = Object.entries(content.health.verificationStatusCounts).sort(
    (a, b) => b[1] - a[1],
  );
  return (
    <div className="page-flow">
      <header className="page-header">
        <p className="eyebrow">Content Health</p>
        <h1>Diagnostik</h1>
        <p>Qualitätsprobleme werden sichtbar gemacht, nicht glattgebügelt.</p>
      </header>
      <div className="diagnostic-grid">
        <section className="panel">
          <div className="section-heading">
            <h2>Build</h2>
            <StatusBadge tone={content.health.brokenReferenceCount === 0 ? 'success' : 'warning'}>
              {content.health.brokenReferenceCount} gebrochene Referenzen
            </StatusBadge>
          </div>
          <dl className="metadata-list">
            <div>
              <dt>Content-Version</dt>
              <dd>{content.manifest.contentVersion}</dd>
            </div>
            <div>
              <dt>Schema-Version</dt>
              <dd>{content.manifest.schemaVersion}</dd>
            </div>
            <div>
              <dt>Build-Datum</dt>
              <dd>{new Date(content.manifest.builtAt).toLocaleString('de-DE')}</dd>
            </div>
            <div>
              <dt>PWA-Version</dt>
              <dd>{content.health.pwaVersion}</dd>
            </div>
            <div>
              <dt>IndexedDB</dt>
              <dd>Version {content.health.indexedDbSchemaVersion}</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <h2>Umfang</h2>
          <dl className="metadata-list">
            <div>
              <dt>Quellen</dt>
              <dd>{content.manifest.sourceCount}</dd>
            </div>
            <div>
              <dt>Themen</dt>
              <dd>{content.manifest.topicCount}</dd>
            </div>
            <div>
              <dt>Prüfungsprofile</dt>
              <dd>{content.manifest.examProfileCount}</dd>
            </div>
            <div>
              <dt>Zitier-Fixpunkte</dt>
              <dd>{content.manifest.fixtureCount}</dd>
            </div>
            <div>
              <dt>Konflikte</dt>
              <dd>{content.health.unresolvedConflictCount}</dd>
            </div>
          </dl>
        </section>
        <section className="panel">
          <h2>Verifikationsstatus</h2>
          <ul className="status-counts">
            {entries.map(([status, count]) => (
              <li key={status}>
                <span>{status}</span>
                <strong>{count}</strong>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <h2>Gates</h2>
          <ul className="gate-list">
            <li>
              <StatusBadge tone="success">bestanden</StatusBadge> Phase 0
            </li>
            <li>
              <StatusBadge tone="success">bestanden</StatusBadge> Phase 0A
            </li>
            <li>
              <StatusBadge tone={content.health.duplicateSafeExamFrequency ? 'success' : 'warning'}>
                {content.health.duplicateSafeExamFrequency ? 'aktiv' : 'fehlt'}
              </StatusBadge>{' '}
              duplikatsichere Häufigkeit
            </li>
            <li>
              <StatusBadge tone={content.health.visualReviewRequiredCount ? 'warning' : 'success'}>
                {content.health.visualReviewRequiredCount}
              </StatusBadge>{' '}
              bewusst offene Bilddatensätze
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
