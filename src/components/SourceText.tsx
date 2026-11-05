import { getSiteLanguage } from '@/lib/language';

/** Make untranslated source content explicit while retaining the original information. */
export function SourceText({ text, language }: { text: string; language?: string }) {
  const original = getSiteLanguage() === 'pt' && language === 'en';
  return (
    <>
      {original && <span className="source-language-note">Texto original em inglês</span>}
      <span lang={language}>{text}</span>
    </>
  );
}
