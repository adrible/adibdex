import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  fetchEvolutionChain,
  fetchMegaEvolutions,
  fetchGmaxForms,
} from '@/lib/pokeapi';
import { TypeBadge } from '@/components/TypeBadge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowDown,
  Sparkles,
  Swords,
  Heart,
  Moon,
  Sun,
  Droplets,
  Zap,
  Crown,
} from 'lucide-react';

const TRIGGER_LABELS: Record<string, string> = {
  'level-up': 'Subir de Nível',
  trade: 'Troca',
  'use-item': 'Usar Item',
  shed: 'Especial',
  spin: 'Girar',
  'tower-of-darkness': 'Torre da Escuridão',
  'tower-of-waters': 'Torre das Águas',
  'three-critical-hits': '3 Golpes Críticos',
  'take-damage': 'Receber Dano',
  other: 'Outro',
  'agile-style-move': 'Golpe Estilo Ágil',
  'strong-style-move': 'Golpe Estilo Forte',
  'recoil-damage': 'Dano de Recuo',
};

function EvolutionDetail({ evo }: { evo: any }) {
  const details: React.ReactNode[] = [];

  if (evo.minLevel) {
    details.push(
      <span
        key="level"
        className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20"
      >
        <Sparkles className="h-3 w-3" /> Nv. {evo.minLevel}
      </span>
    );
  }

  if (evo.trigger && evo.trigger !== 'level-up') {
    const label = TRIGGER_LABELS[evo.trigger] || evo.trigger.replace(/-/g, ' ');
    details.push(
      <span
        key="trigger"
        className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground border border-accent/30 capitalize"
      >
        {evo.trigger === 'trade' && <Swords className="h-3 w-3" />}
        {label}
      </span>
    );
  }

  if (evo.item) {
    details.push(
      <span
        key="item"
        className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground border border-border capitalize"
      >
        🧪 {evo.item.replace(/-/g, ' ')}
      </span>
    );
  }

  if (evo.heldItem) {
    details.push(
      <span
        key="held"
        className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border capitalize"
      >
        🎒 Segurar: {evo.heldItem.replace(/-/g, ' ')}
      </span>
    );
  }

  if (evo.minHappiness) {
    details.push(
      <span
        key="happy"
        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20"
      >
        <Heart className="h-3 w-3" /> Felicidade {evo.minHappiness}+
      </span>
    );
  }

  if (evo.timeOfDay) {
    const isNight = evo.timeOfDay === 'night';
    details.push(
      <span
        key="time"
        className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground border border-accent/20 capitalize"
      >
        {isNight ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
        {isNight ? 'Noite' : 'Dia'}
      </span>
    );
  }

  if (evo.knownMove) {
    details.push(
      <span
        key="move"
        className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground border border-border capitalize"
      >
        ⚔️ Saber: {evo.knownMove.replace(/-/g, ' ')}
      </span>
    );
  }

  if (evo.knownMoveType) {
    details.push(
      <span
        key="movetype"
        className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground border border-border capitalize"
      >
        Saber golpe tipo: {evo.knownMoveType.replace(/-/g, ' ')}
      </span>
    );
  }

  if (evo.location) {
    details.push(
      <span
        key="loc"
        className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border capitalize"
      >
        📍 {evo.location.replace(/-/g, ' ')}
      </span>
    );
  }

  if (evo.minAffection) {
    details.push(
      <span
        key="affection"
        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary border border-primary/20"
      >
        💕 Afeição {evo.minAffection}+
      </span>
    );
  }

  if (evo.needsRain) {
    details.push(
      <span
        key="rain"
        className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground border border-accent/20"
      >
        <Droplets className="h-3 w-3" /> Chovendo
      </span>
    );
  }

  if (evo.turnUpsideDown) {
    details.push(
      <span
        key="upside"
        className="inline-flex items-center gap-1 rounded-full bg-accent/40 px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground border border-accent/20"
      >
        🔄 Console de cabeça pra baixo
      </span>
    );
  }

  if (details.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 my-2 max-w-xs">
      {details}
    </div>
  );
}

interface EvolutionChainDisplayProps {
  pokemonId: number;
  isShiny?: boolean;
  origin?: string;
}

export function EvolutionChainDisplay({
  pokemonId,
  isShiny = false,
  origin,
}: EvolutionChainDisplayProps) {
  const { data: chain, isLoading } = useQuery({
    queryKey: ['evolution-chain', pokemonId],
    queryFn: () => fetchEvolutionChain(pokemonId),
    staleTime: 1000 * 60 * 60,
  });

  const baseIds = chain?.steps.flat().map((s) => s.id) || [];

  const { data: allMegas } = useQuery({
    queryKey: ['mega-evolutions', [...baseIds].sort().join(',')],
    queryFn: async () => {
      const results = await Promise.all(baseIds.map((id) => fetchMegaEvolutions(id)));
      const megaMap: Record<
        number,
        Awaited<ReturnType<typeof fetchMegaEvolutions>>
      > = {};
      baseIds.forEach((id, i) => {
        if (results[i].length > 0) megaMap[id] = results[i];
      });
      return megaMap;
    },
    enabled: baseIds.length > 0,
    staleTime: 1000 * 60 * 60,
  });

  const { data: allGmax } = useQuery({
    queryKey: ['gmax-forms', [...baseIds].sort().join(',')],
    queryFn: async () => {
      const results = await Promise.all(baseIds.map((id) => fetchGmaxForms(id)));
      const gmaxMap: Record<
        number,
        Awaited<ReturnType<typeof fetchGmaxForms>>
      > = {};
      baseIds.forEach((id, i) => {
        if (results[i].length > 0) gmaxMap[id] = results[i];
      });
      return gmaxMap;
    },
    enabled: baseIds.length > 0,
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border p-6">
        <h3 className="font-bold text-card-foreground mb-4">Linha Evolutiva</h3>
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-xl" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-24 w-24 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!chain || (chain.steps.length <= 1 && chain.steps[0]?.length <= 1)) {
    const megas = allMegas?.[pokemonId];
    const gmax = allGmax?.[pokemonId];

    if ((!megas || megas.length === 0) && (!gmax || gmax.length === 0)) {
      return (
        <div className="rounded-xl bg-card border border-border p-6">
          <h3 className="font-bold text-card-foreground mb-3">Linha Evolutiva</h3>
          <p className="text-sm text-muted-foreground">Este Pokémon não evolui.</p>
        </div>
      );
    }
  }

  function getOfficialArtwork(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function getShinySprite(id: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`;
}

function getSprite(id: number, normalSprite: string) {
  return isShiny ? getShinySprite(id) : normalSprite;
}

function getArtwork(
  id: number,
  normalFallback?: string,
  shinyFallback?: string
) {
  return isShiny ? getShinySprite(id) : getOfficialArtwork(id);
}

  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <h3 className="font-bold text-card-foreground mb-5">Linha Evolutiva</h3>

      <div className="flex flex-col items-center gap-4">
        {chain?.steps.map((stage, stageIdx) => (
          <div key={stageIdx} className="flex flex-col items-center w-full">
            {stageIdx > 0 && (
              <div className="flex flex-col items-center my-2">
                <ArrowDown className="h-6 w-6 text-muted-foreground opacity-60" />
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 max-w-5xl w-full">
              {stage.map((evo) => (
                <div key={evo.id} className="flex flex-col items-center">
                  {stageIdx > 0 && <EvolutionDetail evo={evo} />}

                  <Link
                    to={`/pokemon/${evo.id}`}
                    state={{ origin }}
                    className={`flex flex-col items-center w-28 sm:w-32 p-3 rounded-xl border border-border bg-card transition-all hover:scale-105 hover:border-primary/40 ${
                      evo.id === pokemonId ? 'ring-2 ring-primary bg-muted/40' : ''
                    }`}
                  >
                    <div className="h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center">
                      <img
                          src={getArtwork(evo.id, evo.sprite, evo.sprite)}
                          alt={evo.name}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = getSprite(evo.id, evo.sprite);
                          }}
                        />
                    </div>

                    <span className="mt-2 text-[11px] font-bold text-muted-foreground">
                      #{String(evo.id).padStart(4, '0')}
                    </span>

                    <span className="text-xs sm:text-sm font-semibold capitalize text-card-foreground mt-1 text-center leading-tight">
                      {evo.name.replace(/-/g, ' ')}
                    </span>
                  </Link>

                  {allMegas?.[evo.id]?.map((mega) => (
                    <div
                      key={mega.name}
                      className="flex flex-col items-center mt-3 pt-2 border-t border-border/40"
                    >
                      <div className="flex flex-col items-center my-1">
                        <ArrowDown className="h-4 w-4 text-muted-foreground opacity-60" />
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/30 my-1">
                          <Zap className="h-3 w-3" />
                          {mega.name.includes('-primal') || mega.name.includes('primal')
                            ? 'Primal'
                            : 'Mega Evolução'}
                        </span>
                      </div>

                      <Link
                        to={`/pokemon/${mega.id}`}
                        state={{ origin }}
                        className="flex flex-col items-center w-28 sm:w-32 p-3 rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent transition-all hover:scale-105"
                      >
                        <div className="h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center">
                          <img
  src={getArtwork(mega.id, mega.sprite, mega.spriteShiny)}
  alt={mega.name}
  className="max-h-full max-w-full object-contain"
  loading="lazy"
  onError={(e) => {
    e.currentTarget.src = isShiny ? mega.spriteShiny : mega.sprite;
  }}
/>
                        </div>

                        <span className="text-xs sm:text-sm font-semibold capitalize text-card-foreground mt-2 text-center leading-tight">
                          {mega.name.replace(/-/g, ' ')}
                        </span>

                        <div className="flex flex-wrap justify-center gap-1 mt-2">
                          {mega.types.map((t) => (
                            <TypeBadge key={t} type={t} size="sm" />
                          ))}
                        </div>
                      </Link>
                    </div>
                  ))}

                  {allGmax?.[evo.id]?.map((gmax) => (
                    <div
                      key={gmax.name}
                      className="flex flex-col items-center mt-3 pt-2 border-t border-purple-500/20"
                    >
                      <div className="flex flex-col items-center my-1">
                        <ArrowDown className="h-4 w-4 text-muted-foreground opacity-60" />
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2.5 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-400 border border-purple-500/30 my-1">
                          <Crown className="h-3 w-3" /> Gigantamax
                        </span>
                      </div>

                      <Link
                        to={`/pokemon/${gmax.id}`}
                        state={{ origin }}
                        className="flex flex-col items-center w-28 sm:w-32 p-3 rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-transparent transition-all hover:scale-105"
                      >
                        <div className="h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center">
                          <img
  src={getArtwork(gmax.id, gmax.sprite, gmax.spriteShiny)}
  alt={gmax.name}
  className="max-h-full max-w-full object-contain"
  loading="lazy"
  onError={(e) => {
    e.currentTarget.src = isShiny ? gmax.spriteShiny : gmax.sprite;
  }}
/>
                        </div>

                        <span className="text-xs sm:text-sm font-semibold capitalize text-card-foreground mt-2 text-center leading-tight">
                          {gmax.name.replace(/-/g, ' ')}
                        </span>

                        <div className="flex flex-wrap justify-center gap-1 mt-2">
                          {gmax.types.map((t) => (
                            <TypeBadge key={t} type={t} size="sm" />
                          ))}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}