import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TypeBadge } from '@/components/TypeBadge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  MEGA_POKEMON_IDS,
  GMAX_POKEMON_IDS,
  GENERATIONS,
  TYPE_TRANSLATIONS,
  STARTER_IDS,
  LEGENDARY_IDS,
  MYTHICAL_IDS,
  PSEUDO_LEGENDARY_IDS,
  ULTRA_BEAST_IDS,
  PARADOX_IDS,
  BABY_IDS,
  FOSSIL_IDS,
  ALL_SPECIAL_SETS,
} from '@/lib/pokeapi';
import { getDefensiveMatchups, getOffensiveMatchups } from '@/lib/type-effectiveness';
import { Filter, X, ArrowUpDown } from 'lucide-react';

const ALL_TYPES = Object.keys(TYPE_TRANSLATIONS);
const WEAKNESS_FILTER_TYPES = ALL_TYPES.filter((t) => t !== 'normal');
const ALL_REGIONS = GENERATIONS.map((g) => g.region);

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

const CLASSIFICATION_LABELS: Record<ClassificationOption, string> = {
  starter: 'Starter',
  legendary: 'Lendário',
  mythical: 'Mítico',
  pseudo: 'Pseudo-Lendário',
  ultra_beast: 'Ultra Beast',
  paradox: 'Paradoxo',
  baby: 'Bebê',
  fossil: 'Fóssil',
  regular: 'Regular',
};

const CLASSIFICATION_SETS: Record<Exclude<ClassificationOption, 'regular'>, Set<number>> = {
  starter: STARTER_IDS,
  legendary: LEGENDARY_IDS,
  mythical: MYTHICAL_IDS,
  pseudo: PSEUDO_LEGENDARY_IDS,
  ultra_beast: ULTRA_BEAST_IDS,
  paradox: PARADOX_IDS,
  baby: BABY_IDS,
  fossil: FOSSIL_IDS,
};

const EVOLUTION_STAGE_LABELS: Record<EvolutionStageOption, string> = {
  basic: 'Básico',
  stage1: 'Estágio 1',
  stage2: 'Estágio 2',
};

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'id', label: 'Número Nacional' },
  { value: 'name', label: 'Alfabética (A–Z)' },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: 'Ataque' },
  { value: 'defense', label: 'Defesa' },
  { value: 'spAtk', label: 'Atq. Esp.' },
  { value: 'spDef', label: 'Def. Esp.' },
  { value: 'speed', label: 'Velocidade' },
  { value: 'total', label: 'Total' },
  { value: 'height', label: 'Altura' },
  { value: 'weight', label: 'Peso' },
];

