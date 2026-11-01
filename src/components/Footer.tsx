import { VERSION_INFO } from '@/lib/version';

export function Footer() {
  return (
    <footer className="mt-12 pb-6 text-center">
      <span className="footer-version">v{VERSION_INFO.version}</span>
    </footer>
  );
}
