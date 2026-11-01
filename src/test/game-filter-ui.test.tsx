import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FilterContent } from '@/components/filters/FilterContent';
import { ActiveFilterChips } from '@/components/filters/ActiveFilterChips';
import { DEFAULT_FILTERS } from '@/features/catalog/filter-state';

describe('game filter controls', () => {
  it('applies a game selection and clears it through its removable chip', () => {
    const onChange = vi.fn(),
      onClose = vi.fn();
    const view = render(
      <FilterContent
        filters={DEFAULT_FILTERS}
        onChange={onChange}
        onClose={onClose}
        gameOptions={[{ value: 'yellow', label: 'Yellow' }]}
      />,
    );
    fireEvent.change(screen.getByRole('combobox', { name: 'Jogo' }), {
      target: { value: 'yellow' },
    });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar Filtros' }));
    expect(onChange).toHaveBeenCalledWith({ ...DEFAULT_FILTERS, game: 'yellow' });
    expect(onClose).toHaveBeenCalledOnce();
    view.unmount();
    render(
      <ActiveFilterChips filters={{ ...DEFAULT_FILTERS, game: 'yellow' }} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remover Jogo: Yellow' }));
    expect(onChange).toHaveBeenLastCalledWith(DEFAULT_FILTERS);
  });
  it('offers all games and resets the game along with the other filters', () => {
    const onChange = vi.fn();
    render(
      <FilterContent
        filters={{ ...DEFAULT_FILTERS, game: 'yellow', types: ['water'] }}
        onChange={onChange}
        onClose={() => {}}
        gameOptions={[]}
      />,
    );
    expect(screen.getByRole('option', { name: 'Todos os jogos' })).toBeTruthy();
    expect(screen.getByRole('option', { name: /Yellow.*sem registros/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Limpar$/ }));
    expect(onChange).toHaveBeenCalledWith(DEFAULT_FILTERS);
  });
});
