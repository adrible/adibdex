import { Link } from 'react-router-dom';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';
import { X, GitCompareArrows, Trash2 } from 'lucide-react';

export function ComparePanel() {
  const { selected, remove, clear } = useCompare();

  if (selected.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md shadow-lg">
      <div className="container max-w-3xl py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto">
          {selected.map(p => (
            <div key={p.id} className="relative flex-shrink-0 group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden">
                <img src={p.sprite} alt={p.name} className="w-12 h-12 sm:w-14 sm:h-14 object-contain" />
              </div>
              <button
                onClick={() => remove(p.id)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {Array.from({ length: 3 - selected.length }).map((_, i) => (
            <div key={`empty-${i}`} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border-2 border-dashed border-border flex-shrink-0" />
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground text-center">{selected.length}/3</span>
          <Button variant="outline" size="sm" onClick={clear} className="gap-1 h-8 px-2 sm:px-3">
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </Button>
          <Button
            size="sm"
            disabled={selected.length < 2}
            asChild={selected.length >= 2}
            className="gap-1 h-8 px-2 sm:px-3"
          >
            {selected.length >= 2 ? (
              <Link to="/compare">
                <GitCompareArrows className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Comparar</span>
              </Link>
            ) : (
              <>
                <GitCompareArrows className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Comparar</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
