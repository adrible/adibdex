import { useQuery } from '@tanstack/react-query';
import { fetchPokemonListByRange, type Generation } from '@/lib/pokeapi';
import { PokemonCard } from './PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { PokemonFilterButton, ActiveFilterChips, applyFilters, hasActiveFilters, DEFAULT_FILTERS, saveFiltersToSession, loadFiltersFromSession, type FilterState } from './PokemonFilters';

const PAGE_SIZE = 48;

export function PokemonGrid({ generation }: { generation: Generation }) {
  const storageKey = `gen-${generation.id}`;
  const saved = loadFiltersFromSession(storageKey);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(saved?.page ?? 0);
  const [isShiny, setIsShiny] = useState(false);
  const [filters, setFilters] = useState<FilterState>(saved?.filters ?? DEFAULT_FILTERS);
  const [pageInput, setPageInput] = useState('');
  const location = useLocation();

  const totalPokemon = generation.pokemonRange[1] - generation.pokemonRange[0] + 1;

  // Save filters to session on change
  useEffect(() => {
    saveFiltersToSession(storageKey, filters, page);
  }, [filters, page, storageKey]);

  // Always fetch all for this generation (regions are small enough)
  const needsAll = showAll || hasActiveFilters(filters) || search.trim();

  const fetchStart = needsAll ? generation.pokemonRange[0] : generation.pokemonRange[0] + page * PAGE_SIZE;
  const fetchEnd = needsAll ? generation.pokemonRange[1] : Math.min(fetchStart + PAGE_SIZE - 1, generation.pokemonRange[1]);

  const { data: pokemons, isLoading } = useQuery({
    queryKey: ['pokemon-gen', generation.id, needsAll ? 'all' : page],
    queryFn: () => fetchPokemonListByRange(fetchStart, fetchEnd),
    staleTime: 1000 * 60 * 30,
  });

  const processed = useMemo(() => {
    if (!pokemons) return [];
    let result = pokemons;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.includes(q) || String(p.id).includes(q));
    }
    result = applyFilters(result, filters);
    return result;
  }, [pokemons, search, filters]);

  const paginatedResults = useMemo(() => {
    if (!needsAll) return processed;
    if (showAll) return processed;
    const start = page * PAGE_SIZE;
    return processed.slice(start, start + PAGE_SIZE);
  }, [processed, needsAll, showAll, page]);

  const totalFilteredPages = needsAll ? Math.ceil(processed.length / PAGE_SIZE) : Math.ceil(totalPokemon / PAGE_SIZE);
  const showPagination = !showAll && totalFilteredPages > 1 && !search.trim();

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(pageInput);
      if (!isNaN(val) && val >= 1 && val <= totalFilteredPages) {
        setPage(val - 1);
        window.scrollTo(0, 0);
      }
      setPageInput('');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto mb-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou número..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-10" />
        </div>
        <div className="flex gap-1.5 items-center">
          <PokemonFilterButton filters={filters} onChange={(f) => { setFilters(f); setPage(0); }} />
          <Button
            variant={isShiny ? "default" : "outline"} size="sm"
            onClick={() => setIsShiny(!isShiny)}
            className={`gap-1 ${isShiny ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0' : ''}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Shiny
          </Button>
          {totalPokemon > PAGE_SIZE && (
            <>
              <Button variant={!showAll ? 'default' : 'outline'} size="sm" onClick={() => { setShowAll(false); setPage(0); }} className="text-xs">Paginado</Button>
              <Button variant={showAll ? 'default' : 'outline'} size="sm" onClick={() => setShowAll(true)} className="text-xs">Todos</Button>
            </>
          )}
        </div>
      </div>

      <ActiveFilterChips filters={filters} onChange={(f) => { setFilters(f); setPage(0); }} />

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {paginatedResults.map((p) => (
              <PokemonCard key={p.id} pokemon={p} isShiny={isShiny} originPath={location.pathname} />
            ))}
            {paginatedResults.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-12">Nenhum Pokémon encontrado.</p>
            )}
          </div>

          {showPagination && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button variant="outline" size="icon" disabled={page === 0} onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={handlePageInput}
                  onBlur={() => setPageInput('')}
                  placeholder={String(page + 1)}
                  className="w-10 text-center rounded border border-input bg-background px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <span>/ {totalFilteredPages}</span>
              </div>
              <Button variant="outline" size="icon" disabled={page >= totalFilteredPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
