import { useState } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet';
import { countActiveFilters, type FilterProps } from '@/features/catalog/filter-state';
import { FilterContent } from './filters/FilterContent';
import './filters/filters.css';
import { localized } from '@/lib/language';
export { ActiveFilterChips } from './filters/ActiveFilterChips';

export function PokemonFilterButton({
  filters,
  onChange,
  gameOptions,
  showRegionFilter = true,
  showSpecialFormFilters = true,
}: FilterProps) {
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(filters, showRegionFilter, showSpecialFormFilters) > 0;
  const activeCount = countActiveFilters(filters, showRegionFilter, showSpecialFormFilters);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-1.5 ${active ? 'border-primary text-primary' : ''}`}
        >
          <Filter className="h-4 w-4" />
          {localized('Filtros', 'Filters')}
          {active && (
            <span className="h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="pokedex-filters w-full sm:max-w-md overflow-y-auto"
        onEscapeKeyDown={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest('[data-game-selector-options]')
          ) {
            event.preventDefault();
          }
        }}
      >
        <SheetHeader className="pokedex-filter-header">
          <SheetTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            {localized('Filtros e Ordenação', 'Filters and sorting')}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {localized(
              'Escolha os critérios e confirme em Aplicar Filtros.',
              'Choose your criteria and confirm with Apply filters.',
            )}
          </SheetDescription>
        </SheetHeader>

        <FilterContent
          gameOptions={gameOptions}
          filters={filters}
          onChange={onChange}
          onClose={() => setOpen(false)}
          showRegionFilter={showRegionFilter}
          showSpecialFormFilters={showSpecialFormFilters}
        />
      </SheetContent>
    </Sheet>
  );
}
