import { Link } from 'react-router-dom';
import { GENERATIONS } from '@/lib/pokeapi';
import { PokedexFrame } from '@/components/PokedexFrame';
import { ChevronRight } from 'lucide-react';
import { Changelog } from '@/components/Changelog';
import { localized } from '@/lib/language';
import { NationalGlobe } from '@/components/NationalGlobe';

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

const SPECIAL_CATALOGS = [
  {
    path: '/regional-forms',
    label: localized('Formas regionais', 'Regional forms'),
    sprites: [10091, 10100, 10103].map(
      (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
    ),
  },
  { path: '/mega', label: localized('Mega Evoluções', 'Mega Evolution'), sprites: MEGA_SPRITES },
  { path: '/gmax', label: 'Gigantamax', sprites: GMAX_SPRITES },
];

function StarterDisplay({ sprites, label }: { sprites: string[]; label: string }) {
  return (
    <div className="home-starters" aria-hidden="true">
      {sprites.map((sprite) => (
        <img key={sprite} src={sprite} alt="" loading="lazy" decoding="async" />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default function Index() {
  return (
    <PokedexFrame>
      <div className="home-screen-heading">
        <h2>{localized('Escolha sua Pokédex', 'Choose your Pokédex')}</h2>
        <a href="#novidades">
          {localized('Novidades', "What's new")} <ChevronRight aria-hidden="true" />
        </a>
      </div>
      <div className="home-region-grid">
        <Link to="/national" className="home-region-button home-region-button--national">
          <div className="home-starters">
            <NationalGlobe />
          </div>
          <h3>{localized('Pokédex Nacional', 'National Pokédex')}</h3>
          <span className="home-region-code">{localized('Todas as regiões', 'All regions')}</span>
          <ChevronRight className="home-region-arrow" aria-hidden="true" />
        </Link>
        {GENERATIONS.map((gen) => (
          <Link key={gen.id} to={`/generation/${gen.id}`} className="home-region-button">
            <StarterDisplay
              sprites={REGION_STARTERS[gen.id === 10 ? 'Desconhecida' : gen.region] ?? []}
              label={gen.region}
            />
            <h3>
              {gen.region === 'Desconhecida' ? localized('Desconhecida', 'Unknown') : gen.region}
            </h3>
            <span className="home-region-code">
              #{String(gen.pokemonRange[0]).padStart(4, '0')} — #
              {String(gen.pokemonRange[1]).padStart(4, '0')}
            </span>
            <ChevronRight className="home-region-arrow" aria-hidden="true" />
          </Link>
        ))}
        {SPECIAL_CATALOGS.map(({ path, label, sprites }) => (
          <Link key={path} to={path} className="home-region-button">
            <StarterDisplay sprites={sprites} label={label} />
            <h3>{label}</h3>
            <span className="home-region-code">
              {localized('Formas especiais', 'Special forms')}
            </span>
            <ChevronRight className="home-region-arrow" aria-hidden="true" />
          </Link>
        ))}
      </div>
      <Changelog />
    </PokedexFrame>
  );
}
