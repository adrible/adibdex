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
    artwork_shiny: string;
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
  { id: 1, name: 'Kanto', region: 'Kanto', pokemonRange: [1, 151] },
  { id: 2, name: 'Johto', region: 'Johto', pokemonRange: [152, 251] },
  { id: 3, name: 'Hoenn', region: 'Hoenn', pokemonRange: [252, 386] },
  { id: 4, name: 'Sinnoh', region: 'Sinnoh', pokemonRange: [387, 493] },
  { id: 5, name: 'Unova', region: 'Unova', pokemonRange: [494, 649] },
  { id: 6, name: 'Kalos', region: 'Kalos', pokemonRange: [650, 721] },
  { id: 7, name: 'Alola', region: 'Alola', pokemonRange: [722, 807] },
  { id: 10, name: '???', region: '???', pokemonRange: [808, 809] },
  { id: 8, name: 'Galar', region: 'Galar', pokemonRange: [810, 898] },
  { id: 11, name: 'Hisui', region: 'Hisui', pokemonRange: [899, 905] },
  { id: 9, name: 'Paldea', region: 'Paldea', pokemonRange: [906, 1025] },
];

// Cache for pokemon data to avoid refetching
const pokemonCache = new Map<number, any>();

async function fetchPokemonRaw(id: number): Promise<any> {
  if (pokemonCache.has(id)) return pokemonCache.get(id)!;
  const res = await fetch(`${BASE_URL}/pokemon/${id}`);
  const data = await res.json();
  pokemonCache.set(id, data);
  return data;
}

