import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPokemonListByRange, type Generation } from '@/lib/pokeapi';
import { PokemonCard } from './PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { QueryErrorState } from './QueryErrorState';
import { useCatalogView, PAGE_SIZE } from '@/features/catalog/use-catalog-view';
import { PokemonFilterButton, ActiveFilterChips } from './PokemonFilters';

export const PokemonGrid = React.memo(function PokemonGrid({
  generation,
}: {
  generation: Generation;
}) {
  const query = useQuery({
    queryKey: ['catalog', 'generation', generation.id],
    queryFn: ({ signal }) => fetchPokemonListByRange(...generation.pokemonRange, { signal }),
    staleTime: 60 * 60_000,
  });
  const {
    search,
    setSearch,
    showAll,
    setShowAll,
    page,
    setPage,
    isShiny,
    setIsShiny,
    filters,
    setFilters: handleFiltersChange,
    displayed: paginatedResults,
    visibleIds,
    totalPages: totalFilteredPages,
  } = useCatalogView(`gen-${generation.id}`, query.data, query.isSuccess, true, false);
  const [pageInput, setPageInput] = useState('');
  const location = useLocation();
  const totalPokemon = generation.pokemonRange[1] - generation.pokemonRange[0] + 1;
  const isLoading = query.isPending,
    isError = query.isError,
    refetch = query.refetch;
  const showPagination = !showAll && totalFilteredPages > 1;
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(event.target.value);
  const handleShowPaginated = () => setShowAll(false);
  const handleShowAll = () => setShowAll(true);
  const handlePrevPage = () => {
    setPage((p) => p - 1);
    window.scrollTo(0, 0);
  };
  const handleNextPage = () => {
    setPage((p) => p + 1);
    window.scrollTo(0, 0);
  };
  const handlePageInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const value = Number(pageInput);
    if (Number.isSafeInteger(value) && value >= 1 && value <= totalFilteredPages) {
      setPage(value - 1);
      window.scrollTo(0, 0);
    }
    setPageInput('');
  };
  const paginationControls = showPagination ? (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        aria-label="Página anterior"
        disabled={page === 0}
        onClick={handlePrevPage}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5 text-sm">
        <input
          type="text"
          aria-label="Número da página"
          inputMode="numeric"
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
          onKeyDown={handlePageInput}
          onBlur={() => setPageInput('')}
          placeholder={String(page + 1)}
          className="w-10 text-center rounded border border-input bg-card text-foreground px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <span>/ {totalFilteredPages}</span>
      </div>

      <Button
        variant="outline"
        size="icon"
        aria-label="Próxima página"
        disabled={page >= totalFilteredPages - 1}
        onClick={handleNextPage}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  ) : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou número..."
            aria-label="Buscar Pokémon por nome ou número"
            value={search}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>

        <div className="flex gap-1.5 items-center">
          <PokemonFilterButton
            filters={filters}
            onChange={handleFiltersChange}
            showRegionFilter={false}
          />

          <Button
            variant={isShiny ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsShiny(!isShiny)}
            aria-pressed={isShiny}
            className={`gap-1 ${
              isShiny
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0'
                : ''
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Shiny
          </Button>

          {totalPokemon > PAGE_SIZE && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowPaginated}
                className={`text-xs transition-colors ${
                  !showAll ? 'bg-primary text-primary-foreground border-primary' : ''
                }`}
              >
                Paginado
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShowAll}
                className={`text-xs transition-colors ${
                  showAll ? 'bg-primary text-primary-foreground border-primary' : ''
                }`}
              >
                Todos
              </Button>
            </>
          )}
        </div>
      </div>

      <ActiveFilterChips
        filters={filters}
        onChange={handleFiltersChange}
        showRegionFilter={false}
      />

      {!isLoading && paginationControls && <div className="mb-6">{paginationControls}</div>}

      {isError ? (
        <QueryErrorState onRetry={() => void refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-card border border-border p-4">
              <Skeleton className="h-36 w-full rounded-lg mb-3" />
              <Skeleton className="h-3 w-12 mb-2" />
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {paginatedResults.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-12">
                Nenhum Pokémon encontrado.
              </p>
            )}
            {paginatedResults.map((p) => (
              <div key={p.id} style={{ contentVisibility: 'auto', containIntrinsicSize: '220px' }}>
                <PokemonCard
                  pokemon={p}
                  isShiny={isShiny}
                  originPath={location.pathname}
                  listContext={{
                    ids: visibleIds,
                    currentIndex: visibleIds.indexOf(p.id),
                  }}
                />
              </div>
            ))}
          </div>

          {!isLoading && paginationControls && <div className="mt-8">{paginationControls}</div>}
        </>
      )}
    </div>
  );
});
