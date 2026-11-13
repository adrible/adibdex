import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPokemonDetail,
  fetchPokemonForms,
  fetchPokemonEncounters,
  fetchAbilityDescriptionText,
  STAT_TRANSLATIONS,
  GENERATIONS,
} from '@/lib/pokeapi';
import { NATIONAL_POKEDEX_SIZE } from '@/lib/pokemon/constants';
import { Header } from '@/components/Header';
import { TypeBadge } from '@/components/TypeBadge';
import { TypeEffectiveness } from '@/components/TypeEffectiveness';
import { PokemonForms } from '@/components/PokemonForms';
import { EvolutionChainDisplay } from '@/components/EvolutionChain';
import { PokemonMoves } from '@/components/PokemonMoves';
import { PokemonDexEntries } from '@/components/PokemonDexEntries';
import { PokemonSpeciesProfile } from '@/components/PokemonSpeciesProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ChevronDown, MapPin, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/Footer';
import { QueryErrorState } from '@/components/QueryErrorState';
import { parsePokemonNavigationState } from '@/lib/navigation';
import { applyPageMetadata, getPageMetadata } from '@/lib/seo';
import { getSiteLanguage, localized } from '@/lib/language';
import { locationLabel, gameVersionLabel } from '@/lib/resource-labels';
import { SourceText } from '@/components/SourceText';
import './pokedex-detail.css';

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
  walk: localized('Andando', 'Walking'),
  gift: localized('Presente', 'Gift'),
  'gift-egg': localized('Ovo de presente', 'Gift Egg'),
  'island-scan': localized('Scanner de ilhas', 'Island Scan'),
  'overworld-special': localized('Encontro especial no mapa', 'Special overworld encounter'),
  overworld: localized('No mapa', 'Overworld'),
  'only-one': localized('Encontro único', 'One-time encounter'),
  pokeflute: localized('Pokéflauta', 'Poké Flute'),
  'squirt-bottle': localized('Regador', 'Squirt Bottle'),
  'berry-piles': localized('Montes de frutas', 'Berry piles'),
  'roaming-grass': localized('Encontro itinerante na grama', 'Roaming in grass'),
  'roaming-water': localized('Encontro itinerante na água', 'Roaming on water'),
  surf: localized('Surfando', 'Surfing'),
  'old-rod': localized('Vara velha', 'Old Rod'),
  'good-rod': localized('Vara boa', 'Good Rod'),
  'super-rod': localized('Supervara', 'Super Rod'),
  'rock-smash': localized('Quebrando rochas', 'Rock Smash'),
  headbutt: localized('Cabeçada', 'Headbutt'),
  'dark-grass': localized('Grama escura', 'Dark grass'),
  'yellow-flowers': localized('Flores amarelas', 'Yellow flowers'),
  'purple-flowers': localized('Flores roxas', 'Purple flowers'),
  'red-flowers': localized('Flores vermelhas', 'Red flowers'),
  'bridge-shadow': localized('Sombra de ponte', 'Bridge shadow'),
  'dust-cloud': localized('Nuvem de poeira', 'Dust cloud'),
  'rippling-water': localized('Água ondulante', 'Rippling water'),
  'hidden-grotto': localized('Gruta escondida', 'Hidden grotto'),
  'sos-call': localized('Chamada SOS', 'SOS call'),
};

