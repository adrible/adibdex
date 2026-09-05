import { z } from 'zod';
import { createDefaultFilters, filtersSchema } from './filter-state';
import { readSessionJson, readStorage } from '@/lib/session-storage';

export const viewStateSchema = z.object({
  filters: filtersSchema.catch(createDefaultFilters),
  page: z.number().int().min(0).max(10000).catch(0),
  search: z.string().max(200).catch(''),
  isShiny: z.boolean().catch(false),
  showAll: z.boolean().catch(false),
  scrollY: z.number().finite().min(0).max(10_000_000).catch(0),
});
export type CatalogViewState = z.infer<typeof viewStateSchema>;
export const viewStateKey = (key: string) => `pokedex-view-v3-${key}`;
const recordSchema = z.record(z.unknown());
function record(value: unknown) {
  return recordSchema.safeParse(value).data ?? {};
}

export function loadCatalogView(key: string): CatalogViewState {
  const current = viewStateSchema.safeParse(readSessionJson(viewStateKey(key)));
  if (current.success) return current.data;
  const legacyFilters = record(readSessionJson(`pokedex-filters-v2-${key}`));
  const legacyExtra = record(readSessionJson(key));
  const legacyNational = key === 'national' ? record(readSessionJson('national-view-state')) : {};
  return viewStateSchema.parse({
    ...legacyFilters,
    ...legacyExtra,
    ...legacyNational,
    isShiny:
      key === 'national' ? readStorage('national-shiny-state') === 'true' : legacyExtra.isShiny,
  });
}
