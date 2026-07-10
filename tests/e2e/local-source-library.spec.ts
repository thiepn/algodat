import { expect, test } from '@playwright/test';

test('Übungsaufgabe zeigt sicheren Fallback und nach lokaler Verbindung den PDF-Renderer', async ({
  page,
}) => {
  const uploads: string[] = [];
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH'].includes(request.method())) uploads.push(request.url());
  });

  await page.goto('./uebungen');
  await expect(page.getByRole('heading', { name: 'Übungen und Übungsblätter' })).toBeVisible();
  await page.getByRole('link', { name: 'Blatt öffnen' }).first().click();
  await expect(page.getByRole('heading', { name: /Präsenzübung|Übungsblatt/u })).toBeVisible();
  await page.getByRole('link', { name: 'Originalaufgabe anzeigen' }).first().click();
  await page.waitForURL(/\/aufgabe\//u);
  const originalUrl = page.url();
  await expect(page.getByRole('heading', { name: /Übungsaufgabe/u })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Lokale Originaldatei nicht verbunden' }),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Dokument verbinden' }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'lokale-originaldatei.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n% lokale Testdatei\n'),
  });
  const confirm = page.getByRole('button', { name: 'Zuordnung bestätigen' });
  await expect(confirm.first()).toBeVisible();
  await confirm.first().click({ force: true });
  await expect(page.getByText('Lokale PDF-Bindung bestätigt')).toBeVisible();

  await page.goto(originalUrl);
  await expect(page.getByRole('group', { name: 'PDF-Steuerung' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Native PDF-Ansicht' })).toBeVisible();
  await expect(page.locator('iframe[title*="lokale Originalseite"]')).toBeVisible();
  expect(uploads).toEqual([]);
});

test('Dokumentenindexierung speichert und exportiert nur lokale Metadaten', async ({ page }) => {
  await page.goto('./dokumente/indexierung');
  await expect(page.getByRole('heading', { name: 'Aufgabenregion indexieren' })).toBeVisible();
  await page.getByRole('spinbutton', { name: 'Aufgabe' }).fill('3');
  await page.getByRole('spinbutton', { name: 'Seite' }).fill('2');
  await page.getByRole('spinbutton', { name: 'x' }).fill('0.1');
  await page.getByRole('spinbutton', { name: 'y' }).fill('0.2');
  await page.getByRole('spinbutton', { name: 'width' }).fill('0.5');
  await page.getByRole('spinbutton', { name: 'height' }).fill('0.4');
  await page.getByRole('button', { name: 'Region lokal speichern' }).click();
  await expect(page.getByText('Lokale Aufgabenregion gespeichert')).toBeVisible();

  await page.goto('./dokumente/zuordnungen');
  await expect(page.getByRole('heading', { name: 'Lokale Zuordnungen' })).toBeVisible();
  await expect(page.getByText('normalized_page')).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).not.toContain('%PDF');
  expect(body).not.toContain('data:image');
  expect(body).not.toContain('base64');
});
