import { test, expect } from '@playwright/test';

test('Spickzettel erstellt, speichert und öffnet eine zweiseitige Druckansicht', async ({
  page,
}) => {
  await page.goto('spickzettel');
  await expect(page.getByRole('heading', { name: 'A4-Spickzettel' })).toBeVisible();
  await page.getByRole('link', { name: 'Neuen Spickzettel erstellen' }).click();
  await expect(page.getByRole('heading', { name: 'Spickzettel-Modus wählen' })).toBeVisible();
  await page.getByRole('button', { name: 'Standard-Spickzettel erstellen' }).click();
  await expect(page.getByRole('heading', { name: 'Standard-Spickzettel' })).toBeVisible();
  await expect(page.getByText('Quellenanker').first()).toBeVisible();
  await page.getByRole('link', { name: 'Vorschau' }).click();
  await expect(page.getByText('A4-Seite 1/2')).toBeVisible();
  await expect(page.getByText('A4-Seite 2/2')).toBeVisible();
  await page.goBack();
  await page.getByRole('link', { name: 'Drucken' }).click();
  await expect(page.getByRole('button', { name: 'Browser-Druck öffnen' })).toBeVisible();
  await expect(page.getByText('Quellengebundene Referenz').first()).toBeVisible();
  await page.reload();
  await expect(page.getByText('A4-Seite 1/2')).toBeVisible();
});
