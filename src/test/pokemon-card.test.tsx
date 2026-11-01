import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { PokemonCard } from '@/components/PokemonCard';
import type { PokemonBasic } from '@/lib/pokemon/types';

const pokemon: PokemonBasic = {
  id: 25,
  name: 'pikachu',
  sprite: '',
  spriteShiny: '',
  types: ['electric'],
  moves: ['surf', 'thunderbolt', 'thunder-wave'],
  moveGames: {
    surf: ['yellow', 'sword-shield'],
    thunderbolt: ['red-blue'],
    'thunder-wave': ['gold-silver'],
  },
};
function renderCard(search: string) {
  return render(
    <MemoryRouter>
      <PokemonCard pokemon={pokemon} search={search} />
    </MemoryRouter>,
  );
}
describe('learned attack game tags', () => {
  it('shows the matching move and only its games below the Pokémon name', () => {
    renderCard('SÚRF');
    const tags = screen.getByLabelText('Jogos em que aprende o ataque pesquisado');
    expect(within(tags).getByText('surf')).toBeTruthy();
    expect(within(tags).getByText('Yellow')).toBeTruthy();
    expect(within(tags).getByText('Sword / Shield')).toBeTruthy();
    expect(within(tags).queryByText('Red / Blue')).toBeNull();
    expect(
      screen.getByRole('heading', { name: 'pikachu' }).compareDocumentPosition(tags) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/pokemon/25');
  });
  it('keeps game tags associated with each move for a partial search', () => {
    renderCard('thunder');
    const first = screen.getByText('thunderbolt').parentElement!;
    expect(within(first).getByText('Red / Blue')).toBeTruthy();
    expect(within(first).queryByText('Gold / Silver')).toBeNull();
    const second = screen.getByText('thunder wave').parentElement!;
    expect(within(second).getByText('Gold / Silver')).toBeTruthy();
  });
  it.each(['', 'pikachu', '25', 'overgrow'])('hides attack tags for %s', (query) => {
    renderCard(query);
    expect(screen.queryByLabelText('Jogos em que aprende o ataque pesquisado')).toBeNull();
  });
});
