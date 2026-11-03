import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyPageMetadata, getPageMetadata } from '@/lib/seo';

export function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    applyPageMetadata(getPageMetadata(pathname));
  }, [pathname]);
  return null;
}
