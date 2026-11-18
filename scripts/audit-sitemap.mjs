import { canonicalUrl, checkPageHtml, checkSitemap, origin, readSeoRoutes } from './seo-routes.mjs';

const [address = origin, mode] = process.argv.slice(2);
const target = new URL(address).origin;
const isPreview = mode === '--preview';
if ((mode && !isPreview) || (isPreview && target === origin)) {
  throw new Error('Usage: npm run seo:audit -- [URL] [--preview (non-production only)]');
}
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

try {
  const icon = await fetchPage('/adibdex-icon-v2.ico');
  if (icon.status !== 200) throw new Error(`HTTP ${icon.status}`);
  if (!/image\/(x-icon|vnd\.microsoft\.icon)/i.test(icon.headers.get('content-type') ?? ''))
    throw new Error('response is not an ICO image');
  if (/\b(noindex|none)\b/i.test(icon.headers.get('x-robots-tag') ?? ''))
    throw new Error('X-Robots-Tag blocks indexing');
  const bytes = new Uint8Array(await icon.arrayBuffer());
  if (bytes.length < 6 || bytes[0] !== 0 || bytes[1] !== 0 || bytes[2] !== 1 || bytes[3] !== 0)
    throw new Error('invalid ICO header');
  console.log('Published favicon returns a valid ICO response.');
} catch (error) {
  failures.push(`/adibdex-icon-v2.ico: ${error.message}`);
}

let next = 0;
let completed = 0;
let valid = 0;
let previewNoindex = 0;
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
        if (!isPreview) throw new Error('response X-Robots-Tag blocks indexing');
        previewNoindex++;
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
if (previewNoindex) console.log(`${previewNoindex} preview pages sent a noindex header.`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
