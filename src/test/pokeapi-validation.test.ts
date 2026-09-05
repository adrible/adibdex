import { describe, expect, it, vi } from 'vitest';
import { fetchPokemonBasic, fetchPokemonListByRange } from '@/lib/pokeapi';

describe('validação da PokeAPI', () => {
  it('rejeita IDs inválidos antes de acessar a rede', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    await expect(fetchPokemonBasic(-1)).rejects.toThrow('ID de Pokémon inválido');
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });

  it('rejeita intervalos invertidos', async () => {
    await expect(fetchPokemonListByRange(20, 10)).rejects.toThrow('Intervalo de Pokémon inválido');
  });
});
