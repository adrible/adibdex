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
    fireEvent.click(screen.getByRole('button', { name: 'Jogo Todos os jogos' }));
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar jogo' }), {
      target: { value: 'yell' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Yellow' }));
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
    fireEvent.click(screen.getByRole('button', { name: 'Jogo Yellow' }));
    expect(screen.getByRole('button', { name: 'Todos os jogos' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Yellow.*sem registros/ })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^Limpar$/ }));
    expect(onChange).toHaveBeenCalledWith(DEFAULT_FILTERS);
  });
  it('handles an empty search and Escape without losing the selection', () => {
    const onChange = vi.fn();
    render(
      <FilterContent
        filters={{ ...DEFAULT_FILTERS, game: 'yellow' }}
        onChange={onChange}
        onClose={() => {}}
        gameOptions={[
          { value: 'yellow', label: 'Yellow' },
          { value: 'sword-shield', label: 'Sword / Shield' },
        ]}
      />,
    );
    const trigger = screen.getByRole('button', { name: 'Jogo Yellow' });
    fireEvent.click(trigger);
    const search = screen.getByRole('searchbox', { name: 'Buscar jogo' });
    fireEvent.change(search, { target: { value: 'inexistente' } });
    expect(screen.getByText('Nenhum jogo encontrado.')).toBeTruthy();
    fireEvent.keyDown(search, { key: 'Escape' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
    fireEvent.click(trigger);
    expect((screen.getByRole('searchbox', { name: 'Buscar jogo' }) as HTMLInputElement).value).toBe(
      '',
    );
    expect(screen.getByRole('button', { name: 'Yellow' }).getAttribute('aria-pressed')).toBe(
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Remover filtro de jogo' }));
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar Filtros' }));
    expect(onChange).toHaveBeenCalledWith(DEFAULT_FILTERS);
  });
});
