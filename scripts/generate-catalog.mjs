import { mkdir, rename, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { NATIONAL_POKEDEX_SIZE } from '../src/lib/pokemon/constants.ts';

// Resolve once, then use the same immutable revision for every table.
const latest = process.argv.includes('--latest');
const requestedRevision = latest
  ? 'master'
  : process.env.POKEAPI_DATA_REVISION || 'd4f9a4af58ade123fbc0558f68b1c69daa97d9e4';
if (!latest && !/^[a-f0-9]{40}$/.test(requestedRevision))
  throw new Error('Expected a full PokeAPI commit SHA.');
const commitResponse = await fetch(
  `https://api.github.com/repos/PokeAPI/pokeapi/commits/${requestedRevision}`,
  {
    signal: AbortSignal.timeout(30_000),
    headers: { 'User-Agent': 'adibdex-data-updater', Accept: 'application/vnd.github+json' },
  },
);
if (!commitResponse.ok) throw new Error(`PokeAPI revision lookup: HTTP ${commitResponse.status}`);
const commit = await commitResponse.json();
const revision = commit.sha;
const sourceUpdatedAt = commit.commit?.committer?.date;
if (!/^[a-f0-9]{40}$/.test(revision) || !Number.isFinite(Date.parse(sourceUpdatedAt)))
  throw new Error('Invalid upstream revision metadata.');
const base = `https://raw.githubusercontent.com/PokeAPI/pokeapi/${revision}/data/v2/csv/`;

function parseCsv(text) {
  const rows = [];
  let row = [],
    value = '',
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        value += '"';
        i++;
      } else quoted = !quoted;
    } else if (!quoted && (char === ',' || char === '\n')) {
      row.push(value.replace(/\r$/, ''));
      value = '';
      if (char === '\n') {
        rows.push(row);
        row = [];
      }
    } else value += char;
  }
  if (value || row.length) rows.push([...row, value]);
  if (quoted) throw new Error('Unclosed CSV field.');
  const headers = rows.shift();
  return rows
    .filter((r) => r.length === headers.length)
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, r[i]])));
}

