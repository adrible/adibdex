import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPageMetadata, getPageMetadata } from '@/lib/seo';
import { getSiteLanguage } from '@/lib/language';

export function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.documentElement.lang = getSiteLanguage() === 'pt' ? 'pt-BR' : 'en';
    applyPageMetadata(getPageMetadata(pathname));
  }, [pathname]);
  return null;
}
