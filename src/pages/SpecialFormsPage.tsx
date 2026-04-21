import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllMegaForms, fetchAllGmaxForms } from '@/lib/pokeapi';
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

const SPECIAL_BG: Record<string, string> = {
  mega: '/backgrounds/mega.webp',
  gmax: '/backgrounds/gmax.webp',
};

interface Props {
  type: 'mega' | 'gmax';
}

export default function SpecialFormsPage({ type }: Props) {
  const isMega = type === 'mega';
  const storageKey = isMega ? 'mega-forms' : 'gmax-forms';

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
    queryKey: [isMega ? 'all-mega-forms' : 'all-gmax-forms'],
    queryFn: isMega ? fetchAllMegaForms : fetchAllGmaxForms,
    staleTime: 1000 * 60 * 60,
  });

  const applicableFilters: FilterState = {
    ...filters,
    hasMega: null,
    hasGmax: null,
  };

  const filtered = useMemo(() => {
    if (!forms) return [];
    return applyFilters(forms, applicableFilters);
  }, [forms, applicableFilters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const displayed = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  // 🔥 AQUI É A CORREÇÃO
  const visibleIds = useMemo(() => filtered.map((p) => p.id), [filtered]);

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

  const bg = SPECIAL_BG[type];

  return (
    <div className="relative">
      <div
        className="hidden md:block fixed top-0 left-0 w-full h-screen -z-10"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#0b0f14',
        }}
      />

      <div className="hidden md:block fixed top-0 left-0 w-full h-screen -z-10 bg-black/30 pointer-events-none" />

      <div className="md:hidden sticky top-0 h-[100dvh] -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#0b0f14',
          }}
        />
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>

      <div className="relative z-10 md:mt-0 -mt-[100dvh] min-h-screen">
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
                {isMega ? 'Mega Evoluções' : 'Gigantamax'}
              </h2>

              <p className="text-sm text-ui-subtitle">
                {isMega ? 'Todas as formas Mega' : 'Todas as formas Gigantamax'}
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
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0'
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-card border p-4">
                  <Skeleton className="h-36 w-full mb-3" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayed.map((p) => (
                  <PokemonCard
                    key={p.id}
                    pokemon={p}
                    isShiny={isShiny}
                    originPath={location.pathname}
                    listContext={{
                      ids: visibleIds,
                      currentIndex: visibleIds.indexOf(p.id),
                    }}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-3 mt-10">
                  <Button disabled={safePage === 0} onClick={() => setPage(safePage - 1)}>
                    <ChevronLeft />
                  </Button>

                  <span>{safePage + 1} / {totalPages}</span>

                  <Button disabled={safePage >= totalPages - 1} onClick={() => setPage(safePage + 1)}>
                    <ChevronRight />
                  </Button>
                </div>
              )}
            </>
          )}

          <div className="flex justify-center mt-10">
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <ArrowUp /> Topo
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}