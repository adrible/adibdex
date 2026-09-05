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
import { Input } from '@/components/ui/input';
import { fetchCatalog } from '@/lib/pokeapi/catalog';
import { Search, ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function NationalDexPage() {
  const catalogQuery = useQuery({
    queryKey: ['catalog', 'national'],
    queryFn: async ({ signal }) =>
      (await fetchCatalog(signal)).filter(
        (p) => p.category === 'base' || p.category === 'regional',
      ),
    staleTime: 60 * 60_000,
  });
  const {
    page,
    setPage,
    search,
    setSearch,
    isShiny,
    setIsShiny,
    filters,
    setFilters,
    filtered,
    displayed: displayedPokemon,
    visibleIds,
    totalPages: filteredTotalPages,
  } = useCatalogView('national', catalogQuery.data, catalogQuery.isSuccess);
  const [pageInput, setPageInput] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const globalResults = search.trim() ? filtered.slice(0, 20) : null;
  const isLoading = catalogQuery.isPending;
  const hasLoadError = catalogQuery.isError;
  const handleNavigateToPokemon = (id: number) =>
    navigate(`/pokemon/${id}`, {
      state: {
        origin: location.pathname,
        listContext: { ids: visibleIds, currentIndex: visibleIds.indexOf(id) },
      },
    });
  const handlePageInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const value = Number(pageInput);
    if (Number.isSafeInteger(value) && value >= 1 && value <= filteredTotalPages) {
      setPage(value - 1);
      window.scrollTo(0, 0);
    }
    setPageInput('');
  };
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Voltar ao início">
              <ArrowLeft className="h-5 w-5 text-ui-title" />
            </Link>
          </Button>

          <div>
            <h2 className="font-pixel text-sm sm:text-lg text-ui-title">Pokédex Nacional</h2>
            <p className="text-sm text-ui-subtitle">Pokémon da National Dex + formas regionais</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou número..."
              aria-label="Buscar Pokémon por nome ou número"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="pl-10"
            />

            {globalResults && globalResults.length > 0 && search.trim() && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
                {globalResults.map((p) => (
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
                    <span className="text-sm font-medium text-foreground capitalize">{p.name}</span>
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
          onChange={(f) => {
            setFilters(f);
            setPage(0);
          }}
        />

        {hasLoadError ? (
          <QueryErrorState
            onRetry={() => {
              void catalogQuery.refetch();
            }}
          />
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
              {displayedPokemon.map((p) => (
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
                  aria-label="Página anterior"
                  disabled={page === 0}
                  onClick={() => {
                    const nextPage = page - 1;
                    setPage(nextPage);
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
                    placeholder={String(page + 1)}
                    className="w-10 text-center rounded border border-input bg-card text-foreground px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span>/ {filteredTotalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Próxima página"
                  disabled={page >= filteredTotalPages - 1}
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
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
