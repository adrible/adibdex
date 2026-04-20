import { useEffect, useRef, useState } from 'react';
import { VERSION_INFO } from '@/lib/version';

export function Footer() {
  const [showInfo, setShowInfo] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showInfo &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
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
      <div className="flex items-center justify-center gap-2 relative">
        <span className="text-xs text-ui-subtitle">
          v{VERSION_INFO.version}
        </span>

        <button
          onClick={() => setShowInfo((v) => !v)}
          className="
            w-5 h-5 flex items-center justify-center
            rounded-full
            bg-white/10 hover:bg-white/20
            text-ui-title
            text-[10px]
            transition
          "
        >
          ?
        </button>

        {showInfo && (
          <div
            ref={popupRef}
            className="
              absolute bottom-7 left-1/2 -translate-x-1/2
              w-64
              rounded-xl
              bg-black/70 backdrop-blur-xl
              border border-white/10
              p-4
              text-ui-subtitle
              shadow-2xl
              z-50
            "
          >
            <p className="text-xs font-bold mb-2 text-ui-title tracking-wide">
              v{VERSION_INFO.version}
            </p>

            <ul className="space-y-1 text-[11px]">
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