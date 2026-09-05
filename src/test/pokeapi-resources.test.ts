import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const catalog = JSON.parse(readFileSync('public/data/catalog.json', 'utf8'));
const resource = (name: string, kind = 'type', id = 1) => ({
  name,
  url: `https://pokeapi.co/api/v2/${kind}/${id}/`,
});
const details = {
  min_level: 16,
  trigger: resource('level-up', 'evolution-trigger'),
  item: null,
  held_item: null,
  min_happiness: null,
  time_of_day: '',
  known_move: null,
  known_move_type: null,
  location: null,
  min_affection: null,
  needs_overworld_rain: false,
  turn_upside_down: false,
};
function pokemon(id = 1, speciesId = id, name = 'bulbasaur') {
  return {
    id,
    name,
    species: resource('bulbasaur', 'pokemon-species', speciesId),
    sprites: { front_default: null, front_shiny: null },
    types: [{ slot: 1, type: resource('grass') }],
    height: 7,
    weight: 69,
    abilities: [{ ability: resource('overgrow', 'ability') }],
    stats: ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map(
      (name) => ({ base_stat: 50, stat: resource(name, 'stat') }),
    ),
    moves: [
      {
        move: resource('tackle', 'move'),
        version_group_details: [
          {
            version_group: resource('red-blue', 'version-group'),
            move_learn_method: resource('level-up', 'move-learn-method'),
            level_learned_at: 1,
          },
          {
            version_group: resource('unknown-game', 'version-group'),
            move_learn_method: resource('machine', 'move-learn-method'),
            level_learned_at: 0,
          },
        ],
      },
    ],
  };
}
function species(id = 1, extras = {}) {
  return {
    name: 'bulbasaur',
    evolves_from_species: null,
    evolution_chain: { url: `https://pokeapi.co/api/v2/evolution-chain/${id}/` },
    varieties: [
      { is_default: true, pokemon: resource('bulbasaur', 'pokemon', 1) },
      { is_default: false, pokemon: resource('bulbasaur-alola', 'pokemon', 10001) },
      { is_default: false, pokemon: resource('bulbasaur-mega', 'pokemon', 10002) },
    ],
    ...extras,
  };
}
const english = [
  {
    language: resource('en', 'language'),
    effect: 'Full effect',
    short_effect: 'Chance $effect_chance%',
  },
];
const flavor = [{ language: resource('pt', 'language'), flavor_text: 'Texto\nlocal' }];
const move = {
  type: resource('normal'),
  damage_class: resource('physical', 'move-damage-class'),
  power: 40,
  accuracy: 100,
  pp: 35,
  effect_chance: 0,
  effect_entries: english,
  flavor_text_entries: flavor,
};
const node = (id: number) => ({
  species: resource(`pokemon-${id}`, 'pokemon-species', id),
  evolution_details: [details],
  evolves_to: [],
});

