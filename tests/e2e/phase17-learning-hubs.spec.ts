import { expect, test } from '@playwright/test';

test('Aufgaben-Hub und Klausurenbibliothek sind klickbar verbunden', async ({ page }) => {
  await page.goto('./aufgaben/3');
  await expect(page.getByRole('heading', { name: 'Passende produktive Trainer' })).toBeVisible();
  await page.getByRole('link', { name: /Fragen zu Aufgabe 3 öffnen/u }).click();
  await expect(page).toHaveURL(/\/algodat\/klausuren\/fragen\?aufgabe=3/u);
  await expect(
    page.getByRole('heading', { name: 'Alte Fragen als sichere Metadaten' }),
  ).toBeVisible();
});

test('Klausurenvergleich nutzt getrennte Häufigkeiten', async ({ page }) => {
  await page.goto('./klausuren/vergleich');
  await expect(page.getByRole('heading', { name: 'Aufgaben-Slots über den Korpus' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Reale Ereignisse' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Lernhub öffnen' }).first()).toBeVisible();
});
