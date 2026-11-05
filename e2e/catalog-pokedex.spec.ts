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

test('selected Paginated and All buttons keep readable text', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/generation/1');
  const paginated = page.getByRole('button', { name: 'Paginado', exact: true });
  const all = page.getByRole('button', { name: 'Todos', exact: true });
  await expect(paginated).toHaveAttribute('aria-pressed', 'true');
  await expect(paginated).toHaveCSS('color', 'rgb(255, 255, 255)');
  await all.click();
  await expect(all).toHaveAttribute('aria-pressed', 'true');
  await expect(all).toHaveCSS('color', 'rgb(255, 255, 255)');
  await paginated.click();
  await expect(paginated).toHaveCSS('color', 'rgb(255, 255, 255)');
});

for (const dark of [false, true]) {
  test(`filter sheet matches the Pokédex and stays readable (${dark ? 'dark' : 'light'})`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/national');
    if (dark) await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
    const screenColor = await page
      .locator('.home-grid-screen')
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    await page.getByRole('button', { name: 'Filtros', exact: true }).click();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toHaveClass(/pokedex-filters/);
    await expect(sheet).toHaveCSS('background-color', screenColor);
    await expect(sheet.getByRole('heading', { name: 'Filtros e Ordenação' })).toHaveCSS(
      'color',
      'rgb(255, 255, 255)',
    );
    await expect(sheet.getByRole('button', { name: 'Um', exact: true })).toHaveCSS(
      'color',
      'rgb(255, 255, 255)',
    );
    await expect(sheet.getByRole('button', { name: 'Aplicar Filtros' })).toBeVisible();
    await expect(sheet.getByRole('button', { name: 'Limpar', exact: true })).toBeVisible();
    await expect(sheet.getByRole('button', { name: 'Fechar', exact: true })).toBeVisible();
    expect(await sheet.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await page.screenshot({ path: info.outputPath('filters-mobile.png') });
    await sheet.getByRole('button', { name: 'Fechar', exact: true }).click();
    await expect(sheet).toHaveCount(0);
  });
}
