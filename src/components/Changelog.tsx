import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, ArrowUpRight, ChevronDown } from 'lucide-react';
import { CHANGELOG } from '@/lib/version';
import { fetchCatalogSnapshot } from '@/lib/pokeapi/catalog';
import { getSiteLanguage, localized, siteLocale } from '@/lib/language';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString(siteLocale(), { timeZone: 'UTC' });

export function Changelog() {
  const [expanded, setExpanded] = useState(false);
  const query = useQuery({
    queryKey: ['catalog', 'metadata'],
    queryFn: ({ signal }) => fetchCatalogSnapshot(signal),
    enabled: expanded,
    staleTime: 60 * 60_000,
    select: (data) => ({
      generatedAt: data.generatedAt,
      sourceUpdatedAt: data.sourceUpdatedAt,
      source: data.source,
      count: data.entries.length,
    }),
  });
  const [latest, ...previous] = CHANGELOG;
  const english = getSiteLanguage() === 'en';
  return (
    <section id="novidades" className="changelog" aria-labelledby="changelog-title">
      <div className="changelog-bar">
        <div className="changelog-label">
          <History aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          <h2 id="changelog-title" className="text-sm font-semibold">
            {localized('Novidades', "What's new")}
          </h2>
          <span className="changelog-version">v{latest.version}</span>
        </div>
        <button
          type="button"
          className="changelog-toggle"
          aria-expanded={expanded}
          aria-controls="changelog-content"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? localized('Fechar', 'Close') : localized('Ver alterações', 'View changes')}
          <ChevronDown aria-hidden="true" className={`h-4 w-4 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      <div id="changelog-content" hidden={!expanded} className="changelog-content">
        <article>
          <div className="changelog-release-heading">
            <h3 className="text-sm font-medium">{english ? latest.titleEn : latest.title}</h3>
            {latest.date && (
              <time className="text-xs text-muted-foreground" dateTime={latest.date}>
                {formatDate(latest.date)}
              </time>
            )}
          </div>
          <ul className="changelog-changes">
            {(english ? latest.changesEn : latest.changes).map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </article>
        {previous.length > 0 && (
          <details className="changelog-previous">
            <summary>{localized('Versões anteriores', 'Previous releases')}</summary>
            {previous.map((release) => (
              <article key={release.version} className="changelog-history-entry">
                <h3 className="text-sm font-medium">
                  v{release.version} · {english ? release.titleEn : release.title}
                </h3>
                <ul className="changelog-changes">
                  {(english ? release.changesEn : release.changes).map((change) => (
                    <li key={change}>{change}</li>
                  ))}
                </ul>
              </article>
            ))}
          </details>
        )}
        <div className="changelog-data">
          {query.data ? (
            <>
              <p>
                {localized('Dados conferidos em', 'Data checked on')}{' '}
                <time dateTime={query.data.generatedAt}>{formatDate(query.data.generatedAt)}</time>{' '}
                · {query.data.count.toLocaleString(siteLocale())}{' '}
                {localized('registros', 'records')}
              </p>
              <p className="mt-1">
                {localized('Revisão da fonte', 'Source updated')}:{' '}
                {formatDate(query.data.sourceUpdatedAt)}.{' '}
                <a
                  href={query.data.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-primary hover:underline"
                >
                  {localized('Consultar fonte oficial', 'View official source')}
                  <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
                </a>
              </p>
            </>
          ) : query.isError ? (
            <p>
              {localized(
                'Não foi possível conferir a data dos dados.',
                'Could not check the data date.',
              )}{' '}
              <button className="text-primary underline" onClick={() => void query.refetch()}>
                {localized('Tentar novamente', 'Try again')}
              </button>
            </p>
          ) : (
            <p role="status">
              {localized('Conferindo versão dos dados…', 'Checking data version…')}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
