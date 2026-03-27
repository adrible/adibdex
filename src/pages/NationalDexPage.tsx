import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPokemonPage } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { PokemonCard } from '@/components/PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PAGE_SIZE = 48;
const TOTAL_POKEMON = 1025;

export default function NationalDexPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const offset = page * PAGE_SIZE;

  const { data, isLoading } = useQuery({
    queryKey: ['national-dex', page],
    queryFn: () => fetchPokemonPage(offset, Math.min(PAGE_SIZE, TOTAL_POKEMON - offset)),
    staleTime: 1000 * 60 * 30,
  });

  const totalPages = Math.ceil(TOTAL_POKEMON / PAGE_SIZE);

  const filtered = useMemo(() => {
    if (!data?.pokemons) return [];
    if (!search.trim()) return data.pokemons;
    const q = search.toLowerCase();
    return data.pokemons.filter(
      (p) => p.name.includes(q) || String(p.id).includes(q)
    );
  }, [data, search]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h2 className="font-pixel text-sm sm:text-lg text-foreground">Pokédex Nacional</h2>
            <p className="text-sm text-muted-foreground">
              Todos os {TOTAL_POKEMON} Pokémon
            </p>
          </div>
        </div>

        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar na página atual..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

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
              {filtered.map((p) => (
                <PokemonCard key={p.id} pokemon={p} />
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-12">
                  Nenhum Pokémon encontrado nesta página.
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 mt-10">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 0}
                onClick={() => { setPage((p) => p - 1); setSearch(''); window.scrollTo(0, 0); }}
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
                onClick={() => { setPage((p) => p + 1); setSearch(''); window.scrollTo(0, 0); }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
