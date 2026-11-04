import { gameVersionLabel } from '@/lib/resource-labels';
import { SourceText } from '@/components/SourceText';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronDown } from 'lucide-react';
import { fetchPokemonSpeciesInfo } from '@/lib/pokeapi';
import { localized } from '@/lib/language';
import { QueryErrorState } from '@/components/QueryErrorState';
import { Skeleton } from '@/components/ui/skeleton';

export function PokemonDexEntries({ speciesId }: { speciesId: number }) {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['pokemon-species-info', speciesId],
    queryFn: ({ signal }) => fetchPokemonSpeciesInfo(speciesId, signal),
    staleTime: 24 * 60 * 60_000,
  });

  return (
    <section id="entradas-pokedex" className="detail-panel detail-wide detail-dex-entries">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
        <h3 className="section-title">{localized('Entradas da Pokédex', 'Pokédex entries')}</h3>
      </div>
      <details className="species-profile-details">
        <summary>
          {localized('Expandir entradas por jogo', 'Expand entries by game')}
          <ChevronDown aria-hidden="true" />
        </summary>
        <div className="mt-3">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            {localized(
              'Descrições registradas nos jogos. Quando não houver tradução, o texto original será identificado.',
              'Descriptions recorded in the games.',
            )}
          </p>
          {isPending ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : isError ? (
            <QueryErrorState
              title={localized(
                'Não foi possível carregar as entradas',
                'Could not load Pokédex entries',
              )}
              onRetry={() => void refetch()}
            />
          ) : data?.pokedexEntries.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {data.pokedexEntries.map(({ version, text }) => (
                <article
                  key={version}
                  className="rounded-lg border border-border/70 bg-muted/25 p-3"
                >
                  <h4 className="mb-2 text-xs font-semibold text-primary">
                    {gameVersionLabel(version)}
                  </h4>
                  <p className="text-sm leading-relaxed text-card-foreground">
                    <SourceText text={text} language={data.entriesLanguage} />
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {localized(
                'Não há entradas da Pokédex disponíveis para este Pokémon.',
                'No Pokédex entries are available for this Pokémon.',
              )}
            </p>
          )}
        </div>
      </details>
    </section>
  );
}
