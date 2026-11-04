import { test, expect } from './fixtures';

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
    await expect(nav.getByRole('link')).toHaveCount(8);
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
