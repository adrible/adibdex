import { TYPE_TRANSLATIONS } from '@/lib/pokeapi';
import { localized } from '@/lib/language';

const TYPE_BG_CLASSES: Record<string, string> = {
  normal: 'bg-[hsl(var(--type-normal))]',
  fire: 'bg-[hsl(var(--type-fire))]',
  water: 'bg-[hsl(var(--type-water))]',
  grass: 'bg-[hsl(var(--type-grass))]',
  electric: 'bg-[hsl(var(--type-electric))]',
  ice: 'bg-[hsl(var(--type-ice))]',
  fighting: 'bg-[hsl(var(--type-fighting))]',
  poison: 'bg-[hsl(var(--type-poison))]',
  ground: 'bg-[hsl(var(--type-ground))]',
  flying: 'bg-[hsl(var(--type-flying))]',
  psychic: 'bg-[hsl(var(--type-psychic))]',
  bug: 'bg-[hsl(var(--type-bug))]',
  rock: 'bg-[hsl(var(--type-rock))]',
  ghost: 'bg-[hsl(var(--type-ghost))]',
  dragon: 'bg-[hsl(var(--type-dragon))]',
  dark: 'bg-[hsl(var(--type-dark))]',
  steel: 'bg-[hsl(var(--type-steel))]',
  fairy: 'bg-[hsl(var(--type-fairy))]',
};

export function TypeBadge({ type, size = 'sm' }: { type: string; size?: 'sm' | 'md' }) {
  const cls = TYPE_BG_CLASSES[type] || 'bg-muted';
  const textCls = ['dark', 'ghost', 'dragon', 'fighting', 'poison', 'bug', 'rock'].includes(type)
    ? 'text-white'
    : 'text-foreground';

  return (
    <span
      className={`${cls} ${textCls} inline-block rounded-full font-semibold capitalize ${
        size === 'md' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      {TYPE_TRANSLATIONS[type] || localized(type, type)}
    </span>
  );
}
