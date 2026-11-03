export interface PokemonBasic {
  id: number;
  baseId?: number;
  name: string;
  sprite: string;
  spriteShiny: string;
  types: string[];
  abilities?: { name: string; isHidden: boolean }[];
  moves?: string[];
  moveGames?: Record<string, string[]>;
  hasMega?: boolean;
  hasGmax?: boolean;
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
  hiddenAbilities?: string[];
  stats: { name: string; value: number }[];
  species: string;
}

export interface PokemonSpeciesInfo {
  description: string;
  genus: string | null;
  captureRate: number | null;
  genderRate: number | null;
  isBaby: boolean;
  isLegendary: boolean;
  isMythical: boolean;
  eggGroups: string[];
  hatchCounter: number | null;
  growthRate: string | null;
  habitat: string | null;
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
  priority: number;
  target: string;
  ailment: string | null;
  ailmentChance: number | null;
  effectChance: number | null;
}

export interface MovesByVersionGroup {
  versionGroup: string;
  versionGroupLabel: string;
  levelUp: MoveByGame[];
  machine: MoveByGame[];
  egg: MoveByGame[];
  tutor: MoveByGame[];
}

export interface EvolutionCondition {
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
  gender: number | null;
  minBeauty: number | null;
  relativePhysicalStats: number | null;
  partySpecies: string | null;
  partyType: string | null;
  tradeSpecies: string | null;
}

export interface EvolutionStep extends EvolutionCondition {
  id: number;
  speciesId: number;
  parentId: number | null;
  name: string;
  sprite: string;
  conditions: EvolutionCondition[];
}

export interface EvolutionChain {
  steps: EvolutionStep[][];
}

export interface PokemonEncounter {
  location: string;
  versions: {
    version: string;
    methods: string[];
    encounters?: {
      method: string;
      minLevel: number | null;
      maxLevel: number | null;
      chance: number | null;
      conditions: string[];
    }[];
  }[];
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
