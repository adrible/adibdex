import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCatalogView } from '@/features/catalog/use-catalog-view';
import { PokemonFilterButton, ActiveFilterChips } from '@/components/PokemonFilters';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PokemonCard } from '@/components/PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { QueryErrorState } from '@/components/QueryErrorState';
import { fetchAllRegionalForms } from '@/lib/pokeapi/catalog';
import { ArrowLeft, ArrowUp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function RegionalForms() {
  const storageKey = 'regional-forms';
  const query = useQuery({
    queryKey: ['catalog', 'regional'],
    queryFn: ({ signal }) => fetchAllRegionalForms(signal),
    staleTime: 60 * 60_000,
  });
  const {
    isShiny,
    setIsShiny,
    setPage,
    filters,
    setFilters: handleFiltersChange,
    filtered,
    displayed,
    visibleIds,
    totalPages,
    page: safePage,
  } = useCatalogView(storageKey, query.data, query.isSuccess, false);
  const { isPending: isLoading, isError, refetch } = query;
  const location = useLocation();
  const [pageInput, setPageInput] = useState('');
  const handlePageInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const value = Number(pageInput);
    if (Number.isSafeInteger(value) && value >= 1 && value <= totalPages) {
      setPage(value - 1);
      window.scrollTo(0, 0);
    }
    setPageInput('');
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Voltar ao início">
              <ArrowLeft className="h-5 w-5 text-ui-title" />
            </Link>
          </Button>

          <div>
            <h2 className="font-pixel text-sm sm:text-lg text-ui-title">Formas Regionais</h2>

            <p className="text-sm text-ui-subtitle">
              Alolan, Galarian, Hisuian e Paldean
              {filtered.length > 0 && ` (${filtered.length})`}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <PokemonFilterButton
              filters={filters}
              onChange={handleFiltersChange}
              showSpecialFormFilters={false}
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
          </div>
        </div>

        <ActiveFilterChips
          filters={filters}
          onChange={handleFiltersChange}
          showSpecialFormFilters={false}
        />

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
              {displayed.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-12">
                  Nenhum Pokémon encontrado.
                </p>
              )}
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
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Página anterior"
                  disabled={safePage === 0}
                  onClick={() => {
                    const p = safePage - 1;
                    setPage(p);
                    window.scrollTo(0, 0);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <input
                    type="text"
                    aria-label="Número da página"
                    inputMode="numeric"
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
                  aria-label="Próxima página"
                  disabled={safePage >= totalPages - 1}
                  onClick={() => {
                    const p = safePage + 1;
                    setPage(p);
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
  );
}
