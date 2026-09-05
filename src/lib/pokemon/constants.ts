import type { Generation } from './types';

export const NATIONAL_POKEDEX_SIZE = 1025;

export const GENERATIONS: Generation[] = [
  { id: 1, name: 'Kanto', region: 'Kanto', pokemonRange: [1, 151] },
  { id: 2, name: 'Johto', region: 'Johto', pokemonRange: [152, 251] },
  { id: 3, name: 'Hoenn', region: 'Hoenn', pokemonRange: [252, 386] },
  { id: 4, name: 'Sinnoh', region: 'Sinnoh', pokemonRange: [387, 493] },
  { id: 5, name: 'Unova', region: 'Unova', pokemonRange: [494, 649] },
  { id: 6, name: 'Kalos', region: 'Kalos', pokemonRange: [650, 721] },
  { id: 7, name: 'Alola', region: 'Alola', pokemonRange: [722, 807] },
  { id: 10, name: 'Desconhecida', region: 'Desconhecida', pokemonRange: [808, 809] },
  { id: 8, name: 'Galar', region: 'Galar', pokemonRange: [810, 898] },
  { id: 11, name: 'Hisui', region: 'Hisui', pokemonRange: [899, 905] },
  { id: 9, name: 'Paldea', region: 'Paldea', pokemonRange: [906, 1025] },
];

// Product-maintained classification; includes the Primal forms.
export const MEGA_POKEMON_IDS = new Set([
  // Kanto
  3, 6, 9, 15, 18, 26, 36, 65, 71, 80, 94, 115, 121, 127, 130, 142, 149, 150,

  // Johto
  154, 160, 181, 208, 212, 214, 227, 229, 248,

  // Hoenn
  254, 257, 260, 282, 302, 303, 306, 308, 310, 319, 323, 334, 354, 358, 359, 362, 373, 376, 380,
  381, 382, 383, 384,

  // Sinnoh
  398, 428, 445, 448, 460, 475, 478, 485, 491,

  // Unova
  500, 530, 531, 545, 560, 604, 609, 623,

  // Kalos
  652, 655, 658, 668, 670, 678, 687, 689, 691, 701, 718, 719,

  // Alola / Galar / Paldea / misc
  740, 768, 780, 801, 807, 870, 952, 970, 978, 998,
]);

// Classification datasets
// Starters: base + full evolution lines
export const STARTER_IDS = new Set([
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9, // Kanto
  152,
  153,
  154,
  155,
  156,
  157,
  158,
  159,
  160, // Johto
  252,
  253,
  254,
  255,
  256,
  257,
  258,
  259,
  260, // Hoenn
  387,
  388,
  389,
  390,
  391,
  392,
  393,
  394,
  395, // Sinnoh
  495,
  496,
  497,
  498,
  499,
  500,
  501,
  502,
  503, // Unova
  650,
  651,
  652,
  653,
  654,
  655,
  656,
  657,
  658, // Kalos
  722,
  723,
  724,
  725,
  726,
  727,
  728,
  729,
  730, // Alola
  810,
  811,
  812,
  813,
  814,
  815,
  816,
  817,
  818, // Galar
  906,
  907,
  908,
  909,
  910,
  911,
  912,
  913,
  914, // Paldea
]);
export const LEGENDARY_IDS = new Set([
  144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 480, 481,
  482, 483, 484, 485, 486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646, 716, 717, 718,
  772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 888, 889, 890, 891, 892, 895, 896, 897,
  898, 905, 1001, 1002, 1003, 1004, 1007, 1008, 1009, 1010, 1014, 1015, 1016, 1017, 1024,
]);
export const MYTHICAL_IDS = new Set([
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807,
  808, 809, 893, 894, 1025,
]);
export const PSEUDO_LEGENDARY_IDS = new Set([
  149, 248, 289, 373, 376, 445, 635, 706, 784, 887, 998,
]);
export const ULTRA_BEAST_IDS = new Set([793, 794, 795, 796, 797, 798, 799, 803, 804, 805, 806]);
export const PARADOX_IDS = new Set([
  984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 1005, 1006, 1009, 1010,
]);
export const BABY_IDS = new Set([
  172, 173, 174, 175, 236, 238, 239, 240, 298, 360, 406, 433, 438, 439, 440, 446, 447, 458, 848,
]);
// Fossil Pokémon (revived from fossils) - base + evolutions
export const FOSSIL_IDS = new Set([
  138,
  139, // Omanyte, Omastar
  140,
  141, // Kabuto, Kabutops
  142, // Aerodactyl
  345,
  346, // Lileep, Cradily
  347,
  348, // Anorith, Armaldo
  408,
  409, // Cranidos, Rampardos
  410,
  411, // Shieldon, Bastiodon
  564,
  565, // Tirtouga, Carracosta
  566,
  567, // Archen, Archeops
  696,
  697, // Tyrunt, Tyrantrum
  698,
  699, // Amaura, Aurorus
  880,
  881,
  882,
  883, // Dracozolt, Arctozolt, Dracovish, Arctovish
]);

