import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const rows = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 3, 3, 3, 3, 3, 3, 3],
  [0, 0, 3, 4, 4, 7, 7, 7, 7],
  [0, 0, 3, 4, 7, 7, 10, 11, 11],
  [0, 0, 3, 4, 7, 8, 10, 11, 12],
];

const unionFindStates = [
  ['F: F; G: G; H: H; I: I; J: J; K: K', 'keine'],
  ['F: F; G: G; I: I; J: J>H; K: K', 'H->J'],
  ['G: G>F; I: I; J: J>H; K: K', 'F->G'],
  ['G: G>F; I: I; J: J>H>K', 'K->J'],
  ['I: I; J: J>H>K>G>F', 'G->J'],
  ['J: J>H>K>G>F>I', 'I->J'],
];

async function fillRow(page: Page, rowIndex: number) {
  for (const [capacity, value] of (rows[rowIndex] ?? []).entries()) {
    await page.getByLabel(`Opt[${rowIndex},${capacity}]`).fill(String(value));
  }
  if (rowIndex === 3 || rowIndex === 4)
    await page.getByRole('radio', { name: 'Neues Objekt weglassen' }).check();
}

async function fillUnionCheckpoint(page: Page, index: number) {
  const pair = unionFindStates[index] ?? ['', ''];
  const stateText = pair[0] ?? '';
  const attached = pair[1] ?? '';
  await page.getByLabel('Mengen, Repräsentanten und Listenreihenfolge').fill(stateText);
  await page.getByLabel('Welche Liste wurde bei dieser Operation angehängt?').fill(attached);
}

async function fillCanonicalRecurrence(page: Page) {
  const values = [
    'T(n)=8T(n/2)+n^3',
    'T(1)=1',
    'n ist Zweierpotenz',
    'O(n^3 log n)',
    'geschlossene Form per Induktion zeigen',
    '8',
    '2',
    'n^3',
    '3',
    'n^3',
    'fall1',
    '8*(n/2)^3=n^3',
    'O(n^3 log n)',
    'log_2(n)',
    '8^i',
    'n/2^i',
    '(n/2^i)^3',
    '8^i*(n/2^i)^3=n^3',
    '8^log_2(n)=n^3',
    '(log_2(n)+1)*n^3',
    'Auf Ebene i gibt es 8^i Teilprobleme der Größe n/2^i; die Ebenenkosten sind 8^i*(n/2^i)^3=n^3. Mit den Ebenen 0 bis log_2(n) folgt (log_2(n)+1)n^3.',
    'T(n)=(log_2(n)+1)*n^3 für alle Zweierpotenzen n>=1',
    'vollständige Induktion über Zweierpotenzen',
    'T(1)=1=(log_2(1)+1)*1^3',
    'T(n/2)=(log_2(n/2)+1)*(n/2)^3',
    'T(n)=8*T(n/2)+n^3',
    '8*(log_2(n/2)+1)*(n/2)^3+n^3=log_2(n)*n^3+n^3=(log_2(n)+1)*n^3',
    'Aus der geschlossenen Form folgt T(n)<=c*n^3*log_2(n) für geeignetes c und n>=2.',
    'Damit gilt T(n) in O(n^3 log n).',
  ];
  const fields = page.locator('input:not([type="radio"]), textarea');
  await expect(fields).toHaveCount(values.length);
  for (const [index, value] of values.entries()) await fields.nth(index).fill(value);
}

