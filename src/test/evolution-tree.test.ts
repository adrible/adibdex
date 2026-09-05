import { describe, expect, it } from 'vitest';
import { buildEvolutionForest, hasEvolutionBranches } from '@/features/evolution/tree';
import type { EvolutionStep } from '@/lib/pokemon/types';

const step = (speciesId: number, parentId: number | null, id = speciesId): EvolutionStep => ({
  id,
  speciesId,
  parentId,
  name: `pokemon-${id}`,
  sprite: '',
  conditions: [],
  minLevel: null,
  trigger: null,
  item: null,
  heldItem: null,
  minHappiness: null,
  timeOfDay: null,
  knownMove: null,
  knownMoveType: null,
  location: null,
  minAffection: null,
  needsRain: false,
  turnUpsideDown: false,
  gender: null,
  minBeauty: null,
  relativePhysicalStats: null,
  partySpecies: null,
  partyType: null,
  tradeSpecies: null,
});

describe('adaptive evolution layout', () => {
  it('keeps ordinary linear chains linear', () => {
    const roots = buildEvolutionForest([[step(1, null)], [step(2, 1)], [step(3, 2)]]);
    expect(hasEvolutionBranches(roots)).toBe(false);
    expect(roots[0].children[0].children[0].step.id).toBe(3);
  });
  it('recognizes Eevee-like fan-outs without a hardcoded species list', () => {
    const roots = buildEvolutionForest([
      [step(133, null)],
      [134, 135, 136, 196, 197, 470, 471, 700].map((id) => step(id, 133)),
    ]);
    expect(hasEvolutionBranches(roots)).toBe(true);
    expect(roots[0].children).toHaveLength(8);
  });
  it('detects two-way splits and keeps each continuation in its own branch', () => {
    const roots = buildEvolutionForest([
      [step(265, null)],
      [step(266, 265), step(268, 265)],
      [step(267, 266), step(269, 268)],
    ]);
    expect(hasEvolutionBranches(roots)).toBe(true);
    expect(roots[0].children.map((node) => node.children.map((child) => child.step.id))).toEqual([
      [267],
      [269],
    ]);
  });
  it('detects a split after a shared linear segment', () => {
    const roots = buildEvolutionForest([
      [step(60, null)],
      [step(61, 60)],
      [step(62, 61), step(186, 61)],
    ]);
    expect(hasEvolutionBranches(roots)).toBe(true);
    expect(roots[0].children[0].children.map((node) => node.step.id)).toEqual([62, 186]);
  });
  it('uses stable species IDs when regional forms replace a displayed step', () => {
    const roots = buildEvolutionForest([[step(52, null, 10161)], [step(863, 52)]]);
    expect(roots[0].step.id).toBe(10161);
    expect(roots[0].children[0].step.id).toBe(863);
  });
  it('handles empty, missing-parent and invalid cyclic links without hiding nodes', () => {
    expect(buildEvolutionForest([])).toEqual([]);
    expect(hasEvolutionBranches([])).toBe(false);
    const roots = buildEvolutionForest([[step(1, 2), step(2, 1), step(3, 999)]]);
    expect(roots.map((node) => node.step.id)).toEqual([1, 2, 3]);
    expect(roots.every((node) => node.children.length === 0)).toBe(true);
  });
});