beforeEach(() => {
  vi.resetModules();
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('typed resource projections and failures', () => {
  it('loads all list categories and ranges from one compact request', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(catalog)));
    vi.stubGlobal('fetch', fetchMock);
    const api = await import('@/lib/pokeapi/catalog');
    expect(await api.fetchAllPokemonBasic()).toHaveLength(1025);
    expect(await api.fetchAllRegionalForms()).toHaveLength(
      catalog.entries.filter((p: { category: string }) => p.category === 'regional').length,
    );
    expect((await api.fetchAllMegaForms()).length).toBeGreaterThan(80);
    expect((await api.fetchAllGmaxForms()).length).toBeGreaterThan(30);
    expect(await api.fetchAllPokemonNames()).toHaveLength(1025);
    expect((await api.fetchPokemonListByRange(100, 110)).map((p) => p.id)).toEqual(
      Array.from({ length: 11 }, (_, i) => i + 100),
    );
    expect((await api.fetchPokemonListByIds([2, 2, 1])).map((p) => p.id)).toEqual([2, 1]);
    expect((await api.fetchPokemonPage(50, 50)).pokemons[0].id).toBe(51);
    expect((await api.fetchPokemonBasic(1)).name).toBe('bulbasaur');
    expect(fetchMock).toHaveBeenCalledOnce();
    await expect(api.fetchPokemonListByIds([99999])).rejects.toThrow(RangeError);
    await expect(api.fetchPokemonListByRange(1, 1_000_000)).rejects.toThrow(RangeError);
    await expect(api.fetchPokemonPage(0, 1_000_000)).rejects.toThrow(RangeError);
  });
  it('validates detail payloads and supplies nullable sprite fallbacks', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify(pokemon()))),
    );
    const { fetchPokemonDetail } = await import('@/lib/pokeapi/pokemon');
    const result = await fetchPokemonDetail(1);
    expect(result).toMatchObject({
      id: 1,
      speciesId: 1,
      types: ['grass'],
      height: 7,
      weight: 69,
      abilities: ['overgrow'],
    });
    expect(result.stats).toHaveLength(6);
    expect(result.sprites.artwork).toContain('/pokemon/1.png');
    expect(result.sprites.artwork_shiny).toContain('/pokemon/1.png');
  });
  it('deduplicates encounter methods and handles an empty encounter list', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify([
              {
                location_area: resource('route-one'),
                version_details: [
                  {
                    version: resource('red'),
                    encounter_details: [{ method: resource('walk') }, { method: resource('walk') }],
                  },
                ],
              },
            ]),
          ),
        )
        .mockResolvedValueOnce(new Response('[]')),
    );
    const { fetchPokemonEncounters } = await import('@/lib/pokeapi/pokemon');
    expect(await fetchPokemonEncounters(1)).toEqual([
      { location: 'route one', versions: [{ version: 'red', methods: ['walk'] }] },
    ]);
    expect(await fetchPokemonEncounters(2)).toEqual([]);
  });
  it('groups and enriches move data, including unknown games and zero effect chance', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (url: string) =>
          new Response(JSON.stringify(url.includes('/pokemon/') ? pokemon() : move)),
      ),
    );
    const api = await import('@/lib/pokeapi/moves');
    const groups = await api.fetchPokemonMovesByGame(1);
    expect(groups[0].levelUp[0]).toMatchObject({
      name: 'tackle',
      power: 40,
      level: 1,
      damageClass: 'physical',
    });
    expect(groups[1].versionGroupLabel).toBe('unknown game');
    expect(groups[1].machine).toHaveLength(1);
    expect(await api.fetchMoveDescription('tackle')).toBe('Chance 0%');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('uses localized descriptions and distinguishes genuinely missing descriptions', async () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('pt-BR');
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(move)))
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ flavor_text_entries: flavor, effect_entries: english })),
        )
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ flavor_text_entries: [], effect_entries: [] })),
        ),
    );
    const api = await import('@/lib/pokeapi/moves');
    expect(await api.fetchMoveDescription('tackle')).toBe('Texto local');
    expect(await api.fetchAbilityDescription('overgrow')).toBe('Texto local');
    expect(await api.fetchAbilityDescription('missing-description')).toBe('');
  });
  it('propagates move enrichment failures and retries successfully', async () => {
    let failing = true;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.includes('/pokemon/')
          ? new Response(JSON.stringify(pokemon()))
          : failing
            ? new Response('', { status: 503 })
            : new Response(JSON.stringify(move)),
      ),
    );
    const { fetchPokemonMovesByGame } = await import('@/lib/pokeapi/moves');
    await expect(fetchPokemonMovesByGame(1)).rejects.toMatchObject({ status: 503 });
    failing = false;
    expect(await fetchPokemonMovesByGame(1)).toHaveLength(2);
  });
  it('does not return a successful partial list when one alternate form fails', async () => {
    let failing = true;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url.includes('pokemon-species')
          ? new Response(JSON.stringify(species()))
          : failing
            ? new Response('', { status: 500 })
            : new Response(JSON.stringify(pokemon(10001, 1, 'bulbasaur-alola'))),
      ),
    );
    const { fetchPokemonForms } = await import('@/lib/pokeapi/forms');
    await expect(fetchPokemonForms(1)).rejects.toMatchObject({ status: 500 });
    failing = false;
    const forms = await fetchPokemonForms(1);
    expect(forms).toHaveLength(1);
    expect(forms[0]).toMatchObject({ id: 10001, formName: 'Alola', types: ['grass'] });
  });
  it('looks up special forms from catalog and resolves alternate species IDs', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (url: string) =>
          new Response(
            JSON.stringify(url.includes('/data/') ? catalog : pokemon(10033, 3, 'venusaur-mega')),
          ),
      ),
    );
    const { fetchMegaEvolutions, fetchGmaxForms } = await import('@/lib/pokeapi/forms');
    expect((await fetchMegaEvolutions(3)).every((p) => p.baseId === 3)).toBe(true);
    expect(await fetchMegaEvolutions(1)).toEqual([]);
    expect((await fetchMegaEvolutions(10033)).length).toBeGreaterThan(0);
    expect((await fetchGmaxForms(10033)).every((p) => p.baseId === 3)).toBe(true);
  });
  it('projects evolution levels and handles species with no chain resource', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (url: string) =>
          new Response(
            JSON.stringify(
              url.includes('pokemon-species/2')
                ? species(2, { evolution_chain: null })
                : url.includes('pokemon-species')
                  ? species()
                  : { chain: { ...node(1), evolves_to: [node(2)] } },
            ),
          ),
      ),
    );
    const { fetchEvolutionChain } = await import('@/lib/pokeapi/evolution');
    expect((await fetchEvolutionChain(1)).steps[1][0]).toMatchObject({
      id: 2,
      minLevel: 16,
      trigger: 'level-up',
      speciesId: 2,
      parentId: 1,
      conditions: [expect.objectContaining({ minLevel: 16 })],
    });
    expect(await fetchEvolutionChain(2)).toEqual({ steps: [] });
  });
  it('preserves alternative conditions, zero values and branch parents', async () => {
    const branch = {
      ...node(2),
      evolution_details: [
        {
          ...details,
          min_happiness: 0,
          min_affection: 0,
          min_beauty: 0,
          relative_physical_stats: 0,
          gender: 1,
          party_species: resource('pikachu', 'pokemon-species', 25),
          party_type: resource('electric'),
          trade_species: resource('shelmet', 'pokemon-species', 616),
        },
        {
          ...details,
          min_level: null,
          trigger: resource('use-item', 'evolution-trigger'),
          item: resource('leaf-stone', 'item'),
        },
      ],
      evolves_to: [node(3)],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (url: string) =>
          new Response(
            JSON.stringify(
              url.includes('pokemon-species')
                ? species()
                : { chain: { ...node(1), evolution_details: [], evolves_to: [branch, node(4)] } },
            ),
          ),
      ),
    );
    const { fetchEvolutionChain } = await import('@/lib/pokeapi/evolution');
    const { steps } = await fetchEvolutionChain(1);
    expect(steps[0][0]).toMatchObject({ parentId: null, conditions: [] });
    expect(steps[1].map((p) => p.parentId)).toEqual([1, 1]);
    expect(steps[2][0].parentId).toBe(2);
    expect(steps[1][0].conditions).toEqual([
      expect.objectContaining({
        minHappiness: 0,
        minAffection: 0,
        minBeauty: 0,
        relativePhysicalStats: 0,
        gender: 1,
        partySpecies: 'pikachu',
        partyType: 'electric',
        tradeSpecies: 'shelmet',
      }),
      expect.objectContaining({ minLevel: null, trigger: 'use-item', item: 'leaf-stone' }),
    ]);
  });
  it('propagates regional evolutionary lookup failures without silently replacing the form', async () => {
    let failing = true;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/pokemon/10002') && failing) return new Response('', { status: 500 });
        const payload = url.includes('/pokemon/10001')
          ? pokemon(10001, 1, 'bulbasaur-alola')
          : url.includes('/pokemon/10002')
            ? pokemon(10002, 2, 'pokemon-2-alola')
            : url.includes('/pokemon-species/1')
              ? species(1)
              : url.includes('/pokemon-species/2')
                ? species(2, {
                    varieties: [
                      { is_default: false, pokemon: resource('pokemon-2-alola', 'pokemon', 10002) },
                    ],
                  })
                : { chain: { ...node(1), evolves_to: [node(2)] } };
        return new Response(JSON.stringify(payload));
      }),
    );
    const { fetchEvolutionChain } = await import('@/lib/pokeapi/evolution');
    await expect(fetchEvolutionChain(10001)).rejects.toMatchObject({ status: 500 });
    failing = false;
    expect((await fetchEvolutionChain(10001)).steps.flat().map((p) => p.id)).toEqual([
      10001, 10002,
    ]);
  });
});
