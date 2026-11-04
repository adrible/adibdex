import { apiRequest } from './client';
import { moveSchema, abilitySchema } from './schemas';
import { fetchPokemonRaw } from './pokemon';
import { VERSION_GROUP_NAMES } from '../pokemon/constants';
import type { MoveByGame, MovesByVersionGroup } from '../pokemon/types';
import { getSiteLanguage } from '@/lib/language';

const fetchMoveData = (name: string, signal?: AbortSignal) =>
  apiRequest(`move/${encodeURIComponent(name)}`, moveSchema, signal);

function getUserLang(): string {
  return getSiteLanguage();
}

export async function fetchMoveDescription(
  moveName: string,
  signal?: AbortSignal,
): Promise<string> {
  const data = await fetchMoveData(moveName, signal);
  const lang = getUserLang();

  // Try user language first for flavor text
  if (lang !== 'en') {
    const localFlavor = data.flavor_text_entries?.filter((e) => e.language.name === lang);
    if (localFlavor?.length > 0) {
      return localFlavor[localFlavor.length - 1].flavor_text.replace(/\n/g, ' ');
    }
  }

  const entry = data.effect_entries?.find((e) => e.language.name === 'en');
  if (entry) {
    return (
      entry.short_effect?.replace('$effect_chance%', `${data.effect_chance ?? '?'}%`) ||
      entry.effect ||
      ''
    );
  }
  const flavor = data.flavor_text_entries?.find((e) => e.language.name === 'en');
  return flavor?.flavor_text || '';
}

export async function fetchAbilityDescription(
  abilityName: string,
  signal?: AbortSignal,
): Promise<string> {
  const data = await apiRequest(
    `ability/${encodeURIComponent(abilityName)}`,
    abilitySchema,
    signal,
  );
  const lang = getUserLang();

  // Try user language flavor text
  if (lang !== 'en') {
    const localFlavor = data.flavor_text_entries?.filter((e) => e.language.name === lang);
    if (localFlavor?.length > 0) {
      return localFlavor[localFlavor.length - 1].flavor_text.replace(/\n/g, ' ');
    }
  }

  const entry = data.effect_entries?.find((e) => e.language.name === 'en');
  return entry?.effect || entry?.short_effect || '';
}

export async function fetchPokemonMovesByGame(
  pokemonId: number,
  signal?: AbortSignal,
): Promise<MovesByVersionGroup[]> {
  const data = await fetchPokemonRaw(pokemonId, signal);
  const groupMap = new Map<string, Map<string, { name: string; level: number }[]>>();

  for (const m of data.moves) {
    for (const vg of m.version_group_details) {
      const vgName = vg.version_group.name;
      const method = vg.move_learn_method.name;
      if (!groupMap.has(vgName)) groupMap.set(vgName, new Map());
      const methodMap = groupMap.get(vgName)!;
      if (!methodMap.has(method)) methodMap.set(method, []);
      methodMap.get(method)!.push({ name: m.move.name, level: vg.level_learned_at });
    }
  }

  const allMoveNames = new Set<string>();
  for (const m of data.moves) allMoveNames.add(m.move.name);

  const moveNames = [...allMoveNames];
  const moveInfo = new Map<
    string,
    {
      type: string;
      damageClass: string;
      power: number | null;
      accuracy: number | null;
      pp: number | null;
      priority: number;
      target: string;
      ailment: string | null;
      ailmentChance: number | null;
      effectChance: number | null;
    }
  >();

  for (let i = 0; i < moveNames.length; i += 30) {
    const batch = moveNames.slice(i, i + 30);
    const results = await Promise.all(batch.map((name) => fetchMoveData(name, signal)));
    results.forEach((d, j) => {
      if (d) {
        moveInfo.set(batch[j], {
          type: d.type.name,
          damageClass: d.damage_class?.name || 'status',
          power: d.power,
          accuracy: d.accuracy,
          pp: d.pp,
          priority: d.priority ?? 0,
          target: d.target?.name ?? 'selected-pokemon',
          ailment: d.meta?.ailment?.name ?? null,
          ailmentChance: d.meta?.ailment_chance ?? null,
          effectChance: d.effect_chance,
        });
      }
    });
  }

  const vgOrder = Object.keys(VERSION_GROUP_NAMES);
  const sortedGroups = [...groupMap.entries()].sort((a, b) => {
    const ai = vgOrder.indexOf(a[0]);
    const bi = vgOrder.indexOf(b[0]);
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
  });

  return sortedGroups.map(([vgName, methodMap]) => {
    function buildMoves(method: string): MoveByGame[] {
      const moves = methodMap.get(method) || [];
      return moves
        .map((m) => {
          const info = moveInfo.get(m.name);
          return {
            name: m.name,
            type: info?.type || 'normal',
            level: m.level,
            method,
            damageClass: info?.damageClass || 'status',
            power: info?.power ?? null,
            accuracy: info?.accuracy ?? null,
            pp: info?.pp ?? null,
            priority: info?.priority ?? 0,
            target: info?.target ?? 'selected-pokemon',
            ailment: info?.ailment ?? null,
            ailmentChance: info?.ailmentChance ?? null,
            effectChance: info?.effectChance ?? null,
          };
        })
        .sort((a, b) => (method === 'level-up' ? a.level - b.level : a.name.localeCompare(b.name)));
    }
    return {
      versionGroup: vgName,
      versionGroupLabel: VERSION_GROUP_NAMES[vgName] || vgName.replace(/-/g, ' '),
      levelUp: buildMoves('level-up'),
      machine: buildMoves('machine'),
      egg: buildMoves('egg'),
      tutor: buildMoves('tutor'),
    };
  });
}
