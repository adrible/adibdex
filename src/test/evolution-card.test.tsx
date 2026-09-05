import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EvolutionCard } from '@/components/evolution/EvolutionCard';

function renderCard(types?: string[], selected = false, isShiny = false) {
  render(
    <MemoryRouter>
      <EvolutionCard
        id={1}
        speciesId={1}
        name="bulbasaur"
        types={types}
        selected={selected}
        isShiny={isShiny}
        navigation={{}}
      />
    </MemoryRouter>,
  );
  return screen.getByRole('link');
}

describe('styled evolution cards', () => {
  it('uses the two known types for the card palette', () => {
    const card = renderCard(['grass', 'poison']);
    expect(card.style.getPropertyValue('--evo-type')).toBe('var(--type-grass)');
    expect(card.style.getPropertyValue('--evo-secondary')).toBe('var(--type-poison)');
    expect(card.getAttribute('href')).toBe('/pokemon/1');
    expect(card.querySelector('.evolution-orbit')?.getAttribute('aria-hidden')).toBe('true');
  });
  it('reuses the same color for single-type Pokémon', () => {
    const card = renderCard(['water']);
    expect(card.style.getPropertyValue('--evo-secondary')).toBe('var(--type-water)');
  });
  it.each(
    [undefined, [], ['unknown'], ['constructor'], ['fire);color:red']].map((types) => ({ types })),
  )('falls back to neutral for missing or unknown types: $types', ({ types }) => {
    const card = renderCard(types);
    expect(card.style.getPropertyValue('--evo-type')).toBe('var(--type-normal)');
    expect(card.style.getPropertyValue('--evo-secondary')).toBe('var(--type-normal)');
  });
  it('retains accessible current selection and shiny artwork', () => {
    const card = renderCard(['grass'], true, true);
    expect(card.getAttribute('aria-current')).toBe('page');
    expect(card.classList.contains('evolution-card--selected')).toBe(true);
    expect(card.classList.contains('evolution-card--shiny')).toBe(true);
    expect(screen.getByText('Atual').textContent).toBe('Atual');
    expect(screen.getByRole('img').getAttribute('src')).toContain('/official-artwork/shiny/1.png');
  });
});