const ENCOUNTER_CONDITIONS: Record<string, string> = {
  'story-progress-beat-red': localized('Após derrotar Red', 'After defeating Red'),
  'story-progress-master-dojo-complete-first-trial': localized(
    'Após o primeiro desafio do Dojô Mestre',
    'After the first Master Dojo trial',
  ),
  'time-morning': localized('Manhã', 'Morning'),
  'time-day': localized('Dia', 'Day'),
  'time-night': localized('Noite', 'Night'),
  'time-evening': localized('Entardecer', 'Evening'),
  'swarm-yes': localized('Enxame', 'Swarm'),
  'swarm-no': localized('Sem enxame', 'No swarm'),
  'radio-hoenn': localized('Rádio de Hoenn', 'Hoenn radio'),
  'radio-sinnoh': localized('Rádio de Sinnoh', 'Sinnoh radio'),
  'season-spring': localized('Primavera', 'Spring'),
  'season-summer': localized('Verão', 'Summer'),
  'season-autumn': localized('Outono', 'Autumn'),
  'season-winter': localized('Inverno', 'Winter'),
  'slot2-none': localized('Sem cartucho extra', 'No extra cartridge'),
};

function encounterLabel(value: string, labels: Record<string, string>) {
  return (
    labels[value.replace(/ /g, '-')] ??
    value.replace(/-/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase())
  );
}

function encounterLevelRange(min: number | null, max: number | null) {
  if (min === null && max === null) return null;
  if (min === max || max === null) return localized(`Nv. ${min ?? max}`, `Lv. ${min ?? max}`);
  if (min === null) return localized(`Até nv. ${max}`, `Up to Lv. ${max}`);
  return localized(`Nv. ${min}–${max}`, `Lv. ${min}–${max}`);
}

