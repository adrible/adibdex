import { useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowUpRight, Sparkles } from 'lucide-react';
import type { PokemonNavigationState } from '@/lib/navigation';
import { TypeBadge } from '@/components/TypeBadge';
import { TYPE_TRANSLATIONS } from '@/lib/pokemon/constants';
import { localized } from '@/lib/language';

interface Props {
  id: number;
  speciesId: number;
  name: string;
  isShiny: boolean;
  selected: boolean;
  navigation: PokemonNavigationState;
  types?: string[];
}

function Artwork({ id, name, shiny }: { id: number; name: string; shiny: boolean }) {
  const [fallback, setFallback] = useState(0);
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  const sources = [
    ...new Set([
      `${base}other/official-artwork/${shiny ? 'shiny/' : ''}${id}.png`,
      `${base}${shiny ? 'shiny/' : ''}${id}.png`,
      `${base}${id}.png`,
    ]),
  ];
  if (fallback >= sources.length)
    return (
      <span className="text-xs text-muted-foreground">
        {localized('Imagem indisponível', 'Image unavailable')}
      </span>
    );
  return (
    <img
      src={sources[fallback]}
      alt={name}
      loading="lazy"
      decoding="async"
      className="evolution-artwork"
      onError={() => setFallback((level) => level + 1)}
    />
  );
}

export function EvolutionCard({
  id,
  speciesId,
  name,
  isShiny,
  selected,
  navigation,
  types,
}: Props) {
  const primaryType = types?.find((type) => Object.hasOwn(TYPE_TRANSLATIONS, type)) ?? 'normal';
  const secondaryType =
    types?.find((type) => type !== primaryType && Object.hasOwn(TYPE_TRANSLATIONS, type)) ??
    primaryType;
  return (
    <Link
      to={`/pokemon/${id}`}
      state={navigation}
      aria-current={selected ? 'page' : undefined}
      className={`evolution-card ${selected ? 'evolution-card--selected' : ''} ${isShiny ? 'evolution-card--shiny' : ''}`}
      style={
        {
          '--evo-type': `var(--type-${primaryType})`,
          '--evo-secondary': `var(--type-${secondaryType})`,
        } as CSSProperties
      }
    >
      <div className="evolution-card-meta">
        <span>#{String(speciesId).padStart(4, '0')}</span>
        {selected && (
          <span className="evolution-current">
            <Check className="h-3 w-3" />
            {localized('Atual', 'Current')}
          </span>
        )}
        {!selected && <ArrowUpRight aria-hidden="true" className="evolution-card-open" />}
      </div>
      <div className="evolution-artwork-wrap">
        <span className="evolution-orbit" aria-hidden="true" />
        {isShiny && <Sparkles aria-hidden="true" className="evolution-shiny-icon" />}
        <Artwork key={`${id}-${isShiny}`} id={id} name={name} shiny={isShiny} />
      </div>
      <div className="evolution-card-info">
        <span className="evolution-name">{name.replace(/-/g, ' ')}</span>
        {!!types?.length && (
          <span className="evolution-card-types">
            {types.map((type) => (
              <TypeBadge key={type} type={type} size="sm" />
            ))}
          </span>
        )}
      </div>
    </Link>
  );
}
