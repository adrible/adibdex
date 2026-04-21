import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllRegionalForms } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { PokemonCard } from '@/components/PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  PokemonFilterButton,
  ActiveFilterChips,
  applyFilters,
  type FilterState,
  DEFAULT_FILTERS,
  saveFiltersToSession,
  loadFiltersFromSession,
} from '@/components/PokemonFilters';
import { Footer } from '@/components/Footer';

const PAGE_SIZE = 50;

export default function RegionalForms() {
  const storageKey = 'regional-forms';

  const saved = loadFiltersFromSession(storageKey);
  const savedRaw =
    typeof window !== 'undefined' ? sessionStorage.getItem(storageKey) : null;
  const savedExtra = savedRaw ? JSON.parse(savedRaw) : null;

  const [isShiny, setIsShiny] = useState(savedExtra?.isShiny ?? false);
  const [page, setPage] = useState(saved?.page ?? 0);
  const [pageInput, setPageInput] = useState('');
  const [filters, setFilters] = useState<FilterState>(
    saved?.filters ?? DEFAULT_FILTERS
  );

  const location = useLocation();

  useEffect(() => {
    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        filters,
        page,
        isShiny,
      })
    );
  }, [filters, page, isShiny, storageKey]);

  const { data: forms, isLoading } = useQuery({
    queryKey: ['all-regional-forms'],
    queryFn: fetchAllRegionalForms,
    staleTime: 1000 * 60 * 60,
  });

  const applicableFilters: FilterState = {
    ...filters,
    hasMega: null,
    hasGmax: null,
  };

  const filtered = useMemo(() => {
    if (!forms) return [];
    return applyFilters(forms, applicableFilters).sort((a: any, b: any) => {
      const aBase = a.baseId ?? a.id;
      const bBase = b.baseId ?? b.id;

      if (aBase !== bBase) return aBase - bBase;
      return a.name.localeCompare(b.name);
    });
  }, [forms, applicableFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const displayed = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  const visibleIds = useMemo(() => displayed.map((p: any) => p.id), [displayed]);

  const handleFiltersChange = (f: FilterState) => {
    setFilters(f);
    setPage(0);
    saveFiltersToSession(storageKey, f, 0);
  };

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(pageInput);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        setPage(val - 1);
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            filters,
            page: val - 1,
            isShiny,
          })
        );
        window.scrollTo(0, 0);
      }
      setPageInput('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5 text-ui-title" />
            </Link>
          </Button>

          <div>
            <h2 className="font-pixel text-sm sm:text-lg text-ui-title">
              Formas Regionais
            </h2>

            <p className="text-sm text-ui-subtitle">
              Alolan, Galarian, Hisuian e Paldean
              {filtered.length > 0 && ` (${filtered.length})`}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <PokemonFilterButton
              filters={filters}
              onChange={handleFiltersChange}
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
          onChange={handleFiltersChange}
        />

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
              {displayed.map((p: any, index: number) => (
                <PokemonCard
                  key={p.id}
                  pokemon={p}
                  isShiny={isShiny}
                  originPath={location.pathname}
                  listContext={{
                    ids: visibleIds,
                    currentIndex: index,
                  }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={safePage === 0}
                  onClick={() => {
                    const p = safePage - 1;
                    setPage(p);
                    sessionStorage.setItem(
                      storageKey,
                      JSON.stringify({
                        filters,
                        page: p,
                        isShiny,
                      })
                    );
                    window.scrollTo(0, 0);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <input
                    type="text"
                    value={pageInput}
                    onChange={(e) =>
                      setPageInput(e.target.value.replace(/\D/g, ''))
                    }
                    onKeyDown={handlePageInput}
                    onBlur={() => setPageInput('')}
                    placeholder={String(safePage + 1)}
                    className="w-10 text-center rounded border border-input bg-background px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span>/ {totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => {
                    const p = safePage + 1;
                    setPage(p);
                    sessionStorage.setItem(
                      storageKey,
                      JSON.stringify({
                        filters,
                        page: p,
                        isShiny,
                      })
                    );
                    window.scrollTo(0, 0);
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-center mt-10">
              <Button
                variant="outline"
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }
                className="gap-2"
              >
                <ArrowUp className="h-4 w-4" />
                Voltar ao topo
              </Button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}