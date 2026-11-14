import { test, expect, entries, pokemonFixture } from './fixtures';

const cards = (page: import('@playwright/test').Page) =>
  page.locator('main a.group[href^="/pokemon/"]');

test('generation search finds entries beyond the first fifty without per-Pokémon requests', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/generation/1');
  await expect(cards(page)).toHaveCount(50);
  await page
    .getByRole('searchbox', { name: 'Buscar Pokémon por nome, número, habilidade ou ataque' })
    .fill('mewtwo');
  await expect(cards(page)).toHaveCount(1);
  await expect(cards(page).first()).toHaveAttribute('href', '/pokemon/150');
  expect(requests.filter((url) => url.includes('pokeapi.co/api/'))).toHaveLength(0);
  expect(requests.filter((url) => url.includes('/data/catalog.json'))).toHaveLength(1);
});

test('saved national pagination survives a delayed initial catalog and reload', async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('pokedex-view-v3-national'))
      sessionStorage.setItem('pokedex-view-v3-national', JSON.stringify({ page: 3 }));
  });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/data/catalog.json*', async (route) => {
    await gate;
    await route.continue();
  });
  await page.goto('/national');
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(sessionStorage.getItem('pokedex-view-v3-national')!).page),
    )
    .toBe(3);
  release();
  await expect(page.getByRole('textbox', { name: 'Número da página' }).first()).toHaveAttribute(
    'placeholder',
    '4',
  );
  const first = await cards(page).first().getAttribute('href');
  await page.reload();
  await expect(cards(page).first()).toHaveAttribute('href', first!);
  await expect(page.getByRole('textbox', { name: 'Número da página' }).first()).toHaveAttribute(
    'placeholder',
    '4',
  );
});

