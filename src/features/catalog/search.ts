import type { PokemonBasic } from '@/lib/pokemon/types';

export function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_\s]+/g, ' ')
    .trim();
}

export function createPokemonSearch(search: string, game = '') {
  const query = normalizeSearch(search);
  if (!query) return () => true;

  const normalized = new Map<string, string>();
  const includesQuery = (value: string) => {
    let label = normalized.get(value);
    if (label === undefined) {
      label = normalizeSearch(value);
      normalized.set(value, label);
    }
    return label.includes(query);
  };

  return (pokemon: PokemonBasic): boolean =>
    includesQuery(pokemon.name) ||
    String(pokemon.id).includes(query) ||
    String(pokemon.baseId ?? pokemon.id).includes(query) ||
    Boolean(pokemon.abilities?.some((ability) => includesQuery(ability.name))) ||
    Boolean(
      pokemon.moves?.some(
        (move) => includesQuery(move) && (!game || pokemon.moveGames?.[move]?.includes(game)),
      ),
    );
}

export function matchesPokemonSearch(pokemon: PokemonBasic, search: string, game = ''): boolean {
  return createPokemonSearch(search, game)(pokemon);
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
