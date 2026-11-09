import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pokemonSearchDescription, searchTypeName } from '../src/lib/pokemon-search.ts';

import {
  canonicalUrl,
  checkBuiltPages,
  origin,
  readSeoRoutes,
  renderSitemap,
} from './seo-routes.mjs';
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

const catalogDescriptions = {
  '/': 'Explore Pokémon, evoluções, ataques e habilidades em uma Pokédex interativa inspirada nos jogos.',
  '/national': 'Explore todos os Pokémon da Pokédex Nacional na AdibDex.',
  '/regional-forms': 'Conheça as formas regionais dos Pokémon na AdibDex.',
  '/mega': 'Explore Mega Evoluções e formas Primal na AdibDex.',
  '/gmax': 'Explore as formas Gigantamax na AdibDex.',
};

function catalogSummary(route, title, description, entries, catalogs) {
  const { path, category, pokemonRange } = route;
  const items = entries.filter((entry) => {
    if (path === '/national') return true;
    if (path === '/') return [1, 4, 7, 25].includes(entry.id);
    if (category) return entry.category === category;
    const [first, last] = pokemonRange;
    return entry.category === 'base' && entry.id >= first && entry.id <= last;
  });
  const links = catalogs
    .filter((catalog) => catalog.path !== path)
    .map(
      (catalog) =>
        `<a href="${new URL(canonicalUrl(catalog.path)).pathname}">${escape(catalog.title)}</a>`,
    )
    .join(' · ');
  return `<main class="container"><h1>${escape(title)}</h1><p>${escape(description)}</p>
    <nav aria-label="Catálogos">${links}</nav>
    <ul>${items.map((entry) => `<li><a href="/pokemon/${entry.id}/">${escape(displayName(entry.name))}</a> — ${entry.types.map((type) => escape(searchTypeName(type))).join(' / ')}</li>`).join('')}</ul></main>`;
}

function pageMetadata(route) {
  const { path, entry, title } = route;
  if (entry) {
    const name = displayName(entry.name);
    const number = String(entry.baseId || entry.id).padStart(4, '0');
    return {
      title: `${name} (Pokémon) #${number} — tipos, fraquezas e evoluções | AdibDex`,
      description: pokemonSearchDescription(name, number, entry),
      imageId: entry.id,
    };
  }
  return {
    title: path === '/' ? 'AdibDex — Uma Pokédex de visual único' : `${title} — AdibDex`,
    description:
      catalogDescriptions[path] ??
      `Conheça os Pokémon de ${title} na AdibDex. Consulte tipos, habilidades, ataques, jogos e evoluções.`,
    imageId: path === '/mega' ? 6 : 25,
  };
}

export async function generateMetadataPages({ outDir = 'dist', catalogPath } = {}) {
  const html = await readFile(join(outDir, 'index.html'), 'utf8');
  const { entries, catalogs, routes } = await readSeoRoutes(catalogPath);
  const byId = new Map(entries.map((entry) => [entry.id, entry]));

  for (const route of routes) {
    const { path, entry } = route;
    const { title, description, imageId } = pageMetadata(route);
    const canonical = canonicalUrl(path);
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
    const content = entry
      ? pokemonSummary(entry, description, byId)
      : catalogSummary(route, title, description, entries, catalogs);
    page = page.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
    const dir = join(outDir, path.slice(1));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), page);
  }
  await checkBuiltPages(outDir, routes);
  await writeFile(join(outDir, 'sitemap.xml'), renderSitemap(routes));
  // Cloudflare Pages serves 404.html with HTTP 404 for unknown paths.
  // Keep the React error screen while preventing indexing of missing URLs.
  const notFoundHtml = html
    .replace(/<title>[^<]*<\/title>/, '<title>Página não encontrada — AdibDex</title>')
    .replace(/(<meta\s+name="robots"\s+content=")[^"]*("\s*\/?>)/, '$1noindex,follow$2');
  await writeFile(join(outDir, '404.html'), notFoundHtml);
  console.log(`Validated HTML and generated sitemap for ${routes.length} canonical URLs.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await generateMetadataPages();
}
