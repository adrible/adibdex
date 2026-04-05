import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TypeBadge } from '@/components/TypeBadge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MEGA_POKEMON_IDS, GMAX_POKEMON_IDS, TYPE_TRANSLATIONS, STARTER_IDS, LEGENDARY_IDS, MYTHICAL_IDS, PSEUDO_LEGENDARY_IDS, ULTRA_BEAST_IDS, PARADOX_IDS, BABY_IDS, FOSSIL_IDS, ALL_SPECIAL_SETS } from '@/lib/pokeapi';
import { getDefensiveMatchups, getOffensiveMatchups } from '@/lib/type-effectiveness';
import { Filter, X, ArrowUpDown } from 'lucide-react';

const ALL_TYPES = Object.keys(TYPE_TRANSLATIONS);

export type SortOption = 'id' | 'name' | 'hp' | 'attack' | 'defense' | 'spAtk' | 'spDef' | 'speed' | 'height' | 'weight';
export type ClassificationOption = 'starter' | 'legendary' | 'mythical' | 'pseudo' | 'ultra_beast' | 'paradox' | 'baby' | 'fossil' | 'regular';
export type EvolutionStageOption = 'basic' | 'stage1' | 'stage2';

const CLASSIFICATION_LABELS: Record<ClassificationOption, string> = {
  starter: 'Starter', legendary: 'Lendário', mythical: 'Mítico',
  pseudo: 'Pseudo-Lendário', ultra_beast: 'Ultra Beast', paradox: 'Paradoxo', baby: 'Bebê',
  fossil: 'Fóssil', regular: 'Regular',
};

const CLASSIFICATION_SETS: Record<Exclude<ClassificationOption, 'regular'>, Set<number>> = {
  starter: STARTER_IDS, legendary: LEGENDARY_IDS, mythical: MYTHICAL_IDS,
  pseudo: PSEUDO_LEGENDARY_IDS, ultra_beast: ULTRA_BEAST_IDS, paradox: PARADOX_IDS, baby: BABY_IDS,
  fossil: FOSSIL_IDS,
};

const EVOLUTION_STAGE_LABELS: Record<EvolutionStageOption, string> = {
  basic: 'Básico', stage1: 'Estágio 1', stage2: 'Estágio 2',
};

export interface FilterState {
  types: string[];
  weakTo: string[];
  strongAgainst: string[];
  hasMega: boolean | null;
  hasGmax: boolean | null;
  classifications: ClassificationOption[];
  evolutionStages: EvolutionStageOption[];
  sortBy: SortOption;
  sortDir: 'asc' | 'desc';
}

export const DEFAULT_FILTERS: FilterState = {
  types: [], weakTo: [], strongAgainst: [], hasMega: null, hasGmax: null, classifications: [], evolutionStages: [], sortBy: 'id', sortDir: 'asc',
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
  { value: 'height', label: 'Altura' },
  { value: 'weight', label: 'Peso' },
];

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

export function hasActiveFilters(f: FilterState): boolean {
  return f.types.length > 0 || f.weakTo.length > 0 || f.strongAgainst.length > 0 || f.hasMega !== null || f.hasGmax !== null || f.classifications.length > 0 || f.evolutionStages.length > 0 || f.sortBy !== 'id';
}

// Session storage helpers for filter persistence
const FILTER_STORAGE_KEY = 'pokedex-filters';

export function saveFiltersToSession(key: string, filters: FilterState, page: number) {
  try {
    sessionStorage.setItem(`${FILTER_STORAGE_KEY}-${key}`, JSON.stringify({ filters, page }));
  } catch {}
}

