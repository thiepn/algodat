import { expect, test } from '@playwright/test';

test('Klausursimulator zeigt Coverage und bewertet die Kernkompetenz-Probeklausur nach Abgabe', async ({
  page,
  context,
}) => {
  await page.goto('./simulator');
  await page.evaluate(async () => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload();
    await page.evaluate(async () => navigator.serviceWorker.ready);
  }
  await expect(page.getByRole('heading', { name: 'Klausursimulator' })).toBeVisible();
  await page.getByRole('link', { name: 'Profilabdeckung ansehen' }).click();
  await expect(page.getByRole('heading', { name: 'Profilabdeckung' })).toBeVisible();
  await expect(page.getByText('Nicht startbar').first()).toBeVisible();

  await page.goto('./simulator/pruefungen/exam-package-kernkompetenz-v3');
  await expect(
    page.getByText(/Diese Probeklausur wurde aus verifizierten Aufgabenfamilien/u),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Briefing öffnen' }).click();
  for (const label of [
    'Timer verstanden',
    'Keine Hinweise während der Prüfung',
    'Antworten werden automatisch gespeichert',
    'Zeit läuft bei Reload weiter',
    'Endgültige Abgabe ist nicht rückgängig zu machen',
    'Diese Probeklausur ist keine historische Originalklausur',
  ]) {
    await page.getByLabel(label).check();
  }
  await page.getByRole('button', { name: 'Prüfung starten' }).click();
  await expect(page.getByRole('heading', { name: 'Rucksack-DP-Tabelle' })).toBeVisible();

  await page.getByLabel(/Antwort für Rucksack/u).fill('Teilantwort ohne JSON');
  await page.getByLabel('Zur Kontrolle markieren').check();
  await page.getByRole('button', { name: 'Autosave jetzt ausführen' }).click();
  await page.reload();
  await expect(page.getByLabel(/Antwort für Rucksack/u)).toHaveValue(/invalidJson/u);

  await page.getByRole('button', { name: /2\. unbeantwortet/u }).click();
  await expect(
    page.getByRole('heading', { name: 'Union-Find mit verketteten Listen' }),
  ).toBeVisible();
  await page.locator('#hauptinhalt').getByRole('link', { name: 'Übersicht' }).click();
  await expect(page.getByRole('heading', { name: 'Aufgabenübersicht vor Abgabe' })).toBeVisible();
  await page.getByRole('link', { name: 'Zurück zur Aufgabe' }).click();
  await page.getByRole('button', { name: 'Endgültig abgeben' }).click();
  await expect(page.getByRole('heading', { name: '0/56 Punkte' })).toBeVisible();

  const resultUrl = page.url();
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: '0/56 Punkte' })).toBeVisible();
  expect(page.url()).toBe(resultUrl);
  await context.setOffline(false);
});
