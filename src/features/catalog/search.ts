import type { PokemonBasic } from '@/lib/pokemon/types';

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_\s]+/g, ' ')
    .trim();
}

export function matchesPokemonSearch(pokemon: PokemonBasic, search: string): boolean {
  const query = normalizeSearch(search);
  if (!query) return true;
  return (
    normalizeSearch(pokemon.name).includes(query) ||
    String(pokemon.id).includes(query) ||
    String(pokemon.baseId ?? pokemon.id).includes(query) ||
    Boolean(pokemon.abilities?.some((ability) => normalizeSearch(ability.name).includes(query)))
  );
}
