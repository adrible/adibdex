import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { localized } from '@/lib/language';

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
  const submittedInput = useRef<string | null>(null);
  if (totalPages <= 1) return null;
  const change = (value: number) => {
    onChange(value);
    setInput('');
    window.scrollTo(0, 0);
  };
  const submitInput = (raw: string) => {
    const value = Number(raw);
    if (raw && Number.isSafeInteger(value) && value >= 1 && value <= totalPages) {
      submittedInput.current = raw;
      change(value - 1);
    } else {
      setInput('');
    }
  };
  return (
    <nav
      className="catalog-pagination"
      aria-label={localized('Paginação do catálogo', 'Catalog pagination')}
    >
      <Button
        variant="outline"
        size="icon"
        aria-label={localized('Página anterior', 'Previous page')}
        disabled={page === 0}
        onClick={() => change(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="catalog-pagination-page">
        <input
          className="catalog-page-input"
          type="text"
          inputMode="numeric"
          aria-label={localized('Número da página', 'Page number')}
          value={input}
          placeholder={String(page + 1)}
          onChange={(e) => {
            submittedInput.current = null;
            setInput(e.target.value.replace(/\D/g, ''));
          }}
          onBlur={() => {
            if (!input) return;
            if (submittedInput.current === input) {
              submittedInput.current = null;
              return;
            }
            submitInput(input);
          }}
          onKeyDown={(e) => {
            if (e.key !== 'Enter' && e.key !== 'Go') return;
            e.preventDefault();
            submitInput(input);
          }}
        />
        <span className="catalog-page-total">/{totalPages}</span>
      </div>
      <Button
        variant="outline"
        size="icon"
        aria-label={localized('Próxima página', 'Next page')}
        disabled={page >= totalPages - 1}
        onClick={() => change(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
