import { useQuery } from '@tanstack/react-query';
import { fetchPokemonListByRange, type Generation } from '@/lib/pokeapi';
import { PokemonCard } from './PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 48;

export function PokemonGrid({ generation }: { generation: Generation }) {
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(0);

  const totalPokemon = generation.pokemonRange[1] - generation.pokemonRange[0] + 1;
  const isPaginated = !showAll && totalPokemon > PAGE_SIZE;

  const paginatedStart = isPaginated
    ? generation.pokemonRange[0] + page * PAGE_SIZE
    : generation.pokemonRange[0];
  const paginatedEnd = isPaginated
    ? Math.min(paginatedStart + PAGE_SIZE - 1, generation.pokemonRange[1])
    : generation.pokemonRange[1];

  const { data: pokemons, isLoading } = useQuery({
    queryKey: ['pokemon-gen', generation.id, isPaginated ? page : 'all'],
    queryFn: () => fetchPokemonListByRange(paginatedStart, paginatedEnd),
    staleTime: 1000 * 60 * 30,
  });

  const totalPages = Math.ceil(totalPokemon / PAGE_SIZE);

  const filtered = useMemo(() => {
    if (!pokemons) return [];
    if (!search.trim()) return pokemons;
    const q = search.toLowerCase();
    return pokemons.filter(
      (p) => p.name.includes(q) || String(p.id).includes(q)
    );
  }, [pokemons, search]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto mb-8">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou número..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {totalPokemon > PAGE_SIZE && (
          <div className="flex gap-1.5">
            <Button
              variant={!showAll ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setShowAll(false); setPage(0); }}
              className="text-xs"
            >
              Paginado
            </Button>
            <Button
              variant={showAll ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowAll(true)}
              className="text-xs"
            >
              Todos
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: Math.min(24, PAGE_SIZE) }).map((_, i) => (
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
            {filtered.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-12">
                Nenhum Pokémon encontrado.
              </p>
            )}
          </div>

          {isPaginated && !search.trim() && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => { setPage((p) => p - 1); window.scrollTo(0, 0); }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium text-foreground">
                Página {page + 1} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={page >= totalPages - 1}
                onClick={() => { setPage((p) => p + 1); window.scrollTo(0, 0); }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
