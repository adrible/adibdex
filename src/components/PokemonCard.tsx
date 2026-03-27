import { Link } from 'react-router-dom';
import type { PokemonBasic } from '@/lib/pokeapi';
import { TypeBadge } from './TypeBadge';

export function PokemonCard({ pokemon }: { pokemon: PokemonBasic }) {
  return (
    <Link
      to={`/pokemon/${pokemon.id}`}
      className="group block rounded-xl bg-card border border-border p-4 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-primary/40"
    >
      <div className="relative flex items-center justify-center h-36 mb-3">
        <div className="absolute inset-0 rounded-lg bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity" />
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          className="h-32 w-32 object-contain relative z-10 transition-transform group-hover:scale-110"
          loading="lazy"
        />
      </div>
      <p className="text-xs font-bold text-muted-foreground mb-1">
        #{String(pokemon.id).padStart(4, '0')}
      </p>
      <h3 className="text-base font-bold capitalize text-card-foreground mb-2 truncate">
        {pokemon.name}
      </h3>
      <div className="flex gap-1.5 flex-wrap">
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
    </Link>
  );
}
