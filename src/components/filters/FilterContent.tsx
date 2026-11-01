import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GameSelector } from './GameSelector';
import { TypeBadge } from '@/components/TypeBadge';
import {
  cloneFilters,
  getFreshDefaults,
  ALL_TYPES,
  WEAKNESS_FILTER_TYPES,
  ALL_REGIONS,
  CLASSIFICATION_LABELS,
  EVOLUTION_STAGE_LABELS,
  SORT_OPTIONS,
  type FilterProps,
  type FilterState,
  type RegionOption,
  type ClassificationOption,
  type EvolutionStageOption,
} from '@/features/catalog/filter-state';

export function FilterContent({
  filters,
  onChange,
  onClose,
  gameOptions = [],
  showRegionFilter = true,
  showSpecialFormFilters = true,
}: FilterProps & { onClose: () => void }) {
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
      <GameSelector
        value={local.game}
        options={gameOptions}
        onChange={(game) => setLocal((prev) => ({ ...prev, game }))}
      />
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-foreground">Tipos</h4>

          <div className="flex rounded-full bg-muted p-1 sm:bg-transparent sm:p-0 sm:gap-1.5">
            <button
              onClick={() => setLocal((prev) => ({ ...prev, typeMatchMode: 'any' }))}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                local.typeMatchMode === 'any'
                  ? 'bg-primary text-primary-foreground shadow-sm sm:border sm:border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Um
            </button>

            <button
              onClick={() =>
                setLocal((prev) => ({
                  ...prev,
                  typeMatchMode: 'all',
                  types: prev.types.slice(-2),
                }))
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                local.typeMatchMode === 'all'
                  ? 'bg-primary text-primary-foreground shadow-sm sm:border sm:border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Todos
            </button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-2">
          {local.typeMatchMode === 'any'
            ? 'Possui ao menos um dos tipos selecionados'
            : 'Possui todos os tipos selecionados'}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((type) => (
            <button
              key={type}
              aria-pressed={local.types.includes(type)}
              disabled={
                local.typeMatchMode === 'all' &&
                local.types.length >= 2 &&
                !local.types.includes(type)
              }
              onClick={() =>
                setLocal((prev) => {
                  const alreadySelected = prev.types.includes(type);

                  if (alreadySelected) {
                    return {
                      ...prev,
                      types: prev.types.filter((t) => t !== type),
                    };
                  }

                  if (prev.typeMatchMode === 'all' && prev.types.length >= 2) {
                    return prev;
                  }

                  return {
                    ...prev,
                    types: [...prev.types, type],
                  };
                })
              }
              className={`transition-all ${
                local.types.includes(type)
                  ? 'ring-2 ring-primary scale-110'
                  : local.typeMatchMode === 'all' && local.types.length >= 2
                    ? 'opacity-30 cursor-not-allowed'
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

      {showSpecialFormFilters && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Formas Especiais</h4>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { label: 'Tem Mega', key: 'hasMega', value: true },
                { label: 'Sem Mega', key: 'hasMega', value: false },
                { label: 'Tem Gmax', key: 'hasGmax', value: true },
                { label: 'Sem Gmax', key: 'hasGmax', value: false },
              ] as const
            ).map((option) => (
              <button
                key={`${option.key}-${String(option.value)}`}
                onClick={() =>
                  setLocal((prev) => ({
                    ...prev,
                    [option.key]: prev[option.key] === option.value ? null : option.value,
                  }))
                }
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  local[option.key] === option.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
