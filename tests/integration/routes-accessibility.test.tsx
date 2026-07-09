import { render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '../../src/app/App';
import { resetDatabase } from '../../src/persistence/database/database';

afterEach(async () => resetDatabase());

describe('Routen und Barrierefreiheit', () => {
  it('rendert die deutsche Dashboard-Shell', async () => {
    window.history.replaceState({}, '', '/algodat/');
    const { container } = render(<App />);
    expect(
      await screen.findByRole('heading', { name: /ruhiger Ausgangspunkt/u }),
    ).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Hauptnavigation' })).toBeInTheDocument();
    await waitFor(async () => expect((await axe(container)).violations).toHaveLength(0));
  });
});
