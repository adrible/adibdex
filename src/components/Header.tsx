import { Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { Moon, Sun, Home } from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-primary">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-full bg-primary-foreground/90 border-2 border-primary-foreground/30 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform">
  <Home className="h-4 w-4 text-primary" />
</div>
          <h1 className="font-pixel text-xs sm:text-sm text-primary-foreground tracking-wider">
            ADIBDEX
          </h1>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-primary-foreground hover:bg-primary-foreground/20"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
