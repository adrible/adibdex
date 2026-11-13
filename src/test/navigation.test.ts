import { describe, expect, it } from 'vitest';
import { parsePokemonNavigationState, sanitizeInternalOrigin } from '@/lib/navigation';

describe('navegação de Pokémon', () => {
  it('aceita somente origens internas conhecidas', () => {
    expect(sanitizeInternalOrigin('/national')).toBe('/national');
    expect(sanitizeInternalOrigin('/national/')).toBe('/national/');
    expect(sanitizeInternalOrigin('/generation/3/')).toBe('/generation/3/');
    expect(sanitizeInternalOrigin('/regional-forms/')).toBe('/regional-forms/');
    expect(sanitizeInternalOrigin('/national//')).toBeUndefined();
    expect(sanitizeInternalOrigin('/national/?redirect=https://example.com')).toBeUndefined();
    expect(sanitizeInternalOrigin('/generation/3')).toBe('/generation/3');
    expect(sanitizeInternalOrigin('//example.com')).toBeUndefined();
    expect(sanitizeInternalOrigin('https://example.com')).toBeUndefined();
    expect(sanitizeInternalOrigin('/pokemon/1')).toBeUndefined();
  });

  it('descarta contexto de lista malformado', () => {
    expect(
      parsePokemonNavigationState({
        origin: '/national',
        listContext: { ids: [1, -2, 3], currentIndex: 1 },
      }),
    ).toEqual({ origin: '/national' });
  });

  it('preserva contexto válido', () => {
    expect(
      parsePokemonNavigationState({
        origin: '/regional-forms',
        listContext: { ids: [10091, 10100], currentIndex: 0 },
      }),
    ).toEqual({
      origin: '/regional-forms',
      listContext: { ids: [10091, 10100], currentIndex: 0 },
    });
  });
});
