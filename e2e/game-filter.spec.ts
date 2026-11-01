import { test, expect } from './fixtures';
import { readFileSync } from 'node:fs';

const snapshot = JSON.parse(readFileSync('public/data/catalog.json', 'utf8')) as {
  gameSets: string[][];
  entries: { id: number; category: string; moves: string[]; moveGames: number[] }[];
};
test('game filter restricts the searched attack, tags and restored results', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/generation/1');
  const search = page.getByRole('searchbox');
  await search.fill('surf');
  await page.getByRole('button', { name: /^Filtros/ }).click();
  await page.getByRole('button', { name: 'Jogo Todos os jogos' }).click();
  await page.getByRole('searchbox', { name: 'Buscar jogo' }).fill('inexistente');
  await expect(page.getByText('Nenhum jogo encontrado.')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Buscar jogo' }).press('Escape');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Jogo Todos os jogos' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await page.getByRole('button', { name: 'Jogo Todos os jogos' }).click();
  await page.getByRole('searchbox', { name: 'Buscar jogo' }).fill('yellow');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Yellow', exact: true }).click();
  await page.getByRole('button', { name: 'Aplicar Filtros' }).click();
  const chip = page.getByRole('button', { name: 'Remover Jogo: Yellow' });
  await expect(chip).toBeVisible();
  const expected = snapshot.entries.filter(
    (p) =>
      p.category === 'base' &&
      p.id <= 151 &&
      p.moves.includes('surf') &&
      snapshot.gameSets[p.moveGames[p.moves.indexOf('surf')]].includes('yellow'),
  );
  const cards = page.locator('main a.group[href^="/pokemon/"]');
  await expect(cards).toHaveCount(Math.min(expected.length, 50));
  expect(expected.length).toBeGreaterThan(0);
  const tags = page.getByLabel('Jogos em que aprende o ataque pesquisado');
  await expect(tags.first().getByText('Yellow', { exact: true })).toBeVisible();
  await expect(tags.getByText('Sword / Shield', { exact: true })).toHaveCount(0);
  await cards.first().click();
  await page.getByRole('button', { name: 'Voltar à lista' }).click();
  await expect(chip).toBeVisible();
  await expect(search).toHaveValue('surf');
  await page.reload();
  await expect(chip).toBeVisible();
  await expect(cards).toHaveCount(Math.min(expected.length, 50));
  await chip.click();
  await expect(chip).toHaveCount(0);
  await expect(
    page
      .getByLabel('Jogos em que aprende o ataque pesquisado')
      .getByText('Sword / Shield', { exact: true })
      .first(),
  ).toBeVisible();
});
