const BASE_URL = 'https://pokeapi.co/api/v2';

export interface PokemonBasic {
  id: number;
  name: string;
  sprite: string;
  spriteShiny: string;
  types: string[];
  stats?: { hp: number; attack: number; defense: number; spAtk: number; spDef: number; speed: number };
  height?: number;
  weight?: number;
  evolutionStage?: 'basic' | 'stage1' | 'stage2';
}

export interface PokemonDetail {
  id: number;
  speciesId: number;
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
  { id: 10, name: 'Desconhecida', region: 'Desconhecida', pokemonRange: [808, 809] },
  { id: 8, name: 'Galar', region: 'Galar', pokemonRange: [810, 898] },
  { id: 11, name: 'Hisui', region: 'Hisui', pokemonRange: [899, 905] },
  { id: 9, name: 'Paldea', region: 'Paldea', pokemonRange: [906, 1025] },
];

// Complete official Mega Evolution Pokémon (base IDs) – 46 species + Primal forms
export const MEGA_POKEMON_IDS = new Set([
  3, 6, 9, 15, 18, 26, 65, 80, 94, 115, 127, 130, 142, 150, 181, 208, 212, 214, 229, 248,
254, 257, 260, 282, 302, 303, 306, 308, 310, 354, 359, 362, 373, 376, 380, 381, 382, 383, 384,
428, 445, 448, 460, 475, 531, 652, 655, 658, 719, 807, 998
]);

// Classification datasets
// Starters: base + full evolution lines
export const STARTER_IDS = new Set([
  1,2,3,4,5,6,7,8,9, // Kanto
  152,153,154,155,156,157,158,159,160, // Johto
  252,253,254,255,256,257,258,259,260, // Hoenn
  387,388,389,390,391,392,393,394,395, // Sinnoh
  495,496,497,498,499,500,501,502,503, // Unova
  650,651,652,653,654,655,656,657,658, // Kalos
  722,723,724,725,726,727,728,729,730, // Alola
  810,811,812,813,814,815,816,817,818, // Galar
  906,907,908,909,910,911,912,913,914, // Paldea
]);
export const LEGENDARY_IDS = new Set([144,145,146,150,243,244,245,249,250,377,378,379,380,381,382,383,384,480,481,482,483,484,485,486,487,488,638,639,640,641,642,643,644,645,646,716,717,718,772,773,785,786,787,788,789,790,791,792,800,888,889,890,891,892,895,896,897,898,905,1001,1002,1003,1004,1007,1008,1009,1010,1014,1015,1016,1017,1024]);
export const MYTHICAL_IDS = new Set([151,251,385,386,489,490,491,492,493,494,647,648,649,719,720,721,801,802,807,808,809,893,894,1025]);
export const PSEUDO_LEGENDARY_IDS = new Set([149,248,289,373,376,445,635,706,784,887,998]);
export const ULTRA_BEAST_IDS = new Set([793,794,795,796,797,798,799,803,804,805,806]);
export const PARADOX_IDS = new Set([984,985,986,987,988,989,990,991,992,993,994,995,1005,1006,1009,1010]);
export const BABY_IDS = new Set([172,173,174,175,236,238,239,240,298,360,406,433,438,439,440,446,447,458,848]);
// Fossil Pokémon (revived from fossils) - base + evolutions
export const FOSSIL_IDS = new Set([
  138,139, // Omanyte, Omastar
  140,141, // Kabuto, Kabutops
  142, // Aerodactyl
  345,346, // Lileep, Cradily
  347,348, // Anorith, Armaldo
  408,409, // Cranidos, Rampardos
  410,411, // Shieldon, Bastiodon
  564,565, // Tirtouga, Carracosta
  566,567, // Archen, Archeops
  696,697, // Tyrunt, Tyrantrum
  698,699, // Amaura, Aurorus
  880,881,882,883, // Dracozolt, Arctozolt, Dracovish, Arctovish
]);

// All special classification sets for "Regular" exclusion
export const ALL_SPECIAL_SETS = [STARTER_IDS, LEGENDARY_IDS, MYTHICAL_IDS, PSEUDO_LEGENDARY_IDS, ULTRA_BEAST_IDS, PARADOX_IDS, BABY_IDS, FOSSIL_IDS];

