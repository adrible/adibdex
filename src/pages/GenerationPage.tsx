import { useParams, Link } from 'react-router-dom';
import { GENERATIONS } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { PokemonGrid } from '@/components/PokemonGrid';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

export default function GenerationPage() {
  const { id } = useParams();
  const gen = GENERATIONS.find((g) => g.id === Number(id));

  if (!gen) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Região não encontrada.</p>
        </div>
      </div>
    );
  }

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h2 className="font-pixel text-sm sm:text-lg text-foreground">{gen.region}</h2>
            <p className="text-sm text-muted-foreground">
              {gen.region === 'Desconhecida' ? 'Pokémon sem região definida' : `Região de ${gen.region}`} · #{gen.pokemonRange[0]}–#{gen.pokemonRange[1]}
            </p>
          </div>
        </div>

        <PokemonGrid generation={gen} />

        <div className="flex justify-center mt-10">
          <Button variant="outline" onClick={scrollToTop} className="gap-2">
            <ArrowUp className="h-4 w-4" />
            Voltar ao topo
          </Button>
        </div>
      </main>

      <Footer/ >
    </div>
  );
}

