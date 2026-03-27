const BASE_URL = 'https://pokeapi.co/api/v2';

export interface PokemonBasic {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny: string;
    artwork: string;
  };
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  stats: { name: string; value: number }[];
  species: string;
}

export interface Generation {
  id: number;
  name: string;
  region: string;
  pokemonRange: [number, number];
}

export const GENERATIONS: Generation[] = [
  { id: 1, name: 'Geração I', region: 'Kanto', pokemonRange: [1, 151] },
  { id: 2, name: 'Geração II', region: 'Johto', pokemonRange: [152, 251] },
  { id: 3, name: 'Geração III', region: 'Hoenn', pokemonRange: [252, 386] },
  { id: 4, name: 'Geração IV', region: 'Sinnoh', pokemonRange: [387, 493] },
  { id: 5, name: 'Geração V', region: 'Unova', pokemonRange: [494, 649] },
  { id: 6, name: 'Geração VI', region: 'Kalos', pokemonRange: [650, 721] },
  { id: 7, name: 'Geração VII', region: 'Alola', pokemonRange: [722, 809] },
  { id: 8, name: 'Geração VIII', region: 'Galar', pokemonRange: [810, 905] },
  { id: 9, name: 'Geração IX', region: 'Paldea', pokemonRange: [906, 1025] },
];

export async function fetchPokemonBasic(id: number): Promise<PokemonBasic> {
  const res = await fetch(`${BASE_URL}/pokemon/${id}`);
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
    types: data.types.map((t: any) => t.type.name),
  };
}

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const res = await fetch(`${BASE_URL}/pokemon/${id}`);
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    sprites: {
      front_default: data.sprites.front_default,
      front_shiny: data.sprites.front_shiny,
      artwork: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
    },
    types: data.types.map((t: any) => t.type.name),
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map((a: any) => a.ability.name),
    stats: data.stats.map((s: any) => ({ name: s.stat.name, value: s.base_stat })),
    species: data.species.url,
  };
}

export async function fetchPokemonListByRange(start: number, end: number): Promise<PokemonBasic[]> {
  const limit = end - start + 1;
  const res = await fetch(`${BASE_URL}/pokemon?offset=${start - 1}&limit=${limit}`);
  const data = await res.json();

  const promises = data.results.map((_: any, i: number) => fetchPokemonBasic(start + i));

  // Batch in groups of 20
  const results: PokemonBasic[] = [];
  for (let i = 0; i < promises.length; i += 20) {
    const batch = await Promise.all(promises.slice(i, i + 20));
    results.push(...batch);
  }
  return results;
}

export const TYPE_COLORS: Record<string, string> = {
  normal: 'var(--type-normal)',
  fire: 'var(--type-fire)',
  water: 'var(--type-water)',
  grass: 'var(--type-grass)',
  electric: 'var(--type-electric)',
  ice: 'var(--type-ice)',
  fighting: 'var(--type-fighting)',
  poison: 'var(--type-poison)',
  ground: 'var(--type-ground)',
  flying: 'var(--type-flying)',
  psychic: 'var(--type-psychic)',
  bug: 'var(--type-bug)',
  rock: 'var(--type-rock)',
  ghost: 'var(--type-ghost)',
  dragon: 'var(--type-dragon)',
  dark: 'var(--type-dark)',
  steel: 'var(--type-steel)',
  fairy: 'var(--type-fairy)',
};

export const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fogo',
  water: 'Água',
  grass: 'Planta',
  electric: 'Elétrico',
  ice: 'Gelo',
  fighting: 'Lutador',
  poison: 'Veneno',
  ground: 'Terra',
  flying: 'Voador',
  psychic: 'Psíquico',
  bug: 'Inseto',
  rock: 'Pedra',
  ghost: 'Fantasma',
  dragon: 'Dragão',
  dark: 'Sombrio',
  steel: 'Aço',
  fairy: 'Fada',
};

export const STAT_TRANSLATIONS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
};