// Complete Gigantamax Pokémon (base IDs)
export const GMAX_POKEMON_IDS = new Set([
  3,6,9,12,25,52,68,94,99,131,133,143,569,809,
  812,815,818,823,826,834,839,841,842,844,845,849,851,858,861,869,879,884,892
]);

export const REGIONAL_FORM_POKEMON_IDS = new Set([
  19, 20, 26, 27, 28, 37, 38, 50, 51, 52, 53, 58, 59, 74, 75, 76, 77, 78,
79, 80, 83, 88, 89, 100, 101, 102, 103, 105, 110, 122, 144, 145, 146,
157, 211, 215, 222, 263, 264, 554, 555, 562, 563, 618,
705, 706, 713,
724,
899, 901, 902, 903, 904
]);

// Evolution stage cache - populated lazily
const evolutionStageCache = new Map<number, 'basic' | 'stage1' | 'stage2'>();
const speciesCache = new Map<number, any>();

async function fetchSpeciesRaw(id: number): Promise<any> {
  if (speciesCache.has(id)) return speciesCache.get(id)!;
  try {
    const res = await fetch(`${BASE_URL}/pokemon-species/${id}`);
    const data = await res.json();
    speciesCache.set(id, data);
    return data;
  } catch { return null; }
}

async function getEvolutionStage(id: number): Promise<'basic' | 'stage1' | 'stage2'> {
  if (evolutionStageCache.has(id)) return evolutionStageCache.get(id)!;
  const species = await fetchSpeciesRaw(id);
  if (!species || !species.evolves_from_species) {
    evolutionStageCache.set(id, 'basic');
    return 'basic';
  }
  // Has a pre-evolution - check if that pre-evo also has one
  const preEvoId = extractIdFromUrl(species.evolves_from_species.url);
  const preSpecies = await fetchSpeciesRaw(preEvoId);
  if (!preSpecies || !preSpecies.evolves_from_species) {
    evolutionStageCache.set(id, 'stage1');
    return 'stage1';
  }
  evolutionStageCache.set(id, 'stage2');
  return 'stage2';
}

const pokemonCache = new Map<number, any>();

async function fetchPokemonRaw(id: number): Promise<any> {
  if (pokemonCache.has(id)) return pokemonCache.get(id)!;
  const res = await fetch(`${BASE_URL}/pokemon/${id}`);
  const data = await res.json();
  pokemonCache.set(id, data);
  return data;
}

function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, '').split('/');
  return Number(parts[parts.length - 1]);
}

function extractStats(data: any) {
  const s = data.stats;
  return {
    hp: s[0]?.base_stat || 0,
    attack: s[1]?.base_stat || 0,
    defense: s[2]?.base_stat || 0,
    spAtk: s[3]?.base_stat || 0,
    spDef: s[4]?.base_stat || 0,
    speed: s[5]?.base_stat || 0,
  };
}

function buildBasicFromRaw(data: any): PokemonBasic {
  const id = data.id;
  return {
    id,
    name: data.name,
    // Use smaller sprites for lists (much faster loading)
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    spriteShiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
    types: data.types.map((t: any) => t.type.name),
    stats: extractStats(data),
    height: data.height,
    weight: data.weight,
  };
}

export async function fetchPokemonBasic(id: number): Promise<PokemonBasic> {
  const data = await fetchPokemonRaw(id);
  return buildBasicFromRaw(data);
}

