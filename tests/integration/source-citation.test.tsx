import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { content } from '../../src/content/loaders/content';
import { SourceCitation } from '../../src/features/sources/SourceCitation';

describe('Quellenzitat', () => {
  it('zeigt Metadaten und niemals einen PDF-Link', async () => {
    const citation = content.fixtures[0];
    const source = content.sources.find((item) => item.id === citation?.sourceRefs[0]?.sourceId);
    if (!citation || !source) throw new Error('Fixture fehlt.');
    render(<SourceCitation citation={citation} source={source} />);
    await userEvent.click(screen.getByText(/^Klausur 2024$/u));
    expect(screen.getByText(/weder verlinkt noch ausgeliefert/u)).toBeInTheDocument();
    expect(document.querySelector('a[href$=".pdf"]')).not.toBeInTheDocument();
  });
});
