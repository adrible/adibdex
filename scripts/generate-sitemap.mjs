import { readFile, writeFile } from 'node:fs/promises';

const origin = 'https://adibdex.netlify.app';
const catalog = JSON.parse(
  await readFile(new URL('../public/data/catalog.json', import.meta.url), 'utf8'),
);
if (!Array.isArray(catalog.entries) || catalog.entries.length === 0)
  throw new Error('Missing catalog entries.');
const paths = new Set(['/', '/national', '/regional-forms', '/mega', '/gmax']);
for (let id = 1; id <= 11; id++) paths.add(`/generation/${id}`);
for (const { id } of catalog.entries) {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid catalog ID.');
  paths.add(`/pokemon/${id}`);
}
const sitemap =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  [...paths].map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n') +
  '\n</urlset>\n';
await writeFile(new URL('../public/sitemap.xml', import.meta.url), sitemap);
console.log(`Sitemap generated: ${paths.size} URLs for ${origin}.`);