async function fillCanonicalDpDesign(page: Page) {
  const values = [
    'Matrix A mit k Zeilen und l Spalten natürlicher Erzwerte',
    'maximiere die Summe des gesammelten Erzes auf einem gültigen Weg',
    'Start in Zeile 1; pro Schritt eine Zeile tiefer; Spalte bleibt gleich oder ändert sich um 1; keine Seitenüberschreitung',
    'maximal erreichbare Erzmenge in der unteren Zeile',
    'G',
    'zwei Dimensionen i und j',
    '1<=i<=k',
    '1<=j<=l',
    'G(i,j) ist die maximale Erzmenge auf einem gültigen Weg, der in der ersten Reihe beginnt und in a_ij endet',
    'Maximum',
    'G(1,j)=a_1j für 1<=j<=l',
    'G(i,1)=a_i1+max{G(i-1,1),G(i-1,2)} für i>1',
    'G(i,l)=a_il+max{G(i-1,l),G(i-1,l-1)} für i>1',
    'G(i,j)=a_ij+max{G(i-1,j),G(i-1,j-1),G(i-1,j+1)} für i>1 und 1<j<l',
    'Zustände mit j<1 oder j>l sind unzulässig und werden nicht gelesen',
    'jeder Zustand hängt nur von der vorherigen Zeile i-1 ab',
    'zeilenweise von i=1 bis k, innerhalb einer Zeile von j=1 bis l',
    'max_{1<=j<=l} G(k,j)',
    'G = neues Array[k][l]',
    'für j=1 bis l: G[1][j]=A[1][j]',
    'für i=2 bis k: berechne linken Rand, innere Spalten und rechten Rand aus Zeile i-1',
    'return max_{1<=j<=l} G[k][j]',
    'Für alle i,j enthält G(i,j) die maximale Erzmenge eines gültigen Weges von Zeile 1 nach a_ij',
    'Für i=1 besteht der Weg nur aus a_1j, daher gilt G(1,j)=a_1j',
    'Für Zeile i sind alle Werte G(i,j) korrekt',
    'Für Position (i+1,j) sind genau die zulässigen Vorgänger (i,j), (i,j-1), (i,j+1) möglich; das Maximum wählt den besten korrekten Vorgänger',
    'Damit ist die Rekurrenz korrekt; die beste Endposition ist max_j G(k,j)',
    'k*l Zustände',
    'O(1) pro Zustand',
    'O(k*l)',
    'O(k*l)',
  ];
  const fields = page.locator('textarea');
  await expect(fields).toHaveCount(values.length);
  for (const [index, value] of values.entries()) await fields.nth(index).fill(value);
}

async function fillCanonicalDivideConquerDesign(page: Page) {
  const values = [
    'Feld A[1..n] positiver ganzer Zahlen',
    'maximiere A[i] - A[j] unter der Bedingung i <= j',
    'maximale gerichtete Wertdifferenz',
    'MaxWertDiff(A,l,r) liefert [maximale Differenz, kleinster Wert, größter Wert] für A[l..r]',
    'wenn l = r: return [0, A[l], A[l]]',
    'm = floor((l+r)/2); löse A[l..m] und A[m+1..r] rekursiv',
    'optimales Paar liegt vollständig in der linken Hälfte: L[1]',
    'optimales Paar liegt vollständig in der rechten Hälfte: R[1]',
    'optimales Paar kreuzt die Mitte: L[3] - R[2]',
    'return [max(L[1], R[1], L[3] - R[2]), min(L[2], R[2]), max(L[3], R[3])]',
    'MaxWertDiff(A,l,r)',
    'L = MaxWertDiff(A,l,m); R = MaxWertDiff(A,m+1,r)',
    '[max(L[1], R[1], L[3] - R[2]), min(L[2], R[2]), max(L[3], R[3])]',
    'T(n) = 2T(n/2) + O(1)',
    'O(1)',
    'O(n)',
    'MaxWertDiff(A,l,r) berechnet die maximale Differenz A[i] - A[j] mit i <= j und liefert Minimum und Maximum von A[l..r]',
    'k = r - l + 1',
    'für k = 1 ist die maximale Differenz 0 und A[l] zugleich Minimum und Maximum',
    'nach Induktionsvoraussetzung sind L und R für beide Hälften korrekt',
    'jedes zulässige Paar liegt links, rechts oder kreuzt von links nach rechts über die Mitte',
    'das Maximum der drei Fälle ist vollständig; Minimum und Maximum werden mit min und max korrekt zusammengeführt',
  ];
  const fields = page.locator('textarea');
  await expect(fields).toHaveCount(values.length);
  for (const [index, value] of values.entries()) await fields.nth(index).fill(value);
}

