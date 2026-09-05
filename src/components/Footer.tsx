import { useEffect, useRef, useState } from 'react';
import { VERSION_INFO } from '@/lib/version';

export function Footer() {
  const [showInfo, setShowInfo] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showInfo && popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowInfo(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfo]);

  return (
    <footer className="relative mt-12 pb-6 text-center">
      <div ref={popupRef} className="flex items-center justify-center gap-2 relative">
        <span className="footer-version">v{VERSION_INFO.version}</span>

        <button
          onClick={() => setShowInfo((v) => !v)}
          aria-label="Informações da versão"
          aria-expanded={showInfo}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setShowInfo(false);
          }}
          className="footer-info-button"
        >
          ?
        </button>

        {showInfo && (
          <div
            className="
              absolute bottom-6 left-1/2 -translate-x-1/2
              w-52
              rounded-lg
              bg-card
              border border-border
              p-3
              text-card-foreground
              shadow-xl
              z-50
            "
          >
            <p className="text-code mb-2">v{VERSION_INFO.version}</p>

            <ul className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              {VERSION_INFO.changes.map((change) => (
                <li key={change}>• {change}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </footer>
  );
}
