import { test, expect, pokemonFixture } from './fixtures';

test.use({ locale: 'pt-BR' });

for (const width of [320, 390, 768, 1280]) {
  test(`Pokédex fits ${width}px and keeps all record sections reachable`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/pokemon/1');
    await expect(page.locator('.pokedex-name')).toHaveText('bulbasaur');
    await expect(page.locator('.pokedex-measurements dd')).toHaveText(['0,7 m', '6,9 kg']);
    const nav = page.getByRole('navigation', { name: 'Seções do Pokémon' });
    await expect(nav.getByRole('link')).toHaveCount(6);
    for (const link of await nav.getByRole('link').all()) {
      const href = await link.getAttribute('href');
      await expect(page.locator(href!)).toHaveCount(1);
      const box = await link.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(40);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: info.outputPath(`pokedex-${width}.png`), fullPage: true });
  });
}

test('Pokédex keeps shiny, navigation, species details and game entries functional', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pokemon/1');
  const shiny = page.getByRole('button', { name: 'Shiny', exact: true });
  await expect(shiny).toHaveAttribute('aria-pressed', 'false');
  await shiny.click();
  await expect(shiny).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: 'Próximo Pokémon', exact: true }).click();
  await expect(page.locator('.pokedex-name')).toHaveText('ivysaur');
  await page.getByRole('link', { name: 'Pokédex', exact: true }).click();
  await expect(page).toHaveURL(/#entradas-pokedex$/);
  await expect(page.locator('#entradas-pokedex details')).not.toHaveAttribute('open', '');
  await page.locator('#entradas-pokedex summary').click();
  await expect(page.locator('#entradas-pokedex details')).toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'Voltar à lista', exact: true }).click();
  await expect(page).toHaveURL(/\/generation\/1$/);
});

test('locations can be collapsed and reopened with keyboard navigation', async ({ page }) => {
  await page.goto('/pokemon/1');
  const disclosure = page.locator('#localizacoes details');
  const summary = disclosure.locator('summary');
  const body = page.locator('.pokedex-locations-body');
  await expect(body).toBeVisible();
  await summary.click();
  await expect(body).toBeHidden();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(body).toBeVisible();
});

