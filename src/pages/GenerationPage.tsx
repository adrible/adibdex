import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { GENERATIONS } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { PokemonGrid } from '@/components/PokemonGrid';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

const REGION_BG: Record<string, string> = {
  Kanto: '/backgrounds/kanto.PNG',
  Johto: '/backgrounds/johto.PNG',
  Hoenn: '/backgrounds/hoenn.PNG',
  Sinnoh: '/backgrounds/sinnoh.PNG',
  Unova: '/backgrounds/unova.PNG',
  Kalos: '/backgrounds/kalos.PNG',
  Alola: '/backgrounds/alola.PNG',
  Galar: '/backgrounds/galar.PNG',
  Hisui: '/backgrounds/hisui.PNG',
  Paldea: '/backgrounds/paldea.PNG',
  Desconhecida: '/backgrounds/national.PNG',
};

export default function GenerationPage() {
  const { id } = useParams();
  const gen = GENERATIONS.find((g) => g.id === Number(id));

  const [isMobile, setIsMobile] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();

    const onResize = () => checkMobile();

    const onScroll = () => {
      if (window.innerWidth < 640) {
        setOffset(window.scrollY);
      } else {
        setOffset(0);
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

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
    <div className="min-h-screen relative bg-[#0b0f14]">
      
      {/* BACKGROUND COM PARALLAX */}
      <div
        className="absolute top-0 left-0 w-full h-[140vh] will-change-transform pointer-events-none"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: isMobile ? 'center top' : 'center',
          transform: isMobile ? `translateY(${offset * 0.35}px)` : 'translateY(0px)',
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* CONTEÚDO */}
      <div className="relative z-10">
        <Header />

        <main className="container py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>

            <div>
              <h2 className="font-pixel text-sm sm:text-lg text-foreground">
                {gen.region}
              </h2>

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