import { useId, useRef, useState } from 'react';
import { Check, ChevronDown, Gamepad2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { normalizeSearch } from '@/features/catalog/search';
import { VERSION_GROUP_NAMES } from '@/lib/pokemon/constants';
import { localized } from '@/lib/language';

interface Props {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function GameSelector({ value, options, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const selected =
    options.find((game) => game.value === value)?.label ?? VERSION_GROUP_NAMES[value] ?? value;
  const available = [...options].reverse();
  if (value && !options.some((game) => game.value === value)) {
    available.unshift({
      value,
      label: `${selected} (${localized('sem registros neste catálogo', 'no records in this catalog')})`,
    });
  }
  const visible = available.filter((game) =>
    normalizeSearch(game.label).includes(normalizeSearch(search)),
  );
  const select = (game: string) => {
    onChange(game);
    setOpen(false);
    setSearch('');
    trigger.current?.focus();
  };
  return (
    <div className="space-y-2">
      <p id={`${id}-label`} className="text-sm font-semibold text-foreground">
        {localized('Jogo', 'Game')}
      </p>
      <button
        ref={trigger}
        type="button"
        aria-labelledby={`${id}-label ${id}-value`}
        aria-expanded={open}
        aria-controls={`${id}-options`}
        onClick={() => {
          setOpen(!open);
          setSearch('');
        }}
        className={`flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${value ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted/30 hover:bg-muted/60'}`}
      >
        <Gamepad2 className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span
          id={`${id}-value`}
          className="min-w-0 flex-1 break-words text-sm font-medium text-foreground"
        >
          {value ? selected : localized('Todos os jogos', 'All games')}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          id={`${id}-options`}
          data-game-selector-options
          className="overflow-hidden rounded-xl border border-border bg-card shadow-md"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              setOpen(false);
              trigger.current?.focus();
            }
          }}
        >
          <div className="relative p-2 border-b border-border">
            <Search
              className="absolute left-5 top-5 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              autoFocus
              type="search"
              aria-label={localized('Buscar jogo', 'Search games')}
              placeholder={localized('Buscar jogo...', 'Search games...')}
              maxLength={80}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9 text-base"
            />
          </div>
          <div
            className="max-h-64 overflow-y-auto overscroll-contain p-1.5"
            role="group"
            aria-label={localized('Jogos disponíveis', 'Available games')}
          >
            {[{ value: '', label: localized('Todos os jogos', 'All games') }, ...visible].map(
              (game) => (
                <button
                  key={game.value}
                  type="button"
                  aria-pressed={value === game.value}
                  onClick={() => select(game.value)}
                  className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${value === game.value ? 'bg-primary/15 text-foreground font-semibold' : 'text-foreground hover:bg-muted'}`}
                >
                  <span className="min-w-0 flex-1 break-words">{game.label}</span>
                  {value === game.value && (
                    <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  )}
                </button>
              ),
            )}
            {visible.length === 0 && (
              <p className="px-3 py-4 text-sm text-muted-foreground" role="status">
                {search.trim()
                  ? localized('Nenhum jogo encontrado.', 'No games found.')
                  : localized(
                      'Sem jogos com registros neste catálogo.',
                      'No games with records in this catalog.',
                    )}
              </p>
            )}
          </div>
        </div>
      )}
      {value && (
        <button
          type="button"
          onClick={() => select('')}
          className="min-h-11 px-1 text-xs font-medium text-primary underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {localized('Remover filtro de jogo', 'Clear game filter')}
        </button>
      )}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {localized(
          'Com um ataque na busca, mostra quem o aprende no jogo escolhido. Sem ataque, usa os registros de aprendizado disponíveis para esse jogo.',
          'When searching for a move, shows which Pokémon learn it in the selected game. Without a move search, uses all learning records available for that game.',
        )}
      </p>
    </div>
  );
}
