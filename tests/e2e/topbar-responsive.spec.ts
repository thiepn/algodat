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

async function expectGroupLabelsUnbroken(page: Page) {
  for (const label of ['LERNEN', 'ÜBEN', 'PLANEN', 'QUELLEN']) {
    const locator = page
      .locator('.primary-nav__label')
      .filter({ hasText: new RegExp(`^${label}$`, 'iu') });
    await expect(locator).toHaveCount(1);
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(32);
    const textLayout = await locator.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return {
        lineCount: range.getClientRects().length,
        whiteSpace: getComputedStyle(element).whiteSpace,
      };
    });
    expect(textLayout).toEqual({ lineCount: 1, whiteSpace: 'nowrap' });
  }
}

async function waitForStableHeader(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => document.fonts.ready);
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
    await expectGroupLabelsUnbroken(page);
  });
}

test('Gruppenlabels bleiben bei 1326 px ungebrochen und horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 1326, height: 768 });
  await page.goto('');
  await expectGroupLabelsUnbroken(page);
  await waitForStableHeader(page);
  await expect(page.locator('.site-header')).toHaveScreenshot('topbar-1326.png');
});

for (const viewport of [
  { width: 320, height: 568 },
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
]) {
  test(`mobiles Menü funktioniert bei ${viewport.width} × ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('');
    await waitForStableHeader(page);
    const button = page.locator('.nav-menu-button');
    const navigation = page.locator('nav[aria-label="Hauptnavigation"]');
    const initialBodyOverflow = await page.locator('body').evaluate((body) => body.style.overflow);
    await expect(button).toBeVisible();
    await expect(button).toHaveAccessibleName('Menü öffnen');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(navigation).toHaveCount(1);
    await expect(navigation).toBeHidden();
    const positions = await page.evaluate(() => ({
      headerBottom: document.querySelector('header')?.getBoundingClientRect().bottom ?? 0,
      mainTop: document.querySelector('main')?.getBoundingClientRect().top ?? 0,
    }));
    expect(positions.mainTop).toBeGreaterThanOrEqual(positions.headerBottom);
    await button.click();
    await expect(button).toHaveAccessibleName('Menü schließen');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('link')).toHaveCount(11);
    await expectGroupLabelsUnbroken(page);
    await expectNoHorizontalOverflow(page);
    if (viewport.width === 390)
      await expect(page.locator('.site-header')).toHaveScreenshot('topbar-mobile-390.png');
    await page.keyboard.press('Escape');
    await expect(button).toBeFocused();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(await page.locator('body').evaluate((body) => body.style.overflow)).toBe(
      initialBodyOverflow,
    );

    await button.click();
    await navigation.getByRole('link', { name: 'Übungen' }).click();
    await expect(page).toHaveURL(/\/uebungen$/u);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(navigation.locator('a', { hasText: 'Übungen' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await page.goBack();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await page.goForward();
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
