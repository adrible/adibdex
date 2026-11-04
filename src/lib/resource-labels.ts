import { getSiteLanguage } from './language';

const ITEMS: Record<string, string> = {
  'fire-stone': 'Pedra de Fogo',
  'water-stone': 'Pedra de Água',
  'thunder-stone': 'Pedra do Trovão',
  'leaf-stone': 'Pedra de Folha',
  'ice-stone': 'Pedra de Gelo',
  'moon-stone': 'Pedra da Lua',
  'sun-stone': 'Pedra do Sol',
  'shiny-stone': 'Pedra Brilhante',
  'dusk-stone': 'Pedra do Crepúsculo',
  'dawn-stone': 'Pedra da Alvorada',
  'oval-stone': 'Pedra Oval',
  'metal-coat': 'Revestimento Metálico',
  'kings-rock': 'Pedra do Rei',
  'dragon-scale': 'Escama de Dragão',
  'reaper-cloth': 'Tecido Ceifador',
  'razor-claw': 'Garra Afiada',
  'razor-fang': 'Presa Afiada',
  protector: 'Protetor',
  'deep-sea-tooth': 'Dente do Mar Profundo',
  'deep-sea-scale': 'Escama do Mar Profundo',
};
export function itemLabel(value: string) {
  return getSiteLanguage() === 'pt' && ITEMS[value] ? ITEMS[value] : title(value);
}
function title(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
export function locationLabel(value: string) {
  let words = value.replace(/-/g, ' ');
  if (getSiteLanguage() === 'pt') {
    const translations: Record<string, string> = {
      route: 'rota',
      cave: 'caverna',
      forest: 'floresta',
      mountain: 'montanha',
      road: 'estrada',
      city: 'cidade',
      town: 'vila',
      island: 'ilha',
      tower: 'torre',
      lake: 'lago',
      entrance: 'entrada',
      basement: 'subsolo',
      area: 'área',
      mt: 'monte',
      sea: 'mar',
      garden: 'jardim',
    };
    words = words.replace(/\b[a-z]+\b/g, (word) => translations[word] ?? word);
  }
  return title(words);
}
