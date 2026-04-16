import { useParams, Link } from 'react-router-dom';
import { GENERATIONS } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { PokemonGrid } from '@/components/PokemonGrid';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

const REGION_BG: Record<string, string> = {
  Kanto: '/backgrounds/kanto.png.PNG',
  Johto: '/backgrounds/johto.png',
  Hoenn: '/backgrounds/hoenn.png',
  Sinnoh: '/backgrounds/sinnoh.png',
  Unova: '/backgrounds/unova.png',
  Kalos: '/backgrounds/kalos.png',
  Alola: '/backgrounds/alola.png',
  Galar: '/backgrounds/galar.png',
  Hisui: '/backgrounds/hisui.png',
  Paldea: '/backgrounds/paldea.png',
  Desconhecida: '/backgrounds/national.png',
};

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

  const bg = REGION_BG[gen.region] || REGION_BG.Desconhecida;

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div
      className="min-h-screen relative bg-background"
      style={
        bg
          ? {
              backgroundImage: `url(${bg})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[0.5px] pointer-events-none" />

      <div className="relative z-10">
        <Header />

        <main className="container py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <div>
              <h2 className="font-pixel text-sm sm:text-lg text-foreground">{gen.region}</h2>
              <p className="text-sm text-muted-foreground">
                {gen.region === 'Desconhecida'
                  ? 'Pokémon sem região definida'
                  : `Região de ${gen.region}`} · #{gen.pokemonRange[0]}–#{gen.pokemonRange[1]}
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

        <Footer />
      </div>
    </div>
  );
}