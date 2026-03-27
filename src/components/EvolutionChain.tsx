import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchEvolutionChain } from '@/lib/pokeapi';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowDown, Sparkles, Swords, Heart, Moon, Sun, Droplets } from 'lucide-react';

const TRIGGER_LABELS: Record<string, string> = {
  'level-up': 'Subir de Nível',
  'trade': 'Troca',
  'use-item': 'Usar Item',
  'shed': 'Especial',
  'spin': 'Girar',
  'tower-of-darkness': 'Torre da Escuridão',
  'tower-of-waters': 'Torre das Águas',
  'three-critical-hits': '3 Golpes Críticos',
  'take-damage': 'Receber Dano',
  'other': 'Outro',
  'agile-style-move': 'Golpe Estilo Ágil',
  'strong-style-move': 'Golpe Estilo Forte',
  'recoil-damage': 'Dano de Recuo',
};

function EvolutionDetail({ evo }: { evo: any }) {
  const details: React.ReactNode[] = [];

  if (evo.minLevel) {
    details.push(
      <span key="level" className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
        <Sparkles className="h-3 w-3" />
        Nv. {evo.minLevel}
      </span>
    );
  }

  if (evo.trigger && evo.trigger !== 'level-up') {
    const label = TRIGGER_LABELS[evo.trigger] || evo.trigger.replace(/-/g, ' ');
    details.push(
      <span key="trigger" className="inline-flex items-center gap-1 rounded-full bg-accent/60 px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground border border-accent/30 capitalize">
        {evo.trigger === 'trade' && <Swords className="h-3 w-3" />}
        {label}
      </span>
    );
  }

  if (evo.item) {
    details.push(
      <span key="item" className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold text-secondary-foreground border border-border capitalize">
        🧪 {evo.item.replace(/-/g, ' ')}
      </span>
    );
  }

  if (evo.heldItem) {
    details.push(
      <span key="held" className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground border border-border capitalize">
        🎒 Segurar: {evo.heldItem.replace(/-/g, ' ')}
      </span>
    );
  }

  if (evo.minHappiness) {
    details.push(
      <span key="happy" className="inline-flex items-center gap-1 rounded-full bg-pink-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-pink-400 border border-pink-500/20">
        <Heart className="h-3 w-3" /> Felicidade {evo.minHappiness}+
      </span>
    );
  }

  if (evo.timeOfDay) {
    const isNight = evo.timeOfDay === 'night';
    details.push(
      <span key="time" className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-400 border border-indigo-500/20 capitalize">
        {isNight ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
        {isNight ? 'Noite' : 'Dia'}
      </span>
    );
  }

  if (evo.knownMove) {
    details.push(
      <span key="move" className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-orange-400 border border-orange-500/20 capitalize">
        ⚔️ Saber: {evo.knownMove.replace(/-/g, ' ')}
      </span>
    );
  }

  if (evo.knownMoveType) {
    details.push(
      <span key="movetype" className="inline-flex items-center gap-1 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-400 border border-teal-500/20 capitalize">
        Saber golpe tipo: {evo.knownMoveType.replace(/-/g, ' ')}
      </span>
    );
  }

  if (evo.location) {
    details.push(
      <span key="loc" className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-400 border border-green-500/20 capitalize">
        📍 {evo.location.replace(/-/g, ' ')}
      </span>
    );
  }

  if (evo.minAffection) {
    details.push(
      <span key="affection" className="inline-flex items-center gap-1 rounded-full bg-pink-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-pink-400 border border-pink-500/20">
        💕 Afeição {evo.minAffection}+
      </span>
    );
  }

  if (evo.needsRain) {
    details.push(
      <span key="rain" className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-400 border border-blue-500/20">
        <Droplets className="h-3 w-3" /> Chovendo
      </span>
    );
  }

  if (evo.turnUpsideDown) {
    details.push(
      <span key="upside" className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-purple-400 border border-purple-500/20">
        🔄 Console de cabeça pra baixo
      </span>
    );
  }

  if (details.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 my-1">
      {details}
    </div>
  );
}

export function EvolutionChainDisplay({ pokemonId }: { pokemonId: number }) {
  const { data: chain, isLoading } = useQuery({
    queryKey: ['evolution-chain', pokemonId],
    queryFn: () => fetchEvolutionChain(pokemonId),
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border p-6">
        <h3 className="font-bold text-card-foreground mb-4">Linha Evolutiva</h3>
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-20 w-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!chain || (chain.steps.length <= 1 && chain.steps[0]?.length <= 1)) {
    return (
      <div className="rounded-xl bg-card border border-border p-6">
        <h3 className="font-bold text-card-foreground mb-3">Linha Evolutiva</h3>
        <p className="text-sm text-muted-foreground">Este Pokémon não evolui.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <h3 className="font-bold text-card-foreground mb-4">Linha Evolutiva</h3>
      <div className="flex flex-col items-center gap-1">
        {chain.steps.map((stage, stageIdx) => (
          <div key={stageIdx} className="flex flex-col items-center">
            {stageIdx > 0 && (
              <div className="flex flex-col items-center my-1">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-wrap justify-center gap-3">
              {stage.map((evo) => (
                <div key={evo.id} className="flex flex-col items-center">
                  {stageIdx > 0 && <EvolutionDetail evo={evo} />}
                  <Link
                    to={`/pokemon/${evo.id}`}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all hover:bg-muted/60 ${
                      evo.id === pokemonId ? 'ring-2 ring-primary bg-muted/40' : ''
                    }`}
                  >
                    <img
                      src={evo.sprite}
                      alt={evo.name}
                      className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
                      loading="lazy"
                    />
                    <span className="text-xs font-semibold capitalize text-card-foreground mt-1">
                      {evo.name}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
