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
import { PokemonSpeciesProfile } from '@/components/PokemonSpeciesProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/Footer';
import { QueryErrorState } from '@/components/QueryErrorState';
import { parsePokemonNavigationState } from '@/lib/navigation';
import { applyPageMetadata, getPageMetadata } from '@/lib/seo';

function StatBar({ name, value }: { name: string; value: number }) {
  const percentage = Math.min((value / 255) * 100, 100);
  const label = STAT_TRANSLATIONS[name] || name;

  return (
    <div className="flex items-center gap-3">
      <span className="text-detail-label w-24 text-right">{label}</span>
      <span className="text-sm font-bold tabular-nums w-8 text-foreground">{value}</span>
      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

const ENCOUNTER_METHODS: Record<string, string> = {
  walk: 'Andando',
  surf: 'Surfando',
  'old-rod': 'Vara velha',
  'good-rod': 'Vara boa',
  'super-rod': 'Supervara',
  'rock-smash': 'Quebrando rochas',
  headbutt: 'Cabeçada',
  'dark-grass': 'Grama escura',
  'yellow-flowers': 'Flores amarelas',
  'purple-flowers': 'Flores roxas',
  'red-flowers': 'Flores vermelhas',
  'bridge-shadow': 'Sombra de ponte',
  'dust-cloud': 'Nuvem de poeira',
  'rippling-water': 'Água ondulante',
  'hidden-grotto': 'Gruta escondida',
  'sos-call': 'Chamada SOS',
};

const ENCOUNTER_CONDITIONS: Record<string, string> = {
  'time-morning': 'Manhã',
  'time-day': 'Dia',
  'time-night': 'Noite',
  'time-evening': 'Entardecer',
  'swarm-yes': 'Enxame',
  'swarm-no': 'Sem enxame',
  'radio-hoenn': 'Rádio de Hoenn',
  'radio-sinnoh': 'Rádio de Sinnoh',
  'season-spring': 'Primavera',
  'season-summer': 'Verão',
  'season-autumn': 'Outono',
  'season-winter': 'Inverno',
  'slot2-none': 'Sem cartucho extra',
};

function encounterLabel(value: string, labels: Record<string, string>) {
  return labels[value] ?? value.replace(/-/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

function encounterLevelRange(min: number | null, max: number | null) {
  if (min === null && max === null) return null;
  if (min === max || max === null) return `Nv. ${min ?? max}`;
  if (min === null) return `Até nv. ${max}`;
  return `Nv. ${min}–${max}`;
}

function AbilityChip({ ability, hidden }: { ability: string; hidden: boolean }) {
  const {
    data: description,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['ability-desc', ability],
    queryFn: ({ signal }) => fetchAbilityDescription(ability, signal),
    staleTime: Infinity,
  });
  return (
    <article className="detail-ability">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold capitalize">{ability.replace(/-/g, ' ')}</h4>
        <span className={hidden ? 'detail-hidden-tag' : 'text-overline'}>
          {hidden ? 'Oculta' : 'Comum'}
        </span>
      </div>
      <p className="text-support mt-3">
        {isLoading
          ? 'Carregando descrição...'
          : isError
            ? 'Não foi possível carregar a descrição.'
            : description || 'Descrição indisponível.'}
      </p>
    </article>
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

  useEffect(() => {
    if (!pokemon) return;
    applyPageMetadata(
      getPageMetadata(location.pathname, { name: pokemon.name, speciesId: displayId }),
    );
  }, [displayId, location.pathname, pokemon]);

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
      <main className="container py-6 sm:py-8 max-w-6xl detail-page">
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

        <section className="detail-hero" aria-label="Resumo do Pokémon">
          <div className="detail-identity">
            <p className="text-code mb-3">#{String(displayId).padStart(4, '0')}</p>
            <h2 className="site-display capitalize mb-4">{pokemon.name.replace(/-/g, ' ')}</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {pokemon.types.map((t) => (
                <TypeBadge key={t} type={t} size="md" />
              ))}
            </div>
            <PokemonSpeciesProfile speciesId={pokemon.speciesId} />
          </div>

          <div className="detail-artwork">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
              <div className="absolute inset-0 rounded-3xl bg-muted/60 blur-2xl scale-110" />
              <img
                src={artworkSrc}
                alt={pokemon.name}
                className="relative z-10 w-full h-full object-contain"
              />
            </div>
          </div>

          <div className="detail-measurements grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-card border border-border p-5 text-center">
              <p className="text-overline mb-2">Altura</p>
              <p className="metric-value">
                {(pokemon.height / 10).toFixed(1)} <span className="metric-unit">m</span>
              </p>
            </div>
            <div className="rounded-xl bg-card border border-border p-5 text-center">
              <p className="text-overline mb-2">Peso</p>
              <p className="metric-value">
                {(pokemon.weight / 10).toFixed(1)} <span className="metric-unit">kg</span>
              </p>
            </div>
          </div>
        </section>
        <nav className="detail-nav" aria-label="Seções do Pokémon">
          {[
            ['habilidades', 'Habilidades'],
            ['atributos', 'Atributos'],
            ['fraquezas', 'Fraquezas'],
            ['evolucoes', 'Evoluções'],
            ['formas', 'Formas'],
            ['ataques', 'Ataques'],
            ['localizacoes', 'Localizações'],
          ].map(([anchor, label]) => (
            <a key={anchor} href={`#${anchor}`} className="detail-nav-link">
              {label}
            </a>
          ))}
        </nav>
        <div className="detail-content-grid">
          <div id="habilidades" className="detail-panel detail-wide">
            <h3 className="section-title mb-4">Habilidades</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pokemon.abilities.map((a) => (
                <AbilityChip
                  key={a}
                  ability={a}
                  hidden={pokemon.hiddenAbilities?.includes(a) ?? false}
                />
              ))}
            </div>
          </div>

          <div id="atributos" className="detail-panel">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="section-title">Estatísticas Base</h3>
              <span className="text-code">Total: {totalStats}</span>
            </div>
            <div className="space-y-3">
              {pokemon.stats.map((s) => (
                <StatBar key={s.name} name={s.name} value={s.value} />
              ))}
            </div>
          </div>

          <div id="fraquezas" className="detail-section">
            <TypeEffectiveness types={pokemon.types} />
          </div>

          <div id="localizacoes" className="detail-panel detail-wide detail-locations">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="section-title">Localizações</h3>
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
              <div className="grid gap-3 sm:grid-cols-2 max-h-80 overflow-y-auto pr-2">
                {encounters.map((enc, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm font-semibold text-foreground capitalize">
                      {enc.location}
                    </p>
                    <div className="mt-2 space-y-2">
                      {enc.versions.map((version) => (
                        <div key={version.version} className="detail-encounter-version">
                          <span className="detail-encounter-game">
                            {version.version.replace(/-/g, ' ')}
                          </span>
                          {(
                            version.encounters ??
                            version.methods.map((method) => ({
                              method: method.replace(/ /g, '-'),
                              minLevel: null,
                              maxLevel: null,
                              chance: null,
                              conditions: [],
                            }))
                          ).map((encounter, encounterIndex) => (
                            <div
                              key={`${encounter.method}-${encounterIndex}`}
                              className="detail-encounter-entry"
                            >
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-semibold text-card-foreground">
                                  {encounterLabel(encounter.method, ENCOUNTER_METHODS)}
                                </span>
                                {encounterLevelRange(encounter.minLevel, encounter.maxLevel) && (
                                  <span className="detail-encounter-fact">
                                    {encounterLevelRange(encounter.minLevel, encounter.maxLevel)}
                                  </span>
                                )}
                                {encounter.chance !== null && (
                                  <span className="detail-encounter-fact">
                                    {encounter.chance}% de chance
                                  </span>
                                )}
                              </div>
                              {encounter.conditions.length > 0 && (
                                <p className="mt-1 text-[10px] text-muted-foreground">
                                  {encounter.conditions
                                    .map((condition) =>
                                      encounterLabel(condition, ENCOUNTER_CONDITIONS),
                                    )
                                    .join(' · ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-support">
                Não encontrado em nenhuma rota — pode ser obtido por evento, troca ou evolução.
              </p>
            )}
          </div>

          <div id="evolucoes" className="detail-section detail-wide">
            <EvolutionChainDisplay
              pokemonId={pokemonId}
              speciesId={pokemon.speciesId}
              isShiny={isShiny}
              origin={stableOrigin}
              listContext={listContext}
            />
          </div>

          <div id="formas" className="detail-section detail-wide">
            <PokemonForms
              pokemonId={pokemonId}
              isShiny={isShiny}
              origin={stableOrigin}
              listContext={listContext}
            />
          </div>

          <div id="ataques" className="detail-section detail-wide">
            <PokemonMoves key={pokemonId} pokemonId={pokemonId} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
