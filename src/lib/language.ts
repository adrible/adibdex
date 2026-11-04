export type SiteLanguage = 'pt' | 'en';

/** The interface supports Brazilian Portuguese and English; all other browser languages use English. */
export function getSiteLanguage(): SiteLanguage {
  const language = typeof navigator === 'undefined' ? 'pt' : navigator.language;
  return language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export function localized(portuguese: string, english: string): string {
  return getSiteLanguage() === 'pt' ? portuguese : english;
}

export function siteLocale(): string {
  return getSiteLanguage() === 'pt' ? 'pt-BR' : 'en';
}
