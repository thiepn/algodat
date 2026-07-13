import { expect, test } from '@playwright/test';
import { openPrimaryNavigationWhenCompact } from './helpers/navigation';

test('Lernplan erzeugt Tagesplan, Einstellungen und Prüfungsreife lokal', async ({ page }) => {
  await page.goto('./lernplan');
  await expect(page.getByRole('heading', { name: 'Was heute sinnvoll ist' })).toBeVisible();
  await openPrimaryNavigationWhenCompact(page);
  await expect(page.getByRole('link', { name: 'Lernplan' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await page.getByRole('link', { name: 'Tagesplan öffnen' }).click();
  await expect(page).toHaveURL(/\/lernplan\/heute/u);
  await expect(page.getByRole('heading', { name: 'Tagesplan' })).toBeVisible();
  await page.getByRole('button', { name: 'Plan neu berechnen' }).click();
  await expect(page.getByText('Der Tagesplan wurde neu berechnet.')).toBeAttached();
  await page.getByRole('button', { name: 'Als gestartet markieren' }).first().click();
  await page.getByRole('button', { name: 'Abschließen' }).first().click();

  await page.goto('./lernplan/einstellungen');
  await expect(page.getByRole('heading', { name: 'Lernplan-Einstellungen' })).toBeVisible();
  await page.getByLabel('Tagesbudget in Minuten').fill('45');
  await page.getByRole('button', { name: 'Einstellungen speichern' }).click();
  await expect(page.getByRole('status')).toContainText('Einstellungen gespeichert');

  await page.goto('./lernplan/pruefungsreife');
  await expect(page.getByRole('heading', { name: 'Readiness nach Klausurslot' })).toBeVisible();
  await expect(
    page.getByText('Keine Notenprognose').or(page.getByText('Prüfungsreife')),
  ).toBeVisible();
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);

  await page.goto('./lernplan/wiederholungen');
  await expect(page.getByRole('heading', { name: 'Fällige Wiederholungen' })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Fällige Wiederholungen' })).toBeVisible();
});
