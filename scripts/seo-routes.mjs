import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { GENERATIONS, NATIONAL_POKEDEX_SIZE } from '../src/lib/pokemon/constants.ts';

export const origin = 'https://adibdex.com';
export const canonicalUrl = (path) => new URL(path === '/' ? path : `${path}/`, origin).href;
const catalogPath = 'public/data/catalog.json';

export async function readSeoRoutes(source = catalogPath) {
  const { entries } = JSON.parse(await readFile(source, 'utf8'));
  if (!Array.isArray(entries) || !entries.length) throw new Error('Pokémon catalog is empty.');

  const ids = new Set();
  for (const { id, name } of entries) {
    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      typeof name !== 'string' ||
      !name.trim() ||
      ids.has(id)
    ) {
      throw new Error(`Invalid or duplicate catalog entry: ${id}`);
    }
    ids.add(id);
  }
  for (let id = 1; id <= NATIONAL_POKEDEX_SIZE; id++) {
    if (!ids.has(id)) throw new Error(`Missing national Pokédex entry: ${id}`);
  }

  const generations = [...GENERATIONS].sort((a, b) => a.id - b.id);
  const catalogs = [
    { path: '/', title: 'AdibDex' },
    { path: '/national', title: 'Pokédex Nacional' },
    { path: '/regional-forms', title: 'Formas regionais', category: 'regional' },
    { path: '/mega', title: 'Mega Evoluções e formas Primal', category: 'mega' },
    { path: '/gmax', title: 'Gigantamax', category: 'gmax' },
    ...generations.map(({ id, region, pokemonRange }) => ({
      path: `/generation/${id}`,
      title: region,
      pokemonRange,
    })),
  ];
  const routes = [
    ...catalogs,
    ...entries.map((entry) => ({ path: `/pokemon/${entry.id}`, entry })),
  ];
  return { entries, catalogs, routes };
}

export function renderSitemap(routes) {
  const urls = routes.map(({ path }) => `  <url><loc>${canonicalUrl(path)}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function checkSitemap(xml, routes) {
  if (!xml.includes('http://www.sitemaps.org/schemas/sitemap/0.9')) {
    throw new Error('Missing sitemap XML namespace.');
  }
  const urls = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1]);
  const actual = new Set(urls);
  const expected = new Set(routes.map(({ path }) => canonicalUrl(path)));
  const missing = [...expected].filter((url) => !actual.has(url));
  const unexpected = [...actual].filter((url) => !expected.has(url));
  if (missing.length || unexpected.length || actual.size !== urls.length) {
    throw new Error(
      `Sitemap mismatch: ${missing.length} missing, ${unexpected.length} unexpected, ${urls.length - actual.size} duplicate. ` +
        [...missing, ...unexpected].slice(0, 5).join(', '),
    );
  }
}

export function checkPageHtml(html, path) {
  const expected = canonicalUrl(path);
  const canonical = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"/gi)];
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();
  const description = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)?.[1]?.trim();
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] ?? '';
  if (canonical.length !== 1 || canonical[0][1] !== expected) {
    throw new Error(`expected exactly one canonical pointing to ${expected}`);
  }
  if (!title || !description || /\b(noindex|none)\b/i.test(robots)) {
    throw new Error('missing title or description, or page marked noindex');
  }
  if (!/<div id="root">\s*<main\b[^>]*>[\s\S]*?<h1>\s*[^<]+<\/h1>/i.test(html)) {
    throw new Error('missing visible page heading in the initial HTML');
  }
  return { title, description };
}

export async function checkBuiltPages(outDir, routes) {
  const titles = new Map();
  const descriptions = new Map();
  for (const { path } of routes) {
    try {
      const html = await readFile(join(outDir, path.slice(1), 'index.html'), 'utf8');
      const { title, description } = checkPageHtml(html, path);
      if (titles.has(title)) throw new Error(`title also used on ${titles.get(title)}`);
      if (descriptions.has(description)) {
        throw new Error(`description also used on ${descriptions.get(description)}`);
      }
      titles.set(title, path);
      descriptions.set(description, path);
    } catch (error) {
      throw new Error(`SEO check failed for ${path}: ${error.message}`, { cause: error });
    }
  }
}
