import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('PWA-Konfiguration', () => {
  const config = readFileSync('vite.config.ts', 'utf8');
  it('nutzt versionierten Cache und räumt alte Caches auf', () => {
    expect(config).toContain("cacheId: 'algodat-study-system-v7'");
    expect(config).toContain('cleanupOutdatedCaches: true');
    expect(config).toContain("registerType: 'prompt'");
  });
  it('schließt PDFs und lokale Quellordner vom Precache aus', () => {
    expect(config).toContain("'**/*.pdf'");
    expect(config).toContain("'**/info 1 copy/**'");
    expect(config).toContain("'**/pdfs/**'");
  });
});
