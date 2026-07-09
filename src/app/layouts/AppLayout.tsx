import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { UpdatePrompt } from '../../ui/feedback/UpdatePrompt';

const navigation = [
  ['/', 'Übersicht'],
  ['/klausurprofile', 'Klausurprofile'],
  ['/aufgaben', 'Aufgaben 1–9'],
  ['/themen', 'Themen'],
  ['/quellen', 'Quellen'],
  ['/diagnostik', 'Diagnostik'],
  ['/diagnose', 'Diagnose'],
  ['/lernplan', 'Lernplan'],
  ['/spickzettel', 'Spickzettel'],
  ['/trainer', 'Trainer'],
  ['/simulator', 'Simulator'],
] as const;

export function AppLayout() {
  const location = useLocation();
  const initialRouteHandled = useRef(false);

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
        <span className="topbar__phase">1.0.0-rc.2 · 11 Trainer · Accessibility-Fallback</span>
      </header>
      <nav className="primary-nav" aria-label="Hauptnavigation">
        {navigation.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <main id="hauptinhalt" className="main-content" tabIndex={-1}>
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
