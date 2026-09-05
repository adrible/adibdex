import {
  MEGA_POKEMON_IDS,
  GMAX_POKEMON_IDS,
  GENERATIONS,
  ALL_SPECIAL_SETS,
} from '@/lib/pokemon/constants';
import { getDefensiveMatchups, getOffensiveMatchups } from '@/lib/type-effectiveness';

import type { PokemonBasic } from '@/lib/pokemon/types';
import { CLASSIFICATION_SETS, type FilterState, type RegionOption } from './filter-state';

function getBaseId(pokemon: { id: number; baseId?: number }) {
  return pokemon.baseId ?? pokemon.id;
}

function getRegionForPokemon(pokemon: { id: number; baseId?: number }): RegionOption | null {
  const baseId = getBaseId(pokemon);
  const generation = GENERATIONS.find(
    (g) => baseId >= g.pokemonRange[0] && baseId <= g.pokemonRange[1],
  );
  return (generation?.region as RegionOption) ?? null;
}

function safeStat(pokemon: PokemonBasic, stat: keyof NonNullable<PokemonBasic['stats']>): number {
  if (!pokemon?.stats) return 0;
  const value = pokemon.stats[stat];
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : Number(value) || 0;
}

function getTotalStat(pokemon: PokemonBasic): number {
  if (!pokemon?.stats) return 0;
  return (
    safeStat(pokemon, 'hp') +
    safeStat(pokemon, 'attack') +
    safeStat(pokemon, 'defense') +
    safeStat(pokemon, 'spAtk') +
    safeStat(pokemon, 'spDef') +
    safeStat(pokemon, 'speed')
  );
}

export function compareNationalOrder(a: PokemonBasic, b: PokemonBasic, direction = 1): number {
  const byBase = (getBaseId(a) - getBaseId(b)) * direction;
  if (byBase) return byBase;
  const aBase = a.id === getBaseId(a),
    bBase = b.id === getBaseId(b);
  if (aBase !== bBase) return aBase ? -1 : 1;
  return a.name.localeCompare(b.name) || a.id - b.id;
}

export function applyFilters(pokemons: PokemonBasic[], filters: FilterState): PokemonBasic[] {
  let result = [...pokemons];

  if (filters.types.length > 0) {
    if (filters.typeMatchMode === 'all') {
      result = result.filter((pokemon) =>
        filters.types.every((type) => pokemon.types.includes(type)),
      );
    } else {
      result = result.filter((pokemon) =>
        filters.types.some((type) => pokemon.types.includes(type)),
      );
    }
  }

  if (filters.weakTo.length > 0) {
    result = result.filter((pokemon) => {
      const matchups = getDefensiveMatchups(pokemon.types);
      return filters.weakTo.every((type) =>
        matchups.weaknesses.some((weakness) => weakness.type === type),
      );
    });
  }

  if (filters.strongAgainst.length > 0) {
    result = result.filter((pokemon) => {
      const offensive = getOffensiveMatchups(pokemon.types);
      return filters.strongAgainst.every((type) => offensive.superEffective.includes(type));
    });
  }

  if (filters.hasMega === true) {
    result = result.filter((pokemon) => MEGA_POKEMON_IDS.has(getBaseId(pokemon)));
  }

  if (filters.hasMega === false) {
    result = result.filter((pokemon) => !MEGA_POKEMON_IDS.has(getBaseId(pokemon)));
  }

  if (filters.hasGmax === true) {
    result = result.filter((pokemon) => GMAX_POKEMON_IDS.has(getBaseId(pokemon)));
  }

  if (filters.hasGmax === false) {
    result = result.filter((pokemon) => !GMAX_POKEMON_IDS.has(getBaseId(pokemon)));
  }

  if (filters.regions.length > 0) {
    result = result.filter((pokemon) => {
      const region = getRegionForPokemon(pokemon);
      return region ? filters.regions.includes(region) : false;
    });
  }

  if (filters.classifications.length > 0) {
    result = result.filter((pokemon) => {
      const baseId = getBaseId(pokemon);

      return filters.classifications.some((classification) => {
        if (classification === 'regular') {
          return !ALL_SPECIAL_SETS.some((set) => set.has(baseId));
        }
        return CLASSIFICATION_SETS[classification].has(baseId);
      });
    });
  }

  if (filters.evolutionStages.length > 0) {
    result = result.filter((pokemon) => {
      // Product rule: records without an enriched stage are basic.
      const stage = pokemon.evolutionStage ?? 'basic';
      return filters.evolutionStages.includes(stage);
    });
  }

  const { sortBy, sortDir } = filters;
  const dir = sortDir === 'asc' ? 1 : -1;

  if (sortBy === 'name') {
    result.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name) * dir;
      if (cmp !== 0) return cmp;
      return compareNationalOrder(a, b, dir);
    });
  } else if (sortBy === 'id') {
    result.sort((a, b) => {
      return compareNationalOrder(a, b, dir);
    });
  } else if (sortBy === 'height') {
    result.sort((a, b) => {
      const cmp = ((a.height || 0) - (b.height || 0)) * dir;
      if (cmp !== 0) return cmp;
      return compareNationalOrder(a, b, dir);
    });
  } else if (sortBy === 'weight') {
    result.sort((a, b) => {
      const cmp = ((a.weight || 0) - (b.weight || 0)) * dir;
      if (cmp !== 0) return cmp;
      return compareNationalOrder(a, b, dir);
    });
  } else if (sortBy === 'total') {
    result.sort((a, b) => {
      const cmp = (getTotalStat(a) - getTotalStat(b)) * dir;
      if (cmp !== 0) return cmp;
      return compareNationalOrder(a, b, dir);
    });
  } else {
    result.sort((a, b) => {
      const aVal = safeStat(a, sortBy);
      const bVal = safeStat(b, sortBy);

      const cmp = (aVal - bVal) * dir;
      if (cmp !== 0) return cmp;

      return compareNationalOrder(a, b, dir);
    });
  }

  return result;
}
