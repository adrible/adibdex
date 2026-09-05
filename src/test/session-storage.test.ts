import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  readSessionJson,
  readStorage,
  removeSessionValue,
  writeSessionJson,
  writeStorage,
} from '@/lib/session-storage';
import { loadCatalogView, viewStateKey } from '@/features/catalog/view-state';
import { DEFAULT_FILTERS } from '@/features/catalog/filter-state';

afterEach(() => {
  vi.restoreAllMocks();
  sessionStorage.clear();
  localStorage.clear();
});

describe('optional, validated browser persistence', () => {
  it('does not throw when reading, writing or removing storage is blocked', () => {
    const denied = () => {
      throw new DOMException('Blocked', 'SecurityError');
    };
    vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(denied);
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(denied);
    expect(readSessionJson('x')).toBeNull();
    expect(readStorage('x', 'localStorage')).toBeNull();
    expect(() => writeSessionJson('x', {})).not.toThrow();
    expect(() => writeStorage('x', 'light', 'localStorage')).not.toThrow();
    expect(() => removeSessionValue('x')).not.toThrow();
    expect(loadCatalogView('national').page).toBe(0);
  });
  it('ignores malformed JSON without trying an unsafe removal', () => {
    sessionStorage.setItem('broken', '{');
    const remove = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readSessionJson('broken')).toBeNull();
    expect(remove).not.toHaveBeenCalled();
  });
  it.each([-1, 1.5, '4', null, 10001])('rejects invalid saved page %s', (page) => {
    writeSessionJson(viewStateKey('national'), { page, filters: DEFAULT_FILTERS });
    expect(loadCatalogView('national').page).toBe(0);
  });
  it('validates each filter, boolean and search field', () => {
    writeSessionJson(viewStateKey('national'), {
      filters: {
        ...DEFAULT_FILTERS,
        types: 'fire',
        classifications: ['invalid'],
        sortBy: 'oops',
        evolutionStages: ['basic'],
      },
      isShiny: 'false',
      search: {},
      showAll: 'true',
      page: 3,
    });
    const state = loadCatalogView('national');
    expect(state).toMatchObject({ page: 3, search: '', isShiny: false, showAll: false });
    expect(state.filters).toEqual({ ...DEFAULT_FILTERS, evolutionStages: ['basic'] });
  });
  it('migrates the latest legacy page and filters together', () => {
    writeSessionJson('pokedex-filters-v2-regional-forms', { filters: DEFAULT_FILTERS, page: 0 });
    writeSessionJson('regional-forms', {
      filters: { ...DEFAULT_FILTERS, types: ['fire'] },
      page: 1,
      isShiny: true,
    });
    expect(loadCatalogView('regional-forms')).toMatchObject({
      page: 1,
      isShiny: true,
      filters: { types: ['fire'] },
    });
  });
  it('tolerates quota exhaustion', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Full', 'QuotaExceededError');
    });
    expect(() => writeSessionJson('x', { page: 4 })).not.toThrow();
  });
});
