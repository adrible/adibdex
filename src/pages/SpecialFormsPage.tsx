import { useQuery } from '@tanstack/react-query';
import { fetchAllMegaForms, fetchAllGmaxForms } from '@/lib/pokeapi/catalog';
import { useCatalogView } from '@/features/catalog/use-catalog-view';
import { CatalogBrowser } from '@/components/catalog/CatalogBrowser';
import { CatalogPageShell } from '@/components/catalog/CatalogPageShell';
import { localized } from '@/lib/language';

export default function SpecialFormsPage({ type }: { type: 'mega' | 'gmax' }) {
  const isMega = type === 'mega';
  const query = useQuery({
    queryKey: ['catalog', type],
    queryFn: ({ signal }) => (isMega ? fetchAllMegaForms(signal) : fetchAllGmaxForms(signal)),
    staleTime: 60 * 60_000,
  });
  const view = useCatalogView(`${type}-forms`, query.data, query.isSuccess, false);
  return (
    <CatalogPageShell
      title={isMega ? localized('Mega Evoluções', 'Mega Evolution') : 'Gigantamax'}
      subtitle={`${isMega ? localized('Todas as formas Mega e Primal', 'All Mega and Primal forms') : localized('Todas as formas Gigantamax', 'All Gigantamax forms')}${query.isSuccess ? ` (${view.filtered.length})` : ''}`}
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
