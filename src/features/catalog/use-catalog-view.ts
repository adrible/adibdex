import { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from 'react';
import { VERSION_GROUP_NAMES } from '@/lib/pokemon/constants';
import type { PokemonBasic } from '@/lib/pokemon/types';
import { writeSessionJson } from '@/lib/session-storage';
import { applyFilters } from './filtering';
import { matchesPokemonSearch } from './search';
import type { FilterState } from './filter-state';
import { loadCatalogView, viewStateKey, type CatalogViewState } from './view-state';

export const PAGE_SIZE = 50;
const EMPTY: PokemonBasic[] = [];

/** Call from a component keyed by its catalog scope, so route changes reinitialize state. */
export function useCatalogView(
  key: string,
  data: PokemonBasic[] | undefined,
  ready: boolean,
  showSpecial = true,
  showRegion = true,
) {
  const [state, setState] = useState(() => loadCatalogView(key));
  const stateRef = useRef(state);
  stateRef.current = state;
  const scrollRef = useRef(state.scrollY);
  const restoredRef = useRef(false);
  const storageKey = viewStateKey(key);

  const setField = useCallback(
    <K extends keyof CatalogViewState>(
      field: K,
      update: SetStateAction<CatalogViewState[K]>,
      reset = false,
    ) => {
      setState((previous) => ({
        ...previous,
        ...(reset ? { page: 0 } : {}),
        [field]: typeof update === 'function' ? update(previous[field]) : update,
      }));
    },
    [],
  );
  const setPage = useCallback((page: SetStateAction<number>) => setField('page', page), [setField]);
  const setFilters = useCallback(
    (filters: FilterState) => setField('filters', filters, true),
    [setField],
  );
  const setSearch = useCallback((search: string) => setField('search', search, true), [setField]);
  const setIsShiny = useCallback(
    (shiny: SetStateAction<boolean>) => setField('isShiny', shiny),
    [setField],
  );
  const setShowAll = useCallback((all: boolean) => setField('showAll', all, true), [setField]);

  useEffect(() => {
    writeSessionJson(storageKey, { ...state, scrollY: scrollRef.current });
  }, [state, storageKey]);

  const filtered = useMemo(() => {
    const source = (data ?? EMPTY).filter((p) =>
      matchesPokemonSearch(p, state.search, state.filters.game),
    );
    return applyFilters(source, {
      ...state.filters,
      ...(!showSpecial ? { hasMega: null, hasGmax: null } : {}),
      ...(!showRegion ? { regions: [] } : {}),
    });
  }, [data, state.filters, state.search, showSpecial, showRegion]);
  const gameOptions = useMemo(() => {
    const available = new Set(
      (data ?? EMPTY).flatMap((p) => Object.values(p.moveGames ?? {}).flat()),
    );
    return Object.entries(VERSION_GROUP_NAMES)
      .filter(([value]) => available.has(value))
      .map(([value, label]) => ({ value, label }));
  }, [data]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // Never clamp restored pagination against the temporary empty loading state.
  useEffect(() => {
    if (ready && state.page >= totalPages) setPage(totalPages - 1);
  }, [ready, state.page, totalPages, setPage]);

  useEffect(() => {
    if (!ready || restoredRef.current) return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, scrollRef.current);
      restoredRef.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, [ready]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const persist = () =>
      writeSessionJson(storageKey, { ...stateRef.current, scrollY: scrollRef.current });
    const onScroll = () => {
      if (!restoredRef.current) return;
      scrollRef.current = window.scrollY;
      clearTimeout(timer);
      timer = setTimeout(persist, 200);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', persist);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pagehide', persist);
      persist();
    };
  }, [storageKey]);

  const page = ready ? Math.min(state.page, totalPages - 1) : state.page;
  const displayed = useMemo(
    () => (state.showAll ? filtered : filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)),
    [filtered, page, state.showAll],
  );
  const visibleIds = useMemo(() => filtered.map((p) => p.id), [filtered]);
  return {
    ...state,
    gameOptions,
    page,
    setPage,
    setFilters,
    setSearch,
    setIsShiny,
    setShowAll,
    filtered,
    displayed,
    visibleIds,
    totalPages,
  };
}
