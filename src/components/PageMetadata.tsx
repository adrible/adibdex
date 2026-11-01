import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageMetadata } from '@/lib/seo';

export function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const { title, description, canonical, indexable } = getPageMetadata(pathname);
    document.title = title;
    for (const [attribute, key, content] of [
      ['name', 'description', description],
      ['name', 'robots', indexable ? 'index,follow' : 'noindex,follow'],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:url', canonical],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
    ]) {
      let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, key);
        document.head.appendChild(meta);
      }
      meta.content = content;
    }
    // The shared SPA shell intentionally has no homepage canonical on detail URLs.
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;
  }, [pathname]);
  return null;
}
