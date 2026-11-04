import { useMemo } from 'react';
import { X } from 'lucide-react';
import { TYPE_TRANSLATIONS, VERSION_GROUP_NAMES } from '@/lib/pokemon/constants';
import {
  cloneFilters,
  getFreshDefaults,
  CLASSIFICATION_LABELS,
  EVOLUTION_STAGE_LABELS,
  SORT_OPTIONS,
  type FilterProps,
} from '@/features/catalog/filter-state';
import { localized } from '@/lib/language';

export function ActiveFilterChips({
  filters,
  onChange,
  showRegionFilter = true,
  showSpecialFormFilters = true,
}: FilterProps) {
  const chips = useMemo(() => {
    const items: { label: string; onRemove: () => void }[] = [];

    if (filters.game) {
      items.push({
        label: `${localized('Jogo', 'Game')}: ${VERSION_GROUP_NAMES[filters.game] ?? filters.game}`,
        onRemove: () => onChange({ ...cloneFilters(filters), game: '' }),
      });
    }

    filters.types.forEach((type) => {
      items.push({
        label: `${localized('Tipo', 'Type')}: ${TYPE_TRANSLATIONS[type]}`,
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            types: filters.types.filter((x) => x !== type),
          }),
      });
    });

    if (filters.types.length > 1 && filters.typeMatchMode !== 'any') {
      items.push({
        label: `${localized('Tipos', 'Types')}: ${localized('Todos', 'All')}`,
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            typeMatchMode: 'any',
          }),
      });
    }

    filters.weakTo.forEach((type) => {
      items.push({
        label: `${localized('Fraco', 'Weak to')}: ${TYPE_TRANSLATIONS[type]}`,
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            weakTo: filters.weakTo.filter((x) => x !== type),
          }),
      });
    });

    filters.strongAgainst.forEach((type) => {
      items.push({
        label: `${localized('Forte', 'Strong against')}: ${TYPE_TRANSLATIONS[type]}`,
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            strongAgainst: filters.strongAgainst.filter((x) => x !== type),
          }),
      });
    });

    if (showSpecialFormFilters && filters.hasMega !== null) {
      items.push({
        label: filters.hasMega
          ? localized('Tem Mega', 'Has Mega')
          : localized('Sem Mega', 'No Mega'),
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            hasMega: null,
          }),
      });
    }

    if (showSpecialFormFilters && filters.hasGmax !== null) {
      items.push({
        label: filters.hasGmax
          ? localized('Tem Gmax', 'Has Gmax')
          : localized('Sem Gmax', 'No Gmax'),
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
          label: `${localized('Região', 'Region')}: ${region}`,
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
        label: `${localized('Estágio', 'Stage')}: ${EVOLUTION_STAGE_LABELS[stage]}`,
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            evolutionStages: filters.evolutionStages.filter((x) => x !== stage),
          }),
      });
    });

    if (filters.sortBy !== 'id' || filters.sortDir !== 'asc') {
      const label =
        SORT_OPTIONS.find((opt) => opt.value === filters.sortBy)?.label || filters.sortBy;

      items.push({
        label: `${localized('Ordem', 'Sort')}: ${label} (${filters.sortDir === 'asc' ? localized('crescente', 'ascending') : localized('decrescente', 'descending')})`,
        onRemove: () =>
          onChange({
            ...cloneFilters(filters),
            sortBy: 'id',
            sortDir: 'asc',
          }),
      });
    }

    return items;
  }, [filters, onChange, showRegionFilter, showSpecialFormFilters]);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {chips.map((chip, index) => (
        <button
          key={index}
          onClick={chip.onRemove}
          aria-label={`${localized('Remover', 'Remove')} ${chip.label}`}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 text-xs font-medium hover:bg-primary/20 transition-colors"
        >
          {chip.label}
          <X className="h-3 w-3" />
        </button>
      ))}

      <button
        onClick={() => onChange(getFreshDefaults())}
        className="inline-flex items-center rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-1 text-xs font-medium hover:bg-destructive/20 transition-colors"
      >
        {localized('Limpar tudo', 'Clear all')}
      </button>
    </div>
  );
}
