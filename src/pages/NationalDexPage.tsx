import { useQuery } from '@tanstack/react-query';
import { fetchCatalog } from '@/lib/pokeapi/catalog';
import { useCatalogView } from '@/features/catalog/use-catalog-view';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { CatalogPageShell } from '@/components/catalog/CatalogPageShell';
import { localized } from '@/lib/language';

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
      title={localized('Pokédex Nacional', 'National Pokédex')}
      subtitle={localized(
        'Pokémon da Pokédex Nacional + formas regionais',
        'National Pokédex Pokémon + regional forms',
      )}
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
