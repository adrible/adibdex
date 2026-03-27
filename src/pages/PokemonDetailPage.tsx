import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPokemonDetail, STAT_TRANSLATIONS, GENERATIONS } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { TypeBadge } from '@/components/TypeBadge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function StatBar({ name, value }: { name: string; value: number }) {
  const percentage = Math.min((value / 255) * 100, 100);
  const label = STAT_TRANSLATIONS[name] || name;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-muted-foreground w-24 text-right">{label}</span>
      <span className="text-sm font-bold w-8 text-foreground">{value}</span>
      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function PokemonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pokemonId = Number(id);

  const { data: pokemon, isLoading } = useQuery({
    queryKey: ['pokemon-detail', pokemonId],
    queryFn: () => fetchPokemonDetail(pokemonId),
    enabled: !isNaN(pokemonId),
    staleTime: 1000 * 60 * 30,
  });

  const gen = GENERATIONS.find(
    (g) => pokemonId >= g.pokemonRange[0] && pokemonId <= g.pokemonRange[1]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 max-w-3xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-64 w-64 mx-auto rounded-2xl mb-8" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Pokémon não encontrado.</p>
        </div>
      </div>
    );
  }

  const totalStats = pokemon.stats.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(gen ? `/generation/${gen.id}` : '/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            {pokemonId > 1 && (
              <Button variant="outline" size="icon" asChild>
                <Link to={`/pokemon/${pokemonId - 1}`}><ChevronLeft className="h-4 w-4" /></Link>
              </Button>
            )}
            <Button variant="outline" size="icon" asChild>
              <Link to={`/pokemon/${pokemonId + 1}`}><ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-sm font-bold text-muted-foreground mb-1">
            #{String(pokemon.id).padStart(4, '0')}
          </p>
          <h2 className="font-pixel text-lg sm:text-xl text-foreground capitalize mb-4">
            {pokemon.name}
          </h2>
          <div className="flex justify-center gap-2 mb-6">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} size="md" />
            ))}
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-muted/60 blur-2xl scale-110" />
            <img
              src={pokemon.sprites.artwork}
              alt={pokemon.name}
              className="relative z-10 h-56 w-56 sm:h-72 sm:w-72 object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="rounded-xl bg-card border border-border p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Altura</p>
            <p className="text-lg font-bold text-card-foreground">{(pokemon.height / 10).toFixed(1)} m</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Peso</p>
            <p className="text-lg font-bold text-card-foreground">{(pokemon.weight / 10).toFixed(1)} kg</p>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6 mb-10">
          <h3 className="font-bold text-card-foreground mb-1">Habilidades</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {pokemon.abilities.map((a) => (
              <span key={a} className="rounded-full bg-secondary px-3 py-1 text-sm font-medium capitalize text-secondary-foreground">
                {a.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-card-foreground">Estatísticas Base</h3>
            <span className="text-sm font-semibold text-primary">Total: {totalStats}</span>
          </div>
          <div className="space-y-3">
            {pokemon.stats.map((s) => (
              <StatBar key={s.name} name={s.name} value={s.value} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
