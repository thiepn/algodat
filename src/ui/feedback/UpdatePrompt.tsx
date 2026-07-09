import { useRegisterSW } from 'virtual:pwa-register/react';

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  if (!needRefresh) return null;
  return (
    <aside className="update-prompt" aria-live="polite">
      <span>Eine neue, geprüfte Version ist verfügbar.</span>
      <button type="button" onClick={() => void updateServiceWorker(true)}>
        Jetzt aktualisieren
      </button>
    </aside>
  );
}
