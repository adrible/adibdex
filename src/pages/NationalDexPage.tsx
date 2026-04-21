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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  PokemonFilterButton,
  ActiveFilterChips,
  applyFilters,
  DEFAULT_FILTERS,
  saveFiltersToSession,
  loadFiltersFromSession,
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
  const [filters, setFilters] = useState<FilterState>(saved?.filters ?? DEFAULT_FILTERS);
  const [pageInput, setPageInput] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const isFirstRenderRef = useRef(true);
  const restoredScrollRef = useRef(false);

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
    const handleScroll = () => {
      saveViewState();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [saveViewState]);

  const { data: allPokemon, isLoading: allLoading } = useQuery({
    queryKey: ['all-pokemon-basic'],
    queryFn: fetchAllPokemonBasic,
    staleTime: 1000 * 60 * 60,
    enabled: true,
  });

  const { data: regionalForms, isLoading: regionalLoading } = useQuery({
    queryKey: ['all-regional-forms'],
    queryFn: fetchAllRegionalForms,
    staleTime: 1000 * 60 * 60,
    enabled: true,
  });

  const { data: allNames } = useQuery({
    queryKey: ['all-pokemon-names'],
    queryFn: fetchAllPokemonNames,
    staleTime: Infinity,
  });

  const nationalWithRegionalForms = useMemo(() => {
    const base = allPokemon ?? [];
    const regionals = regionalForms ?? [];
    return [...base, ...regionals].sort(sortNationalWithRegionalForms);
  }, [allPokemon, regionalForms]);

  const globalResults = useMemo(() => {
    if (!search.trim() || !allNames) return null;

    const q = search.toLowerCase();

    const regionalNames = (regionalForms ?? []).map((p: any) => ({
      id: p.id,
      name: p.name,
      baseId: p.baseId ?? p.id,
      sprite: p.sprite,
    }));

    const baseNames = allNames.map((p) => ({
      id: p.id,
      name: p.name,
      baseId: p.id,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`,
    }));

    const combined = [...baseNames, ...regionalNames].sort(sortNationalWithRegionalForms);

    return combined
      .filter((p: any) => {
        return (
          p.name.includes(q) ||
          String(p.baseId).includes(q) ||
          String(p.id).includes(q)
        );
      })
      .slice(0, 20);
  }, [search, allNames, regionalForms]);

  const filtered = useMemo(() => {
    const source = nationalWithRegionalForms;
    if (!source.length) return [];

    let result = [...source];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p: any) => {
        return (
          p.name.includes(q) ||
          String((p as any).baseId ?? p.id).includes(q) ||
          String(p.id).includes(q)
        );
      });
    }

    result = applyFilters(result, filters);

    if (filters.sortBy === 'id') {
      result.sort(sortNationalWithRegionalForms);
    }

    return result;
  }, [nationalWithRegionalForms, search, filters]);

  const filteredTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const displayedPokemon = useMemo(() => {
    const safePage = Math.min(page, filteredTotalPages - 1);
    const start = safePage * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, filteredTotalPages]);

  useEffect(() => {
    if (page > filteredTotalPages - 1) {
      setPage(0);
    }
  }, [page, filteredTotalPages]);

  const isLoading = allLoading || regionalLoading;

  useEffect(() => {
    if (isLoading || restoredScrollRef.current) return;

    const raw = sessionStorage.getItem(VIEW_STATE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const y = typeof parsed.scrollY === 'number' ? parsed.scrollY : 0;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.scrollTo(0, y);
          restoredScrollRef.current = true;
        });
      });
    } catch {}
  }, [isLoading, displayedPokemon.length]);

  const handleNavigateToPokemon = useCallback(
    (id: number) => {
      saveViewState();
      navigate(`/pokemon/${id}`, { state: { origin: location.pathname } });
    },
    [navigate, location.pathname, saveViewState]
  );

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(pageInput);
      if (!isNaN(val) && val >= 1 && val <= filteredTotalPages) {
        const nextPage = val - 1;
        setPage(nextPage);
        saveViewState(nextPage);
        window.scrollTo(0, 0);
      }
      setPageInput('');
    }
  };

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

          <div>
            <h2 className="font-pixel text-sm sm:text-lg text-ui-title">
              Pokédex Nacional
            </h2>

            <p className="text-sm text-ui-subtitle">
              Pokémon da National Dex + formas regionais
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou número..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-10"
            />

            {globalResults && globalResults.length > 0 && search.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                {globalResults.map((p: any) => (
                  <button
                    key={`${p.id}-${p.name}`}
                    onClick={() => handleNavigateToPokemon(p.id)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left"
                  >
                    <img
                      src={p.sprite}
                      alt={p.name}
                      className="h-8 w-8 object-contain"
                      loading="lazy"
                    />
                    <span className="text-sm font-medium text-foreground capitalize">
                      {p.name}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      #{String(p.baseId ?? p.id).padStart(4, '0')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-1.5 items-center">
            <PokemonFilterButton
              filters={filters}
              onChange={(f) => {
                setFilters(f);
                setPage(0);
              }}
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
          </div>
        </div>

        <ActiveFilterChips
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(0);
          }}
        />

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
              {displayedPokemon.map((p: any) => (
                <div
                  key={`${p.id}-${p.name}`}
                  onClick={() => saveViewState()}
                >
                  <PokemonCard
                    pokemon={p}
                    isShiny={isShiny}
                    originPath={location.pathname}
                  />
                </div>
              ))}

              {displayedPokemon.length === 0 && !globalResults?.length && (
                <p className="col-span-full text-center text-muted-foreground py-12">
                  Nenhum Pokémon encontrado.
                </p>
              )}
            </div>

            {filteredTotalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={page === 0}
                  onClick={() => {
                    const nextPage = page - 1;
                    setPage(nextPage);
                    saveViewState(nextPage);
                    window.scrollTo(0, 0);
                  }}
                >
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
                    className="w-10 text-center rounded border border-input bg-card text-foreground px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span>/ {filteredTotalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={page >= filteredTotalPages - 1}
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    saveViewState(nextPage);
                    window.scrollTo(0, 0);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}