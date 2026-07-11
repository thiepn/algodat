import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { UpdatePrompt } from '../../ui/feedback/UpdatePrompt';

const navigationGroups = [
  {
    label: 'Lernen',
    items: [
      ['/lernen', 'Lernen'],
      ['/aufgaben', 'Aufgaben 1–9'],
      ['/themen', 'Themen'],
      ['/trainer', 'Trainer'],
    ],
  },
  {
    label: 'Üben',
    items: [
      ['/uebungen', 'Übungen'],
      ['/klausuren', 'Altklausuren'],
      ['/simulator', 'Aktuelle Probeklausur'],
    ],
  },
  {
    label: 'Planen',
    items: [
      ['/diagnose', 'Diagnose'],
      ['/lernplan', 'Lernplan'],
      ['/spickzettel', 'Spickzettel'],
    ],
  },
  {
    label: 'Quellen',
    items: [['/quellen', 'Quellen']],
  },
] as const;

export function AppLayout() {
  const location = useLocation();
  const initialRouteHandled = useRef(false);
  const [showRemovalNotice, setShowRemovalNotice] = useState(
    () => window.localStorage.getItem('algodat-local-source-removal-notice-v13') !== 'seen',
  );

  useEffect(() => {
    if (!initialRouteHandled.current) {
      initialRouteHandled.current = true;
      return;
    }

    const routeSegments = location.pathname.split('/').filter(Boolean);
    if (routeSegments.length > 1) return;

    const frame = window.requestAnimationFrame(() => {
      const main = document.getElementById('hauptinhalt');
      const activeElement = document.activeElement;
      const routeAlreadyFocusedContent =
        activeElement instanceof HTMLElement &&
        main?.contains(activeElement) === true &&
        activeElement !== main;

      if (!routeAlreadyFocusedContent) {
        main?.focus({ preventScroll: true });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="AlgoDat Study System – Startseite">
          <span className="brand__mark" aria-hidden="true">
            A
          </span>
          <span>
            <strong>AlgoDat</strong>
            <small>Study System</small>
          </span>
        </NavLink>
        <span className="topbar__phase">1.0.0-rc.8 · 11 Trainer · Screenreader-Gate offen</span>
      </header>
      <nav className="primary-nav" aria-label="Hauptnavigation">
        {navigationGroups.map((group) => (
          <div className="primary-nav__group" key={group.label}>
            <span className="primary-nav__label">{group.label}</span>
            {group.items.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={false}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <main id="hauptinhalt" className="main-content" tabIndex={-1}>
        {showRemovalNotice && (
          <section className="notice" aria-live="polite">
            <p>
              Die lokale Dokumentbibliothek wurde entfernt. Lokal gespeicherte PDF-Verknüpfungen und
              Ausschnittdaten wurden gelöscht.
            </p>
            <button
              type="button"
              onClick={() => {
                window.localStorage.setItem('algodat-local-source-removal-notice-v13', 'seen');
                setShowRemovalNotice(false);
              }}
            >
              Verstanden
            </button>
          </section>
        )}
        <Outlet />
      </main>
      <footer className="footer">
        <span>Lokale, quellenbasierte Prüfungsvorbereitung</span>
        <NavLink to="/diagnostik">Inhaltsqualität prüfen</NavLink>
      </footer>
      <UpdatePrompt />
    </div>
  );
}
