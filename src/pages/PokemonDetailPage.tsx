import { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPokemonDetail, fetchPokemonEncounters, fetchAbilityDescription, STAT_TRANSLATIONS, GENERATIONS } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { TypeBadge } from '@/components/TypeBadge';
import { TypeEffectiveness } from '@/components/TypeEffectiveness';
import { PokemonForms } from '@/components/PokemonForms';
import { EvolutionChainDisplay } from '@/components/EvolutionChain';
import { PokemonMoves } from '@/components/PokemonMoves';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Sparkles, ChevronDown, ChevronUp, GitCompareArrows, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function StatBar({ name, value }: { name: string; value: number }) {
  const percentage = Math.min((value / 255) * 100, 100);
  const label = STAT_TRANSLATIONS[name] || name;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-muted-foreground w-24 text-right">{label}</span>
      <span className="text-sm font-bold w-8 text-foreground">{value}</span>
      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${percentage}%` }} />
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
  const pokemonId = Number(id);
  const [isShiny, setIsShiny] = useState(false);
  const { add, remove, isSelected, isFull } = useCompare();
  const inCompare = isSelected(pokemonId);

  // Preserve the ORIGINAL origin through all internal navigation
  const origin = (location.state as any)?.origin as string | undefined;
  const stableOrigin = origin || sessionStorage.getItem('pokemon-nav-origin') || undefined;

  // Store origin in sessionStorage when first entering from a list page
  if (origin) {
    sessionStorage.setItem('pokemon-nav-origin', origin);
  }

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

  const displayId = pokemon?.speciesId ?? pokemonId;
  const isBaseForm = pokemonId <= 1025;

  const handleBack = () => {
    if (stableOrigin) {
      sessionStorage.removeItem('pokemon-nav-origin');
      navigate(stableOrigin);
    } else {
      const gen = GENERATIONS.find(g => displayId >= g.pokemonRange[0] && displayId <= g.pokemonRange[1]);
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
  const artworkSrc = isShiny ? pokemon.sprites.artwork_shiny : pokemon.sprites.artwork;

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
              variant={inCompare ? "default" : "outline"} size="sm"
              onClick={() => {
                if (inCompare) {
                  remove(pokemonId);
                } else {
                  add({ id: pokemonId, name: pokemon.name, sprite: pokemon.sprites.artwork, types: pokemon.types });
                }
              }}
              disabled={!inCompare && isFull}
              className={`gap-1.5 ${inCompare ? '' : ''}`}
            >
              {inCompare ? <Check className="h-4 w-4" /> : <GitCompareArrows className="h-4 w-4" />}
              <span className="hidden sm:inline">{inCompare ? 'Adicionado' : 'Comparar'}</span>
            </Button>
            <Button
              variant={isShiny ? "default" : "outline"} size="sm"
              onClick={() => setIsShiny(!isShiny)}
              className={`gap-1.5 ${isShiny ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0' : ''}`}
            >
              <Sparkles className="h-4 w-4" />
              Shiny
            </Button>
            {isBaseForm && (
              <>
                {displayId > 1 && (
                  <Button variant="outline" size="icon" asChild>
                    <Link to={`/pokemon/${displayId - 1}`} state={{ origin: stableOrigin }}><ChevronLeft className="h-4 w-4" /></Link>
                  </Button>
                )}
                {displayId < 1025 && (
                  <Button variant="outline" size="icon" asChild>
                    <Link to={`/pokemon/${displayId + 1}`} state={{ origin: stableOrigin }}><ChevronRight className="h-4 w-4" /></Link>
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        <div className="text-center mb-8">
          <p className="text-sm font-bold text-muted-foreground mb-1">#{String(displayId).padStart(4, '0')}</p>
          <h2 className="font-pixel text-lg sm:text-xl text-foreground capitalize mb-4">{pokemon.name.replace(/-/g, ' ')}</h2>
          <div className="flex justify-center gap-2 mb-6">
            {pokemon.types.map(t => <TypeBadge key={t} type={t} size="md" />)}
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
            <p className="text-lg font-bold text-card-foreground">{(pokemon.height / 10).toFixed(1)} m</p>
          </div>
          <div className="rounded-xl bg-card border border-border p-5 text-center">
            <p className="text-xs text-muted-foreground mb-1">Peso</p>
            <p className="text-lg font-bold text-card-foreground">{(pokemon.weight / 10).toFixed(1)} kg</p>
          </div>
        </div>

        <div className="rounded-xl bg-card border border-border p-6 mb-10">
          <h3 className="font-bold text-card-foreground mb-3">Habilidades</h3>
          <div className="flex flex-wrap gap-2">
            {pokemon.abilities.map(a => (
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
            {pokemon.stats.map(s => <StatBar key={s.name} name={s.name} value={s.value} />)}
          </div>
        </div>

        <div className="mb-10"><TypeEffectiveness types={pokemon.types} /></div>

        <div className="rounded-xl bg-card border border-border p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-card-foreground">Localizações</h3>
          </div>
          {encountersLoading ? (
            <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div>
          ) : encounters && encounters.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {encounters.map((enc, i) => (
                <div key={i} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-semibold text-foreground capitalize">{enc.location}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[...new Set(enc.versions.map(v => v.version))].map(v => (
                      <span key={v} className="text-xs rounded-full bg-secondary px-2 py-0.5 capitalize text-secondary-foreground">{v}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Não encontrado em nenhuma rota — pode ser obtido por evento, troca ou evolução.</p>
          )}
        </div>

        <div className="mb-10">
          <EvolutionChainDisplay pokemonId={pokemonId} isShiny={isShiny} origin={stableOrigin} />
        </div>

        <div className="mb-10">
          <PokemonForms pokemonId={pokemonId} isShiny={isShiny} origin={stableOrigin} />
        </div>

        <div className="mb-10">
          <PokemonMoves pokemonId={pokemonId} />
        </div>
      </main>
    </div>
  );
}
