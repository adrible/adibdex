import { GENERATIONS } from '@/lib/pokemon/constants';

export const SITE_URL = 'https://adibdex.lovable.app';
export const SITE_TITLE = 'AdibDex — Pokédex em português';
export const SITE_DESCRIPTION =
  'Explore a AdibDex: Pokédex em português com 1.025 Pokémon, formas regionais, Mega e Gigantamax. Pesquise ataques, habilidades e jogos.';

export function getPageMetadata(pathname: string) {
  const path = pathname.replace(/\/+$/, '') || '/';
  let title = SITE_TITLE;
  let description = SITE_DESCRIPTION;
  let canonicalPath = path;
  let indexable = true;
  const catalogs: Record<string, [string, string]> = {
    '/national': [
      'Pokédex Nacional',
      'Explore todos os Pokémon da National Dex e suas formas regionais. Filtre por tipo, jogo, habilidade e ataque aprendido na AdibDex.',
    ],
    '/regional-forms': [
      'Formas regionais',
      'Conheça as formas de Alola, Galar, Hisui e Paldea na AdibDex e compare tipos, atributos e ataques.',
    ],
    '/mega': [
      'Mega Evoluções e formas Primal',
      'Explore Mega Evoluções e formas Primal na AdibDex: tipos, atributos, habilidades e detalhes de cada Pokémon.',
    ],
    '/gmax': [
      'Gigantamax',
      'Explore as formas Gigantamax na AdibDex e consulte tipos, atributos e detalhes dos Pokémon.',
    ],
  };
  const catalog = catalogs[path];
  const generationMatch = /^\/generation\/(\d+)$/.exec(path);
  const pokemonMatch = /^\/pokemon\/([1-9]\d*)$/.exec(path);
  if (catalog) {
    title = `${catalog[0]} — AdibDex`;
    description = catalog[1];
  } else if (generationMatch) {
    const generation = GENERATIONS.find((g) => g.id === Number(generationMatch[1]));
    if (generation) {
      title = `${generation.region} — AdibDex`;
      description = `Conheça os Pokémon de ${generation.region} na AdibDex. Consulte tipos, habilidades, ataques e jogos e explore suas evoluções.`;
      canonicalPath = `/generation/${generation.id}`;
    } else indexable = false;
  } else if (pokemonMatch) {
    title = `Pokémon #${pokemonMatch[1]} — AdibDex`;
    description = `Consulte tipos, atributos, habilidades, ataques por jogo e evoluções do Pokémon #${pokemonMatch[1]} na AdibDex.`;
  } else if (path !== '/') indexable = false;
  return { title, description, canonical: `${SITE_URL}${canonicalPath}`, indexable };
}
