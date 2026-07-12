import { expect, test, type Page } from '@playwright/test';

const desktopViewports = [
  { width: 1440, height: 900 },
  { width: 1366, height: 768 },
  { width: 1326, height: 768 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
];

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    ),
  ).toBe(true);
}

async function expectNoItemOverlap(page: Page) {
  const boxes = await page.locator('.primary-nav__label, .primary-nav a').evaluateAll((elements) =>
    elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    }),
  );
  for (let left = 0; left < boxes.length; left += 1) {
    for (let right = left + 1; right < boxes.length; right += 1) {
      const a = boxes[left]!;
      const b = boxes[right]!;
      const overlapX = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      expect(overlapX > 1 && overlapY > 1).toBe(false);
    }
  }
}

for (const viewport of desktopViewports) {
  test(`Hauptnavigation bleibt bei ${viewport.width} × ${viewport.height} geordnet`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('');
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expectNoItemOverlap(page);
  });
}

test('Gruppenlabels bleiben bei 1326 px ungebrochen und horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 1326, height: 768 });
  await page.goto('');
  for (const label of ['LERNEN', 'ÜBEN', 'PLANEN', 'QUELLEN']) {
    const locator = page
      .locator('.primary-nav__label')
      .filter({ hasText: new RegExp(`^${label}$`, 'iu') });
    await expect(locator).toHaveCount(1);
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(32);
    expect(box!.height).toBeLessThan(28);
  }
  await expect(page.locator('.site-header')).toHaveScreenshot('topbar-1326.png');
});

for (const viewport of [
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`mobiles Menü funktioniert bei ${viewport.width} × ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('');
    const button = page.locator('.nav-menu-button');
    await expect(button).toBeVisible();
    await expect(button).toHaveAccessibleName('Menü öffnen');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.click();
    await expect(button).toHaveAccessibleName('Menü schließen');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    if (viewport.width === 390)
      await expect(page.locator('.site-header')).toHaveScreenshot('topbar-mobile-390.png');
    await page.keyboard.press('Escape');
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });
}

test('200-Prozent-Zoom fällt in den kompakten Menüzustand zurück', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 720 });
  await page.goto('');
  await expect(page.getByRole('button', { name: 'Menü öffnen' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('Hauptnavigation bleibt in erzwungenen Farben bedienbar', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  await page.setViewportSize({ width: 1326, height: 768 });
  await page.goto('');
  await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus-visible')).toBeVisible();
});
