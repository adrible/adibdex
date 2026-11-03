import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchPokemonMovesByGame,
  fetchMoveDescription,
  METHOD_LABELS,
  type MoveByGame,
  type MovesByVersionGroup,
} from '@/lib/pokeapi';
import { TypeBadge } from '@/components/TypeBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Swords } from 'lucide-react';
import { QueryErrorState } from '@/components/QueryErrorState';

function MoveRow({ move, showLevel }: { move: MoveByGame; showLevel: boolean }) {
  const [expanded, setExpanded] = useState(false);

  const {
    data: description,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['move-desc', move.name],
    queryFn: ({ signal }) => fetchMoveDescription(move.name, signal),
    enabled: expanded,
    staleTime: Infinity,
  });

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        className="detail-move-row border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
      >
        {showLevel && (
          <td data-label="Nível" className="py-3 pr-2">
            <span className="inline-flex items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary min-w-[2rem]">
              {move.level || '—'}
            </span>
          </td>
        )}
        <td
          data-label="Ataque"
          className="detail-move-name py-3 pr-2 font-medium text-card-foreground capitalize text-xs"
        >
          <button
            aria-expanded={expanded}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded(!expanded);
            }}
            className="capitalize text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {move.name.replace(/-/g, ' ')}
          </button>
        </td>
        <td data-label="Tipo" className="py-3 pr-2">
          <TypeBadge type={move.type} size="sm" />
        </td>
        <td data-label="Categoria" className="py-3 pr-2">
          <span
            className={`text-xs font-semibold capitalize ${
              move.damageClass === 'physical'
                ? 'text-orange-500'
                : move.damageClass === 'special'
                  ? 'text-blue-500'
                  : 'text-muted-foreground'
            }`}
          >
            {move.damageClass === 'physical'
              ? 'Fís.'
              : move.damageClass === 'special'
                ? 'Esp.'
                : 'Sta.'}
          </span>
        </td>
        <td data-label="Poder" className="py-3 pr-2 text-right text-xs text-card-foreground">
          {move.power ?? '—'}
        </td>
        <td data-label="Precisão" className="py-3 pr-2 text-right text-xs text-card-foreground">
          {move.accuracy ? `${move.accuracy}%` : '—'}
        </td>
        <td data-label="PP" className="py-3 text-right text-xs text-card-foreground">
          {move.pp ?? '—'}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/20">
          <td colSpan={showLevel ? 7 : 6} className="px-3 py-2">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isLoading
                ? 'Carregando...'
                : isError
                  ? 'Não foi possível carregar a descrição.'
                  : description || 'Descrição indisponível.'}
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
    <div
      className="overflow-x-auto rounded-lg border border-border detail-move-table"
      tabIndex={0}
      role="region"
      aria-label="Tabela de ataques"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {showLevel && (
              <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs w-12">
                Nv.
              </th>
            )}
            <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs">
              Ataque
            </th>
            <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs w-20">
              Tipo
            </th>
            <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs w-14">
              Cat.
            </th>
            <th className="text-right py-2 pr-2 text-muted-foreground font-semibold text-xs w-12">
              Poder
            </th>
            <th className="text-right py-2 pr-2 text-muted-foreground font-semibold text-xs w-12">
              Precisão
            </th>
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
  const [selectedMethod, setSelectedMethod] = useState('level-up');
  const [search, setSearch] = useState('');
  const sections = [
    { key: 'level-up', label: METHOD_LABELS['level-up'], moves: group.levelUp, showLevel: true },
    { key: 'machine', label: METHOD_LABELS['machine'], moves: group.machine, showLevel: false },
    { key: 'egg', label: METHOD_LABELS['egg'], moves: group.egg, showLevel: false },
    { key: 'tutor', label: METHOD_LABELS['tutor'], moves: group.tutor, showLevel: false },
  ].filter((s) => s.moves.length > 0);

  const activeSection = sections.find((section) => section.key === selectedMethod) || sections[0];
  const normalizedSearch = search.trim().toLowerCase().replace(/-/g, ' ');
  const filteredMoves =
    activeSection?.moves.filter((move) =>
      move.name.replace(/-/g, ' ').includes(normalizedSearch),
    ) || [];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" aria-label="Método de aprendizado">
        {sections.map((section) => (
          <button
            key={section.key}
            type="button"
            aria-pressed={activeSection?.key === section.key}
            onClick={() => setSelectedMethod(section.key)}
            className={`detail-method ${activeSection?.key === section.key ? 'detail-method--active' : ''}`}
          >
            {section.label} <span className="opacity-70">{section.moves.length}</span>
          </button>
        ))}
      </div>
      <label className="block">
        <span className="sr-only">Buscar ataque neste método de aprendizado</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar ataque neste método..."
          className="detail-move-search"
        />
      </label>
      <p className="text-xs text-muted-foreground">Selecione um ataque para ver sua descrição.</p>
      <MoveTable moves={filteredMoves} showLevel={activeSection?.showLevel ?? false} />
    </div>
  );
}

export function PokemonMoves({ pokemonId }: { pokemonId: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('');

  const {
    data: movesByGame,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['pokemon-moves-by-game', pokemonId],
    queryFn: ({ signal }) => fetchPokemonMovesByGame(pokemonId, signal),
    enabled: isOpen,
    staleTime: 1000 * 60 * 60,
  });

  const currentGame = movesByGame?.find((g) => g.versionGroup === selectedGame) || movesByGame?.[0];

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="pokemon-moves-content"
        className="w-full flex items-center justify-between p-5 sm:p-6 h-auto hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          <h3 className="section-title">Ataques</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </Button>

      {isOpen && (
        <div id="pokemon-moves-content" className="px-4 pb-5 sm:px-6 sm:pb-6">
          {isError ? (
            <QueryErrorState
              title="Não foi possível carregar os ataques"
              onRetry={() => void refetch()}
            />
          ) : isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : movesByGame && movesByGame.length > 0 ? (
            <div className="space-y-4">
              <label className="detail-game-picker">
                <span className="text-overline">Jogo</span>
                <select
                  value={currentGame?.versionGroup || ''}
                  onChange={(event) => setSelectedGame(event.target.value)}
                  className="detail-game-select"
                >
                  {movesByGame.map((g) => (
                    <option key={g.versionGroup} value={g.versionGroup}>
                      {g.versionGroupLabel}
                    </option>
                  ))}
                </select>
              </label>
              {currentGame && <GameMoves key={currentGame.versionGroup} group={currentGame} />}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum ataque encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}
