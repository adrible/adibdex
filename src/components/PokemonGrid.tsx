import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPokemonListByRange, type Generation } from '@/lib/pokeapi';
import { PokemonCard } from './PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import {
  PokemonFilterButton,
  ActiveFilterChips,
  applyFilters,
  hasActiveFilters,
  DEFAULT_FILTERS,
  saveFiltersToSession,
  loadFiltersFromSession,
  type FilterState,
} from './PokemonFilters';

const PAGE_SIZE = 50;

export const PokemonGrid = React.memo(function PokemonGrid({
  generation,
}: {
  generation: Generation;
}) {
  const storageKey = `gen-${generation.id}`;
  const saved = loadFiltersFromSession(storageKey);
  const savedRaw =
    typeof window !== 'undefined' ? sessionStorage.getItem(storageKey) : null;
  const savedExtra = savedRaw ? JSON.parse(savedRaw) : null;

  const [search, setSearch] = useState(savedExtra?.search ?? '');
  const [showAll, setShowAll] = useState(savedExtra?.showAll ?? false);
  const [page, setPage] = useState(saved?.page ?? 0);
  const [isShiny, setIsShiny] = useState(savedExtra?.isShiny ?? false);
  const [filters, setFilters] = useState<FilterState>(
    saved?.filters ?? DEFAULT_FILTERS
  );
  const [pageInput, setPageInput] = useState('');
  const location = useLocation();

  const totalPokemon = useMemo(
    () => generation.pokemonRange[1] - generation.pokemonRange[0] + 1,
    [generation.pokemonRange]
  );

  useEffect(() => {
    saveFiltersToSession(storageKey, filters, page);

    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        filters,
        page,
        isShiny,
        search,
        showAll,
      })
    );
  }, [filters, page, isShiny, search, showAll, storageKey]);

  const hasSearch = search.trim().length > 0;
  const needsAll = showAll || hasActiveFilters(filters) || hasSearch;

  const fetchStart = useMemo(() => {
    return needsAll
      ? generation.pokemonRange[0]
      : generation.pokemonRange[0] + page * PAGE_SIZE;
  }, [needsAll, generation.pokemonRange, page]);

  const fetchEnd = useMemo(() => {
    return needsAll
      ? generation.pokemonRange[1]
      : Math.min(fetchStart + PAGE_SIZE - 1, generation.pokemonRange[1]);
  }, [needsAll, generation.pokemonRange, fetchStart]);

  const { data: pokemons, isLoading } = useQuery({
    queryKey: ['pokemon-gen', generation.id, needsAll ? 'all' : page],
    queryFn: () => fetchPokemonListByRange(fetchStart, fetchEnd),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60 * 24,
    refetchOnWindowFocus: false,
  });

  const processed = useMemo(() => {
    if (!pokemons) return [];

    let result = pokemons;

    if (hasSearch) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) => p.name.includes(q) || String(p.id).includes(q)
      );
    }

    return applyFilters(result, filters);
  }, [pokemons, hasSearch, search, filters]);

  const paginatedResults = useMemo(() => {
    if (!needsAll) return processed;
    if (showAll) return processed;

    const start = page * PAGE_SIZE;
    return processed.slice(start, start + PAGE_SIZE);
  }, [processed, needsAll, showAll, page]);

  const totalFilteredPages = useMemo(() => {
    return needsAll
      ? Math.max(1, Math.ceil(processed.length / PAGE_SIZE))
      : Math.max(1, Math.ceil(totalPokemon / PAGE_SIZE));
  }, [needsAll, processed.length, totalPokemon]);

  const showPagination = !showAll && totalFilteredPages > 1 && !hasSearch;

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(0);
    },
    []
  );

  const handleFiltersChange = useCallback((f: FilterState) => {
    setFilters(f);
    setPage(0);
  }, []);

  const handleShowPaginated = useCallback(() => {
    setShowAll(false);
    setPage(0);
  }, []);

  const handleShowAll = useCallback(() => {
    setShowAll(true);
  }, []);

  const handlePrevPage = useCallback(() => {
    setPage((p) => p - 1);
    window.scrollTo(0, 0);
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((p) => p + 1);
    window.scrollTo(0, 0);
  }, []);

  const handlePageInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const val = parseInt(pageInput);
        if (!isNaN(val) && val >= 1 && val <= totalFilteredPages) {
          setPage(val - 1);
          window.scrollTo(0, 0);
        }
        setPageInput('');
      }
    },
    [pageInput, totalFilteredPages]
  );

  const paginationControls = showPagination ? (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        disabled={page === 0}
        onClick={handlePrevPage}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-1.5 text-sm">
        <input
          type="text"
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

      {!isLoading && paginationControls && (
        <div className="mb-6">
          {paginationControls}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-card border border-border p-4"
            >
              <Skeleton className="h-36 w-full rounded-lg mb-3" />
              <Skeleton className="h-3 w-12 mb-2" />
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {paginatedResults.map((p) => (
              <div
                key={p.id}
                style={{ contentVisibility: 'auto', containIntrinsicSize: '220px' }}
              >
                <PokemonCard
                  pokemon={p}
                  isShiny={isShiny}
                  originPath={location.pathname}
                />
              </div>
            ))}
          </div>

          {!isLoading && paginationControls && (
            <div className="mt-8">
              {paginationControls}
            </div>
          )}
        </>
      )}
    </div>
  );
});