import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const centralRoutes = [
  { path: './', heading: /ruhiger Ausgangspunkt/u },
  { path: './diagnose', heading: 'Kurze Klausurkompetenzen diagnostizieren' },
  { path: './trainer', heading: 'Trainer' },
  { path: './simulator', heading: 'Aktuelle Probeklausur' },
  { path: './lernplan', heading: 'Was heute sinnvoll ist' },
  { path: './spickzettel', heading: 'A4-Spickzettel' },
] as const;

async function waitForHeading(page: Page, heading: RegExp | string) {
  const locator =
    typeof heading === 'string'
      ? page.getByRole('heading', { name: heading, exact: true })
      : page.getByRole('heading', { name: heading });
  await expect(locator).toBeVisible();
}

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
}

async function expectNoBrokenAriaReferences(page: Page) {
  const broken = await page.evaluate(() => {
    const attributes = ['aria-labelledby', 'aria-describedby'] as const;
    return Array.from(
      document.querySelectorAll<HTMLElement>('[aria-labelledby], [aria-describedby]'),
    ).flatMap((element) =>
      attributes.flatMap((attribute) =>
        (element.getAttribute(attribute) ?? '')
          .split(/\s+/u)
          .filter(Boolean)
          .filter((id) => !document.getElementById(id))
          .map(
            (id) =>
              `${element.tagName.toLowerCase()}#${element.id || 'ohne-id'}:${attribute}:${id}`,
          ),
      ),
    );
  });
  expect(broken).toEqual([]);
}

async function expectNamedInteractiveControls(page: Page) {
  const unnamed = await page.evaluate(() => {
    function visibleText(element: HTMLElement) {
      return (element.innerText || element.textContent || '').trim();
    }
    function labelText(element: HTMLElement) {
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLSelectElement ||
        element instanceof HTMLTextAreaElement
      ) {
        return Array.from(element.labels ?? [])
          .map((label) => label.textContent?.trim() ?? '')
          .join(' ')
          .trim();
      }
      return '';
    }
    return Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, a[href], input:not([type="hidden"]), select, textarea, [role="button"], [role="link"]',
      ),
    )
      .filter((element) => !element.hasAttribute('disabled'))
      .filter((element) => element.getAttribute('aria-hidden') !== 'true')
      .filter((element) => {
        const name =
          element.getAttribute('aria-label') ||
          visibleText(element) ||
          labelText(element) ||
          element.getAttribute('title') ||
          '';
        return name.trim().length === 0;
      })
      .map((element) => element.outerHTML.slice(0, 180));
  });
  expect(unnamed).toEqual([]);
}

async function expectNoPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
}

async function expectAccessibilityTreeHasStructure(page: Page) {
  const client = await page.context().newCDPSession(page);
  const tree = await client.send('Accessibility.getFullAXTree');
  const roles = new Set(
    tree.nodes
      .map((node) => node.role?.value)
      .filter((role): role is string => typeof role === 'string'),
  );
  expect(roles.has('RootWebArea')).toBe(true);
  expect(roles.has('main') || roles.has('generic')).toBe(true);
  expect(roles.has('navigation') || roles.has('link')).toBe(true);
}

test('Erststart, Skip-Link und Routenfokus sind per Tastatur bedienbar', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle('AlgoDat Study System');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await waitForHeading(page, /ruhiger Ausgangspunkt/u);

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Zum Hauptinhalt' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#hauptinhalt')).toBeFocused();

  await page.getByRole('link', { name: 'Diagnose' }).focus();
  await page.keyboard.press('Enter');
  await waitForHeading(page, 'Kurze Klausurkompetenzen diagnostizieren');
  await expect(page.locator('#hauptinhalt')).toBeFocused();
});

test('zentrale Routen besitzen Namen, Landmark-Struktur, gültige ARIA-Referenzen und keine axe-Verstöße', async ({
  page,
}) => {
  for (const route of centralRoutes) {
    await test.step(route.path, async () => {
      await page.goto(route.path);
      await waitForHeading(page, route.heading);
      await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
      await expect(page.locator('main#hauptinhalt')).toBeVisible();
      await expectNamedInteractiveControls(page);
      await expectNoBrokenAriaReferences(page);
      await expectAccessibilityTreeHasStructure(page);
      await expectNoAxeViolations(page);
    });
  }
});