// All special classification sets for "Regular" exclusion
export const ALL_SPECIAL_SETS = [
  STARTER_IDS,
  LEGENDARY_IDS,
  MYTHICAL_IDS,
  PSEUDO_LEGENDARY_IDS,
  ULTRA_BEAST_IDS,
  PARADOX_IDS,
  BABY_IDS,
  FOSSIL_IDS,
];

// Complete Gigantamax Pokémon (base IDs)
export const GMAX_POKEMON_IDS = new Set([
  3, 6, 9, 12, 25, 52, 68, 94, 99, 131, 133, 143, 569, 809, 812, 815, 818, 823, 826, 834, 839, 841,
  842, 844, 849, 851, 858, 861, 869, 879, 884, 892,
]);

export const TYPE_TRANSLATIONS: Record<string, string> = {
  normal: 'Normal',
  fire: 'Fogo',
  water: 'Água',
  grass: 'Planta',
  electric: 'Elétrico',
  ice: 'Gelo',
  fighting: 'Lutador',
  poison: 'Veneno',
  ground: 'Terra',
  flying: 'Voador',
  psychic: 'Psíquico',
  bug: 'Inseto',
  rock: 'Pedra',
  ghost: 'Fantasma',
  dragon: 'Dragão',
  dark: 'Sombrio',
  steel: 'Aço',
  fairy: 'Fada',
};

export const STAT_TRANSLATIONS: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
};

export const VERSION_GROUP_NAMES: Record<string, string> = {
  'red-blue': 'Red / Blue',
  yellow: 'Yellow',
  'gold-silver': 'Gold / Silver',
  crystal: 'Crystal',
  'ruby-sapphire': 'Ruby / Sapphire',
  emerald: 'Emerald',
  'firered-leafgreen': 'FireRed / LeafGreen',
  'diamond-pearl': 'Diamond / Pearl',
  platinum: 'Platinum',
  'heartgold-soulsilver': 'HeartGold / SoulSilver',
  'black-white': 'Black / White',
  'black-2-white-2': 'Black 2 / White 2',
  'x-y': 'X / Y',
  'omega-ruby-alpha-sapphire': 'Omega Ruby / Alpha Sapphire',
  'sun-moon': 'Sun / Moon',
  'ultra-sun-ultra-moon': 'Ultra Sun / Ultra Moon',
  'lets-go-pikachu-lets-go-eevee': "Let's Go Pikachu / Eevee",
  'sword-shield': 'Sword / Shield',
  'brilliant-diamond-and-shining-pearl': 'Brilliant Diamond / Shining Pearl',
  'legends-arceus': 'Legends: Arceus',
  'scarlet-violet': 'Scarlet / Violet',
  'the-teal-mask': 'The Teal Mask',
  'the-indigo-disk': 'The Indigo Disk',
};

export const METHOD_LABELS: Record<string, string> = {
  'level-up': 'Por Nível',
  machine: 'TM / HM',
  egg: 'Egg Moves',
  tutor: 'Tutor',
};
