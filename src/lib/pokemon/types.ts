export interface PokemonBasic {
  id: number;
  baseId?: number;
  name: string;
  sprite: string;
  spriteShiny: string;
  types: string[];
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    spAtk: number;
    spDef: number;
    speed: number;
  };
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

export interface PokemonEncounter {
  location: string;
  versions: { version: string; methods: string[] }[];
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
  stats: PokemonBasic['stats'];
  height: number;
  weight: number;
}

export interface PokemonForm {
  id: number;
  name: string;
  formName: string;
  sprite: string;
  spriteShiny: string;
  types: string[];
}
