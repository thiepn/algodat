import { expect, test } from '@playwright/test';

test('Quellenabdeckung zeigt lokale Metadaten-Suche und Coverage-Status', async ({ page }) => {
  await page.goto('./dokumente/abdeckung');
  await expect(
    page.getByRole('heading', { name: 'Lokale Quellenbibliothek durchsuchen' }),
  ).toBeVisible();
  await expect(page.getByText('inventarisierte Quellen')).toBeVisible();
  await page.getByRole('textbox', { name: 'Metadaten-Suche' }).fill('2023');
  await expect(page.getByRole('table')).toContainText('2023');
  await expect(page.getByText('Coverage-State-Zählung')).toBeVisible();
  await expect(page.locator('body')).not.toContainText('%PDF');
});

test('Crop-Qualitätsseite trennt Vollseiten-Fallback von präzisen Crops', async ({ page }) => {
  await page.goto('./dokumente/indexierung/qualitaet');
  await expect(page.getByRole('heading', { name: 'Crop-Qualität prüfen' })).toBeVisible();
  await expect(page.getByText('Vollseiten-Fallbacks', { exact: true })).toBeVisible();
  await expect(page.getByRole('table')).toContainText('Vollseiten-Fallback');
  await expect(page.getByRole('link', { name: 'lokal präzisieren' }).first()).toBeVisible();
});

test('Indexer bietet Navigation, Undo/Redo, Lösungslink und Save-and-next', async ({ page }) => {
  await page.goto('./dokumente/indexierung');
  await expect(page.getByRole('heading', { name: 'Aufgabenregion indexieren' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Dokument-Aufgabenliste und Fortschritt' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Nächste Aufgabe', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Aufgabe' })).toHaveValue('2');
  await page.getByRole('button', { name: 'Vorherige Aufgabe' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Aufgabe' })).toHaveValue('1');
  await page.getByRole('button', { name: 'Nächste Aufgabe', exact: true }).click();
  await page.getByRole('textbox', { name: 'Teilaufgaben in dieser Region' }).fill('a-c');
  await page.getByLabel('Lösungsquelle').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Crop von vorheriger Aufgabe kopieren' }).click();
  await page.getByLabel('Vorschau der normalisierten Aufgaben-Crop-Region').press('ArrowRight');
  await page.getByRole('button', { name: 'Rückgängig' }).click();
  await page.getByRole('button', { name: 'Wiederholen' }).click();
  await page.getByRole('button', { name: 'Speichern und nächste Aufgabe' }).click();
  await expect(page.getByText('nächste Aufgabe ist vorbereitet')).toBeVisible();
});
