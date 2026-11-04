import { test, expect, entries } from './fixtures';
import { CHANGELOG } from '../src/lib/version';

test.use({ locale: 'pt-BR' });

for (const dark of [false, true]) {
  test(`shared text styles preserve content and contrast (${dark ? 'dark' : 'light'})`, async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    if (dark) await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
    const heading = page.getByRole('heading', { name: 'Escolha sua Pokédex' });
    await expect(heading).toBeVisible();
    expect(await heading.evaluate((element) => getComputedStyle(element).fontFamily)).toContain(
      'Pixelify Sans',
    );
    await heading.locator('..').screenshot({ path: testInfo.outputPath('home-heading.png') });

    await page.goto('/national');
    const title = page.getByRole('heading', { name: 'Pokédex Nacional' });
    await expect(title).toHaveCSS('text-shadow', 'none');
    expect(await title.evaluate((element) => getComputedStyle(element).color)).not.toBe(
      'rgb(255, 255, 255)',
    );
    await expect(page.locator('.catalog-search-help')).toContainText('habilidades ocultas');
    await expect(page.locator('.catalog-search-help')).toContainText('ataque aprendido');
    await page
      .locator('.catalog-heading')
      .screenshot({ path: testInfo.outputPath('plain-catalog-heading.png') });

    await page.goto('/generation/1');
    await expect(page.getByRole('heading', { name: 'Kanto', exact: true })).toBeVisible();
    await expect(page.locator('.catalog-heading-copy')).toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
    await expect(page.locator('.home-grid-screen')).toHaveCSS('border-left-style', 'solid');
    await page
      .locator('.catalog-heading')
      .screenshot({ path: testInfo.outputPath('illustrated-catalog-heading.png') });
  });
}

test('text remains readable on narrow screens and detail controls still work', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/pokemon/1');
  const title = page.getByRole('heading', { name: 'bulbasaur', exact: true });
  await expect(title).toHaveClass(/pokedex-name/);
  await expect(page.locator('.pokedex-measurements dd')).toHaveText(['0,7 m', '6,9 kg']);
  await expect(page.getByRole('heading', { name: 'Habilidades', exact: true })).toHaveClass(
    /section-title/,
  );
  await expect(page.getByRole('heading', { name: 'overgrow', exact: true })).toBeVisible();
  await expect(page.locator('.detail-ability .text-support')).toContainText('Ability description.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page
    .locator('.detail-ability')
    .screenshot({ path: testInfo.outputPath('ability-text-mobile.png') });
  await expect(page.locator('footer .footer-version')).toHaveText(`v${CHANGELOG[0].version}`);
  await expect(page.getByRole('button', { name: 'Informações da versão' })).toHaveCount(0);
});

test('long Pokémon names wrap instead of being truncated', async ({ page }, testInfo) => {
  const longest = entries
    .filter((p) => p.category === 'mega')
    .sort((a, b) => b.name.length - a.name.length)[0];
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/mega');
  await page.getByRole('searchbox').fill(longest.name);
  const card = page.locator(`main a.group[href="/pokemon/${longest.id}"]`);
  const name = card.locator('h3');
  await expect(name).toHaveText(longest.name.replace(/-/g, ' '));
  await expect(name).toHaveCSS('white-space', 'normal');
  await expect(name).toHaveCSS('text-overflow', 'clip');
  expect(await name.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await card.screenshot({ path: testInfo.outputPath('long-name-mobile.png') });
  await card.click();
  await expect(page.locator('main h2')).toHaveText(longest.name.replace(/-/g, ' '));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
