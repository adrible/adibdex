import { test, expect, entries } from './fixtures';
import { CHANGELOG } from '../src/lib/version';

const cards = (page: import('@playwright/test').Page) =>
  page.locator('main a.group[href^="/pokemon/"]');
const search = (page: import('@playwright/test').Page) =>
  page.getByRole('searchbox', { name: 'Buscar Pokémon por nome, número, habilidade ou ataque' });
const resource = (name: string, kind: string, id = 1) => ({
  name,
  url: `https://pokeapi.co/api/v2/${kind}/${id}/`,
});
const condition = {
  min_level: null,
  trigger: resource('level-up', 'evolution-trigger'),
  item: null,
  held_item: null,
  min_happiness: null,
  time_of_day: '',
  known_move: null,
  known_move_type: null,
  location: null,
  min_affection: null,
  needs_overworld_rain: false,
  turn_upside_down: false,
};

test('hidden ability search works across the entire generation and survives detail return', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/generation/1');
  await expect(cards(page)).toHaveCount(50);
  await search(page).fill('SOLAR POWER');
  const expected = entries.filter(
    (p) =>
      p.category === 'base' && p.id <= 151 && p.abilities.some((a) => a.name === 'solar-power'),
  );
  await expect(cards(page)).toHaveCount(expected.length);
  expect(expected.length).toBeGreaterThan(0);
  expect(requests.filter((url) => url.includes('pokeapi.co/api/'))).toHaveLength(0);
  await cards(page).first().click();
  await page.getByRole('button', { name: 'Voltar à lista' }).click();
  await expect(search(page)).toHaveValue('SOLAR POWER');
  await expect(cards(page)).toHaveCount(expected.length);
});

for (const [path, categories] of [
  ['/national', ['base', 'regional']],
  ['/regional-forms', ['regional']],
  ['/mega', ['mega']],
  ['/gmax', ['gmax']],
] as const) {
  test(`ability search is available in ${path}`, async ({ page }) => {
    const source = entries.filter((p) => (categories as readonly string[]).includes(p.category));
    const ability = source.flatMap((p) => p.abilities)[0]?.name;
    // Some special forms legitimately have no abilities in the upstream data.
    const query = ability ?? 'nonexistent-ability';
    const expected = source.filter(
      (p) => p.abilities.some((a) => a.name.includes(query)) || p.name.includes(query),
    );
    await page.goto(path);
    await search(page).fill(query.replace(/-/g, ' ').toUpperCase());
    await expect(cards(page)).toHaveCount(Math.min(expected.length, 50));
    if (expected.length === 0)
      await expect(page.getByText('Nenhum Pokémon encontrado.')).toBeVisible();
    else {
      const hrefs = await cards(page).evaluateAll((links) =>
        links.map((a) => a.getAttribute('href')),
      );
      expect(hrefs.every((href) => expected.some((p) => href === `/pokemon/${p.id}`))).toBe(true);
    }
  });
}

test('learned attack search finds Pokémon beyond the first page and survives detail return', async ({
  page,
}) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.goto('/generation/1');
  await expect(cards(page)).toHaveCount(50);
  await search(page).fill('  THÚNDERBOLT  ');
  const lapras = page.locator('main a.group[href="/pokemon/131"]');
  await expect(lapras).toBeVisible();
  await expect(
    lapras
      .getByLabel('Jogos em que aprende o ataque pesquisado')
      .getByText('Red / Blue', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('main a.group[href="/pokemon/129"]')).toHaveCount(0);
  const expected = entries.filter(
    (p) => p.category === 'base' && p.id <= 151 && p.moves.includes('thunderbolt'),
  );
  await expect(cards(page)).toHaveCount(expected.length);
  expect(requests.filter((url) => url.includes('pokeapi.co/api/'))).toHaveLength(0);
  await page.locator('main a.group[href="/pokemon/131"]').click();
  await page.getByRole('button', { name: 'Voltar à lista' }).click();
  await expect(search(page)).toHaveValue('  THÚNDERBOLT  ');
  await expect(cards(page)).toHaveCount(expected.length);
  await search(page).fill('attack-that-does-not-exist');
  await expect(page.getByText('Nenhum Pokémon encontrado.')).toBeVisible();
});

