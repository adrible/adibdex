import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TypeBadge } from '@/components/TypeBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Swords } from 'lucide-react';

interface MoveData {
  name: string;
  type: string;
  level: number;
  method: string;
}

async function fetchPokemonMoves(pokemonId: number): Promise<MoveData[]> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  const data = await res.json();

  const moves: MoveData[] = [];

  for (const m of data.moves) {
    for (const vg of m.version_group_details) {
      if (vg.move_learn_method.name === 'level-up') {
        moves.push({
          name: m.move.name,
          type: '', // will be fetched
          level: vg.level_learned_at,
          method: 'level-up',
        });
        break;
      }
    }
  }

  // Sort by level
  moves.sort((a, b) => a.level - b.level);

  // Fetch move types in batches
  const uniqueMoveNames = [...new Set(moves.map((m) => m.name))];
  const typeMap: Record<string, string> = {};

  for (let i = 0; i < uniqueMoveNames.length; i += 20) {
    const batch = uniqueMoveNames.slice(i, i + 20);
    const results = await Promise.all(
      batch.map(async (name) => {
        try {
          const r = await fetch(`https://pokeapi.co/api/v2/move/${name}`);
          const d = await r.json();
          return { name, type: d.type.name };
        } catch {
          return { name, type: 'normal' };
        }
      })
    );
    results.forEach((r) => (typeMap[r.name] = r.type));
  }

  return moves.map((m) => ({ ...m, type: typeMap[m.name] || 'normal' }));
}

export function PokemonMoves({ pokemonId }: { pokemonId: number }) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: moves, isLoading } = useQuery({
    queryKey: ['pokemon-moves', pokemonId],
    queryFn: () => fetchPokemonMoves(pokemonId),
    enabled: isOpen,
    staleTime: 1000 * 60 * 60,
  });

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 h-auto hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-card-foreground">Ataques por Nível</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>

      {isOpen && (
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : moves && moves.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 text-muted-foreground font-semibold text-xs">Nv.</th>
                    <th className="text-left py-2 pr-3 text-muted-foreground font-semibold text-xs">Ataque</th>
                    <th className="text-left py-2 text-muted-foreground font-semibold text-xs">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {moves.map((move, i) => (
                    <tr key={`${move.name}-${i}`} className="border-b border-border/50 last:border-0">
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary min-w-[2rem]">
                          {move.level || '—'}
                        </span>
                      </td>
                      <td className="py-2 pr-3 font-medium text-card-foreground capitalize">
                        {move.name.replace(/-/g, ' ')}
                      </td>
                      <td className="py-2">
                        <TypeBadge type={move.type} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum ataque por nível encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}
