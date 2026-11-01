import { describe, expect, it } from 'vitest';
import { matchesPokemonSearch, normalizeSearch } from '@/features/catalog/search';
import type { PokemonBasic } from '@/lib/pokemon/types';

const pokemon: PokemonBasic = {
  id: 4,
  name: 'charmander',
  sprite: '',
  spriteShiny: '',
  types: ['fire'],
  moves: ['flamethrower', 'dragon-claw'],
  abilities: [
    { name: 'blaze', isHidden: false },
    { name: 'solar-power', isHidden: true },
  ],
};

describe('catalog search', () => {
  it.each([
    'flamethrower',
    'Dragon Claw',
    '  DRÁGON__CLAW ',
    'flame',
    'blaze',
    'BLAZE',
    'solar-power',
    'Solar Power',
    '  sólár__power  ',
    'solar',
    'char',
    '4',
    '   ',
  ])('matches %s across name, number, abilities and learned moves', (query) => {
    expect(matchesPokemonSearch(pokemon, query)).toBe(true);
  });
  it('rejects unmatched abilities and supports legacy entries without enrichment', () => {
    expect(matchesPokemonSearch(pokemon, 'levitate')).toBe(false);
    expect(matchesPokemonSearch({ ...pokemon, abilities: undefined }, 'solar')).toBe(false);
    expect(matchesPokemonSearch({ ...pokemon, abilities: [] }, 'blaze')).toBe(false);
  });
  it('does not infer moves for entries without learnset data', () => {
    expect(matchesPokemonSearch(pokemon, 'surf')).toBe(false);
    expect(matchesPokemonSearch({ ...pokemon, moves: undefined }, 'flamethrower')).toBe(false);
    expect(matchesPokemonSearch({ ...pokemon, moves: [] }, 'dragon claw')).toBe(false);
  });
  it('searches alternate forms by species number and normalizes their names', () => {
    const form = { ...pokemon, id: 10034, baseId: 6, name: 'charizard-mega-x' };
    expect(matchesPokemonSearch(form, '6')).toBe(true);
    expect(matchesPokemonSearch(form, 'charizard mega x')).toBe(true);
    expect(normalizeSearch('  SOLAR--Power  ')).toBe('solar power');
  });
});
