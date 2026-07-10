import { expect, test } from '@playwright/test';

test('Aktuelle Probeklausur startet ohne Profil-UI und bewertet nach Abgabe', async ({
  page,
  context,
}) => {
  await page.goto('./simulator');
  await page.evaluate(async () => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload();
    await page.evaluate(async () => navigator.serviceWorker.ready);
  }
  await expect(page.getByRole('heading', { name: 'Aktuelle Probeklausur' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Profilabdeckung ansehen' })).toHaveCount(0);

  await page.goto('./simulator/pruefungen/exam-package-kernkompetenz-v4');
  await expect(
    page.getByText(/Diese Probeklausur wurde aus verifizierten Aufgabenfamilien/u),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Briefing öffnen' }).click();
  await expect(page.getByText('Autosave speichert Antworten lokal.')).toBeVisible();
  await expect(page.locator('input[type="checkbox"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Prüfung starten' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Rucksack-DP-Tabelle' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Prüfungsaufgaben' })).toBeVisible();

  await page.getByLabel(/Antwort für Rucksack/u).fill('Teilantwort ohne JSON');
  await page.getByLabel('Zur Kontrolle markieren').check();
  await page.getByRole('button', { name: 'Autosave jetzt ausführen' }).click();
  await expect(page.getByText('Antwort lokal gespeichert.')).toBeAttached();
  await page.reload();
  await expect(page.getByLabel(/Antwort für Rucksack/u)).toHaveValue('Teilantwort ohne JSON');

  await page.getByRole('button', { name: /Aufgabe 2/u }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Union-Find mit verketteten Listen' }),
  ).toBeVisible();
  await page.locator('#hauptinhalt').getByRole('link', { name: 'Übersicht' }).click();
  await expect(page.getByRole('heading', { name: 'Review vor Abgabe' })).toBeVisible();
  await page.getByRole('link', { name: 'Zurück zur Aufgabe' }).click();
  await page.getByRole('button', { name: 'Endgültig abgeben' }).click();
  await expect(page.getByRole('heading', { name: /\d+\/56 Punkte/u })).toBeVisible();

  const resultUrl = page.url();
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /\d+\/56 Punkte/u })).toBeVisible();
  expect(page.url()).toBe(resultUrl);
  await context.setOffline(false);
});
