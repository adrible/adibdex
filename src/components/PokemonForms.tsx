import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchPokemonForms } from '@/lib/pokeapi';
import { TypeBadge } from '@/components/TypeBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe } from 'lucide-react';

interface Props {
  pokemonId: number;
  isShiny?: boolean;
  origin?: string;
}

export function PokemonForms({ pokemonId, isShiny = false, origin }: Props) {
  const { data: forms, isLoading } = useQuery({
    queryKey: ['pokemon-forms', pokemonId],
    queryFn: () => fetchPokemonForms(pokemonId),
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl bg-card border border-border p-6">
        <h3 className="font-bold text-card-foreground mb-4">Formas Alternativas</h3>
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-xl" />
          <Skeleton className="h-20 w-20 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!forms || forms.length === 0) return null;

  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-card-foreground">Formas Alternativas</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {forms.map((form) => (
          <Link
            key={form.name}
            to={`/pokemon/${form.id}`}
            state={{ origin }}
            className="flex flex-col items-center p-3 rounded-xl bg-muted/40 border border-border transition-all hover:bg-muted/70 hover:scale-105"
          >
            <div className="h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center">
              <img
                src={isShiny ? form.spriteShiny : form.sprite}
                alt={form.name}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            </div>
            <span className="text-xs font-semibold capitalize text-card-foreground mt-1 text-center">
              {form.formName || form.name.replace(/-/g, ' ')}
            </span>
            <div className="flex gap-1 mt-1">
              {form.types.map(t => <TypeBadge key={t} type={t} size="sm" />)}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
