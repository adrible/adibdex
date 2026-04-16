import { Link } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';
import { Moon, Sun } from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-primary">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-full bg-primary-foreground/90 border-2 border-primary-foreground/30 shadow-inner flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
            <div className="relative w-5 h-5 rounded-full border-2 border-black overflow-hidden transition-transform duration-300 group-hover:rotate-12">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500 transition-colors duration-300 group-hover:bg-red-400"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white"></div>
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white border border-black rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 group-hover:scale-110"></div>
            </div>
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
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </div>
    </header>
  );
}