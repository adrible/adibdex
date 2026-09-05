import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  subtitle: ReactNode;
  background?: string;
  children: ReactNode;
  backToTop?: boolean;
}

export function CatalogPageShell({
  title,
  subtitle,
  background,
  children,
  backToTop = false,
}: Props) {
  return (
    <div className={`catalog-page ${background === undefined ? 'bg-background' : ''}`}>
      {background !== undefined && (
        <div
          className="catalog-background"
          aria-hidden="true"
          style={{
            backgroundImage: background
              ? `url(${background})`
              : 'radial-gradient(circle at top, #26354a 0%, #0b0f14 65%)',
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
      )}
      <Header />
      <main className="catalog-main">
        <div className="catalog-heading">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/" aria-label="Voltar ao início">
              <ArrowLeft className="h-5 w-5 text-ui-title" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h2 className="catalog-title">{title}</h2>
            <p className="catalog-subtitle">{subtitle}</p>
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
              Voltar ao topo
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
