import { apiRequest, assertPokemonId, extractIdFromUrl } from './client';
import { pokemonSchema } from './schemas';
import { localized } from '@/lib/language';
import { fetchPokemonRaw, fetchSpeciesRaw } from './pokemon';
import { fetchAllMegaForms, fetchAllGmaxForms } from './catalog';
import type { PokemonForm } from '../pokemon/types';

export async function fetchMegaEvolutions(id: number, signal?: AbortSignal) {
  assertPokemonId(id);
  const baseId =
    id >= 10000 ? extractIdFromUrl((await fetchPokemonRaw(id, signal)).species.url) : id;
  return (await fetchAllMegaForms(signal)).filter((p) => p.baseId === baseId);
}
export async function fetchGmaxForms(id: number, signal?: AbortSignal) {
  assertPokemonId(id);
  const baseId =
    id >= 10000 ? extractIdFromUrl((await fetchPokemonRaw(id, signal)).species.url) : id;
  return (await fetchAllGmaxForms(signal)).filter((p) => p.baseId === baseId);
}

export async function fetchPokemonForms(
  pokemonId: number,
  signal?: AbortSignal,
): Promise<PokemonForm[]> {
  assertPokemonId(pokemonId);
  let speciesId = pokemonId;
  if (pokemonId >= 10000) {
    const pokData = await fetchPokemonRaw(pokemonId, signal);
    speciesId = extractIdFromUrl(pokData.species.url);
  }
  const speciesData = await fetchSpeciesRaw(speciesId, signal);
  const varieties = speciesData.varieties || [];
  const isAltForm = pokemonId >= 10000;
  const filteredVarieties = varieties.filter((v) => {
    const name = v.pokemon.name;
    if (
      name.includes('-mega') ||
      name.includes('-gmax') ||
      name.includes('-totem') ||
      name.includes('-primal')
    )
      return false;
    const vId = Number(v.pokemon.url.split('/').filter(Boolean).pop());
    if (vId === pokemonId) return false;
    if (!isAltForm && v.is_default) return false;
    return true;
  });
  if (filteredVarieties.length === 0) return [];
  const forms = await Promise.all(
    filteredVarieties.map(async (v) => {
      const data = await apiRequest(v.pokemon.url, pokemonSchema, signal);
      const name = data.name;
      const isDefault = v.is_default;
      let formName = isDefault
        ? 'Normal'
        : name.replace(`${speciesData.name}-`, '').replace(/-/g, ' ');
      const FORM_TRANSLATIONS: Record<string, string> = {
        alola: 'Alola',
        galar: 'Galar',
        hisui: 'Hisui',
        paldea: 'Paldea',
        female: localized('Fêmea', 'Female'),
        male: localized('Macho', 'Male'),
        attack: localized('Ataque', 'Attack'),
        defense: localized('Defesa', 'Defense'),
        speed: localized('Velocidade', 'Speed'),
        sandy: localized('Areia', 'Sandy'),
        trash: localized('Lixo', 'Trash'),
        heat: localized('Calor', 'Heat'),
        wash: localized('Lavagem', 'Wash'),
        frost: localized('Gelo', 'Frost'),
        fan: localized('Ventilador', 'Fan'),
        mow: localized('Corte', 'Mow'),
        origin: localized('Origem', 'Origin'),
        sky: localized('Céu', 'Sky'),
        therian: 'Therian',
        black: localized('Preto', 'Black'),
        white: localized('Branco', 'White'),
        resolute: localized('Resoluto', 'Resolute'),
        pirouette: 'Pirouette',
        zen: 'Zen',
        blade: localized('Lâmina', 'Blade'),
        midday: localized('Diurno', 'Midday'),
        midnight: localized('Noturno', 'Midnight'),
        dusk: localized('Crepuscular', 'Dusk'),
      };
      for (const [key, val] of Object.entries(FORM_TRANSLATIONS)) {
        if (formName.toLowerCase().includes(key)) {
          formName = formName.replace(new RegExp(key, 'gi'), val);
        }
      }
      return {
        id: data.id,
        name,
        formName: formName.charAt(0).toUpperCase() + formName.slice(1),
        sprite:
          data.sprites.other?.['official-artwork']?.front_default ||
          data.sprites.front_default ||
          '',
        spriteShiny:
          data.sprites.other?.['official-artwork']?.front_shiny || data.sprites.front_shiny || '',
        types: data.types.map((t) => t.type.name),
      };
    }),
  );
  return forms;
}