function AbilityChip({ ability, hidden }: { ability: string; hidden: boolean }) {
  const {
    data: description,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['ability-desc', ability],
    queryFn: ({ signal }) => fetchAbilityDescriptionText(ability, signal),
    staleTime: Infinity,
  });
  return (
    <article className="detail-ability">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold capitalize">{ability.replace(/-/g, ' ')}</h4>
        <span className={hidden ? 'detail-hidden-tag' : 'text-overline'}>
          {hidden ? localized('Oculta', 'Hidden') : localized('Comum', 'Common')}
        </span>
      </div>
      <p className="text-support mt-3">
        {isLoading ? (
          localized('Carregando descrição...', 'Loading description...')
        ) : isError ? (
          localized('Não foi possível carregar a descrição.', 'Could not load the description.')
        ) : description?.text ? (
          <SourceText text={description.text} language={description.language} />
        ) : (
          localized('Descrição indisponível.', 'Description unavailable.')
        )}
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
  const [selectedEncounterGame, setSelectedEncounterGame] = useState('');
  const [detailNavFixed, setDetailNavFixed] = useState(false);
  const detailNavSlotRef = useRef<HTMLDivElement | null>(null);

  const navigationState = useMemo(
    () => parsePokemonNavigationState(location.state),
    [location.state],
  );
  const origin = navigationState.origin;
  const stableOrigin = origin;

  const listContext = navigationState.listContext;

  const ids = listContext?.ids ?? [];
  const currentIndex = listContext?.currentIndex ?? -1;

  const idsSafe = ids.length ? ids : Array.from({ length: NATIONAL_POKEDEX_SIZE }, (_, i) => i + 1);

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

  const { data: alternateForms } = useQuery({
    queryKey: ['pokemon-forms', pokemonId],
    queryFn: ({ signal }) => fetchPokemonForms(pokemonId, signal),
    enabled: isValidPokemonId,
    staleTime: 1000 * 60 * 60,
  });
  const hasAlternateForms = Boolean(alternateForms?.length);

  const encounterGames = useMemo(
    () =>
      [
        ...new Set(
          encounters?.flatMap((encounter) => encounter.versions.map((v) => v.version)) ?? [],
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [encounters],
  );
  const filteredEncounters = useMemo(
    () =>
      encounters?.flatMap((encounter) => {
        const versions = encounter.versions.filter(
          (version) => !selectedEncounterGame || version.version === selectedEncounterGame,
        );
        return versions.length ? [{ ...encounter, versions }] : [];
      }),
    [encounters, selectedEncounterGame],
  );

  useEffect(() => {
    setSelectedEncounterGame('');
  }, [pokemonId]);

  useEffect(() => {
    const slot = detailNavSlotRef.current;
    if (!slot) return;
    const nav = slot.querySelector<HTMLElement>('.detail-nav');
    const page = slot.closest<HTMLElement>('.pokedex-page');
    const updateNavHeight = () => {
      if (nav && page) {
        page.style.setProperty('--detail-nav-height', `${nav.getBoundingClientRect().height}px`);
        const rect = slot.getBoundingClientRect();
        page.style.setProperty('--detail-nav-left', `${rect.left}px`);
        page.style.setProperty('--detail-nav-width', `${rect.width}px`);
      }
    };
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateNavHeight) : null;
    if (nav) resizeObserver?.observe(nav);
    resizeObserver?.observe(slot);
    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    const scrollTop = () =>
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    let threshold = slot.getBoundingClientRect().top + scrollTop();
    let isFixed = false;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const currentScroll = scrollTop();
        if (!isFixed) threshold = slot.getBoundingClientRect().top + currentScroll;
        isFixed = currentScroll >= threshold;
        setDetailNavFixed(isFixed);
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    document.addEventListener('scroll', update, { passive: true, capture: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateNavHeight);
      page?.style.removeProperty('--detail-nav-height');
      page?.style.removeProperty('--detail-nav-left');
      page?.style.removeProperty('--detail-nav-width');
      window.removeEventListener('scroll', update);
      document.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [pokemon, isLoading, pokemonError, isValidPokemonId]);

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
    applyPageMetadata(getPageMetadata(location.pathname, { ...pokemon, speciesId: displayId }));
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
      <div className="pokedex-page min-h-screen bg-background">
        <Header />
        <main className="container py-20 max-w-2xl">
          <QueryErrorState
            title={localized('Identificador inválido', 'Invalid identifier')}
            message={localized(
              'Use um número inteiro positivo para acessar um Pokémon.',
              'Use a positive whole number to open a Pokémon.',
            )}
          />
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pokedex-page min-h-screen bg-background">
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
      <div className="pokedex-page min-h-screen bg-background">
        <Header />
        <main className="container py-20 max-w-2xl">
          <QueryErrorState
            title={localized('Pokémon não encontrado', 'Pokémon not found')}
            message={localized(
              'O registro não existe ou a PokeAPI está indisponível.',
              'This record does not exist or the PokéAPI is unavailable.',
            )}
            onRetry={() => void refetchPokemon()}
          />
        </main>
      </div>
    );
  }

  const totalStats = pokemon.stats.reduce((sum, s) => sum + s.value, 0);
  const artworkSrc = isShiny ? pokemon.sprites.artwork_shiny : pokemon.sprites.artwork;

  return (
    <div className="pokedex-page min-h-screen bg-background">
      <main className="container max-w-6xl detail-page">
        <div className="pokedex-shell">
          <div className="pokedex-device-header">
            <Link
              to="/"
              className="pokedex-home-link"
              aria-label={localized('Voltar à tela inicial', 'Back to home')}
              title={localized('Voltar à tela inicial', 'Back to home')}
            >
              <span className="pokedex-lens" aria-hidden="true">
                <ArrowLeft />
              </span>
              <span className="pokedex-home-label">{localized('Início', 'Home')}</span>
            </Link>
            <Header />
            <span className="pokedex-indicators" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="pokedex-layout">
            <section
              id="perfil"
              className="detail-hero pokedex-screen"
              aria-label={localized('Resumo do Pokémon', 'Pokémon overview')}
            >
              <div className="pokedex-identity">
                <h2 className="pokedex-name">{pokemon.name.replace(/-/g, ' ')}</h2>
                <span className="pokedex-number">#{String(displayId).padStart(4, '0')}</span>
                <div className="pokedex-types">
                  {pokemon.types.map((t) => (
                    <TypeBadge key={t} type={t} size="md" />
                  ))}
                </div>
              </div>
              <div className="pokedex-artwork">
                <img
                  key={`${pokemonId}-${isShiny}`}
                  src={artworkSrc || pokemon.sprites.front_default}
                  alt={pokemon.name}
                />
              </div>
              <div className="pokedex-screen-controls">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={handleBack}
                  aria-label={localized('Voltar à lista', 'Back to list')}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{localized('Lista', 'List')}</span>
                </Button>

                <div className="flex gap-2 items-center">
                  <Button
                    variant={isShiny ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIsShiny(!isShiny)}
                    aria-pressed={isShiny}
                    className={`gap-1.5 ${
                      isShiny
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0'
                        : ''
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                    {localized('Shiny', 'Shiny')}
                  </Button>

                  {prevId && (
                    <Button variant="outline" size="icon" className="pokedex-arrow-control" asChild>
                      <Link
                        to={`/pokemon/${prevId}`}
                        replace
                        aria-label={localized('Pokémon anterior', 'Previous Pokémon')}
                        state={{
                          origin: stableOrigin,
                          listContext: {
                            ids: idsSafe,
                            game: listContext?.game,
                            currentIndex: safeIndex - 1,
                          },
                        }}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}

                  {nextId && (
                    <Button variant="outline" size="icon" className="pokedex-arrow-control" asChild>
                      <Link
                        to={`/pokemon/${nextId}`}
                        replace
                        aria-label={localized('Próximo Pokémon', 'Next Pokémon')}
                        state={{
                          origin: stableOrigin,
                          listContext: {
                            ids: idsSafe,
                            game: listContext?.game,
                            currentIndex: safeIndex + 1,
                          },
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              <dl className="pokedex-measurements">
                <div>
                  <dt>{localized('Altura', 'Height')}</dt>
                  <dd>
                    {(pokemon.height / 10).toLocaleString(
                      getSiteLanguage() === 'pt' ? 'pt-BR' : 'en-US',
                    )}{' '}
                    m
                  </dd>
                </div>
                <div>
                  <dt>{localized('Peso', 'Weight')}</dt>
                  <dd>
                    {(pokemon.weight / 10).toLocaleString(
                      getSiteLanguage() === 'pt' ? 'pt-BR' : 'en-US',
                    )}{' '}
                    kg
                  </dd>
                </div>
              </dl>
              <PokemonSpeciesProfile speciesId={pokemon.speciesId} />
            </section>
            <div ref={detailNavSlotRef} className="detail-nav-slot">
              <nav
                className={detailNavFixed ? 'detail-nav detail-nav-fixed' : 'detail-nav'}
                aria-label={localized('Seções do Pokémon', 'Pokémon sections')}
              >
                {[
                  ['stats', 'Stats'],
                  ['fraquezas', localized('Defesa', 'Defense')],
                  ['evolucoes', localized('Evoluções', 'Evolution')],
                  ...(hasAlternateForms ? [['formas', localized('Formas', 'Forms')]] : []),
                  ['ataques', localized('Ataques', 'Moves')],
                  ['localizacoes', localized('Locais', 'Locations')],
                  ['entradas-pokedex', localized('Pokédex', 'Pokédex')],
                ].map(([anchor, label]) => (
                  <a key={anchor} href={`#${anchor}`} className="detail-nav-link">
                    {label}
                  </a>
                ))}
              </nav>
            </div>
            <div id="stats" className="pokedex-instruments pokedex-screen">
              <div id="atributos" className="detail-panel">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="section-title">{localized('Estatísticas Base', 'Base stats')}</h3>
                  <span className="text-code">
                    {localized('Total', 'Total')}: {totalStats}
                  </span>
                </div>
                <div className="space-y-3">
                  {pokemon.stats.map((s) => (
                    <StatBar key={s.name} name={s.name} value={s.value} />
                  ))}
                </div>
              </div>

              <div id="habilidades" className="detail-panel detail-wide">
                <h3 className="section-title mb-4">{localized('Habilidades', 'Abilities')}</h3>
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
            </div>
          </div>
          <div className="detail-content-grid">
            <div id="fraquezas" className="detail-section">
              <TypeEffectiveness types={pokemon.types} />
            </div>

            <div id="localizacoes" className="detail-panel detail-wide detail-locations">
              <details className="pokedex-locations-disclosure" open>
                <summary>
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" aria-hidden="true" />
                    <h3 className="section-title">{localized('Localizações', 'Locations')}</h3>
                  </span>
                  <ChevronDown className="pokedex-disclosure-arrow h-4 w-4" aria-hidden="true" />
                </summary>
                <div className="pokedex-locations-body">
                  {encounters && encounters.length > 0 && (
                    <label className="detail-game-picker mb-4">
                      <span className="text-overline">{localized('Jogo', 'Game')}</span>
                      <select
                        className="detail-game-select"
                        value={selectedEncounterGame}
                        onChange={(event) => setSelectedEncounterGame(event.target.value)}
                      >
                        <option value="">{localized('Todos os jogos', 'All games')}</option>
                        {encounterGames.map((game) => (
                          <option key={game} value={game}>
                            {gameVersionLabel(game)}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  {encountersLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : encountersError ? (
                    <QueryErrorState
                      title={localized(
                        'Não foi possível carregar as localizações',
                        'Could not load locations',
                      )}
                      onRetry={() => void refetchEncounters()}
                    />
                  ) : encounters && encounters.length > 0 && filteredEncounters?.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 max-h-80 overflow-y-auto pr-2">
                      {filteredEncounters.map((enc, i) => (
                        <div key={i} className="rounded-lg bg-muted/50 p-3">
                          <p className="text-sm font-semibold text-foreground capitalize">
                            {locationLabel(enc.location)}
                          </p>
                          <div className="mt-2 space-y-2">
                            {enc.versions.map((version) => (
                              <div key={version.version} className="detail-encounter-version">
                                <span className="detail-encounter-game">
                                  {gameVersionLabel(version.version)}
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
                                      {encounterLevelRange(
                                        encounter.minLevel,
                                        encounter.maxLevel,
                                      ) && (
                                        <span className="detail-encounter-fact">
                                          {encounterLevelRange(
                                            encounter.minLevel,
                                            encounter.maxLevel,
                                          )}
                                        </span>
                                      )}
                                      {encounter.chance !== null && (
                                        <span className="detail-encounter-fact">
                                          {localized(
                                            `${encounter.chance}% de chance`,
                                            `${encounter.chance}% chance`,
                                          )}
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
                  ) : encounters && encounters.length > 0 ? (
                    <p className="text-support">
                      {localized('Nenhuma localização encontrada em', 'No locations found in')}{' '}
                      {gameVersionLabel(selectedEncounterGame)}.
                    </p>
                  ) : (
                    <p className="text-support">
                      {localized(
                        'Não encontrado em nenhuma rota — pode ser obtido por evento, troca ou evolução.',
                        'Not found in any location. It may be obtained through an event, trade, or evolution.',
                      )}
                    </p>
                  )}
                </div>
              </details>
            </div>

            <PokemonDexEntries speciesId={pokemon.speciesId} />

            <div id="evolucoes" className="detail-section detail-wide">
              <EvolutionChainDisplay
                pokemonId={pokemonId}
                speciesId={pokemon.speciesId}
                isShiny={isShiny}
                origin={stableOrigin}
                listContext={listContext}
              />
            </div>

            {hasAlternateForms && (
              <div id="formas" className="detail-section detail-wide">
                <PokemonForms
                  pokemonId={pokemonId}
                  isShiny={isShiny}
                  origin={stableOrigin}
                  listContext={listContext}
                />
              </div>
            )}

            <div id="ataques" className="detail-section detail-wide">
              <PokemonMoves key={pokemonId} pokemonId={pokemonId} initialGame={listContext?.game} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