test('filters, search, shiny and page survive detail navigation and return', async ({ page }) => {
  await page.goto('/generation/1');
  await expect(cards(page)).toHaveCount(50);
  await page.getByRole('button', { name: 'Shiny', exact: true }).click();
  await page.getByRole('button', { name: 'Filtros' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Número Nacional' }).click();
  await dialog.getByRole('button', { name: 'Aplicar Filtros' }).click();
  await page.getByRole('button', { name: 'Próxima página' }).first().click();
  const selected = await cards(page).first().getAttribute('href');
  await cards(page).first().click();
  await expect(page).toHaveURL(new RegExp(`${selected}$`));
  await page.getByRole('link', { name: 'Próximo Pokémon', exact: true }).click();
  await page.getByRole('button', { name: 'Voltar à lista' }).click();
  await expect(page).toHaveURL(/\/generation\/1$/);
  await expect(cards(page).first()).toHaveAttribute('href', selected!);
  await expect(page.getByRole('button', { name: 'Shiny', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('textbox', { name: 'Número da página' }).first()).toHaveAttribute(
    'placeholder',
    '2',
  );
  await expect(page.getByText('Ordem:', { exact: false })).toBeVisible();
});

test('national catalog with a trailing slash remains the return target', async ({ page }) => {
  await page.goto('/national/');
  await expect(cards(page)).toHaveCount(50);
  await page.getByRole('button', { name: 'Próxima página' }).first().click();
  const selected = await cards(page).first().getAttribute('href');
  await cards(page).first().click();
  await expect(page).toHaveURL(new RegExp(`${selected}/?$`));
  await page.getByRole('link', { name: 'Próximo Pokémon', exact: true }).click();
  await page.getByRole('button', { name: 'Voltar à lista' }).click();
  await expect(page).toHaveURL(/\/national\/?$/);
  await expect(cards(page).first()).toHaveAttribute('href', selected!);
});

for (const origin of ['/national', '/generation/1']) {
  test(`section navigation preserves the ${origin} return path`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(origin);
    await expect(cards(page)).toHaveCount(50);
    await cards(page).first().click();
    const sections = page.getByRole('navigation', { name: 'Seções do Pokémon' });
    await sections.getByRole('link', { name: 'Defesa' }).click();
    await expect(page).toHaveURL(/\/pokemon\/1#fraquezas$/);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await sections.getByRole('link', { name: 'Ataques' }).click();
    await expect(page).toHaveURL(/\/pokemon\/1#ataques$/);
    await page.reload();
    await page.getByRole('button', { name: 'Voltar à lista' }).click();
    await expect(page).toHaveURL(new RegExp(`${origin}$`));
  });
}

test('catalog errors expose retry and recover without retaining partial results', async ({
  page,
}) => {
  let failing = true;
  await page.route('**/data/catalog.json*', (route) =>
    failing ? route.fulfill({ status: 503, body: 'unavailable' }) : route.continue(),
  );
  await page.goto('/national');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible({
    timeout: 15000,
  });
  await expect(cards(page)).toHaveCount(0);
  failing = false;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(cards(page)).toHaveCount(50);
});

test('blocked browser storage does not crash the app', async ({ page }) => {
  await page.addInitScript(() => {
    for (const property of ['sessionStorage', 'localStorage'])
      Object.defineProperty(window, property, {
        get() {
          throw new DOMException('Blocked', 'SecurityError');
        },
      });
  });
  await page.goto('/national');
  await expect(cards(page)).toHaveCount(50);
  await page.getByRole('button', { name: 'Próxima página' }).first().click();
  await expect(page.getByRole('textbox', { name: 'Número da página' }).first()).toHaveAttribute(
    'placeholder',
    '2',
  );
});

test('regional pagination is persisted after next-page clicks', async ({ page }) => {
  await page.goto('/regional-forms');
  await page.getByRole('button', { name: 'Próxima página' }).click();
  const first = await cards(page).first().getAttribute('href');
  await page.reload();
  await expect(cards(page).first()).toHaveAttribute('href', first!);
  await expect(page.getByRole('textbox', { name: 'Número da página' })).toHaveAttribute(
    'placeholder',
    '2',
  );
});

test('changing catalog routes does not carry another scope’s state', async ({ page }) => {
  await page.goto('/mega');
  await page.getByRole('button', { name: 'Shiny', exact: true }).click();
  await page.getByRole('link', { name: 'Voltar ao início', exact: true }).click();
  await page.locator('a[href="/gmax"]').click();
  await expect(page.getByRole('button', { name: 'Shiny', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('link', { name: 'Voltar ao início', exact: true }).click();
  await page.locator('a[href="/mega"]').click();
  await expect(page.getByRole('button', { name: 'Shiny', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('rapid next/back navigation does not display a stale detail response', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/v2/pokemon/2', async (route) => {
    await gate;
    await route.fulfill({ json: pokemonFixture(2) });
  });
  await page.goto('/pokemon/1');
  await page.getByRole('link', { name: 'Próximo Pokémon', exact: true }).click();
  await page.goto('/pokemon/3');
  await expect(page.locator('h2')).toContainText('venusaur');
  release();
  await expect(page.locator('h2')).toContainText('venusaur');
  await expect(page).toHaveURL(/\/pokemon\/3$/);
});

test('invalid detail IDs fail locally and HTTP errors can be retried', async ({ page }) => {
  await page.goto('/pokemon/invalid');
  await expect(page.getByText('Identificador inválido')).toBeVisible();
  let failing = true;
  await page.route('**/api/v2/pokemon/25', (route) =>
    failing
      ? route.fulfill({ status: 500, body: '' })
      : route.fulfill({ json: pokemonFixture(25) }),
  );
  await page.goto('/pokemon/25');
  await expect(page.getByRole('button', { name: 'Tentar novamente' }).first()).toBeVisible({
    timeout: 15000,
  });
  failing = false;
  await page.getByRole('button', { name: 'Tentar novamente' }).first().click();
  await expect(page.locator('h2')).toContainText('pikachu');
});

test('mobile keyboard interaction opens, applies and closes filters', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/national');
  await expect(cards(page)).toHaveCount(50);
  await page.getByRole('button', { name: 'Filtros' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Básico', exact: true }).click();
  await page.getByRole('button', { name: 'Aplicar Filtros' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const hrefs = await cards(page).evaluateAll((links) => links.map((a) => a.getAttribute('href')));
  expect(hrefs.every((href) => entries.some((p) => `/pokemon/${p.id}` === href))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
