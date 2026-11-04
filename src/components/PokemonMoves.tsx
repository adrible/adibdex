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
import { localized } from '@/lib/language';

const MOVE_TARGETS: Record<string, string> = {
  'selected-pokemon': localized('Pokémon escolhido', 'Selected Pokémon'),
  'all-opponents': localized('Todos os adversários', 'All opponents'),
  'all-other-pokemon': localized('Todos os outros Pokémon', 'All other Pokémon'),
  user: localized('O próprio usuário', 'User'),
  'users-field': localized('Campo aliado', "User's side"),
  'opponents-field': localized('Campo adversário', "Opponent's side"),
  'entire-field': localized('Campo inteiro', 'Entire field'),
  'user-and-allies': localized('Usuário e aliados', 'User and allies'),
  'user-or-ally': localized('Usuário ou aliado', 'User or ally'),
  'all-pokemon': localized('Todos os Pokémon', 'All Pokémon'),
  'random-opponent': localized('Adversário aleatório', 'Random opponent'),
  'specific-move': localized('Alvo especial', 'Specific move'),
};

const MOVE_AILMENTS: Record<string, string> = {
  burn: localized('Queimadura', 'Burn'),
  freeze: localized('Congelamento', 'Freeze'),
  paralysis: localized('Paralisia', 'Paralysis'),
  poison: localized('Envenenamento', 'Poison'),
  sleep: localized('Sono', 'Sleep'),
  confusion: localized('Confusão', 'Confusion'),
  infatuation: localized('Paixão', 'Infatuation'),
  trap: localized('Aprisionamento', 'Trap'),
  nightmare: localized('Pesadelo', 'Nightmare'),
  torment: localized('Tormento', 'Torment'),
  disable: localized('Bloqueio', 'Disable'),
  yawn: localized('Bocejo', 'Yawn'),
  heal: localized('Cura', 'Healing'),
  no: localized('Nenhum', 'None'),
};

function titleCase(value: string) {
  return value.replace(/-/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

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
          <td data-label={localized('Nível', 'Level')} className="py-3 pr-2">
            <span className="inline-flex items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary min-w-[2rem]">
              {move.level || '—'}
            </span>
          </td>
        )}
        <td
          data-label={localized('Ataque', 'Move')}
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
        <td data-label={localized('Tipo', 'Type')} className="py-3 pr-2">
          <TypeBadge type={move.type} size="sm" />
        </td>
        <td data-label={localized('Categoria', 'Category')} className="py-3 pr-2">
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
              ? localized('Fís.', 'Phys.')
              : move.damageClass === 'special'
                ? localized('Esp.', 'Spec.')
                : localized('Sta.', 'Status')}
          </span>
        </td>
        <td
          data-label={localized('Poder', 'Power')}
          className="py-3 pr-2 text-right text-xs text-card-foreground"
        >
          {move.power ?? '—'}
        </td>
        <td
          data-label={localized('Precisão', 'Accuracy')}
          className="py-3 pr-2 text-right text-xs text-card-foreground"
        >
          {move.accuracy ? `${move.accuracy}%` : '—'}
        </td>
        <td data-label="PP" className="py-3 text-right text-xs text-card-foreground">
          {move.pp ?? '—'}
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/20">
          <td colSpan={showLevel ? 7 : 6} className="px-3 py-2">
            <div className="move-extra-data">
              {move.target && (
                <span>
                  {localized('Alvo', 'Target')}:{' '}
                  {MOVE_TARGETS[move.target] ?? titleCase(move.target)}
                </span>
              )}
              {move.priority !== 0 && (
                <span>
                  {localized('Prioridade', 'Priority')}:{' '}
                  {move.priority > 0 ? `+${move.priority}` : move.priority}
                </span>
              )}
              {move.ailment && move.ailment !== 'none' && (
                <span>
                  {localized('Efeito', 'Effect')}:{' '}
                  {MOVE_AILMENTS[move.ailment] ?? titleCase(move.ailment)}
                  {move.ailmentChance !== null && move.ailmentChance > 0
                    ? ` (${move.ailmentChance}%)`
                    : ''}
                </span>
              )}
              {move.effectChance !== null && move.effectChance > 0 && (
                <span>
                  {localized('Chance do efeito', 'Effect chance')}: {move.effectChance}%
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {isLoading
                ? localized('Carregando...', 'Loading...')
                : isError
                  ? localized(
                      'Não foi possível carregar a descrição.',
                      'Could not load the description.',
                    )
                  : description || localized('Descrição indisponível.', 'Description unavailable.')}
            </p>
          </td>
        </tr>
      )}
    </>
  );
}

function MoveTable({ moves, showLevel }: { moves: MoveByGame[]; showLevel: boolean }) {
  if (moves.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        {localized('Nenhum ataque nesta categoria.', 'No moves in this category.')}
      </p>
    );
  }
  return (
    <div
      className="overflow-x-auto rounded-lg border border-border detail-move-table"
      tabIndex={0}
      role="region"
      aria-label={localized('Tabela de ataques', 'Moves table')}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {showLevel && (
              <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs w-12">
                {localized('Nv.', 'Lv.')}
              </th>
            )}
            <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs">
              {localized('Ataque', 'Move')}
            </th>
            <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs w-20">
              {localized('Tipo', 'Type')}
            </th>
            <th className="text-left py-2 pr-2 text-muted-foreground font-semibold text-xs w-14">
              {localized('Cat.', 'Class')}
            </th>
            <th className="text-right py-2 pr-2 text-muted-foreground font-semibold text-xs w-12">
              {localized('Poder', 'Power')}
            </th>
            <th className="text-right py-2 pr-2 text-muted-foreground font-semibold text-xs w-12">
              {localized('Precisão', 'Accuracy')}
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
      <div
        className="flex flex-wrap gap-2"
        aria-label={localized('Método de aprendizado', 'Learning method')}
      >
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
        <span className="sr-only">
          {localized(
            'Buscar ataque neste método de aprendizado',
            'Search moves learned by this method',
          )}
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={localized(
            'Buscar ataque neste método...',
            'Search moves learned this way...',
          )}
          className="detail-move-search"
        />
      </label>
      <p className="text-xs text-muted-foreground">
        {localized(
          'Selecione um ataque para ver sua descrição.',
          'Select a move to view its description.',
        )}
      </p>
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
    <div className="detail-moves-card rounded-xl bg-card border border-border overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="pokemon-moves-content"
        className="w-full flex items-center justify-between p-5 sm:p-6 h-auto hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-primary" />
          <h3 className="section-title">{localized('Ataques', 'Moves')}</h3>
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
              title={localized('Não foi possível carregar os ataques', 'Could not load moves')}
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
                <span className="text-overline">{localized('Jogo', 'Game')}</span>
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
            <p className="text-sm text-muted-foreground">
              {localized('Nenhum ataque encontrado.', 'No moves found.')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
