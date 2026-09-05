import {
  pokemonSchema,
  speciesSchema,
  evolutionSchema,
  encountersSchema,
  moveSchema,
  abilitySchema,
} from '../src/lib/pokeapi/schemas.ts';

// Opt-in live contract smoke check. Normal tests do not depend on the external API.
const resources = [
  ['pokemon/1', pokemonSchema],
  ['pokemon/10033', pokemonSchema],
  ['pokemon/10195', pokemonSchema],
  ['pokemon-species/1', speciesSchema],
  ['evolution-chain/1', evolutionSchema],
  ['pokemon/1/encounters', encountersSchema],
  ['move/tackle', moveSchema],
  ['ability/overgrow', abilitySchema],
];
for (const [path, schema] of resources) {
  const response = await fetch(`https://pokeapi.co/api/v2/${path}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  schema.parse(await response.json());
  console.log(`OK ${path}`);
}
