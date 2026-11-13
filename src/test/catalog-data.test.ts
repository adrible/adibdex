import { NATIONAL_POKEDEX_SIZE } from '@/lib/pokemon/constants';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { catalogSchema } from '@/lib/pokeapi/catalog';
import { matchesPokemonSearch } from '@/features/catalog/search';
import { applyFilters } from '@/features/catalog/filtering';
import { DEFAULT_FILTERS } from '@/features/catalog/filter-state';

const raw: unknown = JSON.parse(readFileSync('public/data/catalog.json', 'utf8'));
describe('checked-in compact catalog', () => {
  it('includes source dates, visible and hidden abilities, and the official Meowstic forms', () => {
    const catalog = catalogSchema.parse(raw);
    expect(Date.parse(catalog.generatedAt)).toBeGreaterThanOrEqual(
      Date.parse(catalog.sourceUpdatedAt),
    );
    expect(catalog.entries.find((p) => p.id === 1)?.abilities).toEqual([
      { name: 'overgrow', isHidden: false },
      { name: 'chlorophyll', isHidden: true },
    ]);
    expect(
      catalog.entries.filter((p) => p.category === 'base').every((p) => p.abilities.length > 0),
    ).toBe(true);
    expect(
      catalog.entries.filter((p) => p.category === 'mega' && p.baseId === 678).map((p) => p.name),
    ).toEqual(expect.arrayContaining(['meowstic-male-mega', 'meowstic-female-mega']));
    expect(catalog.entries.find((p) => p.id === 678)?.hasMega).toBe(true);
  });
  it('includes deduplicated learned attacks and keeps form learnsets separate', () => {
    const { entries } = catalogSchema.parse(raw);
    expect(entries.filter((p) => p.category === 'base').every((p) => p.moves.length > 0)).toBe(
      true,
    );
    expect(entries.every((p) => new Set(p.moves).size === p.moves.length)).toBe(true);
    const pikachu = { ...entries.find((p) => p.id === 25)!, sprite: '', spriteShiny: '' };
    expect(pikachu.moves).toContain('thunderbolt');
    expect(pikachu.moveGames['thunderbolt']).toContain('red-blue');
    expect(entries.every((p) => p.moves.every((move) => p.moveGames[move]?.length > 0))).toBe(true);
    expect(
      entries.every((p) =>
        Object.values(p.moveGames).every((games) => new Set(games).size === games.length),
      ),
    ).toBe(true);
    expect(matchesPokemonSearch(pikachu, 'THUNDERBOLT')).toBe(true);
    const magikarp = { ...entries.find((p) => p.id === 129)!, sprite: '', spriteShiny: '' };
    expect(matchesPokemonSearch(magikarp, 'thunderbolt')).toBe(false);
    expect(entries.find((p) => p.id === 6)?.moves).toContain('flamethrower');
    expect(entries.find((p) => p.id === 10196)?.moves).toEqual([]);
    // Old snapshots remain readable while the new deployment's cache URL is refreshed.
    const oldSnapshot = JSON.parse(JSON.stringify(raw));
    for (const entry of oldSnapshot.entries) {
      delete entry.moves;
      delete entry.moveGames;
    }
    delete oldSnapshot.gameSets;
    expect(catalogSchema.parse(oldSnapshot).entries[0].moves).toEqual([]);
  });
  it('contains every national ID once and complete filter attributes', () => {
    const catalog = catalogSchema.parse(raw);
    expect(catalog.entries.filter((p) => p.category === 'base')).toHaveLength(
      NATIONAL_POKEDEX_SIZE,
    );
    expect(
      catalog.entries.every((p) => p.types.length > 0 && Object.keys(p.stats).length === 6),
    ).toBe(true);
  });
  it('keeps non-enriched alternate forms Basic by product rule', () => {
    const entries = catalogSchema
      .parse(raw)
      .entries.filter((p) => p.category === 'regional')
      .map((p) => ({ ...p, sprite: '', spriteShiny: '' }));
    expect(entries.every((p) => p.evolutionStage === undefined)).toBe(true);
    expect(applyFilters(entries, { ...DEFAULT_FILTERS, evolutionStages: ['basic'] })).toHaveLength(
      entries.length,
    );
  });
  it('validates known base stages and sorting without modifying the source', () => {
    const entries = catalogSchema
      .parse(raw)
      .entries.slice(0, 3)
      .map((p) => ({ ...p, sprite: '', spriteShiny: '' }));
    expect(entries.map((p) => p.evolutionStage)).toEqual(['basic', 'stage1', 'stage2']);
    expect(applyFilters(entries, { ...DEFAULT_FILTERS, sortDir: 'desc' }).map((p) => p.id)).toEqual(
      [3, 2, 1],
    );
    expect(entries.map((p) => p.id)).toEqual([1, 2, 3]);
  });
  it('rejects incomplete catalogs', () => {
    const catalog = JSON.parse(JSON.stringify(raw));
    expect(catalogSchema.safeParse({ ...catalog, entries: catalog.entries.slice(1) }).success).toBe(
      false,
    );
  });
});
