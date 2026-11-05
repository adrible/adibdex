import { test, expect } from './fixtures';

test.use({ locale: 'pt-BR' });
const paths = [
  '/national',
  ...Array.from({ length: 11 }, (_, i) => `/generation/${i + 1}`),
  '/regional-forms',
  '/mega',
  '/gmax',
];
for (const path of paths) {
  test(`home opens ${path}, preserves its grid on reload and opens Pokémon`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const backgrounds: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/backgrounds/')) backgrounds.push(request.url());
    });
    await page.goto('/');
    await page.locator(`.home-region-button[href="${path}"]`).click();
    await page.mouse.move(1, 1);
    await expect(page.locator('.catalog-title')).toBeVisible();
    const cards = page.locator('.catalog-pokemon-card');
    await expect(cards.first()).toBeVisible();
    const firstHref = await cards.first().getAttribute('href');
    await expect(cards.first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(cards.first()).toHaveCSS('border-radius', '3px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.reload();
    await expect(cards.first()).toHaveAttribute('href', firstHref!);
    await cards.first().click();
    await expect(page.locator('.pokedex-name')).toBeVisible();
    await page.getByRole('button', { name: 'Voltar à lista', exact: true }).click();
    await expect(cards.first()).toHaveAttribute('href', firstHref!);
    expect(backgrounds).toEqual([]);
  });
}
for (const width of [320, 1280]) {
  test(`catalog controls fit at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/generation/1');
    await expect(page.locator('.catalog-pokemon-card')).toHaveCount(50);
    await page.getByRole('searchbox').fill('mewtwo');
    await expect(page.locator('.catalog-pokemon-card')).toHaveCount(1);
    await page.getByRole('searchbox').fill('');
    await page.getByRole('button', { name: 'Próxima página', exact: true }).first().click();
    await expect(page.getByRole('textbox', { name: 'Número da página' }).first()).toHaveAttribute(
      'placeholder',
      '2',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: info.outputPath(`catalog-${width}.png`), fullPage: true });
  });
}
