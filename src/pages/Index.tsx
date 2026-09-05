import { Link } from 'react-router-dom';
import { GENERATIONS } from '@/lib/pokeapi';
import { Header } from '@/components/Header';
import { ChevronRight } from 'lucide-react';
import { Footer } from '@/components/Footer';

const REGION_STARTERS: Record<string, string[]> = {
  Kanto: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png',
  ],
  Johto: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/152.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/155.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/158.png',
  ],
  Hoenn: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/252.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/255.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/258.png',
  ],
  Sinnoh: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/387.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/390.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/393.png',
  ],
  Unova: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/495.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/498.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/501.png',
  ],
  Kalos: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/650.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/653.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/656.png',
  ],
  Alola: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/722.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/725.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/728.png',
  ],
  Galar: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/810.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/813.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/816.png',
  ],
  Hisui: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/722.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/155.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/501.png',
  ],
  Paldea: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/906.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/909.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/912.png',
  ],
  Desconhecida: [
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/808.png',
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/809.png',
  ],
};

const MEGA_SPRITES = [
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10034.png', // Charizard Mega X
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10043.png', // Mewtwo Mega Y
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10059.png', // Lucario Mega
];

const GMAX_SPRITES = [
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', // Charizard
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', // Pikachu
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png', // Gengar
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-12">
        <div className="text-center mb-12">
          <h2 className="font-pixel text-lg sm:text-2xl text-foreground mb-4">Todas as Regiões</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Explore todos os Pokémon organizados por região ou veja a Pokédex Nacional completa.
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
                <div className="flex items-center gap-2 justify-center">
                  {REGION_STARTERS[gen.region]?.map((sprite, index) => (
                    <img
                      key={index}
                      src={sprite}
                      alt={`${gen.region} sprite ${index + 1}`}
                      className="w-14 h-14 object-contain transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                  ))}
                </div>

                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <h3 className="font-bold text-lg text-card-foreground mb-1">{gen.region}</h3>

              <p className="text-sm text-muted-foreground mb-3">
                {gen.region === 'Desconhecida'
                  ? 'Pokémon sem região definida'
                  : `Região de ${gen.region}`}
              </p>

              <p className="text-xs font-semibold text-primary">
                #{gen.pokemonRange[0]} — #{gen.pokemonRange[1]}
              </p>

              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            </Link>
          ))}
          <Link
            to="/regional-forms"
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 justify-center">
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10091.png" // Rattata
                  className="w-14 h-14 object-contain transition-transform group-hover:scale-110"
                />
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10100.png" // Raichu
                  className="w-14 h-14 object-contain transition-transform group-hover:scale-110"
                />
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10103.png" // Vulpix
                  className="w-14 h-14 object-contain transition-transform group-hover:scale-110"
                />
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>

            <h3 className="font-bold text-lg text-card-foreground mb-1">Formas Regionais</h3>

            <p className="text-sm text-muted-foreground mb-3">
              Alolan, Galarian, Hisuian e Paldean forms
            </p>

            <p className="text-xs font-semibold text-primary">VARIAÇÕES POR REGIÃO</p>

            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          </Link>
          <Link
            to="/mega"
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 justify-center">
                {MEGA_SPRITES.map((sprite, index) => (
                  <img
                    key={index}
                    src={sprite}
                    alt={`Mega sprite ${index + 1}`}
                    className="w-16 h-16 object-contain transition-transform group-hover:scale-110"
                    loading="lazy"
                  />
                ))}
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>

            <h3 className="font-bold text-lg text-card-foreground mb-1">Mega Evoluções</h3>
            <p className="text-sm text-muted-foreground mb-3">Todas as formas Mega</p>
            <p className="text-xs font-semibold text-primary">MEGA PODER!</p>

            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          </Link>

          <Link
            to="/gmax"
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 justify-center">
                {GMAX_SPRITES.map((sprite, index) => (
                  <img
                    key={index}
                    src={sprite}
                    alt={`Gigantamax sprite ${index + 1}`}
                    className="w-16 h-16 object-contain"
                    loading="lazy"
                  />
                ))}
              </div>

              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>

            <h3 className="font-bold text-lg text-card-foreground mb-1">Gigantamax</h3>
            <p className="text-sm text-muted-foreground mb-3">Todas as formas Gigantamax</p>
            <p className="text-xs font-semibold text-primary">POKEMONS GIGANTES!</p>

            <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
