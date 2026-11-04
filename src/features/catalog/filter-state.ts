import { z } from 'zod';
import { localized } from '@/lib/language';
import { GENERATIONS, TYPE_TRANSLATIONS, VERSION_GROUP_NAMES } from '@/lib/pokemon/constants';
import {
  STARTER_IDS,
  LEGENDARY_IDS,
  MYTHICAL_IDS,
  PSEUDO_LEGENDARY_IDS,
  ULTRA_BEAST_IDS,
  PARADOX_IDS,
  BABY_IDS,
  FOSSIL_IDS,
} from '@/lib/pokemon/constants';

export const ALL_TYPES = Object.keys(TYPE_TRANSLATIONS);
export const WEAKNESS_FILTER_TYPES = ALL_TYPES.filter((t) => t !== 'normal');
export const ALL_REGIONS = GENERATIONS.map((g) => g.region);

export type SortOption =
  | 'id'
  | 'name'
  | 'hp'
  | 'attack'
  | 'defense'
  | 'spAtk'
  | 'spDef'
  | 'speed'
  | 'height'
  | 'weight'
  | 'total';

export type ClassificationOption =
  | 'starter'
  | 'legendary'
  | 'mythical'
  | 'pseudo'
  | 'ultra_beast'
  | 'paradox'
  | 'baby'
  | 'fossil'
  | 'regular';

export type EvolutionStageOption = 'basic' | 'stage1' | 'stage2';
export type RegionOption =
  | 'Kanto'
  | 'Johto'
  | 'Hoenn'
  | 'Sinnoh'
  | 'Unova'
  | 'Kalos'
  | 'Alola'
  | 'Desconhecida'
  | 'Galar'
  | 'Hisui'
  | 'Paldea';

export type TypeMatchMode = 'any' | 'all';

export const CLASSIFICATION_LABELS: Record<ClassificationOption, string> = {
  starter: localized('Inicial', 'Starter'),
  legendary: localized('Lendário', 'Legendary'),
  mythical: localized('Mítico', 'Mythical'),
  pseudo: localized('Pseudo-Lendário', 'Pseudo-legendary'),
  ultra_beast: localized('Ultra Fera', 'Ultra Beast'),
  paradox: localized('Paradoxo', 'Paradox'),
  baby: localized('Bebê', 'Baby'),
  fossil: localized('Fóssil', 'Fossil'),
  regular: localized('Comum', 'Regular'),
};

export const CLASSIFICATION_SETS: Record<Exclude<ClassificationOption, 'regular'>, Set<number>> = {
  starter: STARTER_IDS,
  legendary: LEGENDARY_IDS,
  mythical: MYTHICAL_IDS,
  pseudo: PSEUDO_LEGENDARY_IDS,
  ultra_beast: ULTRA_BEAST_IDS,
  paradox: PARADOX_IDS,
  baby: BABY_IDS,
  fossil: FOSSIL_IDS,
};

export const EVOLUTION_STAGE_LABELS: Record<EvolutionStageOption, string> = {
  basic: localized('Básico', 'Basic'),
  stage1: localized('Estágio 1', 'Stage 1'),
  stage2: localized('Estágio 2', 'Stage 2'),
};

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'id', label: localized('Número Nacional', 'National number') },
  { value: 'name', label: localized('Alfabética (A–Z)', 'Alphabetical (A–Z)') },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: localized('Ataque', 'Attack') },
  { value: 'defense', label: localized('Defesa', 'Defense') },
  { value: 'spAtk', label: localized('Atq. Esp.', 'Sp. Atk.') },
  { value: 'spDef', label: localized('Def. Esp.', 'Sp. Def.') },
  { value: 'speed', label: localized('Velocidade', 'Speed') },
  { value: 'total', label: 'Total' },
  { value: 'height', label: localized('Altura', 'Height') },
  { value: 'weight', label: localized('Peso', 'Weight') },
];

