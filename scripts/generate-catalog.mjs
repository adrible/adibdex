import { mkdir, rename, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { MEGA_FORM_SLUGS, REGIONAL_FORM_SLUGS } from '../src/lib/pokemon/form-slugs.ts';

// Pin upstream data: updates must be explicit and reviewed with the generated diff.
const revision = process.env.POKEAPI_DATA_REVISION || 'd4f9a4af58ade123fbc0558f68b1c69daa97d9e4';
if (!/^[a-f0-9]{40}$/.test(revision)) throw new Error('Expected a full PokeAPI commit SHA.');
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

const [pokemon, species, types, pokemonTypes, pokemonStats] = await Promise.all(
  ['pokemon', 'pokemon_species', 'types', 'pokemon_types', 'pokemon_stats'].map(csv),
);
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
const mega = new Set(MEGA_FORM_SLUGS.map((f) => f.slug));
const regional = new Set(REGIONAL_FORM_SLUGS.map((f) => f.slug));
const entries = [];
for (const p of pokemon) {
  const id = Number(p.id),
    baseId = Number(p.species_id);
  const category =
    id <= 1025 && p.is_default === '1'
      ? 'base'
      : regional.has(p.identifier)
        ? 'regional'
        : mega.has(p.identifier)
          ? 'mega'
          : p.identifier.includes('-gmax') && baseId <= 1025
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
    stats: { hp: s[1], attack: s[2], defense: s[3], spAtk: s[4], spDef: s[5], speed: s[6] },
    height: Number(p.height),
    weight: Number(p.weight),
  };
  // Alternate forms intentionally have no enriched stage: missing means Basic.
  if (category === 'base') {
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
if (baseEntries.length !== 1025 || baseEntries.some((p, i) => p.id !== i + 1))
  throw new Error('Incomplete national catalog.');
if (new Set(entries.map((p) => p.id)).size !== entries.length)
  throw new Error('Duplicate catalog IDs.');
for (const form of REGIONAL_FORM_SLUGS) {
  if (!entries.some((p) => p.name === form.slug && p.baseId === form.baseId))
    throw new Error(`Missing regional form ${form.slug}`);
}
const missingMega = MEGA_FORM_SLUGS.filter((f) => !entries.some((p) => p.name === f.slug));
if (missingMega.length)
  console.warn('Mega slugs not yet available upstream:', missingMega.map((f) => f.slug).join(', '));
const output = {
  version: 1,
  source: `https://github.com/PokeAPI/pokeapi/tree/${revision}`,
  entries,
};
const directory = fileURLToPath(new URL('../public/data/', import.meta.url));
await mkdir(directory, { recursive: true });
await writeFile(`${directory}/catalog.json.tmp`, `${JSON.stringify(output)}\n`);
await rename(`${directory}/catalog.json.tmp`, `${directory}/catalog.json`);
console.log(
  `Catalog generated: ${entries.length} entries, ${Buffer.byteLength(JSON.stringify(output))} bytes.`,
);
