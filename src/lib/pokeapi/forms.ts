import { apiRequest, assertPokemonId, extractIdFromUrl } from './client';
import { pokemonSchema } from './schemas';
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
        female: 'Fêmea',
        male: 'Macho',
        attack: 'Ataque',
        defense: 'Defesa',
        speed: 'Velocidade',
        sandy: 'Areia',
        trash: 'Lixo',
        heat: 'Calor',
        wash: 'Lavagem',
        frost: 'Gelo',
        fan: 'Ventilador',
        mow: 'Corte',
        origin: 'Origem',
        sky: 'Céu',
        therian: 'Totem',
        black: 'Preto',
        white: 'Branco',
        resolute: 'Resoluto',
        pirouette: 'Pirueta',
        zen: 'Zen',
        blade: 'Lâmina',
        midday: 'Diurno',
        midnight: 'Noturno',
        dusk: 'Crepuscular',
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
