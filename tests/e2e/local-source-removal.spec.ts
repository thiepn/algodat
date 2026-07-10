import { expect, test } from '@playwright/test';

test('lokale Dokumentrouten werden auf die Quellenübersicht umgeleitet', async ({ page }) => {
  for (const route of [
    './dokumente',
    './dokumente/verbinden',
    './dokumente/indexierung',
    './dokumente/indexierung/qualitaet',
    './dokumente/zuordnungen',
    './dokumente/abdeckung',
    './dokumente/local-document-alt',
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/quellen$/u);
    await expect(page.getByRole('heading', { name: 'Quellenbibliothek' })).toBeVisible();
  }
});

test('Hauptnavigation enthält keine Dokumentbibliothek mehr', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('navigation').getByRole('link', { name: 'Dokumente' })).toHaveCount(
    0,
  );
  await expect(page.getByText('Die lokale Dokumentbibliothek wurde entfernt.')).toBeVisible();
});

test('Übungen bleiben ohne lokale Originalansicht nutzbar', async ({ page }) => {
  await page.goto('./uebungen');
  await expect(page.getByRole('heading', { name: /Übungen und Übungsblätter/u })).toBeVisible();
  await expect(page.getByText('öffentlich eingebundene Originale')).toBeVisible();

  const sheetHref = await page.locator('a[href*="/uebungen/sheet-"]').first().getAttribute('href');
  expect(sheetHref).toBeTruthy();
  await page.goto(sheetHref!);

  const taskHref = await page
    .locator('a[href*="/uebungen/"][href*="/aufgabe/"]')
    .first()
    .getAttribute('href');
  expect(taskHref).toBeTruthy();
  await page.goto(taskHref!);
  await expect(page.getByText('Originaldokument nicht öffentlich eingebunden.')).toBeVisible();

  await page.goto(`${taskHref!}/original`);
  await expect(page).toHaveURL(
    new RegExp(`${taskHref!.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}$`, 'u'),
  );
});

test('Klausur-Originalrouten werden auf Metadatenseiten umgeleitet', async ({ page }) => {
  await page.goto('./klausuren');
  const examHref = await page
    .locator('a[href*="/klausuren/exam-"]:not([href*="/aufgabe/"])')
    .first()
    .getAttribute('href');
  expect(examHref).toBeTruthy();

  await page.goto(`${examHref!}/original`);
  await expect(page).toHaveURL(
    new RegExp(`${examHref!.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}$`, 'u'),
  );

  await page.goto('./klausuren/fragen');
  const taskHref = await page
    .locator('a[href*="/klausuren/"][href*="/aufgabe/"]')
    .first()
    .getAttribute('href');
  expect(taskHref).toBeTruthy();
  await page.goto(`${taskHref!}/original`);
  await expect(page).toHaveURL(
    new RegExp(`${taskHref!.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')}$`, 'u'),
  );
  await expect(page.getByText('Originaldokument nicht öffentlich eingebunden.')).toBeVisible();
});
