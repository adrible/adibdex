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
      <div
        className="catalog-pagination-page"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          position: 'relative',
          width: '5.75rem',
          minWidth: '5.75rem',
          height: 44,
          minHeight: 44,
          alignItems: 'center',
          columnGap: 0,
          padding: 0,
        }}
      >
        <div
          className="catalog-page-current"
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            alignItems: 'center',
            justifyContent: 'center',
            justifySelf: 'stretch',
            minWidth: 0,
          }}
        >
          <input
            className="catalog-page-input"
            style={{
              width: '100%',
              minWidth: 0,
              maxWidth: 'none',
              height: 40,
              minHeight: 0,
              margin: 0,
              padding: 0,
              border: 0,
              appearance: 'none',
              font: 'inherit',
              fontWeight: 700,
              lineHeight: '40px',
              color: '#fff',
              textAlign: 'center',
            }}
            type="text"
            inputMode="numeric"
            aria-label={localized('Número da página editável', 'Editable page number')}
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
        </div>
        <span
          className="catalog-page-divider"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'rgba(255, 255, 255, 0.65)',
            pointerEvents: 'none',
          }}
        >
          /
        </span>
        <input
          className="catalog-page-total"
          type="text"
          readOnly
          tabIndex={-1}
          aria-label={localized('Total de páginas', 'Total pages')}
          value={totalPages}
          style={{
            gridColumn: 2,
            width: '100%',
            minWidth: 0,
            height: 40,
            minHeight: 0,
            margin: 0,
            padding: 0,
            border: 0,
            appearance: 'none',
            background: 'transparent',
            font: 'inherit',
            fontWeight: 700,
            lineHeight: '40px',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.65)',
            pointerEvents: 'none',
          }}
        />
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
