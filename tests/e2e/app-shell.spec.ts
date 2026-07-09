import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('deutsche App-Shell, Kernrouten und GitHub-Pages-Basispfad', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { name: /ruhiger Ausgangspunkt/u })).toBeVisible();
  await page.getByRole('link', { name: 'Klausurprofile' }).click();
  await expect(page.getByRole('heading', { name: 'Klausurprofile' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Klausurprofile' })).toBeVisible();
  expect(page.url()).toContain('/algodat/klausurprofile');
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
});

test('Kernseite erfüllt axe und Quellenbrowser exponiert keine PDF-Links', async ({ page }) => {
  await page.goto('./quellen');
  await expect(page.getByRole('heading', { name: 'Quellenbrowser' })).toBeVisible();
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
