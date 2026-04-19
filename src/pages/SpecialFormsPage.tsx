import { useState, useMemo } from 'react';
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

const PAGE_SIZE = 48;

const SPECIAL_BG: Record<string, string> = {
  mega: '/backgrounds/mega.PNG',
  gmax: '/backgrounds/gmax.PNG',
};

interface Props {
  type: 'mega' | 'gmax';
}

export default function SpecialFormsPage({ type }: Props) {
  const isMega = type === 'mega';
  const storageKey = isMega ? 'mega-forms' : 'gmax-forms';
  const saved = loadFiltersFromSession(storageKey);

  const [isShiny, setIsShiny] = useState(false);
  const [page, setPage] = useState(saved?.page ?? 0);
  const [pageInput, setPageInput] = useState('');
  const [filters, setFilters] = useState<FilterState>(saved?.filters ?? DEFAULT_FILTERS);
  const location = useLocation();

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
        saveFiltersToSession(storageKey, filters, val - 1);
        window.scrollTo(0, 0);
      }
      setPageInput('');
    }
  };

  const bg = SPECIAL_BG[type];

  return (
    <div className="min-h-screen relative">
      <div
        className="fixed top-0 left-0 w-full h-[100dvh] -z-10"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#0b0f14',
        }}
      />

      <div className="fixed top-0 left-0 w-full h-[100dvh] -z-10 bg-black/30" />

      <div className="relative z-10">
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
              <PokemonFilterButton filters={filters} onChange={handleFiltersChange} />
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

          <ActiveFilterChips filters={filters} onChange={handleFiltersChange} />

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
                {displayed.map((p) => (
                  <PokemonCard
                    key={p.id}
                    pokemon={p}
                    isShiny={isShiny}
                    originPath={location.pathname}
                  />
                ))}
                {displayed.length === 0 && (
                  <p className="col-span-full text-center text-muted-foreground py-12">
                    Nenhum Pokémon encontrado.
                  </p>
                )}
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
                      saveFiltersToSession(storageKey, filters, p);
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
                      saveFiltersToSession(storageKey, filters, p);
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
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
    </div>
  );
}