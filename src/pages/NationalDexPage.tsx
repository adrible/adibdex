import { useQuery } from '@tanstack/react-query';
import { fetchCatalog } from '@/lib/pokeapi/catalog';
import { useCatalogView } from '@/features/catalog/use-catalog-view';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { CatalogPageShell } from '@/components/catalog/CatalogPageShell';

export default function NationalDexPage() {
  const query = useQuery({
    queryKey: ['catalog', 'national'],
    queryFn: async ({ signal }) =>
      (await fetchCatalog(signal)).filter(
        (p) => p.category === 'base' || p.category === 'regional',
      ),
    staleTime: 60 * 60_000,
  });
  const view = useCatalogView('national', query.data, query.isSuccess);
  return (
    <CatalogPageShell
      title="Pokédex Nacional"
      subtitle="Pokémon da National Dex + formas regionais"
      backToTop
    >
      <CatalogBrowser
        view={view}
        loading={query.isPending}
        error={query.isError}
        onRetry={() => void query.refetch()}
        allowShowAll
        suggestions
      />
    </CatalogPageShell>
  );
}
