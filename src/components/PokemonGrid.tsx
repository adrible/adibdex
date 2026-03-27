import { useQuery } from '@tanstack/react-query';
import { fetchPokemonListByRange, type Generation } from '@/lib/pokeapi';
import { PokemonCard } from './PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

export function PokemonGrid({ generation }: { generation: Generation }) {
  const [search, setSearch] = useState('');

  const { data: pokemons, isLoading } = useQuery({
    queryKey: ['pokemon-gen', generation.id],
    queryFn: () => fetchPokemonListByRange(generation.pokemonRange[0], generation.pokemonRange[1]),
    staleTime: 1000 * 60 * 30,
  });

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
      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou número..."
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
      )}
    </div>
  );
}
