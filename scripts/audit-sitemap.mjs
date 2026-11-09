import { canonicalUrl, checkPageHtml, checkSitemap, origin, readSeoRoutes } from './seo-routes.mjs';

const target = new URL(process.argv[2] ?? origin).origin;
const { routes } = await readSeoRoutes();
const failures = [];
const fetchPage = (path) =>
  fetch(new URL(path, target), { redirect: 'manual', signal: AbortSignal.timeout(15000) });

try {
  const sitemap = await fetchPage('/sitemap.xml');
  if (sitemap.status !== 200) throw new Error(`HTTP ${sitemap.status}`);
  checkSitemap(await sitemap.text(), routes);
  console.log(`Published sitemap matches all ${routes.length} canonical URLs.`);
} catch (error) {
  failures.push(`/sitemap.xml: ${error.message}`);
}

let next = 0;
let completed = 0;
let valid = 0;
async function worker() {
  while (next < routes.length) {
    const { path } = routes[next++];
    const { pathname } = new URL(canonicalUrl(path));
    try {
      const response = await fetchPage(pathname);
      if (response.status !== 200) {
        await response.body?.cancel();
        throw new Error(`HTTP ${response.status} (expected 200 without redirect)`);
      }
      const html = await response.text();
      if (!response.headers.get('content-type')?.includes('text/html')) {
        throw new Error('response is not HTML');
      }
      if (/\b(noindex|none)\b/i.test(response.headers.get('x-robots-tag') ?? '')) {
        throw new Error('response X-Robots-Tag blocks indexing');
      }
      checkPageHtml(html, path);
      valid++;
    } catch (error) {
      failures.push(`${pathname}: ${error.message}`);
    }
    completed++;
    if (completed % 100 === 0) console.log(`Checked ${completed}/${routes.length} URLs.`);
  }
}

await Promise.all(Array.from({ length: 8 }, worker));
console.log(`${valid}/${routes.length} pages passed the HTTP and HTML checks at ${target}.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
