export interface PokemonListContext {
  ids: number[];
  currentIndex: number;
  game?: string;
}

export interface PokemonNavigationState {
  origin?: string;
  listContext?: PokemonListContext;
}

const ALLOWED_ORIGINS = [
  /^\/$/,
  /^\/national$/,
  /^\/generation\/\d+$/,
  /^\/(mega|gmax|regional-forms)$/,
];

export function sanitizeInternalOrigin(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return undefined;
  }

  return ALLOWED_ORIGINS.some((pattern) => pattern.test(value)) ? value : undefined;
}

export function parsePokemonNavigationState(value: unknown): PokemonNavigationState {
  if (!value || typeof value !== 'object') return {};

  const candidate = value as Record<string, unknown>;
  const origin = sanitizeInternalOrigin(candidate.origin);
  const rawContext = candidate.listContext;

  if (!rawContext || typeof rawContext !== 'object') return { origin };

  const context = rawContext as Record<string, unknown>;
  if (!Array.isArray(context.ids) || !Number.isSafeInteger(context.currentIndex as number)) {
    return { origin };
  }

  const ids = context.ids.filter(
    (id): id is number => Number.isSafeInteger(id as number) && (id as number) > 0,
  );
  const currentIndex = context.currentIndex as number;
  if (ids.length !== context.ids.length || currentIndex < 0 || currentIndex >= ids.length) {
    return { origin };
  }

  const game = typeof context.game === 'string' && /^[a-z0-9-]{1,80}$/.test(context.game) ? context.game : undefined;
  return { origin, listContext: { ids, currentIndex, ...(game ? { game } : {}) } };
}
