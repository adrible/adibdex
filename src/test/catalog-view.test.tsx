import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCatalogView } from '@/features/catalog/use-catalog-view';
import { DEFAULT_FILTERS } from '@/features/catalog/filter-state';
import { viewStateKey } from '@/features/catalog/view-state';
import { writeSessionJson, readSessionJson } from '@/lib/session-storage';
import type { PokemonBasic } from '@/lib/pokemon/types';

const pokemon: PokemonBasic[] = Array.from({ length: 151 }, (_, i) => ({
  id: i + 1,
  name: `pokemon-${i + 1}`,
  sprite: '',
  spriteShiny: '',
  types: [i % 2 ? 'water' : 'fire'],
}));
beforeEach(() => {
  sessionStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

describe('shared catalog state', () => {
  it('combines hidden ability search with filters and persists it', () => {
    const source = pokemon.map((p) => ({
      ...p,
      abilities: [{ name: 'solar-power', isHidden: true }],
    }));
    const view = renderHook(() => useCatalogView('ability-search', source, true));
    act(() => view.result.current.setPage(2));
    act(() => view.result.current.setSearch('SOLAR POWER'));
    act(() => view.result.current.setFilters({ ...DEFAULT_FILTERS, types: ['fire'] }));
    expect(view.result.current.page).toBe(0);
    expect(view.result.current.filtered).toHaveLength(76);
    view.unmount();
    const restored = renderHook(() => useCatalogView('ability-search', source, true));
    expect(restored.result.current.search).toBe('SOLAR POWER');
    expect(restored.result.current.filtered).toHaveLength(76);
  });
  it('combines attack search with type filters and restores the query', () => {
    const source = pokemon.map((p) => ({ ...p, moves: p.id > 50 ? ['surf'] : [] }));
    const view = renderHook(() => useCatalogView('move-search', source, true));
    act(() => view.result.current.setPage(2));
    act(() => view.result.current.setSearch('SURF'));
    act(() => view.result.current.setFilters({ ...DEFAULT_FILTERS, types: ['water'] }));
    expect(view.result.current.page).toBe(0);
    expect(view.result.current.visibleIds).toHaveLength(50);
    expect(view.result.current.visibleIds.every((id) => id > 50 && id % 2 === 0)).toBe(true);
    view.unmount();
    const restored = renderHook(() => useCatalogView('move-search', source, true));
    expect(restored.result.current.search).toBe('SURF');
    expect(restored.result.current.filtered).toHaveLength(50);
  });
  it('combines attack and game before pagination and preserves the game on return', () => {
    const source = pokemon.map((p) => ({
      ...p,
      moves: ['surf', 'tackle'],
      moveGames: { surf: p.id > 50 ? ['yellow'] : ['red-blue'], tackle: ['yellow'] },
    }));
    const view = renderHook(() => useCatalogView('game-search', source, true));
    act(() => view.result.current.setPage(2));
    act(() => view.result.current.setSearch('surf'));
    act(() =>
      view.result.current.setFilters({ ...DEFAULT_FILTERS, game: 'yellow', types: ['water'] }),
    );
    expect(view.result.current.visibleIds).toHaveLength(50);
    expect(view.result.current.visibleIds.every((id) => id > 50 && id % 2 === 0)).toBe(true);
    expect(view.result.current.page).toBe(0);
    expect(view.result.current.gameOptions.map((game) => game.value)).toEqual([
      'red-blue',
      'yellow',
    ]);
    view.unmount();
    const restored = renderHook(() => useCatalogView('game-search', source, true));
    expect(restored.result.current.filters.game).toBe('yellow');
    expect(restored.result.current.filtered).toHaveLength(50);
    act(() => restored.result.current.setFilters({ ...restored.result.current.filters, game: '' }));
    expect(restored.result.current.filtered).toHaveLength(75);
  });
  it('keeps restored pagination during loading and across unmount/reload', async () => {
    writeSessionJson(viewStateKey('national'), { page: 2, filters: DEFAULT_FILTERS });
    const initialProps: { data: PokemonBasic[] | undefined; ready: boolean } = {
      data: undefined,
      ready: false,
    };
    const view = renderHook(({ data, ready }) => useCatalogView('national', data, ready), {
      initialProps,
    });
    expect(view.result.current.page).toBe(2);
    expect(readSessionJson(viewStateKey('national'))).toMatchObject({ page: 2 });
    view.rerender({ data: pokemon, ready: true });
    expect(view.result.current.displayed[0].id).toBe(101);
    view.unmount();
    const restored = renderHook(() => useCatalogView('national', pokemon, true));
    expect(restored.result.current.page).toBe(2);
  });
  it('searches beyond the current page and resets it when criteria change', () => {
    const view = renderHook(() => useCatalogView('gen-1', pokemon, true));
    act(() => view.result.current.setPage(1));
    act(() => view.result.current.setSearch('151'));
    expect(view.result.current.displayed.map((p) => p.id)).toEqual([151]);
    expect(view.result.current.page).toBe(0);
  });
  it('clamps a saved out-of-range page only after a successful load', async () => {
    writeSessionJson(viewStateKey('regional-forms'), { page: 9, filters: DEFAULT_FILTERS });
    const view = renderHook(
      ({ ready }: { ready: boolean }) =>
        useCatalogView('regional-forms', ready ? [] : undefined, ready),
      { initialProps: { ready: false } },
    );
    expect(view.result.current.page).toBe(9);
    view.rerender({ ready: true });
    await waitFor(() =>
      expect(readSessionJson(viewStateKey('regional-forms'))).toMatchObject({ page: 0 }),
    );
  });
  it('keeps navigation IDs for the entire filtered list, not only 50 cards', () => {
    const { result } = renderHook(() => useCatalogView('gen-1', pokemon, true));
    expect(result.current.displayed).toHaveLength(50);
    expect(result.current.visibleIds).toHaveLength(151);
    act(() => result.current.setFilters({ ...DEFAULT_FILTERS, types: ['fire'] }));
    expect(result.current.visibleIds.every((id) => id % 2 === 1)).toBe(true);
  });
  it('ignores hidden special-form and generation-region filters', () => {
    writeSessionJson(viewStateKey('gen-1'), {
      filters: { ...DEFAULT_FILTERS, hasMega: true, regions: ['Paldea'] },
    });
    const { result } = renderHook(() => useCatalogView('gen-1', pokemon, true, false, false));
    expect(result.current.filtered).toHaveLength(151);
  });
});
