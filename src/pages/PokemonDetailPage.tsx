import { useState, useEffect, useMemo } from 'react';
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
import { QueryErrorState } from '@/components/QueryErrorState';
import { parsePokemonNavigationState } from '@/lib/navigation';

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

function AbilityChip({ ability }: { ability: string }) {
  const [expanded, setExpanded] = useState(false);

  const {
    data: description,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['ability-desc', ability],
    queryFn: ({ signal }) => fetchAbilityDescription(ability, signal),
    enabled: expanded,
    staleTime: Infinity,
  });

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="rounded-full bg-secondary px-3 py-1 text-sm font-medium capitalize text-secondary-foreground hover:bg-secondary/80 transition-colors inline-flex items-center gap-1"
      >
        {ability.replace(/-/g, ' ')}
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {expanded && (
        <p className="text-xs text-muted-foreground mt-1.5 ml-1 max-w-md">
          {isLoading
            ? 'Carregando...'
            : isError
              ? 'Não foi possível carregar a descrição.'
              : description || 'Descrição indisponível.'}
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
  const isValidPokemonId = Number.isSafeInteger(pokemonId) && pokemonId > 0;
  const [isShiny, setIsShiny] = useState(false);

  const navigationState = useMemo(
    () => parsePokemonNavigationState(location.state),
    [location.state],
  );
  const origin = navigationState.origin;
  const stableOrigin = origin;

  const listContext = navigationState.listContext;

  const ids = listContext?.ids ?? [];
  const currentIndex = listContext?.currentIndex ?? -1;

  const idsSafe = ids.length ? ids : Array.from({ length: 1025 }, (_, i) => i + 1);

  const safeIndex =
    currentIndex >= 0 && idsSafe[currentIndex] === pokemonId
      ? currentIndex
      : idsSafe.indexOf(pokemonId);

  const prevId = safeIndex > 0 ? idsSafe[safeIndex - 1] : null;
  const nextId = safeIndex >= 0 && safeIndex < idsSafe.length - 1 ? idsSafe[safeIndex + 1] : null;

  const {
    data: pokemon,
    isLoading,
    isError: pokemonError,
    refetch: refetchPokemon,
  } = useQuery({
    queryKey: ['pokemon-detail', pokemonId],
    queryFn: ({ signal }) => fetchPokemonDetail(pokemonId, signal),
    enabled: isValidPokemonId,
    staleTime: 1000 * 60 * 30,
  });

  const {
    data: encounters,
    isLoading: encountersLoading,
    isError: encountersError,
    refetch: refetchEncounters,
  } = useQuery({
    queryKey: ['pokemon-encounters', pokemonId],
    queryFn: ({ signal }) => fetchPokemonEncounters(pokemonId, signal),
    enabled: isValidPokemonId,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    const preload = (id: number | null) => {
      if (!id) return;

      queryClient.prefetchQuery({
        queryKey: ['pokemon-detail', id],
        queryFn: ({ signal }) => fetchPokemonDetail(id, signal),
        staleTime: 1000 * 60 * 30,
      });

      queryClient.prefetchQuery({
        queryKey: ['pokemon-encounters', id],
        queryFn: ({ signal }) => fetchPokemonEncounters(id, signal),
        staleTime: 1000 * 60 * 30,
      });
    };

    preload(prevId);
    preload(nextId);
  }, [prevId, nextId, queryClient]);

  const displayId = pokemon?.speciesId ?? pokemonId;

  const handleBack = () => {
    if (stableOrigin) {
      navigate(stableOrigin, { replace: true });
    } else {
      const gen = GENERATIONS.find(
        (g) => displayId >= g.pokemonRange[0] && displayId <= g.pokemonRange[1],
      );
      navigate(gen ? `/generation/${gen.id}` : '/');
    }
  };

  if (!isValidPokemonId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 max-w-2xl">
          <QueryErrorState
            title="Identificador inválido"
            message="Use um número inteiro positivo para acessar um Pokémon."
          />
        </main>
      </div>
    );
  }

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

  if (pokemonError || !pokemon) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 max-w-2xl">
          <QueryErrorState
            title="Pokémon não encontrado"
            message="O registro não existe ou a PokeAPI está indisponível."
            onRetry={() => void refetchPokemon()}
          />
        </main>
      </div>
    );
  }

  const totalStats = pokemon.stats.reduce((sum, s) => sum + s.value, 0);
  const artworkSrc = isShiny ? pokemon.sprites.artwork_shiny : pokemon.sprites.artwork;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar à lista">
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex gap-2 items-center">
            <Button
              variant={isShiny ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsShiny(!isShiny)}
              className={`gap-1.5 ${
                isShiny
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0'
                  : ''
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Shiny
            </Button>

            {prevId && (
              <Button variant="outline" size="icon" asChild>
                <Link
                  to={`/pokemon/${prevId}`}
                  replace
                  aria-label="Pokémon anterior"
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
                  replace
                  aria-label="Próximo Pokémon"
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
          <p className="text-sm font-bold text-muted-foreground mb-1">
            #{String(displayId).padStart(4, '0')}
          </p>
          <h2 className="font-pixel text-lg sm:text-xl text-foreground capitalize mb-4">
            {pokemon.name.replace(/-/g, ' ')}
          </h2>
          <div className="flex justify-center gap-2 mb-6">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} size="md" />
            ))}
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72">
            <div className="absolute inset-0 rounded-3xl bg-muted/60 blur-2xl scale-110" />
            <img
              src={artworkSrc}
              alt={pokemon.name}
              className="relative z-10 w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="rounded-xl bg-card border border-border p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Altura</p>
            <p className="text-lg font-bold text-card-foreground">
              {(pokemon.height / 10).toFixed(1)} m
            </p>
          </div>
          <div className="rounded-xl bg-card border border-border p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Peso</p>
            <p className="text-lg font-bold text-card-foreground">
              {(pokemon.weight / 10).toFixed(1)} kg
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6 mb-10">
          <h3 className="font-bold text-card-foreground mb-3">Habilidades</h3>
          <div className="flex flex-wrap gap-2">
            {pokemon.abilities.map((a) => (
              <AbilityChip key={a} ability={a} />
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6 mb-10">
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

        <div className="mb-10">
          <TypeEffectiveness types={pokemon.types} />
        </div>

        <div className="rounded-xl bg-card border border-border p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-card-foreground">Localizações</h3>
          </div>
          {encountersLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : encountersError ? (
            <QueryErrorState
              title="Não foi possível carregar as localizações"
              onRetry={() => void refetchEncounters()}
            />
          ) : encounters && encounters.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {encounters.map((enc, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-semibold text-foreground capitalize">{enc.location}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[...new Set(enc.versions.map((v) => v.version))].map((v) => (
                      <span
                        key={v}
                        className="text-xs rounded-full bg-secondary px-2 py-0.5 capitalize text-secondary-foreground"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Não encontrado em nenhuma rota — pode ser obtido por evento, troca ou evolução.
            </p>
          )}
        </div>

        <div className="mb-10">
          <EvolutionChainDisplay
            pokemonId={pokemonId}
            speciesId={pokemon.speciesId}
            isShiny={isShiny}
            origin={stableOrigin}
            listContext={listContext}
          />
        </div>

        <div className="mb-10">
          <PokemonForms
            pokemonId={pokemonId}
            isShiny={isShiny}
            origin={stableOrigin}
            listContext={listContext}
          />
        </div>

        <div className="mb-10">
          <PokemonMoves pokemonId={pokemonId} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
