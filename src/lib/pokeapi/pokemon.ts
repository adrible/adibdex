import { apiRequest, assertPokemonId, extractIdFromUrl } from './client';
import { pokemonSchema, speciesSchema, encountersSchema } from './schemas';
import type { PokemonDetail, PokemonEncounter } from '../pokemon/types';

export function fetchPokemonRaw(id: number, signal?: AbortSignal) {
  assertPokemonId(id);
  return apiRequest(`pokemon/${id}`, pokemonSchema, signal);
}
export function fetchSpeciesRaw(id: number, signal?: AbortSignal) {
  assertPokemonId(id);
  return apiRequest(`pokemon-species/${id}`, speciesSchema, signal);
}
export const spriteUrl = (id: number, shiny = false) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? 'shiny/' : ''}${id}.png`;

export async function fetchPokemonDetail(id: number, signal?: AbortSignal): Promise<PokemonDetail> {
  const data = await fetchPokemonRaw(id, signal);
  return {
    id: data.id,
    speciesId: extractIdFromUrl(data.species.url),
    name: data.name,
    sprites: {
      front_default: data.sprites.front_default || spriteUrl(id),
      front_shiny: data.sprites.front_shiny || data.sprites.front_default || spriteUrl(id),
      artwork:
        data.sprites.other?.['official-artwork']?.front_default ||
        data.sprites.front_default ||
        spriteUrl(id),
      artwork_shiny:
        data.sprites.other?.['official-artwork']?.front_shiny ||
        data.sprites.front_shiny ||
        data.sprites.front_default ||
        spriteUrl(id),
    },
    types: data.types.map((t) => t.type.name),
    height: data.height,
    weight: data.weight,
    abilities: data.abilities.map((a) => a.ability.name),
    hiddenAbilities: data.abilities.filter((a) => a.is_hidden).map((a) => a.ability.name),
    stats: data.stats.map((s) => ({ name: s.stat.name, value: s.base_stat })),
    species: data.species.url,
  };
}

export async function fetchPokemonEncounters(
  id: number,
  signal?: AbortSignal,
): Promise<PokemonEncounter[]> {
  assertPokemonId(id);
  const data = await apiRequest(`pokemon/${id}/encounters`, encountersSchema, signal);
  return data.map((enc) => ({
    location: enc.location_area.name.replace(/-/g, ' '),
    versions: enc.version_details.map((v) => ({
      version: v.version.name,
      methods: [...new Set(v.encounter_details.map((d) => d.method.name.replace(/-/g, ' ')))],
    })),
  }));
}
