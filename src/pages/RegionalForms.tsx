import { useQuery } from '@tanstack/react-query';
import { fetchAllRegionalForms } from '@/lib/pokeapi';
import { Header } from '@/components/Header';

export default function RegionalForms() {
  const { data: forms, isLoading } = useQuery({
    queryKey: ['all-regional-forms'],
    queryFn: fetchAllRegionalForms,
    staleTime: 1000 * 60 * 60,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <h1 className="text-2xl font-bold text-center mb-6">
          Formas Regionais
        </h1>

        {isLoading ? (
          <p>Carregando...</p>
        ) : (
          <pre>{JSON.stringify(forms, null, 2)}</pre>
        )}
      </main>
    </div>
  );
}