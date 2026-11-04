import { useQuery } from '@tanstack/react-query';
import { fetchAllRegionalForms } from '@/lib/pokeapi/catalog';
import { useCatalogView } from '@/features/catalog/use-catalog-view';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { CatalogPageShell } from '@/components/catalog/CatalogPageShell';
import { localized } from '@/lib/language';

export default function RegionalForms() {
  const query = useQuery({
    queryKey: ['catalog', 'regional'],
    queryFn: ({ signal }) => fetchAllRegionalForms(signal),
    staleTime: 60 * 60_000,
  });
  const view = useCatalogView('regional-forms', query.data, query.isSuccess, false);
  return (
    <CatalogPageShell
      title={localized('Formas Regionais', 'Regional Forms')}
      subtitle={`${localized('Alola, Galar, Hisui e Paldea', 'Alola, Galar, Hisui, and Paldea')}${query.isSuccess ? ` (${view.filtered.length})` : ''}`}
      backToTop
    >
      <CatalogBrowser
        view={view}
        loading={query.isPending}
        error={query.isError}
        onRetry={() => void query.refetch()}
        showSpecialFormFilters={false}
      />
    </CatalogPageShell>
  );
}