export interface FilterState {
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

function createDefaultFilters(): FilterState {
  return {
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

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  showRegionFilter?: boolean;
}

function cloneFilters(filters?: Partial<FilterState>): FilterState {
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

function getFreshDefaults(): FilterState {
  return cloneFilters();
}

function getBaseId(pokemon: { id: number; baseId?: number }) {
  return (pokemon as any).baseId ?? pokemon.id;
}

function getRegionForPokemon(pokemon: { id: number; baseId?: number }): RegionOption | null {
  const baseId = getBaseId(pokemon);
  const generation = GENERATIONS.find(
    (g) => baseId >= g.pokemonRange[0] && baseId <= g.pokemonRange[1]
  );
  return (generation?.region as RegionOption) ?? null;
}

function safeStat(pokemon: any, stat: string): number {
  if (!pokemon?.stats) return 0;
  const value = pokemon.stats[stat];
  if (value === null || value === undefined) return 0;
  return typeof value === 'number' ? value : Number(value) || 0;
}

function getTotalStat(pokemon: any): number {
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

function countActiveFilters(filters: FilterState, showRegionFilter = true): number {
  return (
    filters.types.length +
    filters.weakTo.length +
    filters.strongAgainst.length +
    (filters.typeMatchMode !== 'any' ? 1 : 0) +
    (showRegionFilter ? filters.regions.length : 0) +
    filters.classifications.length +
    filters.evolutionStages.length +
    (filters.hasMega !== null ? 1 : 0) +
    (filters.hasGmax !== null ? 1 : 0) +
    (filters.sortBy !== 'id' ? 1 : 0)
  );
}

export function hasActiveFilters(filters: FilterState): boolean {
  return countActiveFilters(filters, true) > 0;
}

const FILTER_STORAGE_KEY = 'pokedex-filters-v2';

export function saveFiltersToSession(key: string, filters: FilterState, page: number) {
  try {
    sessionStorage.setItem(
      `${FILTER_STORAGE_KEY}-${key}`,
      JSON.stringify({ filters, page })
    );
  } catch {}
}

export function loadFiltersFromSession(key: string): { filters: FilterState; page: number } | null {
  try {
    const raw = sessionStorage.getItem(`${FILTER_STORAGE_KEY}-${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      filters: cloneFilters(parsed.filters),
      page: parsed.page || 0,
    };
  } catch {
    return null;
  }
}

export function ActiveFilterChips({
  filters,
  onChange,
  showRegionFilter = true,
}: Props) {
  const chips = useMemo(() => {
    const items: { label: string; onRemove: () => void }[] = [];

    filters.types.forEach((type) => {
      items.push({
        label: `Tipo: ${TYPE_TRANSLATIONS[type]}`,
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            types: filters.types.filter((x) => x !== type),
          }),
      });
    });

    if (filters.types.length > 1 && filters.typeMatchMode !== 'any') {
      items.push({
        label: 'Tipos: E',
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            typeMatchMode: 'any',
          }),
      });
    }

    filters.weakTo.forEach((type) => {
      items.push({
        label: `Fraco: ${TYPE_TRANSLATIONS[type]}`,
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            weakTo: filters.weakTo.filter((x) => x !== type),
          }),
      });
    });


    filters.strongAgainst.forEach((type) => {
      items.push({
        label: `Forte: ${TYPE_TRANSLATIONS[type]}`,
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            strongAgainst: filters.strongAgainst.filter((x) => x !== type),
          }),
      });
    });

    if (filters.hasMega !== null) {
      items.push({
        label: filters.hasMega ? 'Tem Mega' : 'Sem Mega',
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            hasMega: null,
          }),
      });
    }

    if (filters.hasGmax !== null) {
      items.push({
        label: filters.hasGmax ? 'Tem Gmax' : 'Sem Gmax',
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            hasGmax: null,
          }),
      });
    }

    if (showRegionFilter) {
      filters.regions.forEach((region) => {
        items.push({
          label: `Região: ${region}`,
          onRemove: () =>
            onChange({
              ...cloneFilters(filters),
              regions: filters.regions.filter((x) => x !== region),
            }),
        });
      });
    }

    filters.classifications.forEach((classification) => {
      items.push({
        label: CLASSIFICATION_LABELS[classification],
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            classifications: filters.classifications.filter((x) => x !== classification),
          }),
      });
    });

    filters.evolutionStages.forEach((stage) => {
      items.push({
        label: `Estágio: ${EVOLUTION_STAGE_LABELS[stage]}`,
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            evolutionStages: filters.evolutionStages.filter((x) => x !== stage),
          }),
      });
    });

    if (filters.sortBy !== 'id') {
      const label =
        SORT_OPTIONS.find((opt) => opt.value === filters.sortBy)?.label || filters.sortBy;

      items.push({
        label: `Ordem: ${label}`,
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            sortBy: 'id',
            sortDir: 'asc',
          }),
      });
    }

    return items;
  }, [filters, onChange, showRegionFilter]);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {chips.map((chip, index) => (
        <button
          key={index}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 text-xs font-medium hover:bg-primary/20 transition-colors"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}

      <button
        onClick={() => onChange(getFreshDefaults())}
        className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-1 text-xs font-medium hover:bg-destructive/20 transition-colors"
      >
        Limpar tudo
      </button>
    </div>
  );
}

function FilterContent({
  filters,
  onChange,
  onClose,
  showRegionFilter = true,
}: Props & { onClose: () => void }) {
  const [local, setLocal] = useState<FilterState>(() => cloneFilters(filters));

  const toggleInArray = <T,>(array: T[], value: T) =>
    array.includes(value) ? array.filter((x) => x !== value) : [...array, value];

  const apply = () => {
    onChange(cloneFilters(local));
    onClose();
  };

  const clear = () => {
    const fresh = getFreshDefaults();
    setLocal(fresh);
    onChange(fresh);
    onClose();
  };

  return (
    <div className="space-y-6 py-2">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground">Tipo</h4>
          <div className="flex gap-1">
            <button
              onClick={() =>
                setLocal((prev) => ({ ...prev, typeMatchMode: 'any' }))
              }
              className={`px-2 py-1 rounded-md text-[11px] font-medium border ${
                local.typeMatchMode === 'any'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
              }`}
            >
              OU
            </button>
            <button
              onClick={() =>
                setLocal((prev) => ({ ...prev, typeMatchMode: 'all' }))
              }
              className={`px-2 py-1 rounded-md text-[11px] font-medium border ${
                local.typeMatchMode === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
              }`}
            >
              E
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() =>
                setLocal((prev) => ({
                  ...prev,
                  types: toggleInArray(prev.types, type),
                }))
              }
              className={`transition-all ${
                local.types.includes(type)
                  ? 'ring-2 ring-primary scale-110'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <TypeBadge type={type} size="sm" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Fraco contra</h4>
        <div className="flex flex-wrap gap-1.5">
          {WEAKNESS_FILTER_TYPES.map((type) => (
            <button
              key={type}
              onClick={() =>
                setLocal((prev) => ({
                  ...prev,
                  weakTo: toggleInArray(prev.weakTo, type),
                }))
              }
              className={`transition-all ${
                local.weakTo.includes(type)
                  ? 'ring-2 ring-destructive scale-110'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <TypeBadge type={type} size="sm" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Forte contra</h4>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((type) => (
            <button
              key={type}
              onClick={() =>
                setLocal((prev) => ({
                  ...prev,
                  strongAgainst: toggleInArray(prev.strongAgainst, type),
                }))
              }
              className={`transition-all ${
                local.strongAgainst.includes(type)
                  ? 'ring-2 ring-green-500 scale-110'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <TypeBadge type={type} size="sm" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Formas Especiais</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Tem Mega', key: 'hasMega', value: true },
            { label: 'Sem Mega', key: 'hasMega', value: false },
            { label: 'Tem Gmax', key: 'hasGmax', value: true },
            { label: 'Sem Gmax', key: 'hasGmax', value: false },
          ].map((option) => (
            <button
              key={`${option.key}-${String(option.value)}`}
              onClick={() =>
                setLocal((prev) => ({
                  ...prev,
                  [option.key]:
                    (prev as any)[option.key] === option.value ? null : option.value,
                }))
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                (local as any)[option.key] === option.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {showRegionFilter && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Região</h4>
          <div className="flex flex-wrap gap-2">
            {ALL_REGIONS.map((region) => (
              <button
                key={region}
                onClick={() =>
                  setLocal((prev) => ({
                    ...prev,
                    regions: toggleInArray(prev.regions, region as RegionOption),
                  }))
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  local.regions.includes(region as RegionOption)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Classificação</h4>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CLASSIFICATION_LABELS) as ClassificationOption[]).map((classification) => (
            <button
              key={classification}
              onClick={() =>
                setLocal((prev) => ({
                  ...prev,
                  classifications: toggleInArray(prev.classifications, classification),
                }))
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                local.classifications.includes(classification)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
              }`}
            >
              {CLASSIFICATION_LABELS[classification]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Estágio Evolutivo</h4>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(EVOLUTION_STAGE_LABELS) as EvolutionStageOption[]).map((stage) => (
            <button
              key={stage}
              onClick={() =>
                setLocal((prev) => ({
                  ...prev,
                  evolutionStages: toggleInArray(prev.evolutionStages, stage),
                }))
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                local.evolutionStages.includes(stage)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
              }`}
            >
              {EVOLUTION_STAGE_LABELS[stage]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Ordenar por</h4>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                setLocal((prev) => ({
                  ...prev,
                  sortBy: option.value,
                  sortDir:
                    prev.sortBy === option.value
                      ? prev.sortDir === 'asc'
                        ? 'desc'
                        : 'asc'
                      : option.value === 'name'
                        ? 'asc'
                        : 'desc',
                }))
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1 ${
                local.sortBy === option.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
              }`}
            >
              {option.label}
              {local.sortBy === option.value && (
                <span className="text-[10px]">{local.sortDir === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={apply} className="flex-1">
          Aplicar Filtros
        </Button>
        <Button variant="outline" onClick={clear}>
          Limpar
        </Button>
      </div>
    </div>
  );
}

export function PokemonFilterButton({
  filters,
  onChange,
  showRegionFilter = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(filters, showRegionFilter) > 0;
  const activeCount = countActiveFilters(filters, showRegionFilter);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-1.5 ${active ? 'border-primary text-primary' : ''}`}
        >
          <Filter className="h-4 w-4" />
          Filtros
          {active && (
            <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Filtros e Ordenação
          </SheetTitle>
        </SheetHeader>

        <FilterContent
          filters={filters}
          onChange={onChange}
          onClose={() => setOpen(false)}
          showRegionFilter={showRegionFilter}
        />
      </SheetContent>
    </Sheet>
  );
}

export function applyFilters(
  pokemons: import('@/lib/pokeapi').PokemonBasic[],
  filters: FilterState
): import('@/lib/pokeapi').PokemonBasic[] {
  let result = [...pokemons];

  if (filters.types.length > 0) {
    if (filters.typeMatchMode === 'all') {
      result = result.filter((pokemon) =>
        filters.types.every((type) => pokemon.types.includes(type))
      );
    } else {
      result = result.filter((pokemon) =>
        filters.types.some((type) => pokemon.types.includes(type))
      );
    }
  }

  if (filters.weakTo.length > 0) {
    result = result.filter((pokemon) => {
      const matchups = getDefensiveMatchups(pokemon.types);
      return filters.weakTo.every((type) =>
        matchups.weaknesses.some((weakness) => weakness.type === type)
      );
    });
  }


  if (filters.strongAgainst.length > 0) {
    result = result.filter((pokemon) => {
      const offensive = getOffensiveMatchups(pokemon.types);
      return filters.strongAgainst.every((type) =>
        offensive.superEffective.includes(type)
      );
    });
  }

  if (filters.hasMega === true) {
    result = result.filter((pokemon: any) => MEGA_POKEMON_IDS.has(getBaseId(pokemon)));
  }

  if (filters.hasMega === false) {
    result = result.filter((pokemon: any) => !MEGA_POKEMON_IDS.has(getBaseId(pokemon)));
  }

  if (filters.hasGmax === true) {
    result = result.filter((pokemon: any) => GMAX_POKEMON_IDS.has(getBaseId(pokemon)));
  }

  if (filters.hasGmax === false) {
    result = result.filter((pokemon: any) => !GMAX_POKEMON_IDS.has(getBaseId(pokemon)));
  }

  if (filters.regions.length > 0) {
    result = result.filter((pokemon: any) => {
      const region = getRegionForPokemon(pokemon);
      return region ? filters.regions.includes(region) : false;
    });
  }

  if (filters.classifications.length > 0) {
    result = result.filter((pokemon: any) => {
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
    result = result.filter((pokemon: any) => {
      const stage = pokemon.evolutionStage as string | undefined;
      if (!stage) return filters.evolutionStages.includes('basic');
      return filters.evolutionStages.includes(stage as EvolutionStageOption);
    });
  }

  const { sortBy, sortDir } = filters;
  const dir = sortDir === 'asc' ? 1 : -1;

  if (sortBy === 'name') {
    result.sort((a: any, b: any) => {
      const cmp = a.name.localeCompare(b.name) * dir;
      if (cmp !== 0) return cmp;
      return (getBaseId(a) - getBaseId(b)) * dir;
    });
  } else if (sortBy === 'id') {
    result.sort((a: any, b: any) => {
      return (getBaseId(a) - getBaseId(b)) * dir;
    });
  } else if (sortBy === 'height') {
    result.sort((a: any, b: any) => {
      const cmp = ((a.height || 0) - (b.height || 0)) * dir;
      if (cmp !== 0) return cmp;
      return (getBaseId(a) - getBaseId(b)) * dir;
    });
  } else if (sortBy === 'weight') {
    result.sort((a: any, b: any) => {
      const cmp = ((a.weight || 0) - (b.weight || 0)) * dir;
      if (cmp !== 0) return cmp;
      return (getBaseId(a) - getBaseId(b)) * dir;
    });
  } else if (sortBy === 'total') {
    result.sort((a: any, b: any) => {
      const cmp = (getTotalStat(a) - getTotalStat(b)) * dir;
      if (cmp !== 0) return cmp;
      return (getBaseId(a) - getBaseId(b)) * dir;
    });
  } else {
    result.sort((a: any, b: any) => {
      const aVal = safeStat(a, sortBy);
      const bVal = safeStat(b, sortBy);

      const cmp = (aVal - bVal) * dir;
      if (cmp !== 0) return cmp;

      return (getBaseId(a) - getBaseId(b)) * dir;
    });
  }

  return result;
}