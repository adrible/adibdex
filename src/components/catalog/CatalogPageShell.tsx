import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { PokedexFrame } from '@/components/PokedexFrame';
import { Button } from '@/components/ui/button';
import { localized } from '@/lib/language';

interface Props {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
  backToTop?: boolean;
}

export function CatalogPageShell({ title, subtitle, children, backToTop = false }: Props) {
  return (
    <PokedexFrame className="catalog-page">
      <div className="catalog-heading">
        <Button variant="ghost" size="icon" className="catalog-back-button" asChild>
          <Link to="/" aria-label={localized('Voltar ao início', 'Back to home')}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="catalog-heading-copy">
          <h2 className="site-display catalog-title">{title}</h2>
          <p className="text-support catalog-subtitle">{subtitle}</p>
        </div>
      </div>
      {children}
      {backToTop && (
        <div className="catalog-back-to-top">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUp className="h-4 w-4" />
            {localized('Voltar ao topo', 'Back to top')}
          </Button>
        </div>
      )}
    </PokedexFrame>
  );
}