async function csv(name) {
  const response = await fetch(`${base}${name}.csv`, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  return parseCsv(await response.text());
}

const tables = [];
const tableNames = [
  'pokemon',
  'pokemon_species',
  'types',
  'pokemon_types',
  'pokemon_stats',
  'abilities',
  'pokemon_abilities',
  'moves',
  'pokemon_moves',
  'version_groups',
];
for (let i = 0; i < tableNames.length; i += 5)
  tables.push(...(await Promise.all(tableNames.slice(i, i + 5).map(csv))));
const [
  pokemon,
  species,
  types,
  pokemonTypes,
  pokemonStats,
  abilities,
  pokemonAbilities,
  moves,
  pokemonMoves,
  versionGroups,
] = tables;

const bySpecies = new Map(species.map((s) => [Number(s.id), s]));
const typeNames = new Map(types.map((t) => [t.id, t.identifier]));
const typeMap = new Map(),
  statMap = new Map();
for (const t of pokemonTypes) {
  if (!typeMap.has(t.pokemon_id)) typeMap.set(t.pokemon_id, []);
  typeMap.get(t.pokemon_id).push(t);
}
for (const s of pokemonStats) {
  if (!statMap.has(s.pokemon_id)) statMap.set(s.pokemon_id, {});
  statMap.get(s.pokemon_id)[s.stat_id] = Number(s.base_stat);
}
const abilityNames = new Map(abilities.map((a) => [a.id, a.identifier]));
const abilityMap = new Map();
for (const ability of pokemonAbilities) {
  const name = abilityNames.get(ability.ability_id);
  if (!name) throw new Error(`Unknown ability ${ability.ability_id}`);
  if (!abilityMap.has(ability.pokemon_id)) abilityMap.set(ability.pokemon_id, []);
  abilityMap
    .get(ability.pokemon_id)
    .push({ name, isHidden: ability.is_hidden === '1', slot: Number(ability.slot) });
}
// Union of explicitly recorded learnsets across games and learning methods.
// Keep form IDs separate; never infer moves from the base species.
const moveNames = new Map(moves.map((m) => [m.id, m.identifier]));
const versionGroupNames = new Map(versionGroups.map((g) => [g.id, g.identifier]));
const moveMap = new Map();
const moveGameMap = new Map();
for (const move of pokemonMoves) {
  const name = moveNames.get(move.move_id);
  if (!name) throw new Error(`Unknown move ${move.move_id}`);
  if (!moveMap.has(move.pokemon_id)) moveMap.set(move.pokemon_id, new Set());
  moveMap.get(move.pokemon_id).add(name);
  const game = versionGroupNames.get(move.version_group_id);
  if (!game) throw new Error(`Unknown version group ${move.version_group_id}`);
  if (!moveGameMap.has(move.pokemon_id)) moveGameMap.set(move.pokemon_id, new Map());
  const games = moveGameMap.get(move.pokemon_id);
  if (!games.has(name)) games.set(name, new Set());
  games.get(name).add(game);
}
const isMega = (name) => /-(mega|primal)(-|$)/.test(name);
const isRegional = (name) =>
  /-(alola|galar|hisui|paldea)(-|$)/.test(name) && !name.includes('-totem');
const megaSpecies = new Set(
  pokemon.filter((p) => isMega(p.identifier)).map((p) => Number(p.species_id)),
);
const gmaxSpecies = new Set(
  pokemon.filter((p) => p.identifier.includes('-gmax')).map((p) => Number(p.species_id)),
);
// Many attacks share the same game list. Store it once and reference by index.
const gameSets = [];
const gameSetIds = new Map();
function gameSetId(games) {
  const sorted = [...games].sort();
  const key = sorted.join('|');
  if (!gameSetIds.has(key)) {
    gameSetIds.set(key, gameSets.length);
    gameSets.push(sorted);
  }
  return gameSetIds.get(key);
}
const entries = [];
for (const p of pokemon) {
  const id = Number(p.id),
    baseId = Number(p.species_id);
  // Future species require an intentional national catalog update first.
  if (baseId > NATIONAL_POKEDEX_SIZE) continue;
  const category =
    id <= NATIONAL_POKEDEX_SIZE && p.is_default === '1'
      ? 'base'
      : isRegional(p.identifier)
        ? 'regional'
        : isMega(p.identifier)
          ? 'mega'
          : p.identifier.includes('-gmax') && baseId <= NATIONAL_POKEDEX_SIZE
            ? 'gmax'
            : null;
  if (!category) continue;
  const s = statMap.get(p.id);
  const entryTypes = (typeMap.get(p.id) || [])
    .sort((a, b) => Number(a.slot) - Number(b.slot))
    .map((t) => typeNames.get(t.type_id));
  if (
    !s ||
    [1, 2, 3, 4, 5, 6].some((k) => !Number.isFinite(s[k])) ||
    !entryTypes.length ||
    entryTypes.some((t) => !t)
  ) {
    throw new Error(`Incomplete stats/types for ${p.identifier}`);
  }
  const entry = {
    id,
    baseId,
    name: p.identifier,
    category,
    types: entryTypes,
    abilities: (abilityMap.get(p.id) || [])
      .sort((a, b) => a.slot - b.slot)
      .map(({ name, isHidden }) => ({ name, isHidden })),
    moves: [...(moveMap.get(p.id) || [])].sort(),
    moveGames: [...(moveMap.get(p.id) || [])]
      .sort()
      .map((name) => gameSetId(moveGameMap.get(p.id).get(name))),
    hasMega: megaSpecies.has(baseId),
    hasGmax: gmaxSpecies.has(baseId),
    stats: { hp: s[1], attack: s[2], defense: s[3], spAtk: s[4], spDef: s[5], speed: s[6] },
    height: Number(p.height),
    weight: Number(p.weight),
  };
  // Alternate forms intentionally have no enriched stage: missing means Basic.
  if (category === 'base') {
    if (entry.abilities.length === 0) throw new Error(`Missing base abilities: ${p.identifier}`);
    const parent = bySpecies.get(baseId)?.evolves_from_species_id;
    entry.evolutionStage = !parent
      ? 'basic'
      : bySpecies.get(Number(parent))?.evolves_from_species_id
        ? 'stage2'
        : 'stage1';
  }
  entries.push(entry);
}
entries.sort((a, b) => a.id - b.id);
const baseEntries = entries.filter((p) => p.category === 'base');
if (baseEntries.length !== NATIONAL_POKEDEX_SIZE || baseEntries.some((p, i) => p.id !== i + 1))
  throw new Error('Incomplete national catalog.');
if (new Set(entries.map((p) => p.id)).size !== entries.length)
  throw new Error('Duplicate catalog IDs.');
const output = {
  version: 2,
  generatedAt: new Date().toISOString(),
  sourceUpdatedAt,
  source: `https://github.com/PokeAPI/pokeapi/tree/${revision}`,
  gameSets,
  entries,
};
const directory = fileURLToPath(new URL('../public/data/', import.meta.url));
await mkdir(directory, { recursive: true });
await writeFile(`${directory}/catalog.json.tmp`, `${JSON.stringify(output)}\n`);
await rename(`${directory}/catalog.json.tmp`, `${directory}/catalog.json`);
console.log(
  `Catalog generated: ${entries.length} entries, ${Buffer.byteLength(JSON.stringify(output))} bytes.`,
);
