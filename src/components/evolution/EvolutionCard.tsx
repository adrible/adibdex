import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import type { PokemonNavigationState } from '@/lib/navigation';
import { TypeBadge } from '@/components/TypeBadge';

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
    return <span className="text-xs text-muted-foreground">Imagem indisponível</span>;
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
  return (
    <Link
      to={`/pokemon/${id}`}
      state={navigation}
      aria-current={selected ? 'page' : undefined}
      className={`evolution-card ${selected ? 'evolution-card--selected' : ''}`}
    >
      <div className="evolution-card-meta">
        <span>#{String(speciesId).padStart(4, '0')}</span>
        {selected && (
          <span className="evolution-current">
            <Check className="h-3 w-3" />
            Atual
          </span>
        )}
      </div>
      <div className="evolution-artwork-wrap">
        <Artwork key={`${id}-${isShiny}`} id={id} name={name} shiny={isShiny} />
      </div>
      <span className="evolution-name">{name.replace(/-/g, ' ')}</span>
      {!!types?.length && (
        <span className="mt-2 flex flex-wrap justify-center gap-1">
          {types.map((type) => (
            <TypeBadge key={type} type={type} size="sm" />
          ))}
        </span>
      )}
    </Link>
  );
}
