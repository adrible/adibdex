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

const FILTER_STORAGE_KEY = 'pokedex-filters';

export function saveFiltersToSession(key: string, filters: any, page: number) {
  try {
    sessionStorage.setItem(
      `${FILTER_STORAGE_KEY}-${key}`,
      JSON.stringify({ filters, page })
    );
  } catch {}
}

export function loadFiltersFromSession(key: string) {
  try {
    const raw = sessionStorage.getItem(`${FILTER_STORAGE_KEY}-${key}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const ALL_TYPES = Object.keys(TYPE_TRANSLATIONS);
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
  | 'weight';

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

const SORT_OPTIONS = [
  { value: 'id', label: 'Número Nacional' },
  { value: 'name', label: 'Alfabética (A–Z)' },
  { value: 'hp', label: 'HP' },
  { value: 'attack', label: 'Ataque' },
  { value: 'defense', label: 'Defesa' },
  { value: 'spAtk', label: 'Atq. Esp.' },
  { value: 'spDef', label: 'Def. Esp.' },
  { value: 'speed', label: 'Velocidade' },
  { value: 'height', label: 'Altura' },
  { value: 'weight', label: 'Peso' },
] as const;

export interface FilterState {
  types: string[];
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

export const DEFAULT_FILTERS = createDefaultFilters();

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

function getBaseId(p: any) {
  return p.baseId ?? p.id;
}

function getRegionForPokemon(p: any): RegionOption | null {
  const id = getBaseId(p);
  const gen = GENERATIONS.find(
    (g) => id >= g.pokemonRange[0] && id <= g.pokemonRange[1]
  );
  return (gen?.region as RegionOption) ?? null;
}

function safeStat(p: any, stat: string) {
  if (!p.stats) return 0;
  const val = p.stats[stat];
  if (val == null) return 0;
  return typeof val === 'number' ? val : Number(val) || 0;
}

function countActiveFilters(f: FilterState, showRegion = true) {
  return (
    f.types.length +
    f.weakTo.length +
    f.strongAgainst.length +
    (showRegion ? f.regions.length : 0) +
    f.classifications.length +
    f.evolutionStages.length +
    (f.hasMega !== null ? 1 : 0) +
    (f.hasGmax !== null ? 1 : 0) +
    (f.sortBy !== 'id' ? 1 : 0)
  );
}

export function hasActiveFilters(f: FilterState) {
  return countActiveFilters(f) > 0;
}

export function PokemonFilterButton({
  filters,
  onChange,
  showRegionFilter = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters, showRegionFilter);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-4 w-4" />
          Filtros
          {activeCount > 0 && (
            <span className="h-4 w-4 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
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

function FilterContent({
  filters,
  onChange,
  onClose,
  showRegionFilter = true,
}: Props & { onClose: () => void }) {
  const [local, setLocal] = useState(() => cloneFilters(filters));

  const toggle = <T,>(arr: T[], val: T) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

  return (
    <div className="space-y-6 py-2">

      {showRegionFilter && (
        <div>
          <h4 className="text-sm font-semibold mb-2">Região</h4>
          <div className="flex flex-wrap gap-2">
            {ALL_REGIONS.map((r) => (
              <button
                key={r}
                onClick={() =>
                  setLocal((p) => ({ ...p, regions: toggle(p.regions, r as RegionOption) }))
                }
                className={`px-3 py-1.5 rounded-full text-xs border ${
                  local.regions.includes(r as RegionOption)
                    ? 'bg-primary text-white'
                    : 'bg-muted/40'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button onClick={() => { onChange(local); onClose(); }} className="flex-1">
          Aplicar
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const fresh = getFreshDefaults();
            setLocal(fresh);
            onChange(fresh);
            onClose();
          }}
        >
          Limpar
        </Button>
      </div>
    </div>
  );
}

export function applyFilters(pokemons: any[], filters: FilterState) {
  let result = [...pokemons];

  if (filters.regions.length > 0) {
    result = result.filter((p) => {
      const region = getRegionForPokemon(p);
      return region ? filters.regions.includes(region) : false;
    });
  }

  const { sortBy, sortDir } = filters;
  const dir = sortDir === 'asc' ? 1 : -1;

  if (sortBy === 'id') {
    result.sort((a, b) => (getBaseId(a) - getBaseId(b)) * dir);
  } else {
    result.sort((a, b) => {
      const cmp = (safeStat(a, sortBy) - safeStat(b, sortBy)) * dir;
      if (cmp !== 0) return cmp;
      return (getBaseId(a) - getBaseId(b)) * dir;
    });
  }

  return result;
}