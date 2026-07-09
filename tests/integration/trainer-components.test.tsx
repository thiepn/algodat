import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TracingTrainerPage } from '../../src/features/trainer/TracingTrainerPage';
import { TrainingAttemptPage } from '../../src/features/trainer/TrainingAttemptPage';
import { resetDatabase } from '../../src/persistence/database/database';

afterEach(async () => {
  cleanup();
  await resetDatabase();
});

describe('Trainer-Komponenten und Accessibility', () => {
  function renderTrainer() {
    return render(
      <MemoryRouter initialEntries={['/trainer/tracing/trainer-rucksack-dp-v1']}>
        <Routes>
          <Route path="/trainer/tracing/:trainerId" element={<TracingTrainerPage />} />
          <Route
            path="/trainer/tracing/:trainerId/versuch/:attemptId"
            element={<TrainingAttemptPage />}
          />
        </Routes>
      </MemoryRouter>,
    );
  }

  it('zeigt Modusauswahl, Preflight, Textalternative und Quellen ohne axe-Verstoß', async () => {
    const { container } = renderTrainer();
    expect(
      await screen.findByRole('heading', { name: 'Rucksack-DP Schritt für Schritt' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Textalternative:/u)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Wiederholungsmodus/u })).toBeDisabled();
    await userEvent.click(screen.getByText('Quellen und Verifikation'));
    expect(screen.queryByRole('link', { name: /pdf/iu })).not.toBeInTheDocument();
    expect((await axe(container)).violations).toHaveLength(0);
  }, 10000);

  it('startet per Tastatur einen Versuch und fokussiert den ersten Schritt', async () => {
    renderTrainer();
    const start = await screen.findByRole('button', { name: 'Versuch beginnen' });
    start.focus();
    await userEvent.keyboard('{Enter}');
    const heading = await screen.findByRole('heading', { name: 'Opt-Zeile 0 bearbeiten' });
    await waitFor(() => expect(heading).toHaveFocus());
    expect(screen.getByLabelText('Opt[0,0]')).toBeInTheDocument();
  });
});
