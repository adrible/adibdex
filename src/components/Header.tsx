import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-primary">
      <div className="container flex items-center h-16 gap-4">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-full bg-primary-foreground/90 border-2 border-primary-foreground/30 shadow-inner group-hover:scale-110 transition-transform" />
          <h1 className="font-pixel text-xs sm:text-sm text-primary-foreground tracking-wider">
            POKÉDEX
          </h1>
        </Link>
      </div>
    </header>
  );
}