export interface FilterState {
  game: string;
  types: string[];
  typeMatchMode: TypeMatchMode;
  weakTo: string[];
  strongAgainst: string[];
  hasMega: boolean | null;
  hasGmax: boolean | null;
  regions: RegionOption[];
  classifications: ClassificationOption[];
  evolutionStages: EvolutionStageOption[];
  sortBy: SortOption;
  sortDir: 'asc' | 'desc';
}

export function createDefaultFilters(): FilterState {
  return {
    game: '',
    types: [],
    typeMatchMode: 'any',
    weakTo: [],
    strongAgainst: [],
    hasMega: null,
    hasGmax: null,
    regions: [],
    classifications: [],
    evolutionStages: [],
    sortBy: 'id',
    sortDir: 'asc',
  };
}

export const DEFAULT_FILTERS: FilterState = createDefaultFilters();

export function cloneFilters(filters?: Partial<FilterState>): FilterState {
  const base = createDefaultFilters();

  return {
    ...base,
    ...filters,
    types: [...(filters?.types ?? base.types)],
    weakTo: [...(filters?.weakTo ?? base.weakTo)],
    strongAgainst: [...(filters?.strongAgainst ?? base.strongAgainst)],
    regions: [...(filters?.regions ?? base.regions)],
    classifications: [...(filters?.classifications ?? base.classifications)],
    evolutionStages: [...(filters?.evolutionStages ?? base.evolutionStages)],
  };
}

export function getFreshDefaults(): FilterState {
  return cloneFilters();
}

export function countActiveFilters(
  filters: FilterState,
  showRegionFilter = true,
  showSpecialFormFilters = true,
): number {
  return (
    (filters.game ? 1 : 0) +
    filters.types.length +
    filters.weakTo.length +
    filters.strongAgainst.length +
    (filters.typeMatchMode !== 'any' ? 1 : 0) +
    (showRegionFilter ? filters.regions.length : 0) +
    filters.classifications.length +
    filters.evolutionStages.length +
    (showSpecialFormFilters && filters.hasMega !== null ? 1 : 0) +
    (showSpecialFormFilters && filters.hasGmax !== null ? 1 : 0) +
    (filters.sortBy !== 'id' || filters.sortDir !== 'asc' ? 1 : 0)
  );
}

export function hasActiveFilters(filters: FilterState): boolean {
  return countActiveFilters(filters, true) > 0;
}

const stringOptions = <T extends string>(values: readonly T[]) =>
  z
    .array(z.custom<T>((value) => typeof value === 'string' && values.includes(value as T)))
    .max(values.length)
    .transform((v) => [...new Set(v)]);
export const filtersSchema = z.object({
  game: z
    .string()
    .refine((value) => value === '' || Object.hasOwn(VERSION_GROUP_NAMES, value))
    .catch(''),
  types: stringOptions(ALL_TYPES).catch([]),
  weakTo: stringOptions(WEAKNESS_FILTER_TYPES).catch([]),
  strongAgainst: stringOptions(ALL_TYPES).catch([]),
  regions: stringOptions(ALL_REGIONS as RegionOption[]).catch([]),
  classifications: stringOptions(
    Object.keys(CLASSIFICATION_LABELS) as ClassificationOption[],
  ).catch([]),
  evolutionStages: stringOptions(['basic', 'stage1', 'stage2'] as const).catch([]),
  typeMatchMode: z.enum(['any', 'all']).catch('any'),
  hasMega: z.boolean().nullable().catch(null),
  hasGmax: z.boolean().nullable().catch(null),
  sortBy: z
    .enum([
      'id',
      'name',
      'hp',
      'attack',
      'defense',
      'spAtk',
      'spDef',
      'speed',
      'height',
      'weight',
      'total',
    ])
    .catch('id'),
  sortDir: z.enum(['asc', 'desc']).catch('asc'),
});
export interface FilterProps {
  gameOptions?: { value: string; label: string }[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  showRegionFilter?: boolean;
  showSpecialFormFilters?: boolean;
}
