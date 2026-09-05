import { apiRequest, assertPokemonId, extractIdFromUrl } from './client';
import { evolutionSchema, pokemonSchema, type RawEvolutionNode } from './schemas';
import { fetchPokemonRaw, fetchSpeciesRaw } from './pokemon';
import type { EvolutionChain, EvolutionStep } from '../pokemon/types';

function flattenChain(chain: RawEvolutionNode): EvolutionStep[][] {
  const stages: EvolutionStep[][] = [];
  function traverse(node: RawEvolutionNode, depth: number) {
    if (!stages[depth]) stages[depth] = [];
    const id = extractIdFromUrl(node.species.url);
    const details = node.evolution_details?.[0];
    stages[depth].push({
      id,
      name: node.species.name,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      minLevel: details?.min_level || null,
      trigger: details?.trigger?.name || null,
      item: details?.item?.name || null,
      heldItem: details?.held_item?.name || null,
      minHappiness: details?.min_happiness || null,
      timeOfDay: details?.time_of_day || null,
      knownMove: details?.known_move?.name || null,
      knownMoveType: details?.known_move_type?.name || null,
      location: details?.location?.name || null,
      minAffection: details?.min_affection || null,
      needsRain: details?.needs_overworld_rain || false,
      turnUpsideDown: details?.turn_upside_down || false,
    });
    for (const next of node.evolves_to) traverse(next, depth + 1);
  }
  traverse(chain, 0);
  return stages;
}

export async function fetchEvolutionChain(
  pokemonId: number,
  signal?: AbortSignal,
): Promise<EvolutionChain> {
  assertPokemonId(pokemonId);
  let speciesId = pokemonId;
  let formSuffix = '';
  if (pokemonId >= 10000) {
    const pokData = await fetchPokemonRaw(pokemonId, signal);
    speciesId = extractIdFromUrl(pokData.species.url);
    // Detect form suffix (e.g., "alola", "galar", "hisui")
    const speciesName = pokData.species.name;
    const pokName = pokData.name as string;
    if (pokName.startsWith(speciesName + '-')) {
      formSuffix = pokName.substring(speciesName.length + 1);
    }
  }
  const speciesData = await fetchSpeciesRaw(speciesId, signal);
  const chainUrl = speciesData.evolution_chain?.url;
  if (!chainUrl) return { steps: [] };
  const chainData = await apiRequest(chainUrl, evolutionSchema, signal);
  const baseSteps = flattenChain(chainData.chain);

  // If viewing a regional/alt form, try to swap each step with its corresponding form
  if (formSuffix && ['alola', 'galar', 'hisui', 'paldea'].includes(formSuffix.split('-')[0])) {
    const regionKey = formSuffix.split('-')[0]; // e.g., "alola"
    const swappedSteps: EvolutionStep[][] = [];
    for (const stage of baseSteps) {
      const newStage: EvolutionStep[] = [];
      for (const evo of stage) {
        // Try to find the regional form for this species
        const spData = await fetchSpeciesRaw(evo.id, signal);
        const regionVariety = spData.varieties?.find(
          (v) =>
            v.pokemon.name.includes(`-${regionKey}`) &&
            !v.pokemon.name.includes('-mega') &&
            !v.pokemon.name.includes('-gmax'),
        );
        if (regionVariety) {
          const vData = await apiRequest(regionVariety.pokemon.url, pokemonSchema, signal);
          newStage.push({
            ...evo,
            id: vData.id,
            name: vData.name,
            sprite: vData.sprites.other?.['official-artwork']?.front_default || evo.sprite,
          });
        } else {
          newStage.push(evo);
        }
      }
      swappedSteps.push(newStage);
    }
    return { steps: swappedSteps };
  }

  return { steps: baseSteps };
}
