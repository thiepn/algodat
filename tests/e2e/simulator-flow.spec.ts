import { expect, test } from '@playwright/test';

test('Aktuelle Probeklausur nutzt strukturierte Renderer und speichert lokal', async ({
  page,
  context,
}) => {
  await page.goto('./simulator');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Aktuelle Probeklausur' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Aktuelle Probeklausur öffnen' }).click();
  await page.getByRole('link', { name: 'Briefing öffnen' }).click();
  await page.getByRole('button', { name: 'Prüfung starten' }).click();

  await expect(page.getByRole('heading', { level: 1, name: 'Rucksack-DP-Tabelle' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Prüfungsaufgaben' })).toBeVisible();
  await expect(page.getByLabel('Opt 0 0')).toBeVisible();
  await page.getByLabel('Opt 0 0').fill('0');
  await expect(page.locator('.sr-status')).toContainText('gespeichert');
  await page.getByRole('button', { name: 'Jetzt speichern' }).click({ force: true });

  await page.getByRole('button', { name: /Aufgabe 2/u }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Union-Find mit verketteten Listen' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Übersicht' }).click();
  await expect(page.getByRole('heading', { name: 'Review vor Abgabe' })).toBeVisible();
  await page.getByRole('link', { name: 'Zurück zur Aufgabe' }).click();
  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Endgültig abgeben' }).click();
  await expect(page.getByRole('heading', { name: /\d+\/50 Punkte/u })).toBeVisible();

  const resultUrl = page.url();
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /\d+\/50 Punkte/u })).toBeVisible();
  expect(page.url()).toBe(resultUrl);
  await context.setOffline(false);
});