test('Diagnose-Fehlerzustand und Ordering/Matching-Alternativen bleiben tastatur- und semantikfähig', async ({
  page,
}) => {
  await page.goto('./diagnose');
  await page.getByRole('button', { name: 'Schnellcheck starten' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/diagnose\/session\/diagnostic-/u);

  await page.getByRole('button', { name: 'Antwort speichern und weiter' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toBeVisible();
  await expectNoBrokenAriaReferences(page);
  await expectNamedInteractiveControls(page);
  await expectNoAxeViolations(page);

  const orderButtons = page.getByRole('button', { name: /nach (oben|unten)/u });
  if ((await orderButtons.count()) > 0) await expect(orderButtons.first()).toBeEnabled();
  const selects = page.locator('select');
  if ((await selects.count()) > 0) await expect(selects.first()).toBeEnabled();
});

test('Spickzettel ist ohne Drag-and-Drop verschiebbar, variantenfähig und als Druckroute semantisch lesbar', async ({
  page,
}) => {
  await page.goto('./spickzettel/neu');
  await page.getByRole('button', { name: 'Standard-Spickzettel erstellen' }).focus();
  await page.keyboard.press('Enter');
  await waitForHeading(page, 'Standard-Spickzettel');

  const moveDown = page.getByRole('button', { name: /nach unten/u }).first();
  await expect(moveDown).toBeVisible();
  await moveDown.focus();
  await page.keyboard.press('Enter');
  await page.getByLabel('Erweiterte Variante bevorzugen').first().check();
  await page.getByRole('button', { name: 'Auswahl speichern' }).click();
  await expect(page.getByText(/Aktuelle Variante/u).first()).toBeVisible();

  await page.getByRole('link', { name: 'Drucken' }).click();
  await expect(page.getByRole('button', { name: 'Browser-Druck öffnen' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Standard-Spickzettel' }).first()).toBeVisible();
  await expect(page.getByLabel('Zweiseitiger A4-Spickzettel')).toBeVisible();
  await expectNoBrokenAriaReferences(page);
  await expectNamedInteractiveControls(page);
  await expectNoAxeViolations(page);
});

test('Zoom, 320px-Reflow, Forced Colors und Reduced Motion halten zentrale Flows bedienbar', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('./trainer/tracing/trainer-rucksack-dp-v1');
  await waitForHeading(page, 'Rucksack-DP Schritt für Schritt');
  await expectNoPageOverflow(page);
  await expect(page.getByRole('button', { name: 'Versuch beginnen' })).toBeVisible();

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = '2';
  });
  await expectNoPageOverflow(page);
  await page.evaluate(() => {
    document.documentElement.style.zoom = '1';
  });

  await page.emulateMedia({ forcedColors: 'active' });
  await expectNoAxeViolations(page);
  await expect(page.getByRole('button', { name: 'Versuch beginnen' })).toBeVisible();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('./spickzettel');
  await waitForHeading(page, 'A4-Spickzettel');
  await expectNoPageOverflow(page);
  await expectNoAxeViolations(page);
});

test('Simulator V4 kommuniziert Timer, Aufgabenwechsel, Recovery und Abgabe ohne Fokusfalle', async ({
  page,
}) => {
  await page.goto('./simulator/pruefungen/exam-package-kernkompetenz-v4/briefing');
  await waitForHeading(page, /Kernkompetenz-Probeklausur V4/u);
  for (const checkbox of await page.locator('input[type="checkbox"]').all()) {
    await checkbox.focus();
    await page.keyboard.press('Space');
  }
  await page.getByRole('button', { name: 'Prüfung starten' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/simulator\/sitzung\/.+\/aufgabe\//u);
  await expect(page.getByText(/Laufende Prüfung/u)).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Prüfungsaufgaben' })).toBeVisible();

  await page.getByRole('button', { name: /Aufgabe 2/u }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('navigation', { name: 'Prüfungsaufgaben' })).toBeVisible();

  await page.getByRole('button', { name: 'Endgültig abgeben' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: /\d+\/\d+ Punkte/u })).toBeVisible();
  await expectNoBrokenAriaReferences(page);
  await expectNamedInteractiveControls(page);
  await expectNoAxeViolations(page);
});
