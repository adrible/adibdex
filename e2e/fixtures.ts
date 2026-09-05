import { readFileSync } from 'node:fs';
import { test as base, expect, type Page } from '@playwright/test';

interface Entry {
  id: number;
  baseId: number;
  name: string;
  types: string[];
  height: number;
  weight: number;
  stats: Record<string, number>;
}
export const entries: Entry[] = JSON.parse(
  readFileSync('public/data/catalog.json', 'utf8'),
).entries;
const resource = (name: string, kind = 'type', id = 1) => ({
  name,
  url: `https://pokeapi.co/api/v2/${kind}/${id}/`,
});

export function pokemonFixture(id: number) {
  const p = entries.find((p) => p.id === id)!;
  const species = entries.find((s) => s.id === p.baseId)!;
  const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  const statNames: Record<string, string> = { spAtk: 'special-attack', spDef: 'special-defense' };
  return {
    id,
    name: p.name,
    species: resource(species.name, 'pokemon-species', p.baseId),
    sprites: {
      front_default: image,
      front_shiny: image,
      other: { 'official-artwork': { front_default: image, front_shiny: image } },
    },
    types: p.types.map((name, index) => ({ slot: index + 1, type: resource(name) })),
    height: p.height,
    weight: p.weight,
    abilities: [{ ability: resource('overgrow', 'ability') }],
    stats: Object.entries(p.stats).map(([name, value]) => ({
      base_stat: value,
      stat: resource(statNames[name] || name, 'stat'),
    })),
    moves: [],
  };
}

export async function mockExternalServices(page: Page) {
  await page.route('https://raw.githubusercontent.com/**', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><circle cx="48" cy="48" r="35" fill="gray"/></svg>',
    }),
  );
  await page.route('https://fonts.googleapis.com/**', (route) =>
    route.fulfill({ contentType: 'text/css', body: '' }),
  );
  await page.route('https://pokeapi.co/api/v2/**', async (route) => {
    const parts = new URL(route.request().url()).pathname.split('/').filter(Boolean);
    const kind = parts[2],
      id = Number(parts[3]);
    if (parts[4] === 'encounters') return route.fulfill({ json: [] });
    if (kind === 'pokemon') return route.fulfill({ json: pokemonFixture(id) });
    if (kind === 'pokemon-species') {
      const p = entries.find((p) => p.id === id)!;
      return route.fulfill({
        json: {
          name: p.name,
          evolves_from_species: null,
          evolution_chain: { url: `https://pokeapi.co/api/v2/evolution-chain/${id}/` },
          varieties: [{ is_default: true, pokemon: resource(p.name, 'pokemon', id) }],
        },
      });
    }
    if (kind === 'evolution-chain') {
      const p = entries.find((p) => p.id === id)!;
      return route.fulfill({
        json: {
          chain: {
            species: resource(p.name, 'pokemon-species', id),
            evolution_details: [],
            evolves_to: [],
          },
        },
      });
    }
    if (kind === 'ability')
      return route.fulfill({
        json: {
          flavor_text_entries: [],
          effect_entries: [
            {
              language: resource('en', 'language'),
              effect: 'Ability description.',
              short_effect: 'Ability description.',
            },
          ],
        },
      });
    return route.fulfill({ status: 404, json: { error: 'Unknown fixture' } });
  });
}

export const test = base.extend({
  page: async ({ page }, runFixture) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await mockExternalServices(page);
    await runFixture(page);
    expect(errors, 'Unhandled browser exceptions').toEqual([]);
  },
});
export { expect };
