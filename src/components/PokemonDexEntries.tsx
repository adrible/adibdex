import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronDown } from 'lucide-react';
import { fetchPokemonSpeciesInfo } from '@/lib/pokeapi';
import { localized } from '@/lib/language';
import { QueryErrorState } from '@/components/QueryErrorState';
import { Skeleton } from '@/components/ui/skeleton';

const GAME_VERSION_LABELS: Record<string, string> = {
  firered: 'FireRed',
  leafgreen: 'LeafGreen',
  heartgold: 'HeartGold',
  soulsilver: 'SoulSilver',
  'lets-go-pikachu': "Let's Go Pikachu",
  'lets-go-eevee': "Let's Go Eevee",
};

function gameVersionLabel(version: string) {
  return (
    GAME_VERSION_LABELS[version] ??
    version.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

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
              'Descrições oficiais registradas nos jogos, no idioma selecionado.',
              'Official descriptions recorded in the games, in the selected language.',
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
                  <p className="text-sm leading-relaxed text-card-foreground">{text}</p>
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
