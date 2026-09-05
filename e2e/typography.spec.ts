import { test, expect, entries } from './fixtures';

for (const dark of [false, true]) {
  test(`shared text styles preserve content and contrast (${dark ? 'dark' : 'light'})`, async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    if (dark) await page.getByRole('button', { name: 'Ativar tema escuro' }).click();
    const heading = page.getByRole('heading', { name: 'Todas as Regiões' });
    await expect(heading).toHaveClass(/site-display/);
    await expect(heading.locator('.text-accent-word')).toHaveText('Regiões');
    await heading.locator('..').screenshot({ path: testInfo.outputPath('home-heading.png') });

    await page.goto('/national');
    const title = page.getByRole('heading', { name: 'Pokédex Nacional' });
    await expect(title).toHaveCSS('text-shadow', 'none');
    expect(await title.evaluate((element) => getComputedStyle(element).color)).not.toBe(
      'rgb(255, 255, 255)',
    );
    await expect(page.locator('.catalog-search-help strong')).toHaveText([
      'habilidade',
      'habilidades ocultas',
    ]);
    await page
      .locator('.catalog-heading')
      .screenshot({ path: testInfo.outputPath('plain-catalog-heading.png') });

    await page.goto('/generation/1');
    await expect(page.getByRole('heading', { name: 'Kanto', exact: true })).toHaveCSS(
      'color',
      'rgb(255, 255, 255)',
    );
    await expect(page.locator('.catalog-heading-copy')).toHaveCSS(
      'background-color',
      'rgba(16, 19, 24, 0.76)',
    );
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
  await expect(title).toHaveClass(/site-display/);
  await expect(page.locator('.metric-value')).toHaveText(['0.7 m', '6.9 kg']);
  await expect(page.getByRole('heading', { name: 'Habilidades', exact: true })).toHaveClass(
    /section-title/,
  );
  await page.getByRole('button', { name: 'overgrow', exact: true }).click();
  await expect(page.locator('.ability-description')).toContainText('Ability description.');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page
    .locator('.ability-label')
    .locator('../..')
    .screenshot({ path: testInfo.outputPath('ability-text-mobile.png') });
  await page.getByRole('button', { name: 'Informações da versão' }).click();
  await expect(page.locator('footer ul')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('footer ul')).toHaveCount(0);
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
