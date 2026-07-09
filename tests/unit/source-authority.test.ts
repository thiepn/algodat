import { describe, expect, it } from 'vitest';
import { content } from '../../src/content/loaders/content';

describe('Quellenautorität', () => {
  it('stützt official_verified ausschließlich auf Autoritätsstufe 1', () => {
    const byId = new Map(content.sources.map((source) => [source.id, source]));
    const officialItems = [...content.topics, ...content.fixtures].filter(
      (item) => item.verificationStatus === 'official_verified',
    );
    expect(
      officialItems
        .flatMap((item) => item.sourceRefs)
        .every((ref) => byId.get(ref.sourceId)?.authorityLevel === 1),
    ).toBe(true);
  });
});
