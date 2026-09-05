import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FILTERS,
  cloneFilters,
  countActiveFilters,
  hasActiveFilters,
  type SortOption,
  type FilterState,
} from '@/features/catalog/filter-state';
import { applyFilters } from '@/features/catalog/filtering';
import type { PokemonBasic } from '@/lib/pokeapi';

function pokemon(id: number, overrides: Partial<PokemonBasic> = {}): PokemonBasic {
  return {
    id,
    name: `pokemon-${id}`,
    sprite: '',
    spriteShiny: '',
    types: ['normal'],
    ...overrides,
  };
}

function filters(overrides: Partial<FilterState>): FilterState {
  return { ...DEFAULT_FILTERS, ...overrides };
}

describe('applyFilters', () => {
  it('clones default arrays and counts only applicable filters', () => {
    const cloned = cloneFilters();
    cloned.types.push('fire');
    expect(DEFAULT_FILTERS.types).toEqual([]);
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    const state = filters({ hasMega: true, hasGmax: false, regions: ['Kanto'], sortDir: 'desc' });
    expect(countActiveFilters(state)).toBe(4);
    expect(countActiveFilters(state, false, false)).toBe(1);
  });
  it('combines type, weakness and offensive criteria', () => {
    const list = [
      pokemon(1, { types: ['grass', 'poison'] }),
      pokemon(4, { types: ['fire'] }),
      pokemon(7, { types: ['water'] }),
    ];
    expect(
      applyFilters(list, filters({ types: ['grass', 'poison'], typeMatchMode: 'all' })).map(
        (p) => p.id,
      ),
    ).toEqual([1]);
    expect(applyFilters(list, filters({ types: ['water', 'fire'] })).map((p) => p.id)).toEqual([
      4, 7,
    ]);
    expect(
      applyFilters(list, filters({ weakTo: ['water'], strongAgainst: ['grass'] })).map((p) => p.id),
    ).toEqual([4]);
  });
  it('filters classification and special forms using the base ID', () => {
    const list = [pokemon(10033, { baseId: 3 }), pokemon(10), pokemon(150), pokemon(800)];
    expect(applyFilters(list, filters({ hasMega: true, hasGmax: true })).map((p) => p.id)).toEqual([
      10033,
    ]);
    expect(
      applyFilters(list, filters({ hasMega: false, hasGmax: false })).map((p) => p.id),
    ).toEqual([10, 800]);
    expect(applyFilters(list, filters({ classifications: ['starter'] })).map((p) => p.id)).toEqual([
      10033,
    ]);
    expect(applyFilters(list, filters({ classifications: ['regular'] })).map((p) => p.id)).toEqual([
      10,
    ]);
    expect(applyFilters(list, filters({ regions: ['Alola'] })).map((p) => p.id)).toEqual([800]);
  });
  it.each<SortOption>([
    'hp',
    'attack',
    'defense',
    'spAtk',
    'spDef',
    'speed',
    'height',
    'weight',
    'total',
  ])('sorts %s safely and resolves ties deterministically', (sortBy) => {
    const list = [
      pokemon(2),
      pokemon(1),
      pokemon(3, {
        height: 10,
        weight: 10,
        stats: { hp: 10, attack: 10, defense: 10, spAtk: 10, spDef: 10, speed: 10 },
      }),
    ];
    expect(applyFilters(list, filters({ sortBy, sortDir: 'asc' })).map((p) => p.id)).toEqual([
      1, 2, 3,
    ]);
    expect(applyFilters(list, filters({ sortBy, sortDir: 'desc' })).map((p) => p.id)).toEqual([
      3, 2, 1,
    ]);
  });
  it('sorts equal names by national ID and keeps bases before alternate forms', () => {
    expect(
      applyFilters(
        [pokemon(2, { name: 'same' }), pokemon(1, { name: 'same' })],
        filters({ sortBy: 'name' }),
      ).map((p) => p.id),
    ).toEqual([1, 2]);
    expect(
      applyFilters([pokemon(10001, { baseId: 19 }), pokemon(19)], filters({ sortDir: 'desc' })).map(
        (p) => p.id,
      ),
    ).toEqual([19, 10001]);
  });
  it('respeita a direção decrescente na ordenação por ID base', () => {
    const result = applyFilters(
      [pokemon(10001, { baseId: 19, name: 'rattata-alola' }), pokemon(1), pokemon(19)],
      filters({ sortBy: 'id', sortDir: 'desc' }),
    );

    expect(result.map((item) => item.baseId ?? item.id)).toEqual([19, 19, 1]);
  });

  it('trata estágio ausente como Básico por regra de produto', () => {
    const result = applyFilters(
      [pokemon(1), pokemon(2, { evolutionStage: 'stage1' })],
      filters({ evolutionStages: ['basic'] }),
    );

    expect(result.map((item) => item.id)).toEqual([1]);
  });

  it('ordena formas por estatísticas carregadas', () => {
    const result = applyFilters(
      [
        pokemon(10001, {
          stats: { hp: 80, attack: 90, defense: 80, spAtk: 70, spDef: 80, speed: 60 },
        }),
        pokemon(10002, {
          stats: { hp: 100, attack: 120, defense: 90, spAtk: 90, spDef: 90, speed: 70 },
        }),
      ],
      filters({ sortBy: 'total', sortDir: 'desc' }),
    );

    expect(result.map((item) => item.id)).toEqual([10002, 10001]);
  });
});
