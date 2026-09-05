import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CatalogPagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  const [input, setInput] = useState('');
  if (totalPages <= 1) return null;
  const change = (value: number) => {
    onChange(value);
    setInput('');
    window.scrollTo(0, 0);
  };
  return (
    <nav className="catalog-pagination" aria-label="Paginação do catálogo">
      <Button
        variant="outline"
        size="icon"
        aria-label="Página anterior"
        disabled={page === 0}
        onClick={() => change(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <input
          className="catalog-page-input"
          type="text"
          inputMode="numeric"
          aria-label="Número da página"
          value={input}
          placeholder={String(page + 1)}
          onChange={(e) => setInput(e.target.value.replace(/\D/g, ''))}
          onBlur={() => setInput('')}
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            const value = Number(input);
            if (Number.isSafeInteger(value) && value >= 1 && value <= totalPages) change(value - 1);
            else setInput('');
          }}
        />
        <span>/ {totalPages}</span>
      </div>
      <Button
        variant="outline"
        size="icon"
        aria-label="Próxima página"
        disabled={page >= totalPages - 1}
        onClick={() => change(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
