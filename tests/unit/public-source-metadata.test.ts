import { describe, expect, it } from 'vitest';
import report from '../../src/content/generated/public-source-validation-report.json';
import sources from '../../src/content/generated/sources.json';

describe('Öffentliche Quellenmetadaten', () => {
  it('enthalten keine OCR- oder Vollseitentexte in Titelfeldern', () => {
    expect(report.passed).toBe(true);
    expect(report.violationCount).toBe(0);
    for (const source of sources) {
      expect(source.title.length).toBeLessThanOrEqual(160);
      expect(source.title).not.toMatch(/[\r\n]/u);
      expect(source.title.split(/\s+/u).length).toBeLessThanOrEqual(24);
    }
  });
});
