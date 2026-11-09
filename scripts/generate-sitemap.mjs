import { writeFile } from 'node:fs/promises';
import { readSeoRoutes, renderSitemap } from './seo-routes.mjs';

const { routes } = await readSeoRoutes(new URL('../public/data/catalog.json', import.meta.url));
await writeFile(new URL('../public/sitemap.xml', import.meta.url), renderSitemap(routes));
console.log(`Sitemap generated: ${routes.length} canonical URLs.`);