export function loadFiltersFromSession(key: string): { filters: FilterState; page: number } | null {
  try {
    const raw = sessionStorage.getItem(`${FILTER_STORAGE_KEY}-${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { filters: { ...DEFAULT_FILTERS, ...parsed.filters }, page: parsed.page || 0 };
  } catch { return null; }
}

export function ActiveFilterChips({ filters, onChange }: Props) {
  const chips: { label: string; onRemove: () => void }[] = [];

  filters.types.forEach(t => {
    chips.push({
      label: `Tipo: ${TYPE_TRANSLATIONS[t]}`,
      onRemove: () => onChange({ ...filters, types: filters.types.filter(x => x !== t) }),
    });
  });

  filters.weakTo.forEach(t => {
    chips.push({
      label: `Fraco: ${TYPE_TRANSLATIONS[t]}`,
      onRemove: () => onChange({ ...filters, weakTo: filters.weakTo.filter(x => x !== t) }),
    });
  });

  filters.strongAgainst.forEach(t => {
    chips.push({
      label: `Forte: ${TYPE_TRANSLATIONS[t]}`,
      onRemove: () => onChange({ ...filters, strongAgainst: filters.strongAgainst.filter(x => x !== t) }),
    });
  });

  if (filters.hasMega !== null) {
    chips.push({
      label: filters.hasMega ? 'Tem Mega' : 'Sem Mega',
      onRemove: () => onChange({ ...filters, hasMega: null }),
    });
  }

  if (filters.hasGmax !== null) {
    chips.push({
      label: filters.hasGmax ? 'Tem Gmax' : 'Sem Gmax',
      onRemove: () => onChange({ ...filters, hasGmax: null }),
    });
  }

  filters.classifications?.forEach(c => {
    chips.push({
      label: CLASSIFICATION_LABELS[c],
      onRemove: () => onChange({ ...filters, classifications: filters.classifications.filter(x => x !== c) }),
    });
  });

  if (filters.sortBy !== 'id') {
    const label = SORT_OPTIONS.find(s => s.value === filters.sortBy)?.label || filters.sortBy;
    chips.push({
      label: `Ordem: ${label}`,
      onRemove: () => onChange({ ...filters, sortBy: 'id', sortDir: 'asc' }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={chip.onRemove}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 text-xs font-medium hover:bg-primary/20 transition-colors"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}
      <button
        onClick={() => onChange(DEFAULT_FILTERS)}
        className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-1 text-xs font-medium hover:bg-destructive/20 transition-colors"
      >
        Limpar tudo
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function FilterContent({ filters, onChange, onClose }: Props & { onClose: () => void }) {
  const [local, setLocal] = useState<FilterState>(filters);

  const toggleType = (t: string) => {
    setLocal(prev => ({
      ...prev,
      types: prev.types.includes(t) ? prev.types.filter(x => x !== t) : [...prev.types, t],
    }));
  };

  const toggleWeak = (t: string) => {
    setLocal(prev => ({
      ...prev,
      weakTo: prev.weakTo.includes(t) ? prev.weakTo.filter(x => x !== t) : [...prev.weakTo, t],
    }));
  };

  const toggleStrong = (t: string) => {
    setLocal(prev => ({
      ...prev,
      strongAgainst: prev.strongAgainst.includes(t) ? prev.strongAgainst.filter(x => x !== t) : [...prev.strongAgainst, t],
    }));
  };

  const apply = () => { onChange(local); onClose(); };
  const clear = () => { setLocal(DEFAULT_FILTERS); onChange(DEFAULT_FILTERS); onClose(); };

  return (
    <div className="space-y-6 py-2">
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Tipo</h4>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map(t => (
            <button key={t} onClick={() => toggleType(t)}
              className={`transition-all ${local.types.includes(t) ? 'ring-2 ring-primary scale-110' : 'opacity-70 hover:opacity-100'}`}>
              <TypeBadge type={t} size="sm" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Fraco contra</h4>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map(t => (
            <button key={t} onClick={() => toggleWeak(t)}
              className={`transition-all ${local.weakTo.includes(t) ? 'ring-2 ring-destructive scale-110' : 'opacity-70 hover:opacity-100'}`}>
              <TypeBadge type={t} size="sm" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Forte contra</h4>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map(t => (
            <button key={t} onClick={() => toggleStrong(t)}
              className={`transition-all ${local.strongAgainst.includes(t) ? 'ring-2 ring-green-500 scale-110' : 'opacity-70 hover:opacity-100'}`}>
              <TypeBadge type={t} size="sm" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Formas Especiais</h4>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Tem Mega', val: true, key: 'hasMega' as const },
            { label: 'Sem Mega', val: false, key: 'hasMega' as const },
            { label: 'Tem Gmax', val: true, key: 'hasGmax' as const },
            { label: 'Sem Gmax', val: false, key: 'hasGmax' as const },
          ].map(opt => (
            <button key={`${opt.key}-${opt.val}`}
              onClick={() => setLocal(prev => ({ ...prev, [opt.key]: prev[opt.key] === opt.val ? null : opt.val }))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                local[opt.key] === opt.val
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Classificação</h4>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(CLASSIFICATION_LABELS) as ClassificationOption[]).map(c => (
            <button key={c}
              onClick={() => setLocal(prev => ({
                ...prev,
                classifications: prev.classifications.includes(c)
                  ? prev.classifications.filter(x => x !== c)
                  : [...prev.classifications, c],
              }))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                local.classifications.includes(c)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
              }`}>
              {CLASSIFICATION_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-foreground mb-2">Ordenar por</h4>
        <div className="flex flex-wrap gap-1.5">
          {SORT_OPTIONS.map(opt => (
            <button key={opt.value}
              onClick={() => setLocal(prev => ({
                ...prev,
                sortBy: opt.value,
                sortDir: prev.sortBy === opt.value ? (prev.sortDir === 'asc' ? 'desc' : 'asc') : (opt.value === 'name' ? 'asc' : 'desc'),
              }))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1 ${
                local.sortBy === opt.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
              }`}>
              {opt.label}
              {local.sortBy === opt.value && (
                <span className="text-[10px]">{local.sortDir === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={apply} className="flex-1">Aplicar Filtros</Button>
        <Button variant="outline" onClick={clear}>Limpar</Button>
      </div>
    </div>
  );
}

export function PokemonFilterButton({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const active = hasActiveFilters(filters);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-1.5 ${active ? 'border-primary text-primary' : ''}`}>
          <Filter className="h-4 w-4" />
          Filtros
          {active && (
            <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
              {filters.types.length + filters.weakTo.length + filters.strongAgainst.length + filters.classifications.length + (filters.hasMega !== null ? 1 : 0) + (filters.hasGmax !== null ? 1 : 0) + (filters.sortBy !== 'id' ? 1 : 0)}
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
        <FilterContent filters={filters} onChange={onChange} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function applyFilters(pokemons: import('@/lib/pokeapi').PokemonBasic[], filters: FilterState): import('@/lib/pokeapi').PokemonBasic[] {
  let result = [...pokemons];

  if (filters.types.length > 0) {
    result = result.filter(p => filters.types.some(t => p.types.includes(t)));
  }

  if (filters.weakTo.length > 0) {
    result = result.filter(p => {
      const matchups = getDefensiveMatchups(p.types);
      return filters.weakTo.every(t =>
        matchups.weaknesses.some(w => w.type === t)
      );
    });
  }

  if (filters.strongAgainst.length > 0) {
    result = result.filter(p => {
      const offensive = getOffensiveMatchups(p.types);
      return filters.strongAgainst.every(t =>
        offensive.superEffective.includes(t)
      );
    });
  }

  if (filters.hasMega === true) result = result.filter(p => MEGA_POKEMON_IDS.has(p.id));
  if (filters.hasMega === false) result = result.filter(p => !MEGA_POKEMON_IDS.has(p.id));
  if (filters.hasGmax === true) result = result.filter(p => GMAX_POKEMON_IDS.has(p.id));
  if (filters.hasGmax === false) result = result.filter(p => !GMAX_POKEMON_IDS.has(p.id));

  if (filters.classifications && filters.classifications.length > 0) {
    result = result.filter(p => {
      const baseId = (p as any).baseId || p.id;
      return filters.classifications.some(c => CLASSIFICATION_SETS[c].has(baseId));
    });
  }

  const { sortBy, sortDir } = filters;
  const dir = sortDir === 'asc' ? 1 : -1;

  if (sortBy === 'name') {
    result.sort((a, b) => a.name.localeCompare(b.name) * dir);
  } else if (sortBy === 'id') {
    result.sort((a, b) => (a.id - b.id) * dir);
  } else if (sortBy === 'height') {
    result.sort((a, b) => ((a.height || 0) - (b.height || 0)) * dir);
  } else if (sortBy === 'weight') {
    result.sort((a, b) => ((a.weight || 0) - (b.weight || 0)) * dir);
  } else {
    result.sort((a, b) => {
      const aVal = a.stats?.[sortBy as keyof NonNullable<typeof a.stats>] || 0;
      const bVal = b.stats?.[sortBy as keyof NonNullable<typeof b.stats>] || 0;
      return (aVal - bVal) * dir;
    });
  }

  return result;
}
