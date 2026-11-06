import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import '@/pages/pokedex-home.css';

export function PokedexFrame({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`home-pokedex-page min-h-screen ${className}`}>
      <div className="home-pokedex-device">
        <div className="home-device-cap home-device-cap--top">
          <Header />
          <span className="home-device-origin" lang="pt-BR">
            Brasil
          </span>
          <span className="home-device-arc" aria-hidden="true" />
        </div>
        <main className="home-grid-screen">{children}</main>
        <div className="home-device-cap home-device-cap--bottom" aria-hidden="true">
          <span className="home-device-arc" />
          <span className="home-device-vents">
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
      <Footer />
    </div>
  );
}
