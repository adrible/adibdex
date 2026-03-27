import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchEvolutionChain } from '@/lib/pokeapi';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';

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
        <div className="flex items-center justify-center gap-4">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-20 w-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!chain || chain.steps.length <= 1 && chain.steps[0]?.length <= 1) {
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
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
        {chain.steps.map((stage, stageIdx) => (
          <div key={stageIdx} className="flex items-center gap-2 sm:gap-4">
            {stageIdx > 0 && (
              <div className="flex flex-col items-center text-muted-foreground">
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              {stage.map((evo) => (
                <Link
                  key={evo.id}
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
                  {evo.minLevel && (
                    <span className="text-[10px] text-muted-foreground">Nv. {evo.minLevel}</span>
                  )}
                  {evo.item && (
                    <span className="text-[10px] text-muted-foreground capitalize">{evo.item.replace('-', ' ')}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