async function waitForServiceWorkerControl(page: Page) {
  await page.evaluate(async () => navigator.serviceWorker.ready);
  if (!(await page.evaluate(() => Boolean(navigator.serviceWorker.controller)))) {
    await page.reload();
    await page.evaluate(async () => navigator.serviceWorker.ready);
  }
}

test('vollständiger Übungs-, Resume-, Bewertungs- und Wiederholungspfad', async ({
  page,
  context,
}) => {
  await page.goto('./trainer/tracing/trainer-rucksack-dp-v1');
  await expect(
    page.getByRole('heading', { name: 'Rucksack-DP Schritt für Schritt' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Versuch beginnen' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Opt-Zeile 0 bearbeiten' })).toBeFocused();

  await fillRow(page, 0);
  await page.getByRole('button', { name: 'Zwischenschritt speichern' }).click();
  await expect(page.getByText('Schritt 0 lokal gespeichert.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Opt[0,8]')).toHaveValue('0');

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    await page.getByRole('button', { name: 'Weiter' }).click();
    await fillRow(page, rowIndex);
  }
  await page.getByRole('button', { name: 'Versuch abgeben' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Jetzt bewerten' }).click();
  await expect(page.getByRole('heading', { name: '12 von 12 Punkten' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Auswirkung auf Beherrschung' })).toBeVisible();

  const resultUrl = page.url();
  await waitForServiceWorkerControl(page);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: '12 von 12 Punkten' })).toBeVisible();
  expect(page.url()).toBe(resultUrl);
  await context.setOffline(false);

  await page.getByRole('link', { name: 'Neuen Modus wählen' }).click();
  await expect(page.getByRole('radio', { name: /Wiederholungsmodus/u })).toBeEnabled();
});

test('vollständiger Rekurrenz-Laufzeitbeweispfad mit Bewertung', async ({ page }) => {
  await page.goto('./trainer/rekurrenzen/trainer-rekurrenz-master-fall1-v1');
  await expect(page.getByRole('heading', { name: /Rekurrenztrainer: Master-Fall/u })).toBeVisible();
  await page.getByRole('button', { name: 'Rekurrenzversuch beginnen' }).click();
  await expect(
    page.getByRole('heading', { name: 'Rekurrenzanalyse aktiv eingeben' }),
  ).toBeFocused();

  await fillCanonicalRecurrence(page);
  await page.getByRole('button', { name: 'Rekurrenzversuch abgeben' }).click();
  await page.getByRole('button', { name: 'Jetzt bewerten' }).click();
  await expect(page.getByRole('heading', { name: '23 von 23 Punkten' })).toBeVisible();
});

test('Prüfungsmodus sperrt Hinweise und bleibt bei 200 Prozent ohne Seitenüberlauf', async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 450 });
  await page.goto('./trainer/tracing/trainer-rucksack-dp-v1');
  await page.getByRole('radio', { name: /Prüfungsmodus/u }).check();
  await page.getByRole('button', { name: 'Versuch beginnen' }).click();
  await expect(page.getByRole('heading', { name: 'Hinweise' })).toHaveCount(0);
  const viewport = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('vollständiger Union-Find-Listenpfad mit Resume und Bewertung', async ({ page, context }) => {
  await page.goto('./trainer');
  await expect(
    page.getByRole('heading', { name: 'Union-Find mit Listen Schritt für Schritt' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Lernpfad öffnen' }).nth(1).click();
  await expect(
    page.getByRole('heading', { name: 'Union-Find mit Listen Schritt für Schritt' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Versuch beginnen' }).click();
  await expect(page.getByRole('heading', { name: 'Union-Find-Kontrollpunkt 1' })).toBeFocused();
  await fillUnionCheckpoint(page, 0);
  await page.getByRole('button', { name: 'Zwischenschritt speichern' }).click();
  await expect(page.getByText('Schritt 0 lokal gespeichert.')).toBeVisible();
  await page.reload();
  const firstUnionState = unionFindStates[0]?.[0] ?? '';
  await expect(page.getByLabel('Mengen, Repräsentanten und Listenreihenfolge')).toHaveValue(
    firstUnionState,
  );

  for (let index = 1; index < unionFindStates.length; index += 1) {
    await page.getByRole('button', { name: 'Weiter' }).focus();
    await page.keyboard.press('Enter');
    await fillUnionCheckpoint(page, index);
  }
  await page.getByRole('button', { name: 'Versuch abgeben' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Jetzt bewerten' }).click();
  await expect(page.getByRole('heading', { name: '12 von 12 Punkten' })).toBeVisible();
  await expect(page.getByText(/Weighted Union/)).toBeVisible();

  const resultUrl = page.url();
  await waitForServiceWorkerControl(page);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: '12 von 12 Punkten' })).toBeVisible();
  expect(page.url()).toBe(resultUrl);
  await context.setOffline(false);
});

test('vollständiger Schleifeninvarianten-Beweispfad mit Bewertung', async ({ page }) => {
  await page.goto('./trainer/beweise/trainer-schleifeninvariante-summe-v1');
  await expect(
    page.getByRole('heading', { name: /Schleifeninvariante.*gewichtete Summe/u }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Beweisversuch beginnen' }).click();
  await expect(
    page.getByRole('heading', { name: 'Schleifeninvariantenbeweis aktiv eingeben' }),
  ).toBeFocused();

  await page.getByLabel('Akkumulatorvariable').fill('s');
  await page.getByLabel('Wirkung einer Iteration').fill('s wird um i*A[i] erhöht');
  await page.getByLabel('Anzahl Iterationen').fill('n');
  await page.getByLabel('Wert nach 0 Iterationen').fill('0');
  await page.getByLabel('Wert nach 1 Iteration').fill('1*A[1]');
  await page.getByLabel('Wert nach 2 Iterationen').fill('1*A[1]+2*A[2]');
  await page.getByLabel('Erwarteter Rückgabewert').fill('sum(j,1,n,j*A[j])');
  await page.getByLabel('Eingabebereich').fill('A=[a_1,...,a_n], n>=1, a_i in N');
  await page.getByLabel('Rückgabevariable').fill('s');
  await page.getByLabel('Rückgabeformel').fill('sum(j,1,n,j*A[j])');
  await page.getByLabel('Quantor').fill('für jede zulässige Eingabe');
  await page.getByLabel('Randfälle').fill('n>=1');
  await page.getByLabel('Variable', { exact: true }).fill('s');
  await page.getByLabel('Index', { exact: true }).nth(0).fill('i');
  await page.getByLabel('Bereich', { exact: true }).nth(0).fill('1<=i<=n+1');
  await page.locator('select').selectOption('before_iteration_i');
  await page.getByLabel('Invariantenformel').fill('sum(j,1,i-1,j*A[j])');
  await page.getByLabel('Startindex').fill('1');
  await page.getByLabel('Zustand vor erster Iteration').fill('vor Iteration 1');
  await page.getByLabel('Initialisierter Wert').fill('s=0');
  await page.getByLabel('Eingesetzte Formel').fill('sum(j,1,0,j*A[j])');
  await page.getByLabel('Schlussfolgerung').fill('Die leere Summe ist 0, also gilt S(1).');
  await page.getByLabel('Index', { exact: true }).nth(1).fill('i');
  await page.getByLabel('Bereich', { exact: true }).nth(1).fill('1<=i<n+1');
  await page.getByLabel('Gleichung').fill('s=sum(j,1,i-1,j*A[j])');
  await page.getByLabel('Zeitpunkt').nth(1).fill('zu Beginn von Iteration i');
  await page.getByLabel('Vorher').fill('s=sum(j,1,i-1,j*A[j])');
  await page.getByLabel('Schleifenrumpf eingesetzt').fill('s_neu=s+i*A[i]');
  await page
    .getByLabel('Algebraischer Schritt')
    .fill('sum(j,1,i-1,j*A[j])+i*A[i]=sum(j,1,i,j*A[j])');
  await page.getByLabel('Ziel nach Iteration').fill('s=sum(j,1,i,j*A[j])');
  await page.getByLabel('Schleife endet wann?').fill('nach i=n');
  await page.getByLabel('Nächster hypothetischer Index').fill('n+1');
  await page.getByLabel('Invariante eingesetzt').fill('s=sum(j,1,n,j*A[j])');
  await page.getByLabel('Rückgabewert', { exact: true }).fill('sum(j,1,n,j*A[j])');
  await page
    .getByLabel('Invariante zu Rückgabe')
    .fill('Nach Terminierung gilt die Invariante für i=n+1.');
  await page.getByLabel('Rückgabezeile').fill('Zeile 4 gibt return s zurück.');
  await page
    .getByLabel('Behauptung wieder erreicht')
    .fill('Der Algorithmus gibt sum(j,1,n,j*A[j]) zurück.');

  await page.getByRole('button', { name: 'Beweis abgeben' }).click();
  await page.getByRole('button', { name: 'Jetzt bewerten' }).click();
  await expect(page.getByRole('heading', { name: '16 von 16 Punkten' })).toBeVisible();
});

test('vollständiger DP-Entwurfspfad mit deterministischer Bewertung', async ({ page }) => {
  await page.goto('./trainer/entwurf/dp/trainer-dp-entwurf-mine-v1');
  await expect(page.getByRole('heading', { name: /DP-Entwurfstrainer: Mine/u })).toBeVisible();
  await page.getByRole('radio', { name: /Prüfungsmodus/u }).check();
  await page.getByRole('button', { name: 'DP-Entwurfsversuch beginnen' }).click();
  await expect(page.getByRole('heading', { name: 'DP-Entwurf aktiv ausarbeiten' })).toBeVisible();

  await fillCanonicalDpDesign(page);
  await page.getByRole('button', { name: 'Versuch abgeben' }).click();
  await expect(page.getByRole('heading', { name: '54/54 Punkte' })).toBeVisible();
  await expect(page.getByText('Umgerechnet auf Aufgabe 8: 8/8 Punkte')).toBeVisible();
});

test('vollständiger Divide-and-Conquer-Entwurfspfad mit deterministischer Bewertung', async ({
  page,
}) => {
  await page.goto('./trainer/entwurf/divide-and-conquer/trainer-dc-entwurf-maxwertdifferenz-v1');
  await expect(
    page.getByRole('heading', { name: 'Divide-and-Conquer-Entwurf: maximale Wertdifferenz' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'D&C-Entwurfsversuch beginnen' }).click();
  await expect(
    page.getByRole('heading', { name: 'Divide-and-Conquer-Entwurf aktiv ausarbeiten' }),
  ).toBeVisible();
  await fillCanonicalDivideConquerDesign(page);
  await page.getByRole('button', { name: 'Versuch abgeben' }).click();
  await expect(page.getByRole('heading', { name: '48/48 Punkte' })).toBeVisible();
  await expect(page.getByText('Umgerechnet auf Aufgabe 7: 8/8 Punkte')).toBeVisible();
});

test('vollständiger Floyd-Warshall-Graphpfad mit deterministischer Bewertung', async ({ page }) => {
  await page.goto('./trainer/graphen/floyd-warshall/trainer-graph-floyd-warshall-v1');
  await expect(
    page.getByRole('heading', { name: 'Graph-Trainer: Floyd-Warshall-Matrixfolge' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Floyd-Warshall-Versuch beginnen' }).click();
  await expect(
    page.getByRole('heading', { name: 'Floyd-Warshall aktiv tabellieren' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Kanonische Lösung übernehmen' }).click();
  await page.getByRole('button', { name: 'Versuch abgeben' }).click();
  await expect(page.getByRole('heading', { name: '40/40 Punkte' })).toBeVisible();
});
