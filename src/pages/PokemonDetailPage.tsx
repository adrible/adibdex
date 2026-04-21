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

  const idsSafe = ids.length
    ? ids
    : Array.from({ length: 1025 }, (_, i) => i + 1);

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

  useEffect(() => {
    const preload = (id: number | null) => {
      if (!id) return;

      queryClient.prefetchQuery({
        queryKey: ['pokemon-detail', id],
        queryFn: () => fetchPokemonDetail(id),
      });

      queryClient.prefetchQuery({
        queryKey: ['pokemon-encounters', id],
        queryFn: () => fetchPokemonEncounters(id),
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

        {/* resto do layout mantido exatamente igual */}