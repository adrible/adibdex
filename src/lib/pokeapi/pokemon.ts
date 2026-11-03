import { apiRequest, assertPokemonId, extractIdFromUrl } from './client';
import { pokemonSchema, speciesSchema, encountersSchema } from './schemas';
import type { PokemonDetail, PokemonEncounter, PokemonSpeciesInfo } from '../pokemon/types';

export function fetchPokemonRaw(id: number, signal?: AbortSignal) {
  assertPokemonId(id);
  return apiRequest(`pokemon/${id}`, pokemonSchema, signal);
}
export function fetchSpeciesRaw(id: number, signal?: AbortSignal) {
  assertPokemonId(id);
  return apiRequest(`pokemon-species/${id}`, speciesSchema, signal);
}

function getUserLanguage() {
  return typeof navigator === 'undefined' ? 'pt' : navigator.language?.split('-')[0] || 'pt';
}

function localizedEntry<T extends { language: { name: string } }>(entries: T[], language: string) {
  return entries.find(
    (entry) =>
      entry.language.name === language || entry.language.name.startsWith(`${language}-`),
  ) ??
    entries.find((entry) => entry.language.name === 'en') ??
    entries.at(-1);
}

export async function fetchPokemonSpeciesInfo(
  id: number,
  signal?: AbortSignal,
): Promise<PokemonSpeciesInfo> {
  const data = await fetchSpeciesRaw(id, signal);
  const language = getUserLanguage();
  const description = localizedEntry(data.flavor_text_entries ?? [], language)?.flavor_text ?? '';
  const genus = localizedEntry(data.genera ?? [], language)?.genus ?? null;
  return {
    description: description.replace(/[\n\f\r]+/g, ' ').replace(/\s+/g, ' ').trim(),
    genus,
    captureRate: data.capture_rate ?? null,
    genderRate: data.gender_rate ?? null,
    isBaby: data.is_baby ?? false,
    isLegendary: data.is_legendary ?? false,
    isMythical: data.is_mythical ?? false,
    eggGroups: (data.egg_groups ?? []).map((group) => group.name),
    hatchCounter: data.hatch_counter ?? null,
    growthRate: data.growth_rate?.name ?? null,
    habitat: data.habitat?.name ?? null,
  };
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
      methods: [...new Set(v.encounter_details.map((detail) => detail.method.name.replace(/-/g, ' ')))],
      ...(v.encounter_details.some(
        (detail) =>
          detail.min_level !== undefined ||
          detail.max_level !== undefined ||
          detail.chance !== undefined ||
          detail.condition_values.length > 0,
      )
        ? {
            encounters: v.encounter_details.map((detail) => ({
              method: detail.method.name,
              minLevel: detail.min_level ?? null,
              maxLevel: detail.max_level ?? null,
              chance: detail.chance ?? null,
              conditions: detail.condition_values.map((condition) => condition.name),
            })),
          }
        : {}),
    })),
  }));
}
