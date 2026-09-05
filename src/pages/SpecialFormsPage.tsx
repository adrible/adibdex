import { useQuery } from '@tanstack/react-query';
import { useCatalogView } from '@/features/catalog/use-catalog-view';
import { PokemonFilterButton, ActiveFilterChips } from '@/components/PokemonFilters';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PokemonCard } from '@/components/PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { QueryErrorState } from '@/components/QueryErrorState';
import { fetchAllMegaForms, fetchAllGmaxForms } from '@/lib/pokeapi/catalog';
import { ArrowLeft, ArrowUp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function SpecialFormsPage({ type }: { type: 'mega' | 'gmax' }) {
  const isMega = type === 'mega';
  const storageKey = isMega ? 'mega-forms' : 'gmax-forms';
  const bg = isMega ? '/backgrounds/mega.webp' : '/backgrounds/gmax.webp';
  const query = useQuery({
    queryKey: ['catalog', type],
    queryFn: ({ signal }) => (isMega ? fetchAllMegaForms(signal) : fetchAllGmaxForms(signal)),
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
              <Link to="/" aria-label="Voltar ao início">
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
                showSpecialFormFilters={false}
              />
              <Button
                variant={isShiny ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsShiny(!isShiny)}
                aria-pressed={isShiny}
                className={`gap-1 ${
                  isShiny ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0' : ''
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
                <div key={i} className="rounded-xl bg-card border p-4">
                  <Skeleton className="h-36 w-full mb-3" />
                  <Skeleton className="h-5 w-24" />
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
                <div className="flex justify-center gap-3 mt-10">
                  <Button
                    aria-label="Página anterior"
                    disabled={safePage === 0}
                    onClick={() => setPage(safePage - 1)}
                  >
                    <ChevronLeft />
                  </Button>

                  <span>
                    {safePage + 1} / {totalPages}
                  </span>

                  <Button
                    aria-label="Próxima página"
                    disabled={safePage >= totalPages - 1}
                    onClick={() => setPage(safePage + 1)}
                  >
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