export async function fetchPokemonDetail(id: number): Promise<PokemonDetail> {
  const data = await fetchPokemonRaw(id);
  const speciesId = extractIdFromUrl(data.species.url);
  return {
    id: data.id,
    speciesId,
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
  const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const results: PokemonBasic[] = [];

  for (let i = 0; i < ids.length; i += 40) {
    const batch = ids.slice(i, i + 40);
    const rawArr = await Promise.all(batch.map((id: number) => fetchPokemonRaw(id)));
    rawArr.forEach((d) => results.push(buildBasicFromRaw(d)));
  }

  // Enrich with evolution stages
  const stages = await Promise.all(results.map(p => getEvolutionStage(p.id)));
  stages.forEach((stage, idx) => { results[idx].evolutionStage = stage; });

  return results;
}

export const TYPE_COLORS: Record<string, string> = {
  normal: 'var(--type-normal)', fire: 'var(--type-fire)', water: 'var(--type-water)',
  grass: 'var(--type-grass)', electric: 'var(--type-electric)', ice: 'var(--type-ice)',
  fighting: 'var(--type-fighting)', poison: 'var(--type-poison)', ground: 'var(--type-ground)',
  flying: 'var(--type-flying)', psychic: 'var(--type-psychic)', bug: 'var(--type-bug)',
  rock: 'var(--type-rock)', ghost: 'var(--type-ghost)', dragon: 'var(--type-dragon)',
  dark: 'var(--type-dark)', steel: 'var(--type-steel)', fairy: 'var(--type-fairy)',
};

export const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', grass: 'Planta',
  electric: 'Elétrico', ice: 'Gelo', fighting: 'Lutador', poison: 'Veneno',
  ground: 'Terra', flying: 'Voador', psychic: 'Psíquico', bug: 'Inseto',
  rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio',
  steel: 'Aço', fairy: 'Fada',
};

export const STAT_TRANSLATIONS: Record<string, string> = {
  hp: 'HP', attack: 'Ataque', defense: 'Defesa',
  'special-attack': 'Atq. Esp.', 'special-defense': 'Def. Esp.', speed: 'Velocidade',
};

export const VERSION_GROUP_NAMES: Record<string, string> = {
  'red-blue': 'Red / Blue', 'yellow': 'Yellow',
  'gold-silver': 'Gold / Silver', 'crystal': 'Crystal',
  'ruby-sapphire': 'Ruby / Sapphire', 'emerald': 'Emerald',
  'firered-leafgreen': 'FireRed / LeafGreen',
  'diamond-pearl': 'Diamond / Pearl', 'platinum': 'Platinum',
  'heartgold-soulsilver': 'HeartGold / SoulSilver',
  'black-white': 'Black / White', 'black-2-white-2': 'Black 2 / White 2',
  'x-y': 'X / Y', 'omega-ruby-alpha-sapphire': 'Omega Ruby / Alpha Sapphire',
  'sun-moon': 'Sun / Moon', 'ultra-sun-ultra-moon': 'Ultra Sun / Ultra Moon',
  'lets-go-pikachu-lets-go-eevee': "Let's Go Pikachu / Eevee",
  'sword-shield': 'Sword / Shield',
  'brilliant-diamond-and-shining-pearl': 'Brilliant Diamond / Shining Pearl',
  'legends-arceus': 'Legends: Arceus',
  'scarlet-violet': 'Scarlet / Violet',
  'the-teal-mask': 'The Teal Mask',
  'the-indigo-disk': 'The Indigo Disk',
};

export const METHOD_LABELS: Record<string, string> = {
  'level-up': 'Por Nível', 'machine': 'TM / HM', 'egg': 'Egg Moves', 'tutor': 'Tutor',
};

export interface MoveByGame {
  name: string;
  type: string;
  level: number;
  method: string;
  damageClass: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
}

export interface MovesByVersionGroup {
  versionGroup: string;
  versionGroupLabel: string;
  levelUp: MoveByGame[];
  machine: MoveByGame[];
  egg: MoveByGame[];
  tutor: MoveByGame[];
}

const moveDataCache = new Map<string, any>();

async function fetchMoveData(name: string): Promise<any> {
  if (moveDataCache.has(name)) return moveDataCache.get(name)!;
  try {
    const res = await fetch(`${BASE_URL}/move/${name}`);
    const data = await res.json();
    moveDataCache.set(name, data);
    return data;
  } catch {
    return null;
  }
}

function getUserLang(): string {
  const lang = navigator?.language?.split('-')[0] || 'en';
  return lang;
}

export async function fetchMoveDescription(moveName: string): Promise<string> {
  const data = await fetchMoveData(moveName);
  if (!data) return '';
  const lang = getUserLang();

  // Try user language first for flavor text
  if (lang !== 'en') {
    const localFlavor = data.flavor_text_entries?.filter((e: any) => e.language.name === lang);
    if (localFlavor?.length > 0) {
      return localFlavor[localFlavor.length - 1].flavor_text.replace(/\n/g, ' ');
    }
  }

  const entry = data.effect_entries?.find((e: any) => e.language.name === 'en');
  if (entry) {
    return entry.short_effect?.replace('$effect_chance%', `${data.effect_chance || '?'}%`) || entry.effect || '';
  }
  const flavor = data.flavor_text_entries?.find((e: any) => e.language.name === 'en');
  return flavor?.flavor_text || '';
}

