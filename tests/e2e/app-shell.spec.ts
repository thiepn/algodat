import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('deutsche App-Shell, Kernrouten und GitHub-Pages-Basispfad', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: /ruhiger Ausgangspunkt/u })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Klausurprofile' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Übungen' }).click();
  await expect(page.getByRole('heading', { name: 'Übungen und Übungsblätter' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Übungen und Übungsblätter' })).toBeVisible();
  expect(page.url()).toContain('/algodat/uebungen');
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});

test('Kernseite erfüllt axe und Quellenbrowser exponiert keine PDF-Links', async ({ page }) => {
  await page.goto('./quellen');
  await expect(page.getByRole('heading', { name: 'Quellenbibliothek' })).toBeVisible();
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
