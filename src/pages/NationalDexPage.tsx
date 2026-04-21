import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchAllPokemonNames,
  fetchAllPokemonBasic,
  fetchAllRegionalForms,
} from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PokemonCard } from '@/components/PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  applyFilters,
  DEFAULT_FILTERS,
  loadFiltersFromSession,
  saveFiltersToSession,
  type FilterState,
} from '@/components/PokemonFilters';

const PAGE_SIZE = 50;
const VIEW_STATE_KEY = 'national-view-state';
const SHINY_STATE_KEY = 'national-shiny-state';

function sortNationalWithRegionalForms(a: any, b: any) {
  const aBase = a.baseId ?? a.id;
  const bBase = b.baseId ?? b.id;

  if (aBase !== bBase) return aBase - bBase;

  const aIsBaseForm = a.id === aBase;
  const bIsBaseForm = b.id === bBase;

  if (aIsBaseForm !== bIsBaseForm) {
    return aIsBaseForm ? -1 : 1;
  }

  return a.name.localeCompare(b.name);
}

export default function NationalDexPage() {
  const saved = loadFiltersFromSession('national');
  const savedShiny =
    typeof window !== 'undefined'
      ? sessionStorage.getItem(SHINY_STATE_KEY)
      : null;

  const [page, setPage] = useState(saved?.page ?? 0);
  const [search, setSearch] = useState('');
  const [isShiny, setIsShiny] = useState(savedShiny === 'true');
  const [filters, setFilters] = useState<FilterState>(
    saved?.filters ?? DEFAULT_FILTERS
  );

  const location = useLocation();
  const isFirstRenderRef = useRef(true);

  const saveViewState = useCallback(
    (nextPage?: number) => {
      sessionStorage.setItem(
        VIEW_STATE_KEY,
        JSON.stringify({
          page: nextPage ?? page,
          scrollY: window.scrollY,
        })
      );
    },
    [page]
  );

  useEffect(() => {
    saveFiltersToSession('national', filters, page);
  }, [filters, page]);

  useEffect(() => {
    sessionStorage.setItem(SHINY_STATE_KEY, String(isShiny));
  }, [isShiny]);

  useEffect(() => {
    const raw = sessionStorage.getItem(VIEW_STATE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.page === 'number') {
        setPage(parsed.page);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    setPage(0);
  }, [filters, search]);

  useEffect(() => {
    const handleScroll = () => saveViewState();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [saveViewState]);

  const { data: allPokemon, isLoading: allLoading } = useQuery({
    queryKey: ['all-pokemon-basic'],
    queryFn: fetchAllPokemonBasic,
    staleTime: 1000 * 60 * 60,
  });

  const { data: regionalForms, isLoading: regionalLoading } = useQuery({
    queryKey: ['all-regional-forms'],
    queryFn: fetchAllRegionalForms,
    staleTime: 1000 * 60 * 60,
  });

  const nationalWithRegionalForms = useMemo(() => {
    const base = allPokemon ?? [];
    const regionals = regionalForms ?? [];
    return [...base, ...regionals].sort(sortNationalWithRegionalForms);
  }, [allPokemon, regionalForms]);

  const filtered = useMemo(() => {
    if (!nationalWithRegionalForms.length) return [];

    let result = [...nationalWithRegionalForms];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p: any) =>
        p.name.includes(q) ||
        String(p.baseId ?? p.id).includes(q) ||
        String(p.id).includes(q)
      );
    }

    result = applyFilters(result, filters);

    if (filters.sortBy === 'id') {
      result.sort(sortNationalWithRegionalForms);
    }

    return result;
  }, [nationalWithRegionalForms, search, filters]);

  const filteredTotalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  // ✅ CORREÇÃO 2 (BUG PAGE)
  useEffect(() => {
    if (page > filteredTotalPages - 1) {
      setPage(0);
    }
  }, [page, filteredTotalPages]);

  const displayedPokemon = useMemo(() => {
    const safePage = Math.min(page, filteredTotalPages - 1);
    const start = safePage * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, filteredTotalPages]);

  const visibleIds = useMemo(
    () => filtered.map((p: any) => p.id),
    [filtered]
  );

  const isLoading = allLoading || regionalLoading;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5 text-ui-title" />
            </Link>
          </Button>

          <h2 className="font-pixel text-sm sm:text-lg text-ui-title">
            Pokédex Nacional
          </h2>
        </div>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayedPokemon.map((p: any, index: number) => (
              <PokemonCard
                key={p.id}
                pokemon={p}
                isShiny={isShiny}
                originPath={location.pathname}
                listContext={{
                  ids: visibleIds,
                  // ✅ CORREÇÃO 1 (PERFORMANCE + GLOBAL INDEX)
                  currentIndex: page * PAGE_SIZE + index,
                }}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}