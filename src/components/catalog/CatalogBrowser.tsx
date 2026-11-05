import { useLocation, useNavigate } from 'react-router-dom';
import { ActiveFilterChips } from '@/components/PokemonFilters';
import { PokemonCard } from '@/components/PokemonCard';
import { QueryErrorState } from '@/components/QueryErrorState';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { useCatalogView } from '@/features/catalog/use-catalog-view';
import { CatalogToolbar } from './CatalogToolbar';
import { CatalogPagination } from './CatalogPagination';
import { localized } from '@/lib/language';

interface Props {
  view: ReturnType<typeof useCatalogView>;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  showRegionFilter?: boolean;
  showSpecialFormFilters?: boolean;
  allowShowAll?: boolean;
  suggestions?: boolean;
}

export function CatalogBrowser({
  view,
  loading,
  error,
  onRetry,
  allowShowAll = false,
  suggestions = false,
  showRegionFilter = true,
  showSpecialFormFilters = true,
}: Props) {
  const location = useLocation(),
    navigate = useNavigate();
  const filterOptions = { showRegionFilter, showSpecialFormFilters };
  const pagination = !view.showAll && (
    <CatalogPagination page={view.page} totalPages={view.totalPages} onChange={view.setPage} />
  );
  return (
    <>
      <CatalogToolbar
        view={view}
        {...filterOptions}
        onSuggestion={
          suggestions
            ? (id) =>
                navigate(`/pokemon/${id}`, {
                  state: {
                    origin: location.pathname,
                    listContext: {
                      ids: view.visibleIds,
                      currentIndex: view.visibleIds.indexOf(id),
                    },
                  },
                })
            : undefined
        }
      >
        {allowShowAll && (
          <>
            <Button
              variant="outline"
              size="sm"
              aria-pressed={!view.showAll}
              onClick={() => view.setShowAll(false)}
              className={!view.showAll ? 'catalog-view-active' : ''}
            >
              {localized('Paginado', 'Paged')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-pressed={view.showAll}
              onClick={() => view.setShowAll(true)}
              className={view.showAll ? 'catalog-view-active' : ''}
            >
              {localized('Todos', 'All')}
            </Button>
          </>
        )}
      </CatalogToolbar>
      <ActiveFilterChips filters={view.filters} onChange={view.setFilters} {...filterOptions} />
      {error ? (
        <QueryErrorState onRetry={onRetry} />
      ) : loading ? (
        <div
          className="catalog-grid"
          role="status"
          aria-label={localized('Carregando Pokémon', 'Loading Pokémon')}
        >
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="catalog-skeleton-card">
              <Skeleton className="h-36 w-full rounded-lg mb-3" />
              <Skeleton className="h-3 w-12 mb-2" />
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {allowShowAll && pagination}
          <div className="catalog-grid">
            {view.displayed.length === 0 && (
              <p className="catalog-empty" role="status">
                {localized('Nenhum Pokémon encontrado.', 'No Pokémon found.')}
              </p>
            )}
            {view.displayed.map((p) => (
              <div key={p.id} style={{ contentVisibility: 'auto', containIntrinsicSize: '220px' }}>
                <PokemonCard
                  pokemon={p}
                  search={view.search}
                  game={view.filters.game}
                  isShiny={view.isShiny}
                  originPath={location.pathname}
                  listContext={{
                    ids: view.visibleIds,
                    currentIndex: view.visibleIds.indexOf(p.id),
                  }}
                />
              </div>
            ))}
          </div>
          {pagination}
        </>
      )}
    </>
  );
}