const abilityCache = new Map<string, any>();

export async function fetchAbilityDescription(abilityName: string): Promise<string> {
  let data: any;
  if (abilityCache.has(abilityName)) {
    data = abilityCache.get(abilityName)!;
  } else {
    try {
      const res = await fetch(`${BASE_URL}/ability/${abilityName}`);
      data = await res.json();
      abilityCache.set(abilityName, data);
    } catch { return ''; }
  }
  const lang = getUserLang();

  // Try user language flavor text
  if (lang !== 'en') {
    const localFlavor = data.flavor_text_entries?.filter((e: any) => e.language.name === lang);
    if (localFlavor?.length > 0) {
      return localFlavor[localFlavor.length - 1].flavor_text.replace(/\n/g, ' ');
    }
  }

  const entry = data.effect_entries?.find((e: any) => e.language.name === 'en');
  return entry?.effect || entry?.short_effect || '';
}

export async function fetchPokemonMovesByGame(pokemonId: number): Promise<MovesByVersionGroup[]> {
  const data = await fetchPokemonRaw(pokemonId);
  const groupMap = new Map<string, Map<string, { name: string; level: number }[]>>();

  for (const m of data.moves) {
    for (const vg of m.version_group_details) {
      const vgName = vg.version_group.name;
      const method = vg.move_learn_method.name;
      if (!groupMap.has(vgName)) groupMap.set(vgName, new Map());
      const methodMap = groupMap.get(vgName)!;
      if (!methodMap.has(method)) methodMap.set(method, []);
      methodMap.get(method)!.push({ name: m.move.name, level: vg.level_learned_at });
    }
  }

  const allMoveNames = new Set<string>();
  for (const m of data.moves) allMoveNames.add(m.move.name);

  const moveNames = [...allMoveNames];
  const moveInfo = new Map<string, { type: string; damageClass: string; power: number | null; accuracy: number | null; pp: number | null }>();

  for (let i = 0; i < moveNames.length; i += 30) {
    const batch = moveNames.slice(i, i + 30);
    const results = await Promise.all(batch.map(fetchMoveData));
    results.forEach((d, j) => {
      if (d) {
        moveInfo.set(batch[j], {
          type: d.type.name,
          damageClass: d.damage_class?.name || 'status',
          power: d.power,
          accuracy: d.accuracy,
          pp: d.pp,
        });
      }
    });
  }

  const vgOrder = Object.keys(VERSION_GROUP_NAMES);
  const sortedGroups = [...groupMap.entries()].sort((a, b) => {
    const ai = vgOrder.indexOf(a[0]);
    const bi = vgOrder.indexOf(b[0]);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return sortedGroups.map(([vgName, methodMap]) => {
    function buildMoves(method: string): MoveByGame[] {
      const moves = methodMap.get(method) || [];
      return moves
        .map(m => {
          const info = moveInfo.get(m.name);
          return {
            name: m.name, type: info?.type || 'normal', level: m.level, method,
            damageClass: info?.damageClass || 'status',
            power: info?.power ?? null, accuracy: info?.accuracy ?? null, pp: info?.pp ?? null,
          };
        })
        .sort((a, b) => (method === 'level-up' ? a.level - b.level : a.name.localeCompare(b.name)));
    }
    return {
      versionGroup: vgName,
      versionGroupLabel: VERSION_GROUP_NAMES[vgName] || vgName.replace(/-/g, ' '),
      levelUp: buildMoves('level-up'), machine: buildMoves('machine'),
      egg: buildMoves('egg'), tutor: buildMoves('tutor'),
    };
  });
}

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

function flattenChain(chain: any): EvolutionStep[][] {
  const stages: EvolutionStep[][] = [];
  function traverse(node: any, depth: number) {
    if (!stages[depth]) stages[depth] = [];
    const id = extractIdFromUrl(node.species.url);
    const details = node.evolution_details?.[0];
    stages[depth].push({
      id, name: node.species.name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      minLevel: details?.min_level || null, trigger: details?.trigger?.name || null,
      item: details?.item?.name || null, heldItem: details?.held_item?.name || null,
      minHappiness: details?.min_happiness || null, timeOfDay: details?.time_of_day || null,
      knownMove: details?.known_move?.name || null, knownMoveType: details?.known_move_type?.name || null,
      location: details?.location?.name || null, minAffection: details?.min_affection || null,
      needsRain: details?.needs_overworld_rain || false, turnUpsideDown: details?.turn_upside_down || false,
    });
    for (const next of node.evolves_to) traverse(next, depth + 1);
  }
  traverse(chain, 0);
  return stages;
}

export async function fetchEvolutionChain(pokemonId: number): Promise<EvolutionChain> {
  let speciesId = pokemonId;
  let formSuffix = '';
  if (pokemonId >= 10000) {
    const pokData = await fetchPokemonRaw(pokemonId);
    speciesId = extractIdFromUrl(pokData.species.url);
    // Detect form suffix (e.g., "alola", "galar", "hisui")
    const speciesName = pokData.species.name;
    const pokName = pokData.name as string;
    if (pokName.startsWith(speciesName + '-')) {
      formSuffix = pokName.substring(speciesName.length + 1);
    }
  }
  const speciesRes = await fetch(`${BASE_URL}/pokemon-species/${speciesId}`);
  const speciesData = await speciesRes.json();
  const chainUrl = speciesData.evolution_chain.url;
  const chainRes = await fetch(chainUrl);
  const chainData = await chainRes.json();
  const baseSteps = flattenChain(chainData.chain);

  // If viewing a regional/alt form, try to swap each step with its corresponding form
  if (formSuffix && ['alola', 'galar', 'hisui', 'paldea'].includes(formSuffix.split('-')[0])) {
    const regionKey = formSuffix.split('-')[0]; // e.g., "alola"
    const swappedSteps: EvolutionStep[][] = [];
    for (const stage of baseSteps) {
      const newStage: EvolutionStep[] = [];
      for (const evo of stage) {
        // Try to find the regional form for this species
        try {
          const spRes = await fetch(`${BASE_URL}/pokemon-species/${evo.id}`);
          const spData = await spRes.json();
          const regionVariety = spData.varieties?.find((v: any) =>
            v.pokemon.name.includes(`-${regionKey}`) && !v.pokemon.name.includes('-mega') && !v.pokemon.name.includes('-gmax')
          );
          if (regionVariety) {
            const vRes = await fetch(regionVariety.pokemon.url);
            const vData = await vRes.json();
            newStage.push({
              ...evo,
              id: vData.id,
              name: vData.name,
              sprite: vData.sprites.other?.['official-artwork']?.front_default || evo.sprite,
            });
          } else {
            newStage.push(evo);
          }
        } catch {
          newStage.push(evo);
        }
      }
      swappedSteps.push(newStage);
    }
    return { steps: swappedSteps };
  }

  return { steps: baseSteps };
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

export interface MegaEvolution {
  id: number;
  name: string;
  sprite: string;
  spriteShiny: string;
  types: string[];
}

export interface GmaxForm {
  id: number;
  name: string;
  sprite: string;
  spriteShiny: string;
  types: string[];
}

export async function fetchMegaEvolutions(pokemonId: number): Promise<MegaEvolution[]> {
  try {
    let speciesId = pokemonId;
    if (pokemonId >= 10000) {
      const pokData = await fetchPokemonRaw(pokemonId);
      speciesId = extractIdFromUrl(pokData.species.url);
    }
    const speciesRes = await fetch(`${BASE_URL}/pokemon-species/${speciesId}`);
    const speciesData = await speciesRes.json();
    const varieties = speciesData.varieties || [];
    const megaVarieties = varieties.filter((v: any) =>
      (v.pokemon.name.includes('-mega') || v.pokemon.name.includes('-primal')) && !v.is_default
    );
    if (megaVarieties.length === 0) return [];
    const megas = await Promise.all(
      megaVarieties.map(async (v: any) => {
        const res = await fetch(v.pokemon.url);
        const data = await res.json();
        return {
          id: data.id, name: data.name,
          sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
          spriteShiny: data.sprites.other?.['official-artwork']?.front_shiny || data.sprites.front_shiny,
          types: data.types.map((t: any) => t.type.name),
        };
      })
    );
    return megas;
  } catch { return []; }
}

export async function fetchGmaxForms(pokemonId: number): Promise<GmaxForm[]> {
  try {
    let speciesId = pokemonId;
    if (pokemonId >= 10000) {
      const pokData = await fetchPokemonRaw(pokemonId);
      speciesId = extractIdFromUrl(pokData.species.url);
    }
    const speciesRes = await fetch(`${BASE_URL}/pokemon-species/${speciesId}`);
    const speciesData = await speciesRes.json();
    const varieties = speciesData.varieties || [];
    const gmaxVarieties = varieties.filter((v: any) => v.pokemon.name.includes('-gmax') && !v.is_default);
    if (gmaxVarieties.length === 0) return [];
    const gmax = await Promise.all(
      gmaxVarieties.map(async (v: any) => {
        const res = await fetch(v.pokemon.url);
        const data = await res.json();
        return {
          id: data.id, name: data.name,
          sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
          spriteShiny: data.sprites.other?.['official-artwork']?.front_shiny || data.sprites.front_shiny,
          types: data.types.map((t: any) => t.type.name),
        };
      })
    );
    return gmax;
  } catch { return []; }
}

let allPokemonNames: { id: number; name: string }[] | null = null;

export async function fetchAllPokemonNames(): Promise<{ id: number; name: string }[]> {
  if (allPokemonNames) return allPokemonNames;
  const res = await fetch(`${BASE_URL}/pokemon?offset=0&limit=1025`);
  const data = await res.json();
  allPokemonNames = data.results.map((r: any, i: number) => ({ id: i + 1, name: r.name }));
  return allPokemonNames!;
}

export async function fetchPokemonPage(offset: number, limit: number): Promise<{ pokemons: PokemonBasic[]; total: number }> {
  const ids = Array.from({ length: limit }, (_, i) => offset + i + 1).filter(id => id <= 1025);
  const results: PokemonBasic[] = [];

  for (let i = 0; i < ids.length; i += 40) {
    const batch = ids.slice(i, i + 40);
    const rawArr = await Promise.all(batch.map((id: number) => fetchPokemonRaw(id)));
    rawArr.forEach((d) => results.push(buildBasicFromRaw(d)));
  }

  const stages = await Promise.all(results.map(p => getEvolutionStage(p.id)));
  stages.forEach((stage, idx) => { results[idx].evolutionStage = stage; });

  return { pokemons: results, total: 1025 };
}

// Fetch ALL 1025 Pokemon basic data (for filtering across all pages)
let allPokemonBasicCache: PokemonBasic[] | null = null;

export async function fetchAllPokemonBasic(): Promise<PokemonBasic[]> {
  if (allPokemonBasicCache) return allPokemonBasicCache;
  const results: PokemonBasic[] = [];
  for (let i = 0; i < 1025; i += 50) {
    const batch = Array.from({ length: Math.min(50, 1025 - i) }, (_, j) => i + j + 1);
    const rawArr = await Promise.all(batch.map(id => fetchPokemonRaw(id)));
    rawArr.forEach(d => results.push(buildBasicFromRaw(d)));
  }
  // Enrich with evolution stages in parallel
  const stagePromises = results.map(p => getEvolutionStage(p.id));
  const stages = await Promise.all(stagePromises);
  stages.forEach((stage, idx) => { results[idx].evolutionStage = stage; });
  allPokemonBasicCache = results;
  return results;
}

// Fetch all mega forms for category display – includes baseId for display
export async function fetchAllMegaForms(): Promise<PokemonBasic[]> {
  const ids = [...MEGA_POKEMON_IDS].sort((a, b) => a - b);
  const results: PokemonBasic[] = [];
  for (let i = 0; i < ids.length; i += 10) {
    const batch = ids.slice(i, i + 10);
    const batchResults = await Promise.all(batch.map(async (baseId) => {
      const megas = await fetchMegaEvolutions(baseId);
      return megas.map(m => ({
        id: m.id, name: m.name,
        sprite: m.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${m.id}.png`,
        spriteShiny: m.spriteShiny || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${m.id}.png`,
        types: m.types,
        baseId,
      } as PokemonBasic & { baseId: number }));
    }));
    results.push(...batchResults.flat());
  }
  return results;
}

// Fetch all gmax forms for category display – includes baseId for display
export async function fetchAllGmaxForms(): Promise<PokemonBasic[]> {
  const ids = [...GMAX_POKEMON_IDS].sort((a, b) => a - b);
  const results: PokemonBasic[] = [];
  for (let i = 0; i < ids.length; i += 10) {
    const batch = ids.slice(i, i + 10);
    const batchResults = await Promise.all(batch.map(async (baseId) => {
      const gmax = await fetchGmaxForms(baseId);
      return gmax.map(g => ({
        id: g.id, name: g.name, sprite: g.sprite, spriteShiny: g.spriteShiny, types: g.types,
        baseId,
      } as PokemonBasic & { baseId: number }));
    }));
    results.push(...batchResults.flat());
  }
  return results;
}

export interface PokemonForm {
  id: number;
  name: string;
  formName: string;
  sprite: string;
  spriteShiny: string;
  types: string[];
}

export async function fetchPokemonForms(pokemonId: number): Promise<PokemonForm[]> {
  try {
    let speciesUrl: string;
    if (pokemonId >= 10000) {
      const pokRes = await fetch(`${BASE_URL}/pokemon/${pokemonId}`);
      const pokData = await pokRes.json();
      speciesUrl = pokData.species.url;
    } else {
      speciesUrl = `${BASE_URL}/pokemon-species/${pokemonId}`;
    }
    const speciesRes = await fetch(speciesUrl);
    const speciesData = await speciesRes.json();
    const varieties = speciesData.varieties || [];
    const isAltForm = pokemonId >= 10000;
    const filteredVarieties = varieties.filter((v: any) => {
      const name = v.pokemon.name;
      if (name.includes('-mega') || name.includes('-gmax') || name.includes('-totem') || name.includes('-primal')) return false;
      const vId = Number(v.pokemon.url.split('/').filter(Boolean).pop());
      if (vId === pokemonId) return false;
      if (!isAltForm && v.is_default) return false;
      return true;
    });
    if (filteredVarieties.length === 0) return [];
    const forms = await Promise.all(
      filteredVarieties.map(async (v: any) => {
        try {
          const res = await fetch(v.pokemon.url);
          const data = await res.json();
          const name = data.name;
          const isDefault = v.is_default;
          let formName = isDefault ? 'Normal' : name.replace(`${speciesData.name}-`, '').replace(/-/g, ' ');
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
            id: data.id, name,
            formName: formName.charAt(0).toUpperCase() + formName.slice(1),
            sprite: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default || '',
            spriteShiny: data.sprites.other?.['official-artwork']?.front_shiny || data.sprites.front_shiny || '',
            types: data.types.map((t: any) => t.type.name),
          };
        } catch { return null; }
      })
    );
    return forms.filter((f): f is PokemonForm => f !== null && f.sprite !== '');
  } catch { return []; }
}
export async function fetchAllRegionalForms(): Promise<PokemonBasic[]> {
  const REGIONAL_FORM_SLUGS: { slug: string; baseId: number }[] = [
    // Alola
    { slug: 'rattata-alola', baseId: 19 },
    { slug: 'raticate-alola', baseId: 20 },
    { slug: 'raichu-alola', baseId: 26 },
    { slug: 'sandshrew-alola', baseId: 27 },
    { slug: 'sandslash-alola', baseId: 28 },
    { slug: 'vulpix-alola', baseId: 37 },
    { slug: 'ninetales-alola', baseId: 38 },
    { slug: 'diglett-alola', baseId: 50 },
    { slug: 'dugtrio-alola', baseId: 51 },
    { slug: 'meowth-alola', baseId: 52 },
    { slug: 'persian-alola', baseId: 53 },
    { slug: 'geodude-alola', baseId: 74 },
    { slug: 'graveler-alola', baseId: 75 },
    { slug: 'golem-alola', baseId: 76 },
    { slug: 'grimer-alola', baseId: 88 },
    { slug: 'muk-alola', baseId: 89 },
    { slug: 'exeggutor-alola', baseId: 103 },
    { slug: 'marowak-alola', baseId: 105 },

    // Galar
    { slug: 'meowth-galar', baseId: 52 },
    { slug: 'ponyta-galar', baseId: 77 },
    { slug: 'rapidash-galar', baseId: 78 },
    { slug: 'slowpoke-galar', baseId: 79 },
    { slug: 'slowbro-galar', baseId: 80 },
    { slug: 'farfetchd-galar', baseId: 83 },
    { slug: 'weezing-galar', baseId: 110 },
    { slug: 'mr-mime-galar', baseId: 122 },
    { slug: 'articuno-galar', baseId: 144 },
    { slug: 'zapdos-galar', baseId: 145 },
    { slug: 'moltres-galar', baseId: 146 },
    { slug: 'corsola-galar', baseId: 222 },
    { slug: 'zigzagoon-galar', baseId: 263 },
    { slug: 'linoone-galar', baseId: 264 },
    { slug: 'darumaka-galar', baseId: 554 },
    { slug: 'darmanitan-galar-standard', baseId: 555 },
    { slug: 'yamask-galar', baseId: 562 },
    { slug: 'stunfisk-galar', baseId: 618 },

    // Hisui
    { slug: 'growlithe-hisui', baseId: 58 },
    { slug: 'arcanine-hisui', baseId: 59 },
    { slug: 'voltorb-hisui', baseId: 100 },
    { slug: 'electrode-hisui', baseId: 101 },
    { slug: 'typhlosion-hisui', baseId: 157 },
    { slug: 'qwilfish-hisui', baseId: 211 },
    { slug: 'sneasel-hisui', baseId: 215 },
    { slug: 'samurott-hisui', baseId: 503 },
    { slug: 'lilligant-hisui', baseId: 549 },
    { slug: 'zorua-hisui', baseId: 570 },
    { slug: 'zoroark-hisui', baseId: 571 },
    { slug: 'braviary-hisui', baseId: 628 },
    { slug: 'sliggoo-hisui', baseId: 705 },
    { slug: 'goodra-hisui', baseId: 706 },
    { slug: 'avalugg-hisui', baseId: 713 },
    { slug: 'decidueye-hisui', baseId: 724 },
    { slug: 'wyrdeer', baseId: 899 },
    { slug: 'kleavor', baseId: 900 },
    { slug: 'ursaluna', baseId: 901 },
    { slug: 'basculegion-male', baseId: 902 },
    { slug: 'sneasler', baseId: 903 },
    { slug: 'overqwil', baseId: 904 },

    // Paldea
    { slug: 'wooper-paldea', baseId: 194 },
    { slug: 'tauros-paldea-combat-breed', baseId: 128 },
    { slug: 'tauros-paldea-blaze-breed', baseId: 128 },
    { slug: 'tauros-paldea-aqua-breed', baseId: 128 },
  ];

  const results: (PokemonBasic & { baseId: number })[] = [];

  for (let i = 0; i < REGIONAL_FORM_SLUGS.length; i += 12) {
    const batch = REGIONAL_FORM_SLUGS.slice(i, i + 12);

    const batchResults = await Promise.all(
      batch.map(async ({ slug, baseId }) => {
        try {
          const res = await fetch(`${BASE_URL}/pokemon/${slug}`);
          if (!res.ok) return null;

          const data = await res.json();

          return {
            id: data.id,
            name: data.name,
            sprite:
              data.sprites.other?.['official-artwork']?.front_default ||
              data.sprites.front_default ||
              `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
            spriteShiny:
              data.sprites.other?.['official-artwork']?.front_shiny ||
              data.sprites.front_shiny ||
              `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${data.id}.png`,
            types: data.types.map((t: any) => t.type.name),
            stats: extractStats(data),
            height: data.height,
            weight: data.weight,
            baseId,
          } as PokemonBasic & { baseId: number };
        } catch {
          return null;
        }
      })
    );

    results.push(...batchResults.filter(Boolean) as (PokemonBasic & { baseId: number })[]);
  }

  return results.sort((a, b) => {
    const aBase = (a as any).baseId ?? a.id;
    const bBase = (b as any).baseId ?? b.id;

    if (aBase !== bBase) return aBase - bBase;
    return a.name.localeCompare(b.name);
  });
}
