import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import {
  CanonicalQuestionPreviewPage,
  CanonicalQuestionReviewPage,
} from '../../src/features/canonical-questions/CanonicalQuestionPages';

describe('kanonische Fragenoberflächen', () => {
  afterEach(cleanup);

  it('zeigt in der Vorschau genau die final geprüften Fragen aller vollständigen Sammlungen', () => {
    render(
      <MemoryRouter initialEntries={['/fragen-vorschau']}>
        <CanonicalQuestionPreviewPage />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('link', { name: 'Frage öffnen' })).toHaveLength(51);
    expect(screen.getByText('exam-2020-2 · Aufgabe 1')).toBeInTheDocument();
    expect(screen.getByText('exam-2022-1 · Aufgabe 9')).toBeInTheDocument();
    expect(screen.getByText('exam-2021-1 · Aufgabe 6')).toBeInTheDocument();
    expect(screen.queryByText(/q-1c1860fa3f25/u)).not.toBeInTheDocument();
  });

  it('zeigt für die historische Sechs-Aufgaben-Klausur den eigenen Struktur- und Reviewstatus', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/__review/questions']}>
        <Routes>
          <Route
            path="/__review/questions/:questionId?"
            element={<CanonicalQuestionReviewPage />}
          />
        </Routes>
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('Sammlung'), 'exam-2021-1');
    expect(screen.getByText(/exam-2021-1: complete/u)).toBeInTheDocument();
    expect(screen.getByText(/6\/6 Aufgaben entschieden/u)).toBeInTheDocument();
    expect(screen.getByText(/Erwartete Punktzahl: 60/u)).toBeInTheDocument();
    expect(screen.getByText(/Trainerabdeckung: partial/u)).toBeInTheDocument();
    expect(screen.getByText(/Dublettenbeziehung:/u)).toHaveTextContent(/byteidentische/u);
    expect(screen.getByText(/Deterministischer Verifikationsstatus:/u)).toHaveTextContent(
      /verified/u,
    );
    expect(screen.getByText(/angeblichen? Lösung/u)).toHaveTextContent(/bleibt getrennt/u);
  });

  it('filtert die Entwicklungsprüfung nach Sammlung und zeigt den Abschlussstatus', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/__review/questions']}>
        <Routes>
          <Route
            path="/__review/questions/:questionId?"
            element={<CanonicalQuestionReviewPage />}
          />
        </Routes>
      </MemoryRouter>,
    );
    await user.selectOptions(screen.getByLabelText('Sammlung'), 'exam-2020-2');
    expect(screen.getByText(/exam-2020-2: complete/u)).toBeInTheDocument();
    expect(screen.getByText(/9\/9 Aufgaben entschieden/u)).toBeInTheDocument();
    expect(screen.getByText(/Erwartete Punktzahl: 50/u)).toBeInTheDocument();
    expect(screen.getByText(/Trainerabdeckung: missing/u)).toBeInTheDocument();
  });
});
