import { z } from 'zod';

const resource = z.object({ name: z.string().min(1), url: z.string().url() });
const image = z.string().url().nullable();
const sprites = z.object({
  front_default: image,
  front_shiny: image,
  other: z
    .object({ 'official-artwork': z.object({ front_default: image, front_shiny: image }) })
    .optional(),
});
export const pokemonSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  species: resource,
  sprites,
  height: z.number().nonnegative(),
  weight: z.number().nonnegative(),
  types: z
    .array(z.object({ slot: z.number(), type: resource }))
    .min(1)
    .max(2),
  abilities: z.array(z.object({ ability: resource, is_hidden: z.boolean().optional() })),
  stats: z.array(z.object({ base_stat: z.number().nonnegative(), stat: resource })).length(6),
  moves: z.array(
    z.object({
      move: resource,
      version_group_details: z.array(
        z.object({
          version_group: resource,
          move_learn_method: resource,
          level_learned_at: z.number().nonnegative(),
        }),
      ),
    }),
  ),
});
export type RawPokemon = z.infer<typeof pokemonSchema>;

export const speciesSchema = z.object({
  name: z.string(),
  evolves_from_species: resource.nullable(),
  evolution_chain: z.object({ url: z.string().url() }).nullable(),
  varieties: z.array(z.object({ is_default: z.boolean(), pokemon: resource })),
  flavor_text_entries: z
    .array(z.object({ flavor_text: z.string(), language: resource, version: resource.optional() }))
    .optional(),
  genera: z.array(z.object({ genus: z.string(), language: resource })).optional(),
  capture_rate: z.number().int().nonnegative().optional(),
  gender_rate: z.number().int().min(-1).max(8).optional(),
  is_baby: z.boolean().optional(),
  is_legendary: z.boolean().optional(),
  is_mythical: z.boolean().optional(),
  egg_groups: z.array(resource).optional(),
  hatch_counter: z.number().int().nonnegative().nullable().optional(),
  growth_rate: resource.nullable().optional(),
  habitat: resource.nullable().optional(),
});
const descriptions = {
  flavor_text_entries: z.array(z.object({ language: resource, flavor_text: z.string() })),
  effect_entries: z.array(
    z.object({ language: resource, effect: z.string(), short_effect: z.string() }),
  ),
};
export const moveSchema = z.object({
  ...descriptions,
  type: resource,
  damage_class: resource,
  power: z.number().nullable(),
  accuracy: z.number().nullable(),
  pp: z.number().nullable(),
  effect_chance: z.number().nullable(),
  priority: z.number().int().optional(),
  target: resource.optional(),
  meta: z
    .object({
      ailment: resource.nullable().optional(),
      ailment_chance: z.number().nonnegative().optional(),
    })
    .nullable()
    .optional(),
});
export const abilitySchema = z.object(descriptions);
const evolutionDetailsSchema = z.object({
  min_level: z.number().nullable(),
  trigger: resource,
  item: resource.nullable(),
  held_item: resource.nullable(),
  min_happiness: z.number().nullable(),
  time_of_day: z.string(),
  known_move: resource.nullable(),
  known_move_type: resource.nullable(),
  location: resource.nullable(),
  min_affection: z.number().nullable(),
  needs_overworld_rain: z.boolean(),
  turn_upside_down: z.boolean(),
  gender: z.number().nullable().optional(),
  min_beauty: z.number().nullable().optional(),
  relative_physical_stats: z.number().nullable().optional(),
  party_species: resource.nullable().optional(),
  party_type: resource.nullable().optional(),
  trade_species: resource.nullable().optional(),
});
type EvolutionDetails = z.infer<typeof evolutionDetailsSchema>;
export interface RawEvolutionNode {
  species: z.infer<typeof resource>;
  evolution_details: EvolutionDetails[];
  evolves_to: RawEvolutionNode[];
}
const nodeSchema: z.ZodType<RawEvolutionNode> = z.lazy(() =>
  z.object({
    species: resource,
    evolution_details: z.array(evolutionDetailsSchema),
    evolves_to: z.array(nodeSchema),
  }),
);
export const evolutionSchema = z.object({ chain: nodeSchema });
export const encountersSchema = z.array(
  z.object({
    location_area: resource,
    version_details: z.array(
      z.object({
        version: resource,
        max_chance: z.number().nonnegative().optional(),
        encounter_details: z.array(
          z.object({
            method: resource,
            min_level: z.number().int().nonnegative().optional(),
            max_level: z.number().int().nonnegative().optional(),
            chance: z.number().nonnegative().optional(),
            condition_values: z.array(resource).default([]),
          }),
        ),
      }),
    ),
  }),
);
