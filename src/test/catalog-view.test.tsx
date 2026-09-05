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