test('home changelog shows the release, actual catalog metadata and history', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ver novidades da versão' }).click();
  const changelog = page.getByRole('region', { name: 'Novidades' });
  await expect(changelog.getByText(`v${CHANGELOG[0].version}`, { exact: true })).toBeVisible();
  await expect(changelog.getByRole('button', { name: 'Ver alterações' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(changelog.getByText(/Dados conferidos em/)).toBeHidden();
  await changelog.screenshot({ path: testInfo.outputPath('changelog-compact.png') });
  await changelog.getByRole('button', { name: 'Ver alterações' }).click();
  await expect(changelog.getByText(/Dados conferidos em/)).toContainText(
    `${entries.length.toLocaleString('pt-BR')} registros`,
  );
  await expect(changelog.getByRole('link', { name: 'Consultar fonte oficial' })).toHaveAttribute(
    'href',
    /^https:\/\/github.com\/PokeAPI\/pokeapi\/tree\/[a-f0-9]{40}/,
  );
  await changelog.getByText('Versões anteriores', { exact: true }).click();
  await expect(changelog.getByRole('heading', { name: /v0.8.0/ })).toBeVisible();
  await changelog.screenshot({ path: testInfo.outputPath('changelog.png') });
  await changelog.getByRole('button', { name: 'Fechar' }).click();
  await expect(changelog.getByText(/Dados conferidos em/)).toBeHidden();
});

test('three-stage evolution is linked, highlights the current Pokémon and separates transformations', async ({
  page,
}, testInfo) => {
  const node = (id: number, level: number | null) => ({
    species: resource(entries.find((p) => p.id === id)!.name, 'pokemon-species', id),
    evolution_details: level ? [{ ...condition, min_level: level }] : [],
    evolves_to: [],
  });
  await page.route('**/api/v2/evolution-chain/2*', (route) =>
    route.fulfill({
      json: {
        chain: { ...node(1, null), evolves_to: [{ ...node(2, 16), evolves_to: [node(3, 32)] }] },
      },
    }),
  );
  await page.goto('/pokemon/2');
  const panel = page.getByRole('region', { name: 'Linha Evolutiva' });
  await expect(panel.getByRole('link', { name: /ivysaur/ })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(panel.getByText('Nível 16', { exact: true })).toBeVisible();
  await expect(panel.getByText('Evolui de bulbasaur', { exact: true })).toBeVisible();
  await expect(panel.getByRole('region', { name: 'Mega e Primal', exact: true })).toHaveCount(0);
  await panel.screenshot({
    path: testInfo.outputPath('evolution-desktop.png'),
    style: 'header { visibility: hidden; }',
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(panel.getByText('Nível 32', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await panel.screenshot({
    path: testInfo.outputPath('evolution-mobile.png'),
    style: 'header { visibility: hidden; }',
  });
  await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(panel.locator('.evolution-artwork').first()).toHaveCSS('transition-duration', '0s');
  await panel.screenshot({
    path: testInfo.outputPath('evolution-dark-mobile.png'),
    style: 'header { visibility: hidden; }',
  });
  await panel.locator('a.evolution-card[href="/pokemon/3"]').click();
  await expect(page).toHaveURL(/\/pokemon\/3$/);
  await expect(panel.getByRole('region', { name: 'Mega e Primal', exact: true })).toBeVisible();
});

test('branching evolutions show every alternative condition on mobile', async ({
  page,
}, testInfo) => {
  const children = [134, 135, 136, 196, 197, 470, 471, 700].map((id) => ({
    species: resource(entries.find((p) => p.id === id)!.name, 'pokemon-species', id),
    evolution_details:
      id === 470
        ? [
            { ...condition, min_level: 1, location: resource('eterna-forest', 'location') },
            {
              ...condition,
              trigger: resource('use-item', 'evolution-trigger'),
              item: resource('leaf-stone', 'item'),
            },
          ]
        : [{ ...condition, min_happiness: 160 }],
    evolves_to: [],
  }));
  await page.route('**/api/v2/evolution-chain/133*', (route) =>
    route.fulfill({
      json: {
        chain: {
          species: resource('eevee', 'pokemon-species', 133),
          evolution_details: [],
          evolves_to: children,
        },
      },
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pokemon/133');
  const panel = page.getByRole('region', { name: 'Linha Evolutiva' });
  await expect(panel.getByText('Evolui de eevee', { exact: true })).toHaveCount(8);
  await expect(panel.getByText('8 evoluções possíveis de eevee', { exact: true })).toBeVisible();
  await expect(panel.locator('[data-layout="branched"]')).toHaveCount(1);
  await expect(panel.locator('.evolution-tree-children--many > .evolution-tree-node')).toHaveCount(
    8,
  );
  await panel.getByText('Ver condições (2 alternativas)', { exact: true }).click();
  await expect(panel.getByText('leaf stone', { exact: true })).toBeVisible();
  await expect(panel.getByText('eterna forest', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await panel.screenshot({
    path: testInfo.outputPath('evolution-branches-mobile.png'),
    style: 'header { visibility: hidden; }',
  });
  await page.setViewportSize({ width: 1280, height: 900 });
  await panel.screenshot({
    path: testInfo.outputPath('evolution-branches-desktop.png'),
    style: 'header { visibility: hidden; }',
  });
});

test('changelog metadata failures offer recovery without hiding release notes', async ({
  page,
}) => {
  let failing = true;
  await page.route('**/data/catalog.json*', (route) =>
    failing ? route.fulfill({ status: 503, body: '' }) : route.continue(),
  );
  await page.goto('/');
  const changelog = page.getByRole('region', { name: 'Novidades' });
  await expect(changelog.getByText(`v${CHANGELOG[0].version}`, { exact: true })).toBeVisible();
  await changelog.getByRole('button', { name: 'Ver alterações' }).click();
  await expect(changelog.getByRole('button', { name: 'Tentar novamente' })).toBeVisible({
    timeout: 15000,
  });
  failing = false;
  await changelog.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(changelog.getByText(/Dados conferidos em/)).toBeVisible();
});

test('evolution artwork failures terminate in a readable fallback', async ({ page }) => {
  await page.route('**/sprites/pokemon/other/official-artwork/25.png', (route) =>
    route.fulfill({ status: 404, body: '' }),
  );
  await page.route('**/sprites/pokemon/25.png', (route) =>
    route.fulfill({ status: 404, body: '' }),
  );
  await page.goto('/pokemon/25');
  const root = page
    .getByRole('region', { name: 'Linha Evolutiva' })
    .locator('.evolution-stage-cards');
  await root.scrollIntoViewIfNeeded();
  await expect(root.getByText('Imagem indisponível', { exact: true })).toBeVisible();
  await expect(root.locator('img')).toHaveCount(0);
  await expect(root.getByRole('link')).toHaveAttribute('href', '/pokemon/25');
});
