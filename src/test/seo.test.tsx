import { readFileSync } from 'node:fs';
import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PageMetadata } from '@/components/PageMetadata';
import { getPageMetadata, SITE_TITLE, SITE_URL } from '@/lib/seo';

describe('search metadata', () => {
  it('keeps canonical URLs specific to each route and excludes unknown pages', () => {
    expect(getPageMetadata('/national/')).toMatchObject({
      canonical: `${SITE_URL}/national/`,
      indexable: true,
    });
    expect(getPageMetadata('/generation/11').title).toContain('Hisui');
    expect(getPageMetadata('/generation/999').indexable).toBe(false);
    expect(getPageMetadata('/pokemon/invalid').indexable).toBe(false);
    expect(getPageMetadata('/not-found').indexable).toBe(false);
    expect(getPageMetadata('/pokemon/25').canonical).toBe(`${SITE_URL}/pokemon/25/`);
  });
  it('updates metadata across navigation without duplicating tags or keeping a stale noindex', () => {
    document.head.innerHTML = '<meta name="description" content="old">';
    render(
      <MemoryRouter initialEntries={['/pokemon/25?filter=test']}>
        <PageMetadata />
        <Link to="/unknown">Unknown</Link>
        <Link to="/">Home</Link>
      </MemoryRouter>,
    );
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      `${SITE_URL}/pokemon/25/`,
    );
    expect(document.title).toContain('#25');
    fireEvent.click(screen.getByRole('link', { name: 'Unknown' }));
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toBe(
      'noindex,follow',
    );
    fireEvent.click(screen.getByRole('link', { name: 'Home' }));
    expect(document.title).toBe(SITE_TITLE);
    expect(document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content).toBe(
      'index,follow,max-image-preview:large',
    );
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      `${SITE_URL}/`,
    );
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1);
  });
  it('provides a complete sitemap with public canonical URLs and a robots reference', () => {
    const xml = readFileSync('public/sitemap.xml', 'utf8');
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    expect(document.querySelector('parsererror')).toBeNull();
    const urls = [...document.querySelectorAll('loc')].map((loc) => loc.textContent!);
    const catalog = JSON.parse(readFileSync('public/data/catalog.json', 'utf8'));
    expect(urls).toHaveLength(catalog.entries.length + 16);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.every((url) => new URL(url).origin === SITE_URL && !new URL(url).search)).toBe(
      true,
    );
    expect(urls).toContain(`${SITE_URL}/pokemon/25/`);
    expect(urls).toContain(`${SITE_URL}/generation/11/`);
    expect(readFileSync('public/robots.txt', 'utf8')).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
    const html = new DOMParser().parseFromString(readFileSync('index.html', 'utf8'), 'text/html');
    const structured = JSON.parse(
      html.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    expect(structured).toMatchObject({ '@type': 'WebSite', name: 'AdibDex', url: `${SITE_URL}/` });
  });
});
