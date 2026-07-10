import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePreferences } from '../../app/providers/PreferencesProvider';
import { coreContent as content } from '../../content/loaders/core';
import { taskSlotLearningMap } from '../../content/loaders/study-content';
import { studySessionRepository } from '../../persistence/repositories';
import { StatusBadge } from '../../ui/components/StatusBadge';

export function DashboardPage() {
  const { selectedExamProfileId, setSelectedExamProfileId } = usePreferences();
  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const selectedProfile =
    content.profiles.find((profile) => profile.id === selectedExamProfileId) ?? content.profiles[0];
  const verifiedTopics = content.manifest.topicCount;
  const verifiedQuestions =
    (content.health.verificationStatusCounts.official_verified ?? 0) +
    (content.health.verificationStatusCounts.verified_against_official_source ?? 0);
  useEffect(() => {
    void studySessionRepository.list().then((sessions) => setSessionCount(sessions.length));
  }, []);
  if (!selectedProfile) return null;

  return (
    <div className="page-flow">
      <section className="hero hero--dashboard">
        <div>
          <p className="eyebrow">Lernsystem 1.0.0-rc.3</p>
          <h1>Dein ruhiger Ausgangspunkt für AlgoDat</h1>
          <p>
            Aufgaben 1–9, Themen, Klausurenbibliothek, Diagnose, Lernplan und alle elf Trainer sind
            miteinander verbunden. Die Screenreader-Freigabe bleibt bewusst offen.
          </p>
        </div>
        <label className="profile-select">
          <span>Gewähltes Klausurprofil</span>
          <select
            value={selectedProfile.id}
            onChange={(event) => setSelectedExamProfileId(event.target.value)}
          >
            {content.profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.title}
              </option>
            ))}
          </select>
          <small>Evidenz: {selectedProfile.confidence}</small>
        </label>
      </section>

      <section aria-labelledby="system-status">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Systembereitschaft</p>
            <h2 id="system-status">Was bereits belastbar ist</h2>
          </div>
          <StatusBadge tone="success">Phase 0A bestanden</StatusBadge>
        </div>
        <div className="metric-grid">
          <article>
            <strong>{verifiedTopics}</strong>
            <span>verifizierte Themen</span>
          </article>
          <article>
            <strong>{verifiedQuestions}</strong>
            <span>verifizierte Fragenbezüge</span>
          </article>
          <article>
            <strong>{content.health.visualReviewRequiredCount}</strong>
            <span>bewusst offene Sichtprüfungen</span>
          </article>
          <article>
            <strong>{content.health.brokenReferenceCount}</strong>
            <span>gebrochene Referenzen</span>
          </article>
        </div>
      </section>

      <div className="two-column">
        <section className="panel" aria-labelledby="mastery-status">
          <p className="eyebrow">Persönlicher Lernstand</p>
          <h2 id="mastery-status">Noch keine Lernaktivität vorhanden</h2>
          <p>
            {sessionCount === 0
              ? 'Es wurden noch keine lokalen Sitzungen gespeichert.'
              : sessionCount === null
                ? 'Lokaler Speicher wird geprüft …'
                : `${sessionCount} lokale Sitzungen vorhanden.`}
          </p>
          <p className="quiet">
            Inhaltsreife und persönliche Beherrschung sind zwei verschiedene Größen. Hier wird
            nichts geschätzt.
          </p>
        </section>
        <section className="panel panel--accent" aria-labelledby="next-action">
          <p className="eyebrow">Nächster sinnvoller Schritt</p>
          <h2 id="next-action">Aufgaben-Hubs öffnen</h2>
          <p>
            {taskSlotLearningMap.tasks.length} Hubs verbinden jetzt Profile, Themen, Trainer und
            alte Fragenmetadaten.
          </p>
          <Link className="button-link" to="/aufgaben">
            Aufgaben 1–9 öffnen
          </Link>
        </section>
      </div>

      <section className="panel">
        <h2>Schnellzugriff</h2>
        <div className="button-row">
          <Link className="button-link" to="/klausuren">
            Klausurenbibliothek
          </Link>
          <Link className="button-link" to="/diagnose">
            Kompetenzcheck starten
          </Link>
          <Link className="button-link" to="/trainer">
            Trainer
          </Link>
          <Link className="button-link" to="/lernplan">
            Lernplan
          </Link>
        </div>
      </section>

      <p className="quiet">
        Quellenbelege und Qualitätsstatus sind im <Link to="/quellen">Quellenbrowser</Link>{' '}
        nachvollziehbar.
      </p>
    </div>
  );
}
