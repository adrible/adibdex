import { useParams, Link } from 'react-router-dom';
import { GENERATIONS } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { PokemonGrid } from '@/components/PokemonGrid';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

const REGION_BG: Record<string, string> = {
  Kanto: '/backgrounds/kanto.webp',
  Johto: '/backgrounds/johto.webp',
  Hoenn: '/backgrounds/hoenn.webp',
  Sinnoh: '/backgrounds/sinnoh.webp',
  Unova: '/backgrounds/unova.webp',
  Kalos: '/backgrounds/kalos.webp',
  Alola: '/backgrounds/alola.webp',
  Galar: '/backgrounds/galar.webp',
  Hisui: '/backgrounds/hisui.webp',
  Paldea: '/backgrounds/paldea.webp',
  Desconhecida: '/backgrounds/national.PNG',
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
    <div className="relative">
      {/* DESKTOP: fundo fixo como era antes */}
      <div
        className="hidden md:block fixed top-0 left-0 w-full h-screen -z-10"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundColor: '#0b0f14',
        }}
      />

      <div className="hidden md:block fixed top-0 left-0 w-full h-screen -z-10 bg-black/30 pointer-events-none" />

      {/* MOBILE: solução estável pro iPhone */}
      <div className="md:hidden sticky top-0 h-[100dvh] -z-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#0b0f14',
          }}
        />
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 md:mt-0 -mt-[100dvh] min-h-screen">
        <Header />

        <main className="container py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5 text-ui-title" />
              </Link>
            </Button>

            <div>
              <h2 className="font-pixel text-sm sm:text-lg text-ui-title">
                {gen.region}
              </h2>

              <p className="text-sm text-ui-subtitle">
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