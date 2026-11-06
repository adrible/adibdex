import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const origin = 'https://adibdex.com';
const artwork = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const escape = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
const displayName = (name) => {
  const special = {
    'mr-mime': 'Mr. Mime',
    'mime-jr': 'Mime Jr.',
    'type-null': 'Type: Null',
    'ho-oh': 'Ho-Oh',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',
  };
  return (
    special[name] ||
    name
      .split('-')
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(' ')
  );
};

export async function generateMetadataPages({
  outDir = 'dist',
  catalogPath = 'public/data/catalog.json',
} = {}) {
  const html = await readFile(join(outDir, 'index.html'), 'utf8');
  const { entries } = JSON.parse(await readFile(catalogPath, 'utf8'));
  if (!Array.isArray(entries) || !entries.length) throw new Error('Pokémon catalog is empty');
  const pages = [
    [
      '/national',
      'Pokédex Nacional — AdibDex',
      'Explore todos os Pokémon da Pokédex Nacional na AdibDex.',
      25,
    ],
    [
      '/regional-forms',
      'Formas regionais — AdibDex',
      'Conheça as formas regionais dos Pokémon na AdibDex.',
      25,
    ],
    [
      '/mega',
      'Mega Evoluções e formas Primal — AdibDex',
      'Explore Mega Evoluções e formas Primal na AdibDex.',
      6,
    ],
    ['/gmax', 'Gigantamax — AdibDex', 'Explore as formas Gigantamax na AdibDex.', 25],
  ];
  const regions = [
    'Kanto',
    'Johto',
    'Hoenn',
    'Sinnoh',
    'Unova',
    'Kalos',
    'Alola',
    'Galar',
    'Paldea',
    'Desconhecida',
    'Hisui',
  ];
  regions.forEach((region, i) =>
    pages.push([
      `/generation/${i + 1}`,
      `${region} — AdibDex`,
      `Conheça os Pokémon de ${region} na AdibDex. Consulte tipos, habilidades, ataques, jogos e evoluções.`,
      25,
    ]),
  );
  for (const entry of entries) {
    if (!Number.isSafeInteger(entry.id) || entry.id < 1 || typeof entry.name !== 'string')
      throw new Error('Invalid Pokémon catalog entry');
    const name = displayName(entry.name);
    const number = String(entry.baseId || entry.id).padStart(4, '0');
    pages.push([
      `/pokemon/${entry.id}`,
      `${name} (Pokémon) #${number} — tipos, fraquezas e evoluções | AdibDex`,
      `Descubra tipos, fraquezas, atributos, habilidades, ataques e evoluções de ${name} (#${number}) na AdibDex.`,
      entry.id,
    ]);
  }
  for (const [path, title, description, imageId] of pages) {
    const canonical = origin + path;
    let page = html.replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`);
    page = page.replace(
      /(<meta\s+name="description"\s+content=")[^"]*("\s*\/?>)/,
      `$1${escape(description)}$2`,
    );
    for (const [attribute, key, value] of [
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:url', canonical],
      ['property', 'og:image', artwork(imageId)],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', artwork(imageId)],
    ]) {
      const pattern = new RegExp(`(<meta\\s+${attribute}="${key}"\\s+content=")[^"]*("\\s*\\/?>)`);
      if (!pattern.test(page)) throw new Error(`Missing ${key} metadata`);
      page = page.replace(pattern, `$1${escape(value)}$2`);
    }
    page = page.replace('</head>', `  <link rel="canonical" href="${canonical}" />\n  </head>`);
    const dir = join(outDir, path.slice(1));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), page);
  }
  console.log(`Generated metadata for ${pages.length} routes.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateMetadataPages();
}
