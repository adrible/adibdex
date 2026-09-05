import type { EvolutionStep } from '@/lib/pokemon/types';

export interface EvolutionNode {
  step: EvolutionStep;
  children: EvolutionNode[];
}

/** Species IDs remain stable even when a step is replaced by a regional form. */
export function buildEvolutionForest(stages: EvolutionStep[][]): EvolutionNode[] {
  const nodes = new Map<number, { node: EvolutionNode; depth: number }>();
  stages.forEach((stage, depth) =>
    stage.forEach((step) => {
      nodes.set(step.speciesId, { node: { step, children: [] }, depth });
    }),
  );
  const roots: EvolutionNode[] = [];
  for (const { node, depth } of nodes.values()) {
    const parent = node.step.parentId === null ? undefined : nodes.get(node.step.parentId);
    // A malformed link cannot create a cycle or make a Pokémon disappear.
    if (parent && parent.depth < depth) parent.node.children.push(node);
    else roots.push(node);
  }
  return roots;
}

export function hasEvolutionBranches(nodes: EvolutionNode[]): boolean {
  return nodes.some((node) => node.children.length > 1 || hasEvolutionBranches(node.children));
}
