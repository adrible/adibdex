import { Link } from 'react-router-dom';
import { GENERATIONS } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { ChevronRight } from 'lucide-react';

const REGION_EMOJIS: Record<string, string> = {
  Kanto: '🏯',
  Johto: '⛩️',
  Hoenn: '🌊',
  Sinnoh: '🏔️',
  Unova: '🌆',
  Kalos: '🗼',
  Alola: '🌴',
  Galar: '🏰',
  Paldea: '🏟️',
};

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-lg sm:text-2xl text-foreground mb-4">
            Todas as Gerações
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Explore todos os Pokémon organizados por geração ou veja a Pokédex Nacional completa.
          </p>
          <Link
            to="/national"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground transition-all hover:opacity-90 hover:scale-105"
          >
            🌍 Pokédex Nacional
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {GENERATIONS.map((gen) => (
            <Link
              key={gen.id}
              to={`/generation/${gen.id}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/50"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{REGION_EMOJIS[gen.region]}</span>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-bold text-lg text-card-foreground mb-1">{gen.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">Região de {gen.region}</p>
              <p className="text-xs font-semibold text-primary">
                #{gen.pokemonRange[0]} — #{gen.pokemonRange[1]}
              </p>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
