import { expect, type Page } from '@playwright/test';

export async function openPrimaryNavigationWhenCompact(page: Page) {
  const menuButton = page.locator('.nav-menu-button');
  if (await menuButton.isVisible()) {
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  }
  await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
}
