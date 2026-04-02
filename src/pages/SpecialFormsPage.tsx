import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllMegaForms, fetchAllGmaxForms } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { PokemonCard } from '@/components/PokemonCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUp, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const PAGE_SIZE = 48;

interface Props {
  type: 'mega' | 'gmax';
}

export default function SpecialFormsPage({ type }: Props) {
  const [isShiny, setIsShiny] = useState(false);
  const [page, setPage] = useState(0);
  const [pageInput, setPageInput] = useState('');
  const location = useLocation();

  const isMega = type === 'mega';

  const { data: forms, isLoading } = useQuery({
    queryKey: [isMega ? 'all-mega-forms' : 'all-gmax-forms'],
    queryFn: isMega ? fetchAllMegaForms : fetchAllGmaxForms,
    staleTime: 1000 * 60 * 60,
  });

  const totalPages = forms ? Math.ceil(forms.length / PAGE_SIZE) : 1;

  const displayed = useMemo(() => {
    if (!forms) return [];
    const start = page * PAGE_SIZE;
    return forms.slice(start, start + PAGE_SIZE);
  }, [forms, page]);

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = parseInt(pageInput);
      if (!isNaN(val) && val >= 1 && val <= totalPages) {
        setPage(val - 1);
        window.scrollTo(0, 0);
      }
      setPageInput('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h2 className="font-pixel text-sm sm:text-lg text-foreground">
              {isMega ? 'Mega Evoluções' : 'Gigantamax'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isMega ? 'Todas as formas Mega' : 'Todas as formas Gigantamax'}
            </p>
          </div>
          <div className="ml-auto">
            <Button
              variant={isShiny ? "default" : "outline"} size="sm"
              onClick={() => setIsShiny(!isShiny)}
              className={`gap-1 ${isShiny ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0' : ''}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Shiny
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-card border border-border p-4">
                <Skeleton className="h-36 w-full rounded-lg mb-3" />
                <Skeleton className="h-3 w-12 mb-2" />
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {displayed.map((p) => (
                <PokemonCard key={p.id} pokemon={p} isShiny={isShiny} originPath={location.pathname} />
              ))}
              {displayed.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-12">Nenhum Pokémon encontrado.</p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <Button variant="outline" size="icon" disabled={page === 0} onClick={() => { setPage(p => p - 1); window.scrollTo(0, 0); }}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <input
                    type="text"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={handlePageInput}
                    onBlur={() => setPageInput('')}
                    placeholder={String(page + 1)}
                    className="w-10 text-center rounded border border-input bg-background px-1 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <span>/ {totalPages}</span>
                </div>
                <Button variant="outline" size="icon" disabled={page >= totalPages - 1} onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-center mt-10">
              <Button variant="outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="gap-2">
                <ArrowUp className="h-4 w-4" />
                Voltar ao topo
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
