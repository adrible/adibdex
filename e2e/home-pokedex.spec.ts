import { test, expect } from './fixtures';

test.use({ locale: 'pt-BR' });

for (const width of [320, 390, 1280]) {
  test(`home Pokédex has equal transparent buttons without overflow at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const cards = page.locator('.home-region-button');
    await expect(cards).toHaveCount(15);
    const national = page.locator('a.home-region-button[href="/national"]');
    await expect(national.locator('svg.national-globe')).toHaveCount(1);
    await expect(national.locator('img')).toHaveCount(0);
    await expect(page.locator('a.home-region-button[href="/generation/1"] img')).toHaveCount(3);
    await expect(page.locator('.home-card-description')).toHaveCount(0);
    const sizes = await cards.evaluateAll((elements) =>
      elements.map((element) => {
        const { width, height } = element.getBoundingClientRect();
        return { width, height, background: getComputedStyle(element).backgroundColor };
      }),
    );
    for (const size of sizes) {
      expect(Math.abs(size.width - sizes[0].width)).toBeLessThan(1);
      expect(Math.abs(size.height - sizes[0].height)).toBeLessThan(1);
      expect(size.background).toBe('rgba(0, 0, 0, 0)');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: info.outputPath(`home-${width}.png`), fullPage: true });
  });
}

test('home navigation and readable typography carry into catalogs and Pokémon records', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('a.home-region-button[href="/national"]').click();
  await expect(page).toHaveURL(/\/national$/);
  await expect(page.getByRole('heading', { name: 'Pokédex Nacional' })).toBeVisible();
  expect(
    await page.locator('body').evaluate((element) => getComputedStyle(element).fontFamily),
  ).toContain('Chakra Petch');
  await page.goto('/');
  await page.locator('a.home-region-button[href="/generation/1"]').click();
  await expect(page).toHaveURL(/\/generation\/1$/);
  await page.goto('/pokemon/1');
  await expect(page.locator('.pokedex-name')).toHaveText('bulbasaur');
  expect(
    await page.locator('.pokedex-page').evaluate((element) => getComputedStyle(element).fontFamily),
  ).toContain('Chakra Petch');
});
