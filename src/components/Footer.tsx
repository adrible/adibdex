import { APP_VERSION } from '@/lib/version';

export function Footer() {
  return (
    <footer className="border-t border-border mt-12 py-4">
      <div className="container flex items-center justify-between text-xs text-muted-foreground">
        
        {/* esquerda */}
        <span>© ADIBDEX</span>

        {/* direita */}
        <span className="font-mono opacity-70">
          v{APP_VERSION}
        </span>

      </div>
    </footer>
  );
}