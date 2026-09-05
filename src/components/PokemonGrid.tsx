import { useQuery } from '@tanstack/react-query';
import { fetchPokemonListByRange, type Generation } from '@/lib/pokeapi';
import { useCatalogView, PAGE_SIZE } from '@/features/catalog/use-catalog-view';
import { CatalogBrowser } from './catalog/CatalogBrowser';

export function PokemonGrid({ generation }: { generation: Generation }) {
  const query = useQuery({
    queryKey: ['catalog', 'generation', generation.id],
    queryFn: ({ signal }) => fetchPokemonListByRange(...generation.pokemonRange, { signal }),
    staleTime: 60 * 60_000,
  });
  const view = useCatalogView(`gen-${generation.id}`, query.data, query.isSuccess, true, false);
  return (
    <CatalogBrowser
      view={view}
      loading={query.isPending}
      error={query.isError}
      onRetry={() => void query.refetch()}
      showRegionFilter={false}
      allowShowAll={generation.pokemonRange[1] - generation.pokemonRange[0] + 1 > PAGE_SIZE}
    />
  );
}
