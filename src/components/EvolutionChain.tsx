import { useMemo, type CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GitBranch, ArrowRight, ArrowDown, Sparkles, Maximize2 } from 'lucide-react';
import { fetchEvolutionChain } from '@/lib/pokeapi/evolution';
import { fetchCatalog } from '@/lib/pokeapi/catalog';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryErrorState } from '@/components/QueryErrorState';
import type { PokemonListContext } from '@/lib/navigation';
import { EvolutionCard } from './evolution/EvolutionCard';
import { EvolutionRequirements } from './evolution/EvolutionRequirements';
import { EvolutionBranchTree } from './evolution/EvolutionBranchTree';
import { buildEvolutionForest, hasEvolutionBranches } from '@/features/evolution/tree';

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
          <p className="evolution-eyebrow">Crescimento e transformações</p>
          <h3 id="evolution-title" className="evolution-title">
            Linha Evolutiva
          </h3>
        </div>
        {members.size > 0 && (
          <span className="evolution-count">
            {members.size} {members.size === 1 ? 'forma' : 'formas'}
          </span>
        )}
      </div>
      {query.isPending ? (
        <div className="evolution-loading" role="status" aria-label="Carregando linha evolutiva">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <QueryErrorState
          title="Não foi possível carregar a linha evolutiva"
          onRetry={() => void query.refetch()}
        />
      ) : !steps?.length ? (
        <p className="evolution-note">
          A PokeAPI não disponibilizou uma linha evolutiva para este Pokémon.
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
              style={{ '--stage-count': steps.length } as CSSProperties}
            >
              {steps.map((stage, index) => (
                <div className="evolution-stage" key={index}>
                  <div className="evolution-stage-heading">
                    {index > 0 && (
                      <>
                        <ArrowRight className="evolution-connector-desktop" aria-hidden="true" />
                        <ArrowDown className="evolution-connector-mobile" aria-hidden="true" />
                      </>
                    )}
                    <span className="evolution-stage-number">{index + 1}</span>
                    <h4>{index === 0 ? 'Forma inicial' : `Evolução ${index}`}</h4>
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
                        {step.parentId !== null && (
                          <p className="evolution-parent">
                            Evolui de{' '}
                            <span>
                              {members.get(step.parentId)?.name.replace(/-/g, ' ') ??
                                `#${step.parentId}`}
                            </span>
                          </p>
                        )}
                        <EvolutionRequirements conditions={step.conditions} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {members.size === 1 && (
            <p className="evolution-note">Não há outras evoluções registradas para esta espécie.</p>
          )}
          {members.size > 1 && (
            <p className="evolution-note">
              Condições informadas pela PokeAPI; podem variar entre jogos.
            </p>
          )}
          {formsQuery.isError ? (
            <div className="mt-6">
              <QueryErrorState
                title="Não foi possível carregar as formas especiais"
                onRetry={() => void formsQuery.refetch()}
              />
            </div>
          ) : formsQuery.isPending ? (
            <Skeleton className="mt-6 h-20 rounded-xl" />
          ) : (
            specialForms.length > 0 && (
              <div className="evolution-transformations">
                <div className="mb-5">
                  <h4 className="font-semibold text-card-foreground">Formas especiais</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Apenas as transformações desta espécie, separadas da linha evolutiva.
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
                        aria-label={category === 'mega' ? 'Mega e Primal' : 'Gigantamax'}
                      >
                        <h5 className="evolution-form-heading">
                          <Icon className="h-4 w-4" />
                          {category === 'mega' ? 'Mega e Primal' : 'Gigantamax'}
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
                                Forma de{' '}
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
