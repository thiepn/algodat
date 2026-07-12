import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { AppLayout } from '../../src/app/layouts/AppLayout';

afterEach(cleanup);

function renderLayout(initialEntry = '/') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<h1>Start</h1>} />
          <Route path="lernen" element={<h1>Lernen</h1>} />
          <Route path="themen" element={<h1>Themen</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe('responsive Hauptnavigation', () => {
  it('verknüpft den Menüschalter semantisch mit der Hauptnavigation', async () => {
    const user = userEvent.setup();
    renderLayout();
    const button = screen.getByRole('button', { name: 'Menü öffnen' });
    const navigation = screen.getByRole('navigation', { name: 'Hauptnavigation' });
    expect(button).toHaveAttribute('aria-controls', navigation.id);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await user.click(button);
    expect(screen.getByRole('button', { name: 'Menü schließen' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('schließt das mobile Menü mit Escape und setzt den Fokus zurück', async () => {
    const user = userEvent.setup();
    renderLayout();
    const button = screen.getByRole('button', { name: 'Menü öffnen' });
    await user.click(button);
    await user.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });

  it('schließt das Menü nach einem Routenwechsel und kennzeichnet die aktuelle Route', async () => {
    const user = userEvent.setup();
    renderLayout('/lernen');
    const button = screen.getByRole('button', { name: 'Menü öffnen' });
    await user.click(button);
    await user.click(screen.getByRole('link', { name: 'Themen' }));
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('link', { name: 'Themen' })).toHaveAttribute('aria-current', 'page');
  });
});
