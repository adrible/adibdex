import { ArrowDown, GitBranch } from 'lucide-react';
import type { EvolutionNode } from '@/features/evolution/tree';
import type { PokemonNavigationState } from '@/lib/navigation';
import type { PokemonBasic } from '@/lib/pokemon/types';
import { EvolutionCard } from './EvolutionCard';
import { EvolutionRequirements } from './EvolutionRequirements';

interface Props {
  nodes: EvolutionNode[];
  pokemonId: number;
  isShiny: boolean;
  navigation: PokemonNavigationState;
  byId: ReadonlyMap<number, PokemonBasic>;
}

export function EvolutionBranchTree({ nodes, ...context }: Props) {
  return (
    <div className="evolution-tree" data-layout="branched">
      {nodes.map((node) => (
        <Branch key={node.step.id} node={node} {...context} />
      ))}
    </div>
  );
}

function Branch({
  node,
  parentName,
  ...context
}: Omit<Props, 'nodes'> & { node: EvolutionNode; parentName?: string }) {
  const { step, children } = node;
  const split = children.length > 1;
  return (
    <div className="evolution-tree-node" data-species-id={step.speciesId}>
      <div
        className={`evolution-tree-member ${parentName ? 'evolution-tree-member--compact' : ''}`}
      >
        <EvolutionCard
          id={step.id}
          speciesId={step.speciesId}
          name={step.name}
          isShiny={context.isShiny}
          selected={step.id === context.pokemonId}
          navigation={context.navigation}
          types={context.byId.get(step.id)?.types}
        />
        {parentName && (
          <p className="evolution-parent">
            Evolui de <span>{parentName.replace(/-/g, ' ')}</span>
          </p>
        )}
        <EvolutionRequirements conditions={step.conditions} />
      </div>
      {children.length > 0 && (
        <>
          <div className="evolution-tree-connector">
            {split ? (
              <>
                <GitBranch className="h-4 w-4" aria-hidden="true" />
                <p>
                  {children.length} evoluções possíveis de{' '}
                  <span className="capitalize">{step.name.replace(/-/g, ' ')}</span>
                </p>
              </>
            ) : (
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            )}
          </div>
          <div
            className={`evolution-tree-children ${split ? 'evolution-tree-children--split' : ''} ${children.length > 3 ? 'evolution-tree-children--many' : ''}`}
            role="group"
            aria-label={`Evoluções de ${step.name.replace(/-/g, ' ')}`}
          >
            {children.map((child) => (
              <Branch key={child.step.id} node={child} parentName={step.name} {...context} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