for (const width of [390, 1280]) {
  test(`blue record panels match the home grid at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const home = await page.locator('.home-grid-screen').evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.backgroundColor, style.backgroundImage, style.backgroundSize];
    });
    await page.goto('/pokemon/1');
    await expect(page.locator('.pokedex-name')).toBeVisible();
    for (const selector of [
      '.detail-hero',
      '.pokedex-instruments',
      '#evolucoes > .evolution-panel',
    ]) {
      const panel = page.locator(selector);
      await expect(panel).toBeAttached();
      expect(
        await panel.evaluate((element) => {
          const style = getComputedStyle(element);
          return [style.backgroundColor, style.backgroundImage, style.backgroundSize];
        }),
      ).toEqual(home);
      expect(await panel.evaluate((element) => getComputedStyle(element).color)).toBe(
        'rgb(12, 30, 55)',
      );
    }
  });
}

test('Stats combines the two panels and hides Forms for species without alternatives', async ({
  page,
}) => {
  await page.goto('/pokemon/1');
  const nav = page.getByRole('navigation', { name: 'Seções do Pokémon' });
  await nav.getByRole('link', { name: 'Stats', exact: true }).click();
  await expect(page).toHaveURL(/#stats$/);
  await expect(page.locator('#stats #atributos')).toBeVisible();
  await expect(page.locator('#stats #habilidades')).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Formas', exact: true })).toHaveCount(0);
  await expect(page.locator('#formas')).toHaveCount(0);
  await expect(page.locator('.detail-ability')).toContainText('Texto original em inglês');
});

test('Forms remains reachable for Pokémon with alternatives', async ({ page }) => {
  await page.route('https://pokeapi.co/api/v2/pokemon/10008', (route) =>
    route.fulfill({ json: { ...pokemonFixture(479), id: 10008, name: 'rotom-heat' } }),
  );
  await page.route('https://pokeapi.co/api/v2/pokemon-species/479', (route) =>
    route.fulfill({
      json: {
        name: 'rotom',
        evolves_from_species: null,
        evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/479/' },
        varieties: [
          {
            is_default: true,
            pokemon: { name: 'rotom', url: 'https://pokeapi.co/api/v2/pokemon/479/' },
          },
          {
            is_default: false,
            pokemon: { name: 'rotom-heat', url: 'https://pokeapi.co/api/v2/pokemon/10008/' },
          },
        ],
      },
    }),
  );
  await page.goto('/pokemon/479');
  await page
    .getByRole('navigation', { name: 'Seções do Pokémon' })
    .getByRole('link', { name: 'Formas', exact: true })
    .click();
  await expect(page.locator('#formas')).toBeVisible();
  await expect(page.locator('#formas')).toContainText('Calor');
});

test('capture data has a light surface and readable labels', async ({ page }) => {
  await page.route('https://pokeapi.co/api/v2/pokemon-species/1', (route) =>
    route.fulfill({
      json: {
        name: 'bulbasaur',
        evolves_from_species: null,
        evolution_chain: { url: 'https://pokeapi.co/api/v2/evolution-chain/1/' },
        varieties: [],
        capture_rate: 45,
        gender_rate: 1,
        hatch_counter: 20,
      },
    }),
  );
  await page.goto('/pokemon/1');
  await page.getByText('Dados de captura e reprodução', { exact: true }).click();
  const facts = page.locator('.species-profile-facts');
  await expect(facts).toBeVisible();
  await expect(facts).toContainText('45/255');
  const colors = await facts.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    value: getComputedStyle(element.querySelector('strong')!).color,
  }));
  expect(colors.background).toBe('rgb(206, 230, 243)');
  expect(colors.value).toBe('rgb(12, 30, 55)');
});

test('English browsers use English interface labels', async ({ page }) => {
  await page.route('https://pokeapi.co/api/v2/pokemon/1/encounters', (route) =>
    route.fulfill({
      json: [
        {
          location_area: {
            name: 'pallet-town-area',
            url: 'https://pokeapi.co/api/v2/location-area/1/',
          },
          version_details: [
            {
              version: { name: 'firered', url: 'https://pokeapi.co/api/v2/version/10/' },
              max_chance: 100,
              encounter_details: [
                {
                  chance: 100,
                  min_level: 5,
                  max_level: 5,
                  method: { name: 'gift', url: 'https://pokeapi.co/api/v2/encounter-method/1/' },
                  condition_values: [],
                },
              ],
            },
          ],
        },
      ],
    }),
  );
  await page.addInitScript(() => Object.defineProperty(navigator, 'language', { value: 'en-US' }));
  await page.goto('/pokemon/1');
  await expect(page.getByRole('heading', { name: 'Abilities', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Pokémon sections' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Locations', exact: true })).toBeVisible();
  await expect(page.locator('.detail-ability')).not.toContainText('Texto original em inglês');
  await expect(page.locator('.evolution-current')).toContainText('Current');
  await expect(page.locator('#localizacoes')).toContainText('100% chance');
  await expect(page.locator('#localizacoes')).not.toContainText('de chance');
  await expect(page.locator('#localizacoes')).toContainText('FireRed');
});

for (const width of [320, 390, 1280]) {
  test(`lens offers a visible keyboard-accessible Home link at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/pokemon/1');
    const home = page.getByRole('link', { name: 'Voltar à tela inicial', exact: true });
    await expect(home).toBeVisible();
    await expect(home).toContainText('Início');
    const box = await home.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.y).toBeLessThan(100);
    const colors = await page.locator('.pokedex-page').evaluate((element) => ({
      surround: getComputedStyle(element).backgroundColor,
      screen: getComputedStyle(element.querySelector('.pokedex-screen')!).backgroundColor,
    }));
    expect(colors.surround).not.toBe(colors.screen);
    await home.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Escolha sua Pokédex' })).toBeVisible();
  });
}
