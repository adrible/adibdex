// Type effectiveness chart: attacker -> defender -> multiplier
// 0 = immune, 0.5 = not very effective, 2 = super effective (1 = neutral, omitted)

const ALL_TYPES = [
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
] as const;

// Chart: TYPE_CHART[attackType][defendType] = multiplier (only non-1x stored)
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: {
    normal: 2,
    ice: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    rock: 2,
    ghost: 0,
    dark: 2,
    steel: 2,
    fairy: 0.5,
  },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, poison: 0.5, fighting: 2, dragon: 2, dark: 2, steel: 0.5 },
};

export interface TypeMatchups {
  weaknesses: { type: string; multiplier: number }[];
  resistances: { type: string; multiplier: number }[];
  immunities: string[];
}

export function getDefensiveMatchups(types: string[]): TypeMatchups {
  const weaknesses: { type: string; multiplier: number }[] = [];
  const resistances: { type: string; multiplier: number }[] = [];
  const immunities: string[] = [];

  for (const attackType of ALL_TYPES) {
    let multiplier = 1;
    for (const defType of types) {
      const eff = TYPE_CHART[attackType]?.[defType];
      if (eff !== undefined) multiplier *= eff;
    }
    if (multiplier === 0) immunities.push(attackType);
    else if (multiplier > 1) weaknesses.push({ type: attackType, multiplier });
    else if (multiplier < 1) resistances.push({ type: attackType, multiplier });
  }

  weaknesses.sort((a, b) => b.multiplier - a.multiplier);
  resistances.sort((a, b) => a.multiplier - b.multiplier);

  return { weaknesses, resistances, immunities };
}

export function getOffensiveMatchups(types: string[]) {
  const superEffective: string[] = [];
  const notVeryEffective: string[] = [];
  const noEffect: string[] = [];

  for (const defType of ALL_TYPES) {
    let bestMultiplier = 0;
    for (const atkType of types) {
      const eff = TYPE_CHART[atkType]?.[defType] ?? 1;
      if (eff > bestMultiplier) bestMultiplier = eff;
    }
    if (bestMultiplier === 0) noEffect.push(defType);
    else if (bestMultiplier >= 2) superEffective.push(defType);
    else if (bestMultiplier < 1) notVeryEffective.push(defType);
  }

  return { superEffective, notVeryEffective, noEffect };
}
