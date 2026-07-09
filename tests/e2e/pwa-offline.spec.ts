import { expect, test } from '@playwright/test';

test('App-Shell lädt nach dem ersten Online-Aufruf offline', async ({ page, context }) => {
  await page.goto('./');
  await page.evaluate(async () => navigator.serviceWorker.ready);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /ruhiger Ausgangspunkt/u })).toBeVisible();
  await context.setOffline(false);
});

test('gewähltes Profil bleibt nach Reload und App-Update erhalten', async ({ page }) => {
  await page.goto('./');
  await page.getByLabel('Gewähltes Klausurprofil').selectOption('klausur-2021');
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
  });
  await page.reload();
  await expect(page.getByLabel('Gewähltes Klausurprofil')).toHaveValue('klausur-2021');
});
