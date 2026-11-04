import { useState, type ReactNode } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PokemonFilterButton } from '@/components/PokemonFilters';
import type { useCatalogView } from '@/features/catalog/use-catalog-view';
import type { FilterProps } from '@/features/catalog/filter-state';
import { localized } from '@/lib/language';

type View = ReturnType<typeof useCatalogView>;
interface Props extends Pick<FilterProps, 'showRegionFilter' | 'showSpecialFormFilters'> {
  view: View;
  children?: ReactNode;
  onSuggestion?: (id: number) => void;
}

export function CatalogToolbar({ view, children, onSuggestion, ...filterOptions }: Props) {
  const [focused, setFocused] = useState(false);
  const suggestions =
    focused && view.search.trim() && onSuggestion ? view.filtered.slice(0, 20) : [];
  return (
    <div className="catalog-tools">
      <div className="catalog-toolbar">
        <div
          className="catalog-search"
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setFocused(false);
          }}
        >
          <Search className="catalog-search-icon" aria-hidden="true" />
          <Input
            type="search"
            maxLength={200}
            placeholder={localized(
              'Nome, número, habilidade ou ataque...',
              'Name, number, ability, or move...',
            )}
            aria-label={localized(
              'Buscar Pokémon por nome, número, habilidade ou ataque',
              'Search Pokémon by name, number, ability, or move',
            )}
            value={view.search}
            onChange={(event) => view.setSearch(event.target.value)}
            className="pl-10"
          />
          {suggestions.length > 0 && (
            <div
              className="catalog-suggestions"
              aria-label={localized('Sugestões de Pokémon', 'Pokémon suggestions')}
            >
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="catalog-suggestion"
                  onClick={() => onSuggestion?.(p.id)}
                >
                  <img src={p.sprite} alt="" className="h-8 w-8 object-contain" loading="lazy" />
                  <span className="text-sm font-medium capitalize">
                    {p.name.replace(/-/g, ' ')}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    #{String(p.baseId ?? p.id).padStart(4, '0')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="catalog-actions">
          <PokemonFilterButton
            gameOptions={view.gameOptions}
            filters={view.filters}
            onChange={view.setFilters}
            {...filterOptions}
          />
          <Button
            variant={view.isShiny ? 'default' : 'outline'}
            size="sm"
            onClick={() => view.setIsShiny(!view.isShiny)}
            aria-pressed={view.isShiny}
            className={`gap-1 ${view.isShiny ? 'catalog-shiny-active' : ''}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {localized('Shiny', 'Shiny')}
          </Button>
          {children}
        </div>
      </div>
      <p className="catalog-search-help">
        {localized(
          'Busque também por habilidade — incluindo habilidades ocultas — ou por ataque aprendido, como Surf e Thunderbolt. Ataques consideram todos os jogos e métodos de aprendizado registrados; a disponibilidade varia por jogo.',
          'Search by ability, including hidden abilities, or by a learned move such as Surf or Thunderbolt. Move results include all recorded games and learning methods; availability varies by game.',
        )}
      </p>
    </div>
  );
}
