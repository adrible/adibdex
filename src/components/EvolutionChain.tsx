import { Fragment, useMemo, type CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitBranch, Sparkles, Maximize2 } from 'lucide-react';
import { fetchEvolutionChain } from '@/lib/pokeapi/evolution';
import { fetchCatalog } from '@/lib/pokeapi/catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/QueryErrorState';
import type { PokemonListContext } from '@/lib/navigation';
import { EvolutionCard } from './evolution/EvolutionCard';
import { EvolutionTransition } from './evolution/EvolutionTransition';
import { EvolutionBranchTree } from './evolution/EvolutionBranchTree';
import { buildEvolutionForest, hasEvolutionBranches } from '@/features/evolution/tree';
import './evolution/evolution.css';
import { localized } from '@/lib/language';

interface Props {
  pokemonId: number;
  speciesId: number;
  isShiny?: boolean;
  origin?: string;
  listContext?: PokemonListContext;
}

export function EvolutionChainDisplay({
  pokemonId,
  speciesId,
  isShiny = false,
  origin,
  listContext,
}: Props) {
  const query = useQuery({
    queryKey: ['evolution-chain', pokemonId],
    queryFn: ({ signal }) => fetchEvolutionChain(pokemonId, signal),
    staleTime: 60 * 60_000,
  });
  const steps = query.data?.steps;
  const formsQuery = useQuery({
    queryKey: ['catalog', 'evolution'],
    queryFn: ({ signal }) => fetchCatalog(signal),
    enabled: Boolean(steps?.length),
    staleTime: 60 * 60_000,
  });
  const members = useMemo(
    () => new Map(steps?.flat().map((step) => [step.speciesId, step]) ?? []),
    [steps],
  );
  const specialForms = useMemo(
    () =>
      formsQuery.data?.filter(
        (form) =>
          form.baseId === speciesId && (form.category === 'mega' || form.category === 'gmax'),
      ) ?? [],
    [formsQuery.data, speciesId],
  );
  const byId = useMemo(
    () => new Map(formsQuery.data?.map((form) => [form.id, form]) ?? []),
    [formsQuery.data],
  );
  const navigation = { origin, listContext };
  const forest = useMemo(() => buildEvolutionForest(steps ?? []), [steps]);
  const branched = hasEvolutionBranches(forest);

  return (
    <section className="evolution-panel" aria-labelledby="evolution-title">
      <div className="evolution-header">
        <div className="evolution-heading-icon">
          <GitBranch aria-hidden="true" className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="evolution-eyebrow">
            {localized('Caminhos de evolução', 'Evolution paths')}
          </p>
          <h3 id="evolution-title" className="evolution-title">
            {localized('Linha Evolutiva', 'Evolution chain')}
          </h3>
        </div>
        {members.size > 0 && (
          <span className="evolution-count">
            <span className="evolution-count-number">{String(members.size).padStart(2, '0')}</span>
            <span>
              {members.size === 1 ? localized('forma', 'form') : localized('formas', 'forms')}
            </span>
          </span>
        )}
      </div>
      {query.isPending ? (
        <div
          className="evolution-loading"
          role="status"
          aria-label={localized('Carregando linha evolutiva', 'Loading evolution chain')}
        >
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <QueryErrorState
          title={localized(
            'Não foi possível carregar a linha evolutiva',
            'Could not load the evolution chain',
          )}
          onRetry={() => void query.refetch()}
        />
      ) : !steps?.length ? (
        <p className="evolution-note">
          {localized(
            'A PokeAPI não disponibilizou uma linha evolutiva para este Pokémon.',
            'The PokéAPI has no evolution chain for this Pokémon.',
          )}
        </p>
      ) : (
        <>
          {branched ? (
            <EvolutionBranchTree
              key={pokemonId}
              nodes={forest}
              pokemonId={pokemonId}
              isShiny={isShiny}
              navigation={navigation}
              byId={byId}
            />
          ) : (
            <div
              className={`evolution-stages ${members.size === 1 ? 'evolution-stages--single' : ''}`}
              style={
                {
                  '--evolution-columns': steps
                    .map(() => 'minmax(0, 1fr)')
                    .join(' minmax(100px, 0.65fr) '),
                } as CSSProperties
              }
            >
              {steps.map((stage, index) => (
                <Fragment key={index}>
                  {index > 0 && (
                    <EvolutionTransition
                      conditions={stage[0].conditions}
                      from={members.get(stage[0].parentId!)?.name}
                      to={stage[0].name}
                      horizontal
                    />
                  )}
                  <div className="evolution-stage">
                    <div className="evolution-stage-heading">
                      <span className="evolution-stage-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h4>
                        {index === 0
                          ? localized('Forma inicial', 'Starting form')
                          : `${localized('Evolução', 'Evolution')} ${index}`}
                      </h4>
                    </div>
                    <div className="evolution-stage-cards">
                      {stage.map((step) => (
                        <div key={step.id} className="evolution-node">
                          <EvolutionCard
                            id={step.id}
                            speciesId={step.speciesId}
                            name={step.name}
                            isShiny={isShiny}
                            selected={step.id === pokemonId}
                            navigation={navigation}
                            types={byId.get(step.id)?.types}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </Fragment>
              ))}
            </div>
          )}
          {members.size === 1 && (
            <p className="evolution-note">
              {localized(
                'Não há outras evoluções registradas para esta espécie.',
                'No other evolutions are recorded for this species.',
              )}
            </p>
          )}
          {members.size > 1 && (
            <p className="evolution-note">
              {localized(
                'Condições informadas pela PokeAPI; podem variar entre jogos.',
                'Evolution conditions are provided by PokéAPI and may vary between games.',
              )}
            </p>
          )}
          {formsQuery.isError ? (
            <div className="mt-6">
              <QueryErrorState
                title={localized(
                  'Não foi possível carregar as formas especiais',
                  'Could not load special forms',
                )}
                onRetry={() => void formsQuery.refetch()}
              />
            </div>
          ) : formsQuery.isPending ? (
            <Skeleton className="mt-6 h-20 rounded-xl" />
          ) : (
            specialForms.length > 0 && (
              <div className="evolution-transformations">
                <div className="evolution-transformations-heading">
                  <h4 className="font-semibold text-card-foreground">
                    {localized('Formas especiais', 'Special forms')}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {localized(
                      'Apenas as transformações desta espécie, separadas da linha evolutiva.',
                      'Only this species’ transformations, separate from its evolution chain.',
                    )}
                  </p>
                </div>
                <div className="evolution-form-groups">
                  {(['mega', 'gmax'] as const).map((category) => {
                    const forms = specialForms.filter((form) => form.category === category);
                    if (!forms.length) return null;
                    const Icon = category === 'mega' ? Sparkles : Maximize2;
                    return (
                      <section
                        key={category}
                        className={`evolution-form-group evolution-form-group--${category} ${forms.length > 1 ? 'sm:col-span-2' : ''}`}
                        aria-label={
                          category === 'mega'
                            ? localized('Mega e Primal', 'Mega and Primal')
                            : 'Gigantamax'
                        }
                      >
                        <h5 className="evolution-form-heading">
                          <Icon className="h-4 w-4" />
                          {category === 'mega'
                            ? localized('Mega e Primal', 'Mega and Primal')
                            : 'Gigantamax'}
                          <span>{forms.length}</span>
                        </h5>
                        <div
                          className={`evolution-special-grid ${forms.length === 1 ? 'evolution-special-grid--single' : ''}`}
                        >
                          {forms.map((form) => (
                            <div key={form.id}>
                              <EvolutionCard
                                id={form.id}
                                speciesId={form.baseId}
                                name={form.name}
                                isShiny={isShiny}
                                selected={form.id === pokemonId}
                                navigation={navigation}
                                types={form.types}
                              />
                              <p className="evolution-parent">
                                {localized('Forma de', 'Form of')}{' '}
                                <span>{members.get(form.baseId)?.name.replace(/-/g, ' ')}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </>
      )}
    </section>
  );
}
