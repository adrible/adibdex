export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-primary">
      <div className="container flex items-center justify-between h-16">
        <div className="site-brand flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-foreground/90 border-2 border-primary-foreground/30 shadow-inner flex items-center justify-center">
            <div className="relative w-5 h-5 rounded-full border-2 border-black overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1/2 bg-red-500"></div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-white"></div>
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white border border-black rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>

          <h1 className="font-pixel text-xs sm:text-sm text-primary-foreground tracking-wider">
            ADIBDEX
          </h1>
        </div>

      </div>
    </header>
  );
}
