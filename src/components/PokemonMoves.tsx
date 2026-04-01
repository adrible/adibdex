import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPokemonMovesByGame, fetchMoveDescription, METHOD_LABELS, type MoveByGame, type MovesByVersionGroup } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/TypeBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Swords } from 'lucide-react';

function MoveRow({ move, showLevel }: { move: MoveByGame; showLevel: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const { data: description } = useQuery({
    queryKey: ['move-desc', move.name],
    queryFn: () => fetchMoveDescription(move.name),
    enabled: expanded,
    staleTime: Infinity,
  });

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
      >
        {showLevel && (
          <td className="py-1.5 pr-2">
            <span className="inline-flex items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary min-w-[2rem]">
              {move.level || '—'}
            </span>
          </td>
        )}
        <td className="py-1.5 pr-2 font-medium text-card-foreground capitalize text-xs">
          {move.name.replace(/-/g, ' ')}
        </td>
        <td className="py-1.5 pr-2"><TypeBadge type={move.type} size="sm" /></td>
        <td className="py-1.5 pr-2">
          <span className={`text-xs font-semibold capitalize ${
            move.damageClass === 'physical' ? 'text-orange-500' :
            move.damageClass === 'special' ? 'text-blue-500' : 'text-muted-foreground'
          }`}>
            {move.damageClass === 'physical' ? 'Fís.' : move.damageClass === 'special' ? 'Esp.' : 'Sta.'}
          </span>
        </td>
        <td className="py-1.5 pr-2 text-right text-xs text-card-foreground">{move.power ?? '—'}</td>
        <td className="py-1.5 pr-2 text-right text-xs text-card-foreground">{move.accuracy ? `${move.accuracy}%` : '—'}</td>
        <td className="py-1.5 text-right text-xs text-card-foreground">{move.pp ?? '—'}</td>
      </tr>
      {expanded && (
        <tr className="bg-muted/20">
          <td colSpan={showLevel ? 7 : 6} className="px-3 py-2">
            <p className="text-xs text-muted-foreground italic">
              {description || 'Carregando...'}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}

function MoveTable({ moves, showLevel }: { moves: MoveByGame[]; showLevel: boolean }) {
  if (moves.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">Nenhum ataque nesta categoria.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {showLevel && <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs w-12">Nv.</th>}
            <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs">Ataque</th>
            <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs w-20">Tipo</th>
            <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs w-14">Cat.</th>
            <th className="text-right py-2 pr-2 text-muted-foreground font-semibold text-xs w-12">Pow</th>
            <th className="text-right py-2 pr-2 text-muted-foreground font-semibold text-xs w-12">Acc</th>
            <th className="text-right py-2 text-muted-foreground font-semibold text-xs w-10">PP</th>
          </tr>
        </thead>
        <tbody>
          {moves.map((move, i) => (
            <MoveRow key={`${move.name}-${i}`} move={move} showLevel={showLevel} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GameMoves({ group }: { group: MovesByVersionGroup }) {
  const [openSection, setOpenSection] = useState<string>('level-up');
  const sections = [
    { key: 'level-up', label: METHOD_LABELS['level-up'], moves: group.levelUp, showLevel: true },
    { key: 'machine', label: METHOD_LABELS['machine'], moves: group.machine, showLevel: false },
    { key: 'egg', label: METHOD_LABELS['egg'], moves: group.egg, showLevel: false },
    { key: 'tutor', label: METHOD_LABELS['tutor'], moves: group.tutor, showLevel: false },
  ].filter(s => s.moves.length > 0);

  return (
    <div className="space-y-2">
      {sections.map(section => (
        <div key={section.key} className="border border-border/50 rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenSection(openSection === section.key ? '' : section.key)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
          >
            <span className="text-sm font-semibold text-card-foreground">
              {section.label} <span className="text-muted-foreground font-normal">({section.moves.length})</span>
            </span>
            {openSection === section.key ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {openSection === section.key && (
            <div className="px-4 py-2"><MoveTable moves={section.moves} showLevel={section.showLevel} /></div>
          )}
        </div>
      ))}
    </div>
  );
}

export function PokemonMoves({ pokemonId }: { pokemonId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('');

  const { data: movesByGame, isLoading } = useQuery({
    queryKey: ['pokemon-moves-by-game', pokemonId],
    queryFn: () => fetchPokemonMovesByGame(pokemonId),
    enabled: isOpen,
    staleTime: 1000 * 60 * 60,
  });

  const currentGame = movesByGame?.find(g => g.versionGroup === selectedGame) || movesByGame?.[0];

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <Button
        variant="ghost" onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 h-auto hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-card-foreground">Ataques</h3>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
      </Button>

      {isOpen && (
        <div className="px-6 pb-6">
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : movesByGame && movesByGame.length > 0 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {movesByGame.map(g => (
                  <button key={g.versionGroup} onClick={() => setSelectedGame(g.versionGroup)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                      currentGame?.versionGroup === g.versionGroup
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted/70'
                    }`}>
                    {g.versionGroupLabel}
                  </button>
                ))}
              </div>
              {currentGame && <GameMoves group={currentGame} />}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum ataque encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}