export async function fetchPokemonBasic(id: number): Promise<PokemonBasic> {
  const data = await fetchPokemonRaw(id);
  return {
    id: data.id,
    name: data.name,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
    types: data.types.map((t: any) => t.type.name),
  };
}

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const data = await fetchPokemonRaw(id);
  return {
    id: data.id,
    name: data.name,
    sprites: {
      front_default: data.sprites.front_default,
      front_shiny: data.sprites.front_shiny,
      artwork: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
      artwork_shiny: data.sprites.other?.['official-artwork']?.front_shiny || data.sprites.front_shiny,
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

  // Use names from list endpoint, fetch types in parallel batches of 40
  const ids = data.results.map((_: any, i: number) => start + i);
  const names = data.results.map((r: any) => r.name);
  
  const results: PokemonBasic[] = ids.map((id: number, i: number) => ({
    id,
    name: names[i],
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    types: [] as string[],
  }));

  for (let i = 0; i < ids.length; i += 40) {
    const batch = ids.slice(i, i + 40);
    const typesArr = await Promise.all(batch.map((id: number) => fetchPokemonRaw(id)));
    typesArr.forEach((data, j) => {
      results[i + j].types = data.types.map((t: any) => t.type.name);
    });
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

export interface EvolutionStep {
  id: number;
  name: string;
  sprite: string;
  minLevel: number | null;
  trigger: string | null;
  item: string | null;
  heldItem: string | null;
  minHappiness: number | null;
  timeOfDay: string | null;
  knownMove: string | null;
  knownMoveType: string | null;
  location: string | null;
  minAffection: number | null;
  needsRain: boolean;
  turnUpsideDown: boolean;
}

export interface EvolutionChain {
  steps: EvolutionStep[][];
}

function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, '').split('/');
  return Number(parts[parts.length - 1]);
}

function flattenChain(chain: any): EvolutionStep[][] {
  const stages: EvolutionStep[][] = [];

  function traverse(node: any, depth: number) {
    if (!stages[depth]) stages[depth] = [];
    const id = extractIdFromUrl(node.species.url);
    const details = node.evolution_details?.[0];
    stages[depth].push({
      id,
      name: node.species.name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      minLevel: details?.min_level || null,
      trigger: details?.trigger?.name || null,
      item: details?.item?.name || null,
      heldItem: details?.held_item?.name || null,
      minHappiness: details?.min_happiness || null,
      timeOfDay: details?.time_of_day || null,
      knownMove: details?.known_move?.name || null,
      knownMoveType: details?.known_move_type?.name || null,
      location: details?.location?.name || null,
      minAffection: details?.min_affection || null,
      needsRain: details?.needs_overworld_rain || false,
      turnUpsideDown: details?.turn_upside_down || false,
    });
    for (const next of node.evolves_to) {
      traverse(next, depth + 1);
    }
  }

  traverse(chain, 0);
  return stages;
}

export async function fetchEvolutionChain(pokemonId: number): Promise<EvolutionChain> {
  const speciesRes = await fetch(`${BASE_URL}/pokemon-species/${pokemonId}`);
  const speciesData = await speciesRes.json();
  const chainUrl = speciesData.evolution_chain.url;
  const chainRes = await fetch(chainUrl);
  const chainData = await chainRes.json();
  return { steps: flattenChain(chainData.chain) };
}

export interface PokemonEncounter {
  location: string;
  versions: { version: string; methods: string[] }[];
}

export async function fetchPokemonEncounters(pokemonId: number): Promise<PokemonEncounter[]> {
  const res = await fetch(`${BASE_URL}/pokemon/${pokemonId}/encounters`);
  const data = await res.json();
  return data.map((enc: any) => ({
    location: enc.location_area.name.replace(/-/g, ' '),
    versions: enc.version_details.map((v: any) => ({
      version: v.version.name,
      methods: v.encounter_details.map((d: any) => d.method.name.replace(/-/g, ' ')),
    })),
  }));
}

export async function fetchPokemonPage(offset: number, limit: number): Promise<{ pokemons: PokemonBasic[]; total: number }> {
  const res = await fetch(`${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
  const data = await res.json();
  const total = Math.min(data.count, 1025);

  const promises = data.results.map((_: any, i: number) => fetchPokemonBasic(offset + i + 1));
  const results: PokemonBasic[] = [];
  for (let i = 0; i < promises.length; i += 20) {
    const batch = await Promise.all(promises.slice(i, i + 20));
    results.push(...batch);
  }
  return { pokemons: results, total };
}

export interface MegaEvolution {
  id: number;
  name: string;
  sprite: string;
  spriteShiny: string;
  types: string[];
}

export async function fetchMegaEvolutions(pokemonId: number): Promise<MegaEvolution[]> {
  try {
    const speciesRes = await fetch(`${BASE_URL}/pokemon-species/${pokemonId}`);
    const speciesData = await speciesRes.json();
    const varieties = speciesData.varieties || [];
    
    const megaVarieties = varieties.filter((v: any) => 
      v.pokemon.name.includes('-mega') && !v.is_default
    );
    
    if (megaVarieties.length === 0) return [];
    
    const megas = await Promise.all(
      megaVarieties.map(async (v: any) => {
        const res = await fetch(v.pokemon.url);
        const data = await res.json();
        return {
          id: data.id,
          name: data.name,
          sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
          spriteShiny: data.sprites.other?.['official-artwork']?.front_shiny || data.sprites.front_shiny,
          types: data.types.map((t: any) => t.type.name),
        };
      })
    );
    
    return megas;
  } catch {
    return [];
  }
}

export interface PokemonForm {
  name: string;
  formName: string;
  sprite: string;
  spriteShiny: string;
  types: string[];
}

export async function fetchPokemonForms(pokemonId: number): Promise<PokemonForm[]> {
  try {
    const speciesRes = await fetch(`${BASE_URL}/pokemon-species/${pokemonId}`);
    const speciesData = await speciesRes.json();
    const varieties = speciesData.varieties || [];
    
    const altVarieties = varieties.filter((v: any) => 
      !v.is_default && !v.pokemon.name.includes('-mega') && !v.pokemon.name.includes('-gmax') && !v.pokemon.name.includes('-totem')
    );
    
    if (altVarieties.length === 0) return [];
    
    const forms = await Promise.all(
      altVarieties.map(async (v: any) => {
        try {
          const res = await fetch(v.pokemon.url);
          const data = await res.json();
          const name = data.name;
          let formName = name.replace(`${speciesData.name}-`, '').replace(/-/g, ' ');
          
          // Translate common form names
          const FORM_TRANSLATIONS: Record<string, string> = {
            'alola': 'Alola', 'galar': 'Galar', 'hisui': 'Hisui', 'paldea': 'Paldea',
            'female': 'Fêmea', 'male': 'Macho',
            'attack': 'Ataque', 'defense': 'Defesa', 'speed': 'Velocidade',
            'sandy': 'Areia', 'trash': 'Lixo', 'heat': 'Calor', 'wash': 'Lavagem',
            'frost': 'Gelo', 'fan': 'Ventilador', 'mow': 'Corte',
            'origin': 'Origem', 'sky': 'Céu', 'therian': 'Totem',
            'black': 'Preto', 'white': 'Branco', 'resolute': 'Resoluto',
            'pirouette': 'Pirueta', 'zen': 'Zen', 'blade': 'Lâmina',
            'midday': 'Diurno', 'midnight': 'Noturno', 'dusk': 'Crepuscular',
          };
          
          for (const [key, val] of Object.entries(FORM_TRANSLATIONS)) {
            if (formName.toLowerCase().includes(key)) {
              formName = formName.replace(new RegExp(key, 'gi'), val);
            }
          }
          
          return {
            name,
            formName: formName.charAt(0).toUpperCase() + formName.slice(1),
            sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default || '',
            spriteShiny: data.sprites.other?.['official-artwork']?.front_shiny || data.sprites.front_shiny || '',
            types: data.types.map((t: any) => t.type.name),
          };
        } catch {
          return null;
        }
      })
    );
    
    return forms.filter((f): f is PokemonForm => f !== null && f.sprite !== '');
  } catch {
    return [];
  }
}
