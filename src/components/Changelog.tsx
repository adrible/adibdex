import { useQuery } from '@tanstack/react-query';
import { History, ArrowUpRight, Database, CheckCircle2 } from 'lucide-react';
import { CHANGELOG } from '@/lib/version';
import { fetchCatalogSnapshot } from '@/lib/pokeapi/catalog';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

export function Changelog() {
  const query = useQuery({
    queryKey: ['catalog', 'metadata'],
    queryFn: ({ signal }) => fetchCatalogSnapshot(signal),
    staleTime: 60 * 60_000,
    select: (data) => ({
      generatedAt: data.generatedAt,
      sourceUpdatedAt: data.sourceUpdatedAt,
      source: data.source,
      count: data.entries.length,
    }),
  });
  const [latest, ...previous] = CHANGELOG;
  return (
    <section id="novidades" className="changelog" aria-labelledby="changelog-title">
      <div className="changelog-heading">
        <div>
          <p className="evolution-eyebrow">AdibDex em evolução</p>
          <h2
            id="changelog-title"
            className="flex items-center gap-2 text-xl font-bold text-card-foreground"
          >
            <History className="h-5 w-5 text-primary" />
            Novidades
          </h2>
        </div>
        <span className="changelog-version">v{latest.version}</span>
      </div>
      <article className="changelog-release">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-semibold text-card-foreground">{latest.title}</h3>
          {latest.date && (
            <time className="text-xs text-muted-foreground" dateTime={latest.date}>
              {formatDate(latest.date)}
            </time>
          )}
        </div>
        <ul className="space-y-3">
          {latest.changes.map((change) => (
            <li className="flex items-start gap-2 text-sm text-muted-foreground" key={change}>
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{change}</span>
            </li>
          ))}
        </ul>
      </article>
      <div className="changelog-data">
        <Database aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div className="min-w-0 text-xs text-muted-foreground">
          {query.data ? (
            <>
              <p className="font-medium text-card-foreground">
                Dados conferidos em{' '}
                <time dateTime={query.data.generatedAt}>{formatDate(query.data.generatedAt)}</time>{' '}
                · {query.data.count.toLocaleString('pt-BR')} registros
              </p>
              <p className="mt-1">
                Revisão da fonte: {formatDate(query.data.sourceUpdatedAt)}. Catálogo local baseado
                na PokeAPI.
              </p>
              <a
                href={query.data.source}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
              >
                Consultar fonte oficial
                <ArrowUpRight className="h-3 w-3" />
              </a>
            </>
          ) : query.isError ? (
            <p>
              Não foi possível conferir a data dos dados.{' '}
              <button className="text-primary underline" onClick={() => void query.refetch()}>
                Tentar novamente
              </button>
            </p>
          ) : (
            <p role="status">Conferindo versão dos dados…</p>
          )}
        </div>
      </div>
      {previous.length > 0 && (
        <details className="changelog-previous">
          <summary>Versões anteriores</summary>
          {previous.map((release) => (
            <article key={release.version} className="mt-5 border-l-2 border-primary/20 pl-4">
              <h3 className="text-sm font-semibold text-card-foreground">
                v{release.version} · {release.title}
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                {release.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
