import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { catalogSchema } from '@/lib/pokeapi/catalog';
import { applyFilters } from '@/features/catalog/filtering';
import { DEFAULT_FILTERS } from '@/features/catalog/filter-state';

const raw: unknown = JSON.parse(readFileSync('public/data/catalog.json', 'utf8'));
describe('checked-in compact catalog', () => {
  it('contains every national ID once and complete filter attributes', () => {
    const catalog = catalogSchema.parse(raw);
    expect(catalog.entries.filter((p) => p.category === 'base')).toHaveLength(1025);
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
    const catalog = catalogSchema.parse(raw);
    expect(catalogSchema.safeParse({ ...catalog, entries: catalog.entries.slice(1) }).success).toBe(
      false,
    );
  });
});
