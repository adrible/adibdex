const TYPES: Record<string, string> = {
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

export function searchTypeName(type: string, language = 'pt') {
  return language === 'pt' ? (TYPES[type] ?? type) : type.charAt(0).toUpperCase() + type.slice(1);
}

export function pokemonSearchDescription(
  name: string,
  number: string,
  pokemon: { types?: string[]; height?: number; weight?: number },
  language = 'pt',
) {
  const pt = language === 'pt';
  const types = pokemon.types?.map((type) => searchTypeName(type, language)).join(' / ');
  const dimensions = [
    ['height', pt ? 'Altura' : 'Height', 'm'],
    ['weight', pt ? 'peso' : 'weight', 'kg'],
  ].flatMap(([key, label, unit]) => {
    const value = pokemon[key as 'height' | 'weight'];
    return typeof value === 'number' && Number.isFinite(value) && value > 0
      ? [`${label}: ${(value / 10).toLocaleString(pt ? 'pt-BR' : 'en-US')} ${unit}`]
      : [];
  });
  return [
    types
      ? pt
        ? `${name} #${number} é um Pokémon do tipo ${types}.`
        : `${name} #${number} is a ${types}-type Pokémon.`
      : `${name} #${number}.`,
    dimensions.length ? `${dimensions.join('; ')}.` : '',
    pt
      ? 'Veja habilidades, atributos, ataques por jogo e evoluções na AdibDex.'
      : 'Explore abilities, stats, moves by game, and evolution in AdibDex.',
  ]
    .filter(Boolean)
    .join(' ');
}
