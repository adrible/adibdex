import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { PokemonBasic } from '@/lib/pokeapi';
import { getMatchingMoveGames } from '@/features/catalog/search';
import { VERSION_GROUP_NAMES } from '@/lib/pokemon/constants';
import { TypeBadge } from './TypeBadge';

interface Props {
  pokemon: PokemonBasic & { baseId?: number };
  isShiny?: boolean;
  search?: string;
  originPath?: string;
  listContext?: {
    ids: number[];
    currentIndex: number;
  };
}

export const PokemonCard = React.memo(function PokemonCard({
  pokemon,
  isShiny = false,
  search = '',
  originPath,
  listContext,
}: Props) {
  const matchingMoves = useMemo(() => getMatchingMoveGames(pokemon, search), [pokemon, search]);
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

      {displayId && <p className="text-code mb-2">#{String(displayId).padStart(4, '0')}</p>}

      <h3 className="catalog-card-name">{pokemonName}</h3>

      {matchingMoves.length > 0 && (
        <div className="mb-3 space-y-2" aria-label="Jogos em que aprende o ataque pesquisado">
          {matchingMoves.map((move) => (
            <div key={move.name}>
              <p className="text-xs font-semibold capitalize mb-1">
                {move.name.replace(/-/g, ' ')}
              </p>
              <div className="flex flex-wrap gap-1">
                {move.games.map((game) => (
                  <span
                    key={game}
                    className="rounded-md border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[10px] leading-relaxed font-medium text-primary"
                  >
                    {VERSION_GROUP_NAMES[game] ?? game.replace(/-/g, ' ')}
                  </span>
                ))}
                {move.games.length === 0 && (
                  <span className="text-xs text-muted-foreground">Jogos não informados.</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1.5 flex-wrap">
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
    </Link>
  );
});
