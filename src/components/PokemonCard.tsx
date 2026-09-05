import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { PokemonBasic } from '@/lib/pokeapi';
import { TypeBadge } from './TypeBadge';

interface Props {
  pokemon: PokemonBasic & { baseId?: number };
  isShiny?: boolean;
  originPath?: string;
  listContext?: {
    ids: number[];
    currentIndex: number;
  };
}

export const PokemonCard = React.memo(function PokemonCard({
  pokemon,
  isShiny = false,
  originPath,
  listContext,
}: Props) {
  const displayId = pokemon.baseId ?? (pokemon.id <= 1025 ? pokemon.id : null);

  const isSpecialFormsPage = originPath?.includes('/mega') || originPath?.includes('/gmax');

  const imageSrc = useMemo(() => {
    if (isSpecialFormsPage) {
      return isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;
    }

    return isShiny ? pokemon.spriteShiny : pokemon.sprite;
  }, [isSpecialFormsPage, isShiny, pokemon.id, pokemon.sprite, pokemon.spriteShiny]);

  const pokemonName = useMemo(() => {
    return pokemon.name.replace(/-/g, ' ');
  }, [pokemon.name]);

  return (
    <Link
      to={`/pokemon/${pokemon.id}`}
      state={
        originPath
          ? {
              origin: originPath,
              listContext,
            }
          : undefined
      }
      className="group block rounded-xl bg-card border border-border p-4 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/40"
    >
      <div className="relative flex items-center justify-center h-36 w-full mb-3">
        <div className="absolute inset-0 rounded-lg bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        <img
          src={imageSrc}
          alt={pokemon.name}
          className="h-32 w-32 object-contain relative z-10 transition-all duration-300 group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />
      </div>

      {displayId && (
        <p className="text-xs font-bold text-muted-foreground mb-1">
          #{String(displayId).padStart(4, '0')}
        </p>
      )}

      <h3 className="font-pixel text-[10px] capitalize text-card-foreground mb-2 truncate">
        {pokemonName}
      </h3>

      <div className="flex gap-1.5 flex-wrap">
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
    </Link>
  );
});
