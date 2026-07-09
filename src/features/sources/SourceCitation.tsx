import type { SourceCitationFixture, SourceDocument } from '../../content/schemas';
import { StatusBadge } from '../../ui/components/StatusBadge';

interface SourceCitationProps {
  citation: SourceCitationFixture;
  source: SourceDocument;
}

const statusLabels: Record<string, string> = {
  official_verified: 'offiziell verifiziert',
  verified_against_official_source: 'gegen offizielle Quelle geprüft',
  official_solution_available: 'offizielle Lösung vorhanden',
  unofficial_solution_only: 'nur inoffizielle Lösung',
  generated_unverified: 'generiert, ungeprüft',
  conflict_detected: 'Konflikt erkannt',
  extraction_uncertain: 'Extraktion unsicher',
  visual_review_required: 'Sichtprüfung erforderlich',
};

export function SourceCitation({ citation, source }: SourceCitationProps) {
  return (
    <details className="source-citation">
      <summary>
        <span>
          <strong>{citation.title}</strong>, {citation.pageLabel}
        </span>
        <StatusBadge tone={citation.conflictWarning ? 'warning' : 'success'}>
          {statusLabels[citation.verificationStatus]}
        </StatusBadge>
      </summary>
      <div className="source-citation__panel">
        <dl className="metadata-list">
          <div>
            <dt>Quelle</dt>
            <dd>{source.displayName}</dd>
          </div>
          <div>
            <dt>Autorität</dt>
            <dd>
              {citation.authorityLabel} (Stufe {source.authorityLevel})
            </dd>
          </div>
          <div>
            <dt>Evidenztyp</dt>
            <dd>{citation.evidenceType}</dd>
          </div>
          <div>
            <dt>Geprüft</dt>
            <dd>{new Date(citation.lastReviewed).toLocaleDateString('de-DE')}</dd>
          </div>
        </dl>
        {citation.conflictWarning && (
          <p className="notice notice--warning">{citation.conflictWarning}</p>
        )}
        <p className="quiet">
          Die lokale Quelldatei wird in der Anwendung weder verlinkt noch ausgeliefert.
        </p>
      </div>
    </details>
  );
}
