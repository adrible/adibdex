import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { PokemonBasic } from '../lib/pokemon/types';
const generatorPath = '../../scripts/generate-metadata-pages.mjs';
import { getPageMetadata } from '../lib/seo';

// Use the full checked-in catalog: every species and alternate form must be crawlable.
describe('generated Pokémon search pages', () => {
  it('ships unique metadata, visible facts and crawlable links before JavaScript', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'adibdex-seo-'));
    try {
      await writeFile(join(outDir, 'index.html'), await readFile('index.html', 'utf8'));
      const { generateMetadataPages } = await import(generatorPath);
      await generateMetadataPages({ outDir });
      const { entries }: { entries: PokemonBasic[] } = JSON.parse(
        await readFile('public/data/catalog.json', 'utf8'),
      );
      const canonicals = new Set();
      for (const entry of entries) {
        const html = await readFile(join(outDir, `pokemon/${entry.id}/index.html`), 'utf8');
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const canonical = doc.querySelector<HTMLLinkElement>('link[rel="canonical"]')!.href;
        expect(canonical).toBe(`https://adibdex.com/pokemon/${entry.id}/`);
        canonicals.add(canonical);
        expect(doc.querySelector('#root h1')!.textContent).not.toBe('');
        expect(doc.querySelector('title')!.textContent).toContain('AdibDex');
        expect(doc.querySelector<HTMLMetaElement>('meta[name="description"]')!.content).toContain(
          '#',
        );
        expect(doc.querySelector('meta[name="robots"][content*="noindex"]')).toBeNull();
      }
      expect(canonicals.size).toBe(entries.length);
      const html = await readFile(join(outDir, 'pokemon/7/index.html'), 'utf8');
      const doc = new DOMParser().parseFromString(html, 'text/html');
      expect(doc.querySelector('#root h1')!.textContent).toBe('Squirtle #0007');
      expect(doc.querySelector('#root')!.textContent).toContain('Pokémon do tipo Água');
      expect(doc.querySelector('#root')!.textContent).toContain('0,5 m');
      expect(doc.querySelector('#root')!.textContent).toContain('Torrent');
      expect(doc.querySelectorAll('#root dl dt')).toHaveLength(6);
      const entry = entries.find(({ id }) => id === 7)!;
      expect(doc.querySelector<HTMLMetaElement>('meta[name="description"]')!.content).toBe(
        getPageMetadata('/pokemon/7', { ...entry, speciesId: 7 }).description,
      );
      const national = new DOMParser().parseFromString(
        await readFile(join(outDir, 'national/index.html'), 'utf8'),
        'text/html',
      );
      expect(national.querySelectorAll('a[href^="/pokemon/"]')).toHaveLength(entries.length);
      const home = new DOMParser().parseFromString(
        await readFile(join(outDir, 'index.html'), 'utf8'),
        'text/html',
      );
      expect(home.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
        'https://adibdex.com/',
      );
      expect(home.querySelector('a[href="/pokemon/7/"]')).not.toBeNull();
      const sitemap = new DOMParser().parseFromString(
        await readFile(join(outDir, 'sitemap.xml'), 'utf8'),
        'text/xml',
      );
      expect(sitemap.querySelector('parsererror')).toBeNull();
      const urls = [...sitemap.querySelectorAll('url > loc')].map((loc) => loc.textContent);
      expect(urls).toHaveLength(entries.length + 16);
      expect(new Set(urls).size).toBe(urls.length);
      expect(urls).toEqual(expect.arrayContaining([...canonicals, 'https://adibdex.com/']));
      const regional = await readFile(join(outDir, 'regional-forms/index.html'), 'utf8');
      for (const id of [10162, 10164, 10178]) {
        expect(regional).toContain(`href="/pokemon/${id}/"`);
      }
      const missing = await readFile(join(outDir, '404.html'), 'utf8');
      expect(missing).toContain('noindex,follow');
      expect(missing).not.toContain('Squirtle #0007');
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  }, 30000);
});
