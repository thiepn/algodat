# Accessibility Manual Audit Phase 7

## Ergebnis

Die Phase-7-UI verwendet deutsche Link- und Buttonnamen, ein Hauptlandmark `#hauptinhalt`, Tabellencaptions, Formularlabels und sichtbare Hinweise zur Prüfungsnatur. Der Simulator wurde in Desktop- und Mobil-Chromium per Playwright durchlaufen.

## Automatisiert geprüft

- `tests/integration/routes-accessibility.test.tsx` bleibt Teil von `npm.cmd test`.
- `tests/e2e/simulator-flow.spec.ts` prüft die neue Simulatorstrecke in Desktop- und Mobil-Chromium.
- `tests/e2e/pwa-offline.spec.ts` prüft weiterhin Offline-Neuladen.

## Manuell nicht durchgeführt

Eine echte Screenreader-Sitzung mit NVDA, JAWS oder VoiceOver wurde in dieser Sandbox nicht ausgeführt. Diese Prüfung bleibt als nachgelagerter manueller Schritt offen.
