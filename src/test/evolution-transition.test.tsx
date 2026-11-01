import '@testing-library/jest-dom/vitest';
import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EvolutionChainDisplay } from '@/components/EvolutionChain';
import type { EvolutionCondition, EvolutionStep } from '@/lib/pokemon/types';

const condition: EvolutionCondition = {
  minLevel: null,
  trigger: 'level-up',
  item: null,
  heldItem: null,
  minHappiness: null,
  timeOfDay: null,
  knownMove: null,
  knownMoveType: null,
  location: null,
  minAffection: null,
  needsRain: false,
  turnUpsideDown: false,
  gender: null,
  minBeauty: null,
  relativePhysicalStats: null,
  partySpecies: null,
  partyType: null,
  tradeSpecies: null,
};
const step = (
  id: number,
  name: string,
  parentId: number | null,
  levels: number[],
): EvolutionStep => ({
  ...condition,
  id,
  speciesId: id,
  name,
  parentId,
  sprite: '',
  conditions: levels.map((minLevel) => ({ ...condition, minLevel })),
});
function show(steps: EvolutionStep[][]) {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
  client.setQueryData(['evolution-chain', 1], { steps });
  client.setQueryData(['catalog', 'evolution'], []);
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <EvolutionChainDisplay pokemonId={1} speciesId={1} />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('incoming evolution methods', () => {
  it('places each method between its source and destination, never under the destination card', () => {
    const { container } = show([
      [step(1, 'bulbasaur', null, [])],
      [step(2, 'ivysaur', 1, [16])],
      [step(3, 'venusaur', 2, [32])],
    ]);
    const first = screen.getByRole('group', { name: 'Como evoluir bulbasaur para ivysaur' });
    const second = screen.getByRole('group', { name: 'Como evoluir ivysaur para venusaur' });
    expect(within(first).getByText('Nível 16')).toBeVisible();
    expect(within(first).queryByText('Nível 32')).toBeNull();
    expect(within(second).getByText('Nível 32')).toBeVisible();
    expect(first.previousElementSibling).toContainElement(
      screen.getByRole('link', { name: /bulbasaur/i }),
    );
    expect(first.nextElementSibling).toContainElement(
      screen.getByRole('link', { name: /ivysaur/i }),
    );
    expect(container.querySelector('.evolution-node .evolution-requirements')).toBeNull();
  });
  it('keeps branch methods attached to their own destination with alternatives accessible', () => {
    const { container } = show([
      [step(1, 'base', null, [])],
      [step(2, 'left', 1, [16, 20]), step(3, 'right', 1, [32])],
      [step(4, 'final', 2, [40])],
    ]);
    const left = screen.getByRole('group', { name: 'Como evoluir base para left' });
    expect(within(left).getByText('Nível 16')).toBeVisible();
    expect(within(left).getByText('Outras condições (1)')).toBeVisible();
    expect(within(left).getByText('Nível 20')).not.toBeVisible();
    expect(screen.getByRole('group', { name: 'Como evoluir base para right' })).toHaveTextContent(
      'Nível 32',
    );
    expect(screen.getByRole('group', { name: 'Como evoluir left para final' })).toHaveTextContent(
      'Nível 40',
    );
    expect(container.querySelector('.evolution-tree-member .evolution-requirements')).toBeNull();
  });
  it('renders a single species without a transition', () => {
    const { container } = show([[step(1, 'single', null, [])]]);
    expect(container.querySelector('.evolution-transition')).toBeNull();
  });
});
