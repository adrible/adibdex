import type { PokemonBasic } from '@/lib/pokemon/types';

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_\s]+/g, ' ')
    .trim();
}

export function matchesPokemonSearch(pokemon: PokemonBasic, search: string, game = ''): boolean {
  const query = normalizeSearch(search);
  if (!query) return true;
  return (
    normalizeSearch(pokemon.name).includes(query) ||
    String(pokemon.id).includes(query) ||
    String(pokemon.baseId ?? pokemon.id).includes(query) ||
    Boolean(pokemon.abilities?.some((ability) => normalizeSearch(ability.name).includes(query))) ||
    getMatchingMoveGames(pokemon, query, game).length > 0
  );
}

/** A separate row for each matching move prevents mixing up game availability. */
export function getMatchingMoveGames(pokemon: PokemonBasic, search: string, game = '') {
  const query = normalizeSearch(search);
  if (!query) return [];
  return (pokemon.moves ?? [])
    .filter((move) => normalizeSearch(move).includes(query))
    .map((name) => ({ name, games: pokemon.moveGames?.[name] ?? [] }))
    .map((move) => ({ ...move, games: game ? move.games.filter((g) => g === game) : move.games }))
    .filter((move) => !game || move.games.length > 0);
}
