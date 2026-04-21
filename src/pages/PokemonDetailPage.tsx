import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPokemonDetail,
  fetchPokemonEncounters,
  fetchAbilityDescription,
  STAT_TRANSLATIONS,
  GENERATIONS,
} from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { TypeBadge } from '@/components/TypeBadge';
import { TypeEffectiveness } from '@/components/TypeEffectiveness';
import { PokemonForms } from '@/components/PokemonForms';
import { EvolutionChainDisplay } from '@/components/EvolutionChain';
import { PokemonMoves } from '@/components/PokemonMoves';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/Footer';

function StatBar({ name, value }: { name: string; value: number }) {
  const percentage = Math.min((value / 255) * 100, 100);
  const label = STAT_TRANSLATIONS[name] || name;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-muted-foreground w-24 text-right">
        {label}
      </span>
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

function AbilityChip({ ability }: { ability: string }) {
  const [expanded, setExpanded] = useState(false);

  const { data: description } = useQuery({
    queryKey: ['ability-desc', ability],
    queryFn: () => fetchAbilityDescription(ability),
    enabled: expanded,
    staleTime: Infinity,
  });

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="rounded-full bg-secondary px-3 py-1 text-sm font-medium capitalize text-secondary-foreground hover:bg-secondary/80 transition-colors inline-flex items-center gap-1"
      >
        {ability.replace(/-/g, ' ')}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {expanded && (
        <p className="text-xs text-muted-foreground mt-1.5 ml-1 max-w-md">
          {description || 'Carregando...'}
        </p>
      )}
    </div>
  );
}

export default function PokemonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const pokemonId = Number(id);
  const [isShiny, setIsShiny] = useState(false);

  const origin = (location.state as any)?.origin as string | undefined;
  const stableOrigin =
    origin || sessionStorage.getItem('pokemon-nav-origin') || undefined;

  if (origin) {
    sessionStorage.setItem('pokemon-nav-origin', origin);
  }

  const listContext = (location.state as any)?.listContext as
    | { ids: number[]; currentIndex: number }
    | undefined;

  const ids = listContext?.ids ?? [];
  const currentIndex = listContext?.currentIndex ?? -1;

  // fallback global
  const idsSafe = ids.length
    ? ids
    : Array.from({ length: 1025 }, (_, i) => i + 1);

  // garante consistência
  const safeIndex =
    currentIndex >= 0 && idsSafe[currentIndex] === pokemonId
      ? currentIndex
      : idsSafe.indexOf(pokemonId);

  const prevId = safeIndex > 0 ? idsSafe[safeIndex - 1] : null;
  const nextId =
    safeIndex >= 0 && safeIndex < idsSafe.length - 1
      ? idsSafe[safeIndex + 1]
      : null;

  const { data: pokemon, isLoading } = useQuery({
    queryKey: ['pokemon-detail', pokemonId],
    queryFn: () => fetchPokemonDetail(pokemonId),
    enabled: !isNaN(pokemonId),
    staleTime: 1000 * 60 * 30,
  });

  const { data: encounters, isLoading: encountersLoading } = useQuery({
    queryKey: ['pokemon-encounters', pokemonId],
    queryFn: () => fetchPokemonEncounters(pokemonId),
    enabled: !isNaN(pokemonId),
    staleTime: 1000 * 60 * 30,
  });

  // 🔥 PRELOAD CORRETO
  useEffect(() => {
    const preload = (id: number | null) => {
      if (!id) return;

      queryClient.prefetchQuery({
        queryKey: ['pokemon-detail', id],
        queryFn: () => fetchPokemonDetail(id),
        staleTime: 1000 * 60 * 30,
      });

      queryClient.prefetchQuery({
        queryKey: ['pokemon-encounters', id],
        queryFn: () => fetchPokemonEncounters(id),
        staleTime: 1000 * 60 * 30,
      });
    };

    preload(prevId);
    preload(nextId);
  }, [prevId, nextId, queryClient]);

  const displayId = pokemon?.speciesId ?? pokemonId;
  const isBaseForm = pokemonId <= 1025;

  const handleBack = () => {
    if (stableOrigin) {
      sessionStorage.removeItem('pokemon-nav-origin');
      navigate(stableOrigin);
    } else {
      const gen = GENERATIONS.find(
        (g) => displayId >= g.pokemonRange[0] && displayId <= g.pokemonRange[1]
      );
      navigate(gen ? `/generation/${gen.id}` : '/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 max-w-3xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <Skeleton className="h-64 w-64 mx-auto rounded-2xl mb-8" />
        </div>
      </div>
    );
  }

  if (!pokemon) return null;

  const totalStats = pokemon.stats.reduce((sum, s) => sum + s.value, 0);
  const artworkSrc = isShiny
    ? pokemon.sprites.artwork_shiny
    : pokemon.sprites.artwork;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex gap-2 items-center">
            <Button
              variant={isShiny ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsShiny(!isShiny)}
            >
              <Sparkles className="h-4 w-4" />
              Shiny
            </Button>

            {/* ESQUERDA */}
            {prevId && (
              <Button variant="outline" size="icon" asChild>
                <Link
                  to={`/pokemon/${prevId}`}
                  state={{
                    origin: stableOrigin,
                    listContext: {
                      ids: idsSafe,
                      currentIndex: safeIndex - 1,
                    },
                  }}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {/* DIREITA */}
            {nextId && (
              <Button variant="outline" size="icon" asChild>
                <Link
                  to={`/pokemon/${nextId}`}
                  state={{
                    origin: stableOrigin,
                    listContext: {
                      ids: idsSafe,
                      currentIndex: safeIndex + 1,
                    },
                  }}
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <p>#{String(displayId).padStart(4, '0')}</p>
          <h2>{pokemon.name}</h2>
        </div>

        <img src={artworkSrc} className="mx-auto w-64" />

        <div>Total: {totalStats}</div>
      </main>

      <Footer />
    </div>
  );
}