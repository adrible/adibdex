import { test, expect, entries } from './fixtures';

const condition = {
  min_level: 10,
  trigger: { name: 'level-up', url: 'https://pokeapi.co/api/v2/evolution-trigger/1/' },
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
function node(id: number) {
  return {
    species: {
      name: entries.find((p) => p.id === id)!.name,
      url: `https://pokeapi.co/api/v2/pokemon-species/${id}/`,
    },
    evolution_details: [condition],
    evolves_to: [],
  };
}
const pikachuGmax = entries.find((p) => p.baseId === 25 && p.category === 'gmax')!;

for (const [id, showSpecial] of [
  [172, false],
  [25, true],
  [26, false],
  [pikachuGmax.id, true],
] as const) {
  test(`special forms belong only to the viewed species (${id})`, async ({ page }) => {
    await page.route('**/api/v2/evolution-chain/*', (route) =>
      route.fulfill({
        json: {
          chain: {
            ...node(172),
            evolution_details: [],
            evolves_to: [{ ...node(25), evolves_to: [node(26)] }],
          },
        },
      }),
    );
    await page.goto(`/pokemon/${id}`);
    const panel = page.getByRole('region', { name: 'Linha Evolutiva' });
    await expect(panel.locator('.evolution-stage-cards .evolution-card')).toHaveCount(3);
    // Type badges arrive with the catalog used to select special forms.
    await expect(panel.locator('.evolution-stage-cards .evolution-card').first()).toContainText(
      'Elétrico',
    );
    const special = panel.locator(`a[href="/pokemon/${pikachuGmax.id}"]`);
    if (showSpecial) {
      await expect(special).toBeVisible();
      if (id === pikachuGmax.id) await expect(special).toHaveAttribute('aria-current', 'page');
    } else {
      await expect(special).toHaveCount(0);
      await expect(panel.getByRole('region', { name: 'Gigantamax', exact: true })).toHaveCount(0);
    }
  });
}

test('two-way branches keep their descendants in separate paths on mobile', async ({
  page,
}, testInfo) => {
  await page.route('**/api/v2/evolution-chain/*', (route) =>
    route.fulfill({
      json: {
        chain: {
          ...node(265),
          evolution_details: [],
          evolves_to: [
            { ...node(266), evolves_to: [node(267)] },
            { ...node(268), evolves_to: [node(269)] },
          ],
        },
      },
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pokemon/265');
  const panel = page.getByRole('region', { name: 'Linha Evolutiva' });
  await expect(panel.getByText('2 evoluções possíveis de wurmple', { exact: true })).toBeVisible();
  const silcoon = panel.locator('[data-species-id="266"]');
  const cascoon = panel.locator('[data-species-id="268"]');
  await expect(silcoon.locator('a[href="/pokemon/267"]')).toHaveCount(1);
  await expect(silcoon.locator('a[href="/pokemon/269"]')).toHaveCount(0);
  await expect(cascoon.locator('a[href="/pokemon/269"]')).toHaveCount(1);
  await expect(cascoon.locator('a[href="/pokemon/267"]')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await panel.screenshot({
    path: testInfo.outputPath('wurmple-mobile.png'),
    style: 'header { visibility: hidden; }',
  });
  await silcoon.locator('a[href="/pokemon/267"]').click();
  await expect(page).toHaveURL(/\/pokemon\/267$/);
});

test('compact changelog is keyboard accessible on mobile and loads metadata only when opened', async ({
  page,
}, testInfo) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  const changelog = page.getByRole('region', { name: 'Novidades' });
  const toggle = changelog.getByRole('button', { name: 'Ver alterações' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(requests.filter((url) => url.includes('/data/catalog.json'))).toHaveLength(0);
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(changelog.getByText(/Dados conferidos em/)).toBeVisible();
  expect(requests.filter((url) => url.includes('/data/catalog.json'))).toHaveLength(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
  await changelog.screenshot({
    path: testInfo.outputPath('changelog-dark-mobile.png'),
    style: 'header { visibility: hidden; }',
  });
  await changelog.getByRole('button', { name: 'Fechar' }).click();
  await expect(changelog.getByRole('button', { name: 'Ver alterações' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});
