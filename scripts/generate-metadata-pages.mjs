import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pokemonSearchDescription, searchTypeName } from '../src/lib/pokemon-search.ts';

const origin = 'https://adibdex.com';
const artwork = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
const safeJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');
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

function pokemonSummary(entry, description, byId) {
  const name = displayName(entry.name);
  const number = String(entry.baseId || entry.id).padStart(4, '0');
  const stats = Object.entries(entry.stats ?? {})
    .map(([key, value]) => {
      const labels = {
        hp: 'HP',
        attack: 'Ataque',
        defense: 'Defesa',
        spAtk: 'Ataque especial',
        spDef: 'Defesa especial',
        speed: 'Velocidade',
      };
      return `<dt>${labels[key] ?? escape(key)}</dt><dd>${escape(value)}</dd>`;
    })
    .join('');
  const abilities = (entry.abilities ?? [])
    .map(({ name, isHidden }) => `${escape(displayName(name))}${isHidden ? ' (oculta)' : ''}`)
    .join(', ');
  const related = [entry.id - 1, entry.id + 1]
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((other) => `<a href="/pokemon/${other.id}/">${escape(displayName(other.name))}</a>`)
    .join(' · ');
  // This visible initial content is replaced by React, so users never see duplicate facts.
  return `<main class="container"><nav><a href="/">AdibDex</a> · <a href="/national/">Pokédex Nacional</a></nav>
    <article><h1>${escape(name)} #${number}</h1><p>${escape(description)}</p>
    <img src="${artwork(entry.id)}" alt="${escape(name)}" width="240" height="240" />
    ${abilities ? `<h2>Habilidades</h2><p>${abilities}</p>` : ''}
    ${stats ? `<h2>Atributos base</h2><dl>${stats}</dl>` : ''}
    <p>Consulte fraquezas, ataques por jogo, evoluções e localizações na ficha interativa.</p>
    </article><nav aria-label="Outros Pokémon">${related}</nav></main>`;
}

function catalogSummary(path, title, description, entries) {
  const items =
    path === '/national'
      ? entries
      : path === '/'
        ? entries.filter((entry) => [1, 4, 7, 25].includes(entry.id))
        : [];
  return `<main class="container"><h1>${escape(title)}</h1><p>${escape(description)}</p>
    <nav><a href="/">AdibDex</a> · <a href="/national/">Pokédex Nacional</a></nav>
    ${items.length ? `<ul>${items.map((entry) => `<li><a href="/pokemon/${entry.id}/">${escape(displayName(entry.name))}</a> — ${entry.types.map((type) => escape(searchTypeName(type))).join(' / ')}</li>`).join('')}</ul>` : ''}</main>`;
}

export async function generateMetadataPages({
  outDir = 'dist',
  catalogPath = 'public/data/catalog.json',
} = {}) {
  const html = await readFile(join(outDir, 'index.html'), 'utf8');
  const { entries } = JSON.parse(await readFile(catalogPath, 'utf8'));
  if (!Array.isArray(entries) || !entries.length) throw new Error('Pokémon catalog is empty');
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
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
      pokemonSearchDescription(name, number, entry),
      entry.id,
    ]);
  }
  for (const [path, title, description, imageId] of pages) {
    const canonical = `${origin}${path}/`;
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
      [
        'property',
        'og:image:alt',
        `${displayName(byId.get(imageId)?.name ?? 'Pokémon')} — Pokémon #${String(imageId).padStart(4, '0')}`,
      ],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', artwork(imageId)],
    ]) {
      const pattern = new RegExp(`(<meta\\s+${attribute}="${key}"\\s+content=")[^"]*("\\s*\\/?>)`);
      if (!pattern.test(page)) throw new Error(`Missing ${key} metadata`);
      page = page.replace(pattern, `$1${escape(value)}$2`);
    }
    const pageData = safeJson({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      primaryImageOfPage: {
        '@type': 'ImageObject',
        contentUrl: artwork(imageId),
        url: artwork(imageId),
        caption: `${displayName(byId.get(imageId)?.name ?? 'Pokémon')} — AdibDex`,
      },
      isPartOf: { '@id': `${origin}/#website` },
    });
    page = page.replace(
      /<script\s+type="application\/ld\+json"\s+data-page-structured-data="true">[\s\S]*?<\/script>/,
      `<script type="application/ld+json" data-page-structured-data="true">${pageData}</script>`,
    );
    page = page.replace('</head>', `  <link rel="canonical" href="${canonical}" />\n  </head>`);
    const entry = path.startsWith('/pokemon/') ? byId.get(imageId) : undefined;
    const content = entry
      ? pokemonSummary(entry, description, byId)
      : catalogSummary(path, title, description, entries);
    page = page.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
    const dir = join(outDir, path.slice(1));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), page);
  }
  // Real links let crawlers discover catalogs before JavaScript executes.
  const home = catalogSummary(
    '/',
    'AdibDex — Uma Pokédex de visual único',
    'Explore Pokémon, evoluções, ataques e habilidades em uma Pokédex interativa inspirada nos jogos.',
    entries,
  );
  await writeFile(
    join(outDir, 'index.html'),
    html.replace('<div id="root"></div>', `<div id="root">${home}</div>`),
  );
  // Cloudflare Pages serves 404.html with HTTP 404 for unknown paths.
  // Keep the React error screen while preventing indexing of missing URLs.
  const notFoundHtml = html
    .replace(/<title>[^<]*<\/title>/, '<title>Página não encontrada — AdibDex</title>')
    .replace(
      /(<meta\s+name="robots"\s+content=")[^"]*("\s*\/?>)/,
      '$1noindex,follow$2',
    );
  await writeFile(join(outDir, '404.html'), notFoundHtml);
  console.log(`Generated metadata for ${pages.length} routes and a 404 page.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateMetadataPages();
}
