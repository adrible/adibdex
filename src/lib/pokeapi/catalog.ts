import { z } from 'zod';
import { JsonClient, assertPokemonId } from './client';
import { spriteUrl } from './pokemon';
import { NATIONAL_POKEDEX_SIZE } from '../pokemon/constants';

const value = z.number().finite().nonnegative();
export const catalogEntrySchema = z.object({
  id: z.number().int().positive(),
  baseId: z.number().int().min(1).max(NATIONAL_POKEDEX_SIZE),
  name: z.string().min(1),
  category: z.enum(['base', 'regional', 'mega', 'gmax']),
  types: z.array(z.string().min(1)).min(1).max(2),
  stats: z.object({
    hp: value,
    attack: value,
    defense: value,
    spAtk: value,
    spDef: value,
    speed: value,
  }),
  height: value,
  weight: value,
  evolutionStage: z.enum(['basic', 'stage1', 'stage2']).optional(),
});
export const catalogSchema = z
  .object({
    version: z.literal(1),
    source: z.string().url(),
    entries: z.array(catalogEntrySchema).max(3000),
  })
  .superRefine(({ entries }, ctx) => {
    const base = entries.filter((p) => p.category === 'base').sort((a, b) => a.id - b.id);
    if (
      base.length !== NATIONAL_POKEDEX_SIZE ||
      base.some((p, i) => p.id !== i + 1) ||
      new Set(entries.map((p) => p.id)).size !== entries.length
    ) {
      ctx.addIssue({ code: 'custom', message: 'Incomplete or duplicate catalog.' });
    }
  });
const catalogClient = new JsonClient(1, 60 * 60_000);
export async function fetchCatalog(signal?: AbortSignal) {
  const data = await catalogClient.request(
    `${import.meta.env.BASE_URL}data/catalog.json`,
    catalogSchema,
    signal,
  );
  return data.entries.map((p) => ({
    ...p,
    sprite: spriteUrl(p.id),
    spriteShiny: spriteUrl(p.id, true),
  }));
}
export const fetchAllRegionalForms = async (signal?: AbortSignal) =>
  (await fetchCatalog(signal)).filter((p) => p.category === 'regional');
export const fetchAllMegaForms = async (signal?: AbortSignal) =>
  (await fetchCatalog(signal)).filter((p) => p.category === 'mega');
export const fetchAllGmaxForms = async (signal?: AbortSignal) =>
  (await fetchCatalog(signal)).filter((p) => p.category === 'gmax');
export interface PokemonListOptions {
  includeEvolutionStages?: boolean;
  signal?: AbortSignal;
}
export const fetchAllPokemonBasic = async (options: PokemonListOptions = {}) =>
  (await fetchCatalog(options.signal)).filter((p) => p.category === 'base');
export const fetchAllPokemonNames = async (signal?: AbortSignal) =>
  (await fetchAllPokemonBasic({ signal })).map(({ id, name }) => ({ id, name }));

export async function fetchPokemonListByIds(ids: number[], options: PokemonListOptions = {}) {
  ids.forEach(assertPokemonId);
  const byId = new Map((await fetchCatalog(options.signal)).map((p) => [p.id, p]));
  return [...new Set(ids)].map((id) => {
    const pokemon = byId.get(id);
    if (!pokemon) throw new RangeError(`ID fora do catálogo: ${id}`);
    return pokemon;
  });
}
export async function fetchPokemonListByRange(
  start: number,
  end: number,
  options: PokemonListOptions = {},
) {
  assertPokemonId(start);
  assertPokemonId(end);
  if (end < start || end > NATIONAL_POKEDEX_SIZE)
    throw new RangeError(`Intervalo de Pokémon inválido: ${start}-${end}`);
  return (await fetchAllPokemonBasic(options)).filter((p) => p.id >= start && p.id <= end);
}
export async function fetchPokemonBasic(id: number, signal?: AbortSignal) {
  return (await fetchPokemonListByIds([id], { signal }))[0];
}
export async function fetchPokemonPage(
  offset: number,
  limit: number,
  options: PokemonListOptions = {},
) {
  if (
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > NATIONAL_POKEDEX_SIZE
  )
    throw new RangeError('Paginação inválida.');
  return {
    pokemons: (await fetchAllPokemonBasic(options)).slice(offset, offset + limit),
    total: NATIONAL_POKEDEX_SIZE,
  };
}
