import { useState } from 'react';
import { APP_VERSION } from '@/lib/version';

export function Footer() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <footer className="relative mt-12 pb-6 text-center text-xs text-muted-foreground">
      
      <div className="flex items-center justify-center gap-2 relative">

        {/* versão */}
        <span>v{APP_VERSION}</span>

        {/* botão */}
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="
            w-5 h-5 flex items-center justify-center
            rounded-full
            bg-white/10 hover:bg-white/20
            text-white/70 hover:text-white
            text-[10px]
            transition
          "
        >
          ?
        </button>

        {/* popup */}
        {showInfo && (
          <div
            className="
              absolute bottom-7 left-1/2 -translate-x-1/2
              w-64
              rounded-xl
              bg-black/60 backdrop-blur-xl
              border border-white/10
              p-4
              text-white
              shadow-2xl
              z-50
            "
          >
            <p className="text-xs font-bold mb-2 text-white/80 tracking-wide">
              v{APP_VERSION}
            </p>

            <ul className="space-y-1 text-[11px] text-white/70">
              <li>• Backgrounds por região</li>
              <li>• Tema Mega / GMAX</li>
              <li>• Melhorias no mobile</li>
              <li>• UI padronizada</li>
              <li>• Bug fixes</li>
            </ul>
          </div>
        )}
      </div>

    </footer>
  );
}