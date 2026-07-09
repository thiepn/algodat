import { expect, test, type Page } from '@playwright/test';

async function answerCurrentDiagnosticItem(page: Page) {
  const main = page.locator('main');
  const fieldsets = main.locator('fieldset');
  const fieldsetCount = await fieldsets.count();

  for (let index = 0; index < fieldsetCount; index += 1) {
    const fieldset = fieldsets.nth(index);
    const legend = (await fieldset.locator('legend').textContent()) ?? '';
    if (legend.includes('Wie sicher')) continue;

    const radios = fieldset.locator('input[type="radio"]');
    const checkboxes = fieldset.locator('input[type="checkbox"]');
    const selects = fieldset.locator('select');

    if ((await radios.count()) > 0) await radios.first().check();
    if ((await checkboxes.count()) > 0) await checkboxes.first().check();

    const selectCount = await selects.count();
    for (let selectIndex = 0; selectIndex < selectCount; selectIndex += 1) {
      await selects.nth(selectIndex).selectOption({ index: 1 });
    }
  }

  const numericInput = main.locator('input[inputmode="numeric"]');
  if ((await numericInput.count()) > 0) await numericInput.first().fill('1');

  const orderButton = main.getByRole('button', { name: 'nach unten' });
  if ((await orderButton.count()) > 0) await orderButton.first().click();
}

test('Grundlagen-Diagnose startet, speichert Antworten und zeigt eine Auswertung', async ({
  page,
}) => {
  await page.goto('./diagnose');
  await expect(
    page.getByRole('heading', { name: 'Kurze Klausurkompetenzen diagnostizieren' }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Diagnose' })).toBeVisible();

  await page.getByRole('button', { name: 'Schnellcheck starten' }).click();
  await expect(page).toHaveURL(/\/diagnose\/session\/diagnostic-/u);

  for (let index = 0; index < 16; index += 1) {
    await expect(page.getByText(new RegExp(`Item ${index + 1}/16`, 'u'))).toBeVisible();
    await answerCurrentDiagnosticItem(page);
    await page
      .getByRole('button', {
        name: index === 15 ? 'Diagnose abschließen' : 'Antwort speichern und weiter',
      })
      .click();
  }

  await expect(page).toHaveURL(/\/diagnose\/auswertung\/diagnostic-/u);
  await expect(page.getByRole('heading', { name: /\d+\/\d+ Punkte/u })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Kompetenzen' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Empfohlene nächste Schritte' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: /\d+\/\d+ Punkte/u })).toBeVisible();
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
});
