import { GENERATIONS } from '@/lib/pokemon/constants';
import { getSiteLanguage, localized } from '@/lib/language';

export const SITE_URL = 'https://adibdex.netlify.app';
export const SITE_TITLE = localized('AdibDex — A Pokédex de Adib', 'AdibDex — Adib’s Pokédex');
export const SITE_DESCRIPTION = localized(
  'A Pokédex de Adib: explore 1.025 Pokémon, formas regionais, Mega e Gigantamax. Pesquise ataques, habilidades e jogos na AdibDex.',
  'Adib’s Pokédex: explore 1,025 Pokémon, regional forms, Mega Evolution, and Gigantamax. Search moves, abilities, and games in AdibDex.',
);

type PokemonPage = { name: string; speciesId: number };

function formatPokemonName(name: string) {
  const regionMatch = /^(.*)-(alola|galar|hisui|paldea)$/.exec(name);
  if (regionMatch) {
    const pokemon = regionMatch[1].split('-').map(capitalize).join(' ');
    const region = capitalize(regionMatch[2]);
    return getSiteLanguage() === 'pt' ? `${pokemon} de ${region}` : `${region} ${pokemon}`;
  }

  const specialNames: Record<string, string> = {
    'mr-mime': 'Mr. Mime',
    'mime-jr': 'Mime Jr.',
    'type-null': 'Type: Null',
    'ho-oh': 'Ho-Oh',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',
  };
  return specialNames[name] ?? name.split('-').map(capitalize).join(' ');
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function getPageMetadata(pathname: string, pokemon?: PokemonPage) {
  const path = pathname.replace(/\/+$/, '') || '/';
  let title = SITE_TITLE;
  let description = SITE_DESCRIPTION;
  let canonicalPath = path;
  let indexable = true;
  const catalogs: Record<string, [string, string]> = {
    '/national': [
      localized('Pokédex Nacional', 'National Pokédex'),
      localized(
        'Explore todos os Pokémon da National Dex e suas formas regionais. Filtre por tipo, jogo, habilidade e ataque aprendido na AdibDex.',
        'Explore every Pokémon in the National Pokédex and their regional forms. Filter by type, game, ability, and learned move in AdibDex.',
      ),
    ],
    '/regional-forms': [
      localized('Formas regionais', 'Regional forms'),
      localized(
        'Conheça as formas de Alola, Galar, Hisui e Paldea na AdibDex e compare tipos, atributos e ataques.',
        'Explore forms from Alola, Galar, Hisui, and Paldea in AdibDex and compare types, stats, and moves.',
      ),
    ],
    '/mega': [
      localized('Mega Evoluções e formas Primal', 'Mega Evolution and Primal forms'),
      localized(
        'Explore Mega Evoluções e formas Primal na AdibDex: tipos, atributos, habilidades e detalhes de cada Pokémon.',
        'Explore Mega Evolution and Primal forms in AdibDex, including each Pokémon’s types, stats, abilities, and details.',
      ),
    ],
    '/gmax': [
      'Gigantamax',
      localized(
        'Explore as formas Gigantamax na AdibDex e consulte tipos, atributos e detalhes dos Pokémon.',
        'Explore Gigantamax forms in AdibDex and view Pokémon types, stats, and details.',
      ),
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
      title = `${generation.region === 'Desconhecida' ? localized('Desconhecida', 'Unknown') : generation.region} — AdibDex`;
      description = localized(
        `Conheça os Pokémon de ${generation.region} na AdibDex. Consulte tipos, habilidades, ataques e jogos e explore suas evoluções.`,
        `Explore Pokémon from ${generation.region} in AdibDex. View types, abilities, moves, and games, and discover their evolution paths.`,
      );
      canonicalPath = `/generation/${generation.id}`;
    } else indexable = false;
  } else if (pokemonMatch) {
    const pokemonName = pokemon ? formatPokemonName(pokemon.name) : undefined;
    const pokemonNumber = pokemon?.speciesId ?? Number(pokemonMatch[1]);
    const paddedNumber = String(pokemonNumber).padStart(4, '0');
    title = pokemonName
      ? localized(
          `${pokemonName} #${paddedNumber} — tipos, fraquezas e evoluções | AdibDex`,
          `${pokemonName} #${paddedNumber} — types, weaknesses, and evolution | AdibDex`,
        )
      : localized(`Pokémon #${pokemonMatch[1]} — AdibDex`, `Pokémon #${pokemonMatch[1]} — AdibDex`);
    description = pokemonName
      ? localized(
          `Descubra tipos, fraquezas, atributos, habilidades, ataques e evoluções de ${pokemonName} (#${paddedNumber}) na AdibDex.`,
          `Explore ${pokemonName} (#${paddedNumber}) in AdibDex, including its types, weaknesses, stats, abilities, moves, and evolution.`,
        )
      : localized(
          `Consulte tipos, atributos, habilidades, ataques por jogo e evoluções do Pokémon #${pokemonMatch[1]} na AdibDex.`,
          `View types, stats, abilities, moves by game, and evolution for Pokémon #${pokemonMatch[1]} in AdibDex.`,
        );
  } else if (path !== '/') indexable = false;
  return { title, description, canonical: `${SITE_URL}${canonicalPath}`, indexable };
}

export function applyPageMetadata(metadata: ReturnType<typeof getPageMetadata>) {
  const { title, description, canonical, indexable } = metadata;
  document.title = title;
  for (const [attribute, key, content] of [
    ['name', 'description', description],
    ['name', 'robots', indexable ? 'index,follow' : 'noindex,follow'],
    ['property', 'og:title', title],
    ['property', 'og:description', description],
    ['property', 'og:url', canonical],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', description],
  ]) {
    let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, key);
      document.head.appendChild(meta);
    }
    meta.content = content;
  }
  // The shared SPA shell intentionally has no homepage canonical on detail URLs.
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = canonical;
}
