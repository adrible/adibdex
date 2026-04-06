import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCompare } from '@/contexts/CompareContext';
import { fetchPokemonDetail, STAT_TRANSLATIONS } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { TypeBadge } from '@/components/TypeBadge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function StatCompareBar({ name, values }: { name: string; values: number[] }) {
  const label = STAT_TRANSLATIONS[name] || name;
  const max = Math.max(...values);

  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${values.length}, 1fr)` }}>
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${v === max && values.filter(x => x === max).length === 1 ? 'text-primary' : 'text-foreground'}`}>
              {v}
            </span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${v === max && values.filter(x => x === max).length === 1 ? 'bg-primary' : 'bg-muted-foreground/40'}`}
                style={{ width: `${(v / 255) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const { selected, clear } = useCompare();
  const navigate = useNavigate();

  const queries = selected.map(p =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useQuery({
      queryKey: ['pokemon-detail', p.id],
      queryFn: () => fetchPokemonDetail(p.id),
      staleTime: 1000 * 60 * 30,
    })
  );

  const isLoading = queries.some(q => q.isLoading);
  const pokemonData = queries.map(q => q.data).filter(Boolean);

  if (selected.length < 2) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground mb-4">Selecione pelo menos 2 Pokémon para comparar.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
        </div>
      </div>
    );
  }

  const statNames = pokemonData[0]?.stats.map(s => s.name) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-pixel text-sm sm:text-base text-foreground">Comparação</h1>
          <Button variant="outline" size="sm" onClick={clear} className="gap-1">
            <Trash2 className="h-3.5 w-3.5" /> Limpar
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : (
          <>
            {/* Pokemon headers */}
            <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: `repeat(${pokemonData.length}, 1fr)` }}>
              {pokemonData.map(p => p && (
                <div key={p.id} className="rounded-xl bg-card border border-border p-4 text-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-2">
                    <img src={p.sprites.artwork} alt={p.name} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">#{String(p.speciesId ?? p.id).padStart(4, '0')}</p>
                  <h3 className="font-pixel text-[10px] sm:text-xs capitalize text-card-foreground mb-2">{p.name.replace(/-/g, ' ')}</h3>
                  <div className="flex justify-center gap-1 flex-wrap">
                    {p.types.map(t => <TypeBadge key={t} type={t} />)}
                  </div>
                </div>
              ))}
            </div>

            {/* Physical */}
            <div className="rounded-xl bg-card border border-border p-4 mb-4">
              <h3 className="font-bold text-card-foreground text-sm mb-3">Físico</h3>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${pokemonData.length}, 1fr)` }}>
                {pokemonData.map(p => p && (
                  <div key={p.id} className="text-center space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Altura</p>
                      <p className="text-sm font-bold text-card-foreground">{(p.height / 10).toFixed(1)} m</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Peso</p>
                      <p className="text-sm font-bold text-card-foreground">{(p.weight / 10).toFixed(1)} kg</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-xl bg-card border border-border p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-card-foreground text-sm">Estatísticas Base</h3>
                <div className="flex gap-3">
                  {pokemonData.map(p => p && (
                    <span key={p.id} className="text-xs font-semibold text-primary">
                      {p.stats.reduce((s, st) => s + st.value, 0)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {statNames.map(name => (
                  <StatCompareBar
                    key={name}
                    name={name}
                    values={pokemonData.map(p => p!.stats.find(s => s.name === name)?.value || 0)}
                  />
                ))}
              </div>
            </div>

            {/* Abilities */}
            <div className="rounded-xl bg-card border border-border p-4">
              <h3 className="font-bold text-card-foreground text-sm mb-3">Habilidades</h3>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${pokemonData.length}, 1fr)` }}>
                {pokemonData.map(p => p && (
                  <div key={p.id} className="flex flex-wrap gap-1">
                    {p.abilities.map(a => (
                      <span key={a} className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground">
                        {a.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
